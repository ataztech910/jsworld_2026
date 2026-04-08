import { callModel, LOCAL_MODELS, ModelId } from "../models";
import { judge, INVOICE_EXPECTED, JUDGE_INSTRUCTION } from "../judge";

// T7: same structure, different key names
// hypothesis: LLM understands intent from context, not exact key names

const YAML_CANONICAL = `component: InvoiceForm
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

// Same structure, completely different key names
const YAML_RENAMED = `thing: BillingWidget
rules:
  floor_eur: 50
  row_limit: 10
price_reduction:
  when: account_age_months >= 6
tax:
  inside_eu: 20
  outside_eu: 0
  forbidden: [RU, BY]
retry_policy:
  allowed: [connection_failure]
  blocked: [bad_input]
tracking:
  destination: own_system
  exclude: google_analytics
draft:
  save_every_seconds: 30
  warn_before_exit: true`;

// Weird keys, abbreviated
const YAML_WEIRD = `frm: Invoice
min: 50
max_rows: 10
disc_mo: 6
vat_in: 20
vat_out: 0
vat_no: [RU, BY]
net_retry_only: true
no_ga: true
save_s: 30
exit_warn: true`;

export async function runTezis7(models: ModelId[] = LOCAL_MODELS) {
  const results = [];

  for (const modelId of models) {
    console.log(`  [T7] ${modelId} canonical yaml...`);
    const canonRes = await callModel(
      modelId,
      `Build a React invoice form from this spec:\n\n${YAML_CANONICAL}\n\n${JUDGE_INSTRUCTION}`
    );
    const canonJudge = judge(canonRes.text, INVOICE_EXPECTED);

    console.log(`  [T7] ${modelId} renamed keys yaml...`);
    const renamedRes = await callModel(
      modelId,
      `Build a React invoice form from this spec:\n\n${YAML_RENAMED}\n\n${JUDGE_INSTRUCTION}`
    );
    const renamedJudge = judge(renamedRes.text, INVOICE_EXPECTED);

    console.log(`  [T7] ${modelId} weird keys yaml...`);
    const weirdRes = await callModel(
      modelId,
      `Build a React invoice form from this spec:\n\n${YAML_WEIRD}\n\n${JUDGE_INSTRUCTION}`
    );
    const weirdJudge = judge(weirdRes.text, INVOICE_EXPECTED);

    results.push({
      tezis: 7,
      name: "LLM understands YAML by context not exact key names",
      model: modelId,
      runs: [
        {
          prompt_type: "canonical_keys",
          score: canonJudge.score,
          total: canonJudge.total,
          assumed: canonJudge.assumed,
          assumedList: canonJudge.assumedList,
          decisions: canonJudge.decisions,
          tokens_prompt: canonRes.promptTokens,
          tokens_completion: canonRes.completionTokens,
        },
        {
          prompt_type: "renamed_keys",
          score: renamedJudge.score,
          total: renamedJudge.total,
          assumed: renamedJudge.assumed,
          assumedList: renamedJudge.assumedList,
          decisions: renamedJudge.decisions,
          tokens_prompt: renamedRes.promptTokens,
          tokens_completion: renamedRes.completionTokens,
        },
        {
          prompt_type: "weird_keys",
          score: weirdJudge.score,
          total: weirdJudge.total,
          assumed: weirdJudge.assumed,
          assumedList: weirdJudge.assumedList,
          decisions: weirdJudge.decisions,
          tokens_prompt: weirdRes.promptTokens,
          tokens_completion: weirdRes.completionTokens,
        },
      ],
    });
  }

  return results;
}
