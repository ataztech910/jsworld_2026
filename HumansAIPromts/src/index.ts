import * as fs from "fs";
import * as path from "path";
import { ModelId } from "./models";
import { runTezis1 } from "./tests/tezis1";
import { runTezis2 } from "./tests/tezis2";
import { runTezis3 } from "./tests/tezis3";
import { runTezis4, runTezis5 } from "./tests/tezis4-5";
import { runTezis6 } from "./tests/tezis6";
import { runTezis7 } from "./tests/tezis7";
import { runTezis8 } from "./tests/tezis8";

const RESULTS_FILE = path.join(__dirname, "../results.json");

const LOCAL: ModelId[] = ["mistral", "codeqwen"];
// const BIG: ModelId[] = ["gpt-4o-mini", "gemini-flash", "claude-sonnet"];
const BIG: ModelId[] = ["gemini-flash", "claude-sonnet"];

async function main() {
  const args = process.argv.slice(2);
  const tezisFilter = args.find((a) => a.startsWith("--tezis="))?.split("=")[1];
  const useBig = args.includes("--big");

  // default is always local — never hit paid API by accident
  const models: ModelId[] = useBig ? BIG : LOCAL;

  console.log(`\n🧪 Running tests`);
  console.log(`   Models: ${models.join(", ")}`);
  console.log(`   Tezis:  ${tezisFilter || "all"}`);
  console.log(`   Mode:   ${useBig ? "big (paid)" : "local (free)"}\n`);

  const allResults: unknown[] = [];

  if (!tezisFilter || tezisFilter === "1") {
    console.log("📊 T1 — Vague prompt hides unknowns");
    allResults.push(...await runTezis1(models));
  }
  if (!tezisFilter || tezisFilter === "2") {
    console.log("📊 T2 — Big models hide the problem");
    allResults.push(...await runTezis2(useBig ? BIG : [], LOCAL));
  }
  if (!tezisFilter || tezisFilter === "3") {
    console.log("📊 T3 — Spec works on any model");
    allResults.push(...await runTezis3(models));
  }
  if (!tezisFilter || tezisFilter === "4") {
    console.log("📊 T4 — YAML token efficiency (no API calls)");
    allResults.push(...runTezis4());
  }
  if (!tezisFilter || tezisFilter === "5") {
    console.log("📊 T5 — Text degrades with complexity (no API calls)");
    allResults.push(...runTezis5());
  }
  if (!tezisFilter || tezisFilter === "6") {
    console.log("📊 T6 — Intermediate layer without domain is useless");
    allResults.push(...await runTezis6(models));
  }
  if (!tezisFilter || tezisFilter === "7") {
    console.log("📊 T7 — LLM understands YAML by context not key names");
    allResults.push(...await runTezis7(models));
  }
  if (!tezisFilter || tezisFilter === "8") {
    console.log("📊 T8 — YAML + text beats pure YAML");
    allResults.push(...await runTezis8(models));
  }

  // merge with existing results
  let existing: any = { results: [] };
  if (fs.existsSync(RESULTS_FILE)) {
    existing = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf8"));
  }

  const output = {
    meta: {
      date: new Date().toISOString(),
      total_tezisy: 8,
    },
    results: [...existing.results, ...allResults],
  };

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(output, null, 2));
  console.log(`\n✅ Done. Saved to results.json`);

  // summary
  console.log("\n📋 Summary:");
  for (const r of allResults as any[]) {
    if ((r as any).model === "none") {
      console.log(`\n  T${(r as any).tezis} — ${(r as any).name}`);
      for (const run of (r as any).runs) {
        console.log(`    ${run.prompt_type.padEnd(6)} [${run.complexity}] ${run.tokens_prompt}t / ${run.decision_count}d = ${run.tokens_per_decision} t/decision`);
      }
    } else {
      console.log(`\n  T${(r as any).tezis} [${(r as any).model}]`);
      for (const run of (r as any).runs) {
        const bar = "█".repeat(run.score) + "░".repeat(run.total - run.score);
        console.log(`    ${run.prompt_type.padEnd(22)} ${bar} ${run.score}/${run.total}  assumed:${run.assumed}  tokens:${run.tokens_prompt}+${run.tokens_completion}`);
      }
    }
  }
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});