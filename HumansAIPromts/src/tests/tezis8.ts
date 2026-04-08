import { callModel, LOCAL_MODELS, ModelId } from "../models";
import { judge, INVOICE_EXPECTED, JUDGE_INSTRUCTION } from "../judge";

// T8: pure YAML vs YAML + text annotations (PromptFarm approach)
// hypothesis: structure + natural language context > pure structure

const YAML_PURE = `component: InvoiceForm
constraints:
  min_amount_eur: 50
  max_line_items: 10
discount:
  condition: client_tenure_months >= 6
vat:
  eu: 20
  non_eu: 0
  blocked: [RU, BY]
payment:
  retry_on: [network_error]
  no_retry_on: [validation_error]
analytics:
  provider: internal
  not: google_analytics
persistence:
  autosave_seconds: 30
  confirm_on_close: true`;

// Same structure + text context where it adds meaning
const YAML_PLUS_TEXT = `component: InvoiceForm
# Core billing form for B2B SaaS. Users are finance managers, not developers.

constraints:
  min_amount_eur: 50   # below this we lose money on payment processing fees
  max_line_items: 10   # backend DB limit, hard constraint

discount:
  condition: client_tenure_months >= 6
  # loyalty discount — only for established clients, not trials

vat:
  eu: 20        # standard EU VAT
  non_eu: 0     # export, VAT-exempt
  blocked: [RU, BY]
  # RU/BY: legal/compliance requirement, do not render form at all

payment:
  retry_on: [network_error]
  no_retry_on: [validation_error]
  # never retry on validation — user must fix input first

analytics:
  provider: internal   # our own ClickHouse, not GA — GDPR requirement
  not: google_analytics

persistence:
  autosave_seconds: 30  # users often leave tab open, prevent data loss
  confirm_on_close: true`;

export async function runTezis8(models: ModelId[] = LOCAL_MODELS) {
  const results = [];

  for (const modelId of models) {
    console.log(`  [T8] ${modelId} pure yaml...`);
    const pureRes = await callModel(
      modelId,
      `Build a React invoice form from this spec:\n\n${YAML_PURE}\n\n${JUDGE_INSTRUCTION}`
    );
    const pureJudge = judge(pureRes.text, INVOICE_EXPECTED);

    console.log(`  [T8] ${modelId} yaml + text...`);
    const mixRes = await callModel(
      modelId,
      `Build a React invoice form from this spec:\n\n${YAML_PLUS_TEXT}\n\n${JUDGE_INSTRUCTION}`
    );
    const mixJudge = judge(mixRes.text, INVOICE_EXPECTED);

    results.push({
      tezis: 8,
      name: "YAML + text annotations beats pure YAML",
      model: modelId,
      runs: [
        {
          prompt_type: "pure_yaml",
          score: pureJudge.score,
          total: pureJudge.total,
          assumed: pureJudge.assumed,
          assumedList: pureJudge.assumedList,
          decisions: pureJudge.decisions,
          tokens_prompt: pureRes.promptTokens,
          tokens_completion: pureRes.completionTokens,
        },
        {
          prompt_type: "yaml_plus_text",
          score: mixJudge.score,
          total: mixJudge.total,
          assumed: mixJudge.assumed,
          assumedList: mixJudge.assumedList,
          decisions: mixJudge.decisions,
          tokens_prompt: mixRes.promptTokens,
          tokens_completion: mixRes.completionTokens,
        },
      ],
    });
  }

  return results;
}
