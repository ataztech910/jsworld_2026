import { callModel, BIG_MODELS, LOCAL_MODELS, ModelId } from "../models";
import { judge, INVOICE_EXPECTED, JUDGE_INSTRUCTION } from "../judge";
import { VAGUE_PROMPT } from "./tezis1";

// T2: same vague prompt, big models vs small models
// hypothesis: big models score higher on vague — hiding the problem
export async function runTezis2(
  bigModels: ModelId[] = BIG_MODELS,
  localModels: ModelId[] = LOCAL_MODELS
) {
  const results = [];
  const allModels = [...localModels, ...bigModels];

  for (const modelId of allModels) {
    console.log(`  [T2] ${modelId} vague...`);
    const res = await callModel(modelId, VAGUE_PROMPT);
    const j = judge(res.text, INVOICE_EXPECTED);

    results.push({
      tezis: 2,
      name: "Big models hide the problem",
      model: modelId,
      model_type: bigModels.includes(modelId) ? "big" : "small",
      runs: [
        {
          prompt_type: "vague_text",
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
