import { callModel, ALL_MODELS, ModelId } from "../models";
import { judge, INVOICE_EXPECTED, JUDGE_INSTRUCTION } from "../judge";

export const VAGUE_PROMPT = `Build a React invoice form with line items and totals.

${JUDGE_INSTRUCTION}`;

export const YAML_PROMPT = `Build a React invoice form component from this spec:

component: InvoiceForm
constraints:
  min_amount_eur: 50
  max_line_items: 10
discount:
  enabled: true
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
  confirm_unsaved_on_close: true

${JUDGE_INSTRUCTION}`;

export async function runTezis1(models: ModelId[] = ALL_MODELS) {
  const results = [];

  for (const modelId of models) {
    console.log(`  [T1] ${modelId} vague...`);
    const vagueRes = await callModel(modelId, VAGUE_PROMPT);
    const vagueJudge = judge(vagueRes.text, INVOICE_EXPECTED);

    console.log(`  [T1] ${modelId} yaml...`);
    const yamlRes = await callModel(modelId, YAML_PROMPT);
    console.log("RAW YAML RESPONSE:", yamlRes.text.slice(0, 500));
    const yamlJudge = judge(yamlRes.text, INVOICE_EXPECTED);

    results.push({
      tezis: 1,
      name: "Vague prompt hides unknowns",
      model: modelId,
      runs: [
        {
          prompt_type: "vague_text",
          score: vagueJudge.score,
          total: vagueJudge.total,
          assumed: vagueJudge.assumed,
          assumedList: vagueJudge.assumedList,
          decisions: vagueJudge.decisions,
          tokens_prompt: vagueRes.promptTokens,
          tokens_completion: vagueRes.completionTokens,
        },
        {
          prompt_type: "real_yaml",
          score: yamlJudge.score,
          total: yamlJudge.total,
          assumed: yamlJudge.assumed,
          assumedList: yamlJudge.assumedList,
          decisions: yamlJudge.decisions,
          tokens_prompt: yamlRes.promptTokens,
          tokens_completion: yamlRes.completionTokens,
        },
      ],
    });
  }

  return results;
}