import { callModel, ALL_MODELS, ModelId } from "../models";
import { judge, INVOICE_EXPECTED } from "../judge";
import { YAML_PROMPT } from "./tezis1";

// T3: same real YAML, all models
// hypothesis: spec gives consistent results regardless of model
export async function runTezis3(models: ModelId[] = ALL_MODELS) {
  const results = [];

  for (const modelId of models) {
    console.log(`  [T3] ${modelId} real yaml...`);
    const res = await callModel(modelId, YAML_PROMPT);
    const j = judge(res.text, INVOICE_EXPECTED);

    results.push({
      tezis: 3,
      name: "Spec works on any model",
      model: modelId,
      runs: [
        {
          prompt_type: "real_yaml",
          score: j.score,
          total: j.total,
          assumed: j.assumed,
          assumedList: j.assumedList,
          decisions: j.decisions,
          tokens_prompt: res.promptTokens,
          tokens_completion: res.completionTokens,
        },
      ],
    });
  }

  return results;
}
