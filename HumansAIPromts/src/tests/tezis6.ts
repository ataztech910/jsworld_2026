import { callModel, ModelId } from "../models";
import { judge, INVOICE_EXPECTED, JUDGE_INSTRUCTION } from "../judge";

const VAGUE = `Build a React invoice form with line items and totals.`;

const SPEC_PROMPT = `You are a spec writer. Convert this feature request into a YAML spec.
Be explicit. Output ONLY valid YAML, no backticks, no explanation.

"${VAGUE}"`;

export async function runTezis6(models: ModelId[] = ["mistral", "codeqwen"]) {
  const results = [];

  const intentModels: ModelId[] = models.includes("claude-sonnet")
    ? ["mistral", "gemini-flash", "claude-sonnet"]
    : ["mistral"];

  for (const intentModel of intentModels) {
    console.log(`  [T6] ${intentModel}: generating spec from vague...`);

    let specText = "";
    try {
      const specRes = await callModel(intentModel, SPEC_PROMPT);
      specText = specRes.text;
      console.log(`  [T6] spec: ${specText.slice(0, 100).replace(/\n/g, " ")}...`);
    } catch (e: any) {
      console.log(`  [T6] ${intentModel} failed: ${e.message}`);
      continue;
    }

    console.log(`  [T6] codeqwen from ${intentModel} yaml...`);
    const yamlRes = await callModel(
      "codeqwen",
      `Build a React invoice form from this spec:\n\n${specText}\n\n${JUDGE_INSTRUCTION}`
    );
    const yamlJudge = judge(yamlRes.text, INVOICE_EXPECTED);

    console.log(`  [T6] codeqwen from vague (baseline)...`);
    const vagueRes = await callModel(
      "codeqwen",
      `Build a React invoice form with line items and totals.\n\n${JUDGE_INSTRUCTION}`
    );
    const vagueJudge = judge(vagueRes.text, INVOICE_EXPECTED);

    results.push({
      tezis: 6,
      name: "Intermediate layer without domain knowledge is useless",
      model: `${intentModel}→codeqwen`,
      meta: { generated_spec: specText.slice(0, 500) },
      runs: [
        {
          prompt_type: "vague_direct",
          description: "vague → codeqwen",
          score: vagueJudge.score,
          total: vagueJudge.total,
          assumed: vagueJudge.assumed,
          assumedList: vagueJudge.assumedList,
          decisions: vagueJudge.decisions,
          tokens_prompt: vagueRes.promptTokens,
          tokens_completion: vagueRes.completionTokens,
        },
        {
          prompt_type: "vague_via_yaml",
          description: `vague → ${intentModel} YAML → codeqwen`,
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