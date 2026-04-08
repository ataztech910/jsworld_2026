#!/usr/bin/env node

import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs/promises";
import path from "node:path";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
const RUN_COUNT = 3;
const EXPERIMENT = {
  type: "AST_BOUND",
  description: "Claude optimization suggestions on bounded AST-derived React performance issue",
};

const INPUT_IDENTIFIERS = new Set([
  "entry",
  "measureAction",
  "selectedOrderIds",
  "setSelectedOrderIds",
  "sortedOrders",
  "OrderRow",
  "onSelect",
  "orderId",
]);

const KNOWN_REACT_APIS = new Set([
  "React",
  "useCallback",
  "useMemo",
  "useRef",
  "useState",
  "useEffect",
  "memo",
]);

const JS_BUILTINS = new Set([
  "Math",
  "Date",
  "Array",
  "Object",
  "String",
  "Number",
  "Boolean",
  "Promise",
  "JSON",
  "console",
  "map",
  "filter",
  "reduce",
  "sort",
  "includes",
  "return",
  "const",
  "let",
  "var",
  "function",
  "if",
  "else",
  "true",
  "false",
  "null",
  "undefined",
]);

const STRATEGY_RULES = [
  {
    strategy: "useCallback",
    test: (text) => /\buseCallback\b/i.test(text),
  },
  {
    strategy: "factory",
    test: (text) => /\bfactory\b/i.test(text) || /\(\)\s*=>\s*\(\)/.test(text),
  },
  {
    strategy: "rewrite",
    test: (text) =>
      /\brewrite\b/i.test(text) ||
      /\bfull component\b/i.test(text) ||
      /\bentire component\b/i.test(text) ||
      /\bcomplete component\b/i.test(text) ||
      /\breplace the component\b/i.test(text),
  },
];

function getTimeMeta() {
  const now = new Date();
  return {
    timestamp: now.getTime(),
    iso: now.toISOString(),
    local: now.toLocaleString(),
  };
}

function percentage(part, total) {
  if (total <= 0) {
    return 0;
  }
  return Number(((part / total) * 100).toFixed(2));
}

function hasRewriteSignal(text) {
  return (
    /\brewrite\b/i.test(text) ||
    /\bfull rewrite\b/i.test(text) ||
    /\brewrite the component\b/i.test(text) ||
    /\bentire component\b/i.test(text) ||
    /\bfull component\b/i.test(text) ||
    /\bcomplete component\b/i.test(text) ||
    /\breplace the component\b/i.test(text)
  );
}

function hasLargeStructuralChangeSignal(text) {
  return (
    /\bnew architecture\b/i.test(text) ||
    /\brestructure\b/i.test(text) ||
    /\bmigrate\b/i.test(text) ||
    /\bextract .* hook\b/i.test(text) ||
    /\bmove .* to separate component\b/i.test(text)
  );
}

function detectStrategy(text) {
  for (const rule of STRATEGY_RULES) {
    if (rule.test(text)) {
      return rule.strategy;
    }
  }
  return "unknown";
}

function extractCodeContexts(text) {
  const parts = [];
  const fencedRegex = /```[\s\S]*?```/g;
  const inlineRegex = /`[^`\n]+`/g;

  const fenced = text.match(fencedRegex) || [];
  const inline = text.match(inlineRegex) || [];

  fenced.forEach((chunk) => {
    parts.push(chunk.replace(/```[\w-]*\n?/, "").replace(/```$/, ""));
  });
  inline.forEach((chunk) => {
    parts.push(chunk.slice(1, -1));
  });

  if (parts.length === 0) {
    parts.push(text);
  }

  return parts;
}

function collectDeclaredIdentifiers(codeText) {
  const declared = new Set();
  const declarationRegex = /\b(?:const|let|var|function)\s+([A-Za-z_][A-Za-z0-9_]*)/g;

  let match;
  while ((match = declarationRegex.exec(codeText)) !== null) {
    declared.add(match[1]);
  }

  return declared;
}

function detectHallucinations(text) {
  const contexts = extractCodeContexts(text);
  const notes = [];
  let hallucination = false;

  const unknownApiRegex = /\b(use[A-Z][A-Za-z0-9_]*)\b/g;

  contexts.forEach((ctx) => {
    const declared = collectDeclaredIdentifiers(ctx);
    const identifiers = ctx.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) || [];

    identifiers.forEach((identifier) => {
      if (declared.has(identifier)) {
        return;
      }

      if (INPUT_IDENTIFIERS.has(identifier) || KNOWN_REACT_APIS.has(identifier) || JS_BUILTINS.has(identifier)) {
        return;
      }

      if (/^[A-Z]/.test(identifier)) {
        return;
      }

      if (identifier.length <= 2) {
        return;
      }

      hallucination = true;
      notes.push(`unknown variable/reference: ${identifier}`);
    });

    let match;
    while ((match = unknownApiRegex.exec(ctx)) !== null) {
      const hookName = match[1];
      if (!KNOWN_REACT_APIS.has(hookName) && !declared.has(hookName)) {
        hallucination = true;
        notes.push(`invented API/hook: ${hookName}`);
      }
    }
  });

  return {
    hallucination,
    notes: Array.from(new Set(notes)),
  };
}

function evaluateResponse(responseText) {
  const strategyDetected = detectStrategy(responseText);
  const rewriteSignal = hasRewriteSignal(responseText);
  const largeChangeSignal = hasLargeStructuralChangeSignal(responseText);

  const mentionsRerenders = /\bre-?renders?\b/i.test(responseText);
  const mentionsInlineProblem =
    /\binline (function|handler|callback)\b/i.test(responseText) ||
    /\bfunction inside map\b/i.test(responseText) ||
    /\bhandler inside map\b/i.test(responseText) ||
    /\bnew function on each render\b/i.test(responseText);

  const isCorrect = mentionsRerenders && mentionsInlineProblem;
  const isMinimal = !rewriteSignal && !largeChangeSignal;

  let isSafe = false;
  if (/\bnot safe\b/i.test(responseText) || /\bunsafe\b/i.test(responseText)) {
    isSafe = false;
  } else if (/\bsafe to auto-apply\b/i.test(responseText) || /\bit is safe\b/i.test(responseText) || /\bsafe\b/i.test(responseText)) {
    isSafe = true;
  }

  const respectsConstraints =
    !rewriteSignal &&
    !/\bignore (the )?(instruction|constraint)s?\b/i.test(responseText) &&
    !/\bfull component rewrite\b/i.test(responseText);

  const hallucinationResult = detectHallucinations(responseText);

  const notes = [
    `strategy: ${strategyDetected}`,
    isCorrect ? "correctness signals present" : "missing correctness signals",
    isMinimal ? "minimal change suggested" : "non-minimal structural change detected",
    isSafe ? "explicitly marked safe" : "not explicitly safe or marked unsafe",
    respectsConstraints ? "constraints respected" : "constraints potentially violated",
    hallucinationResult.hallucination ? "possible hallucinations detected" : "no obvious hallucinations",
    ...hallucinationResult.notes,
  ].join("; ");

  return {
    strategyDetected,
    isCorrect,
    isMinimal,
    isSafe,
    respectsConstraints,
    hallucinations: hallucinationResult.hallucination,
    notes,
  };
}

function buildEvaluationSummary(results) {
  const total = results.length;
  if (total === 0) {
    return {
      consistencyScore: 0,
      correctnessRate: 0,
      minimalityRate: 0,
      safetyAgreementRate: 0,
    };
  }

  const strategyCounts = new Map();
  let correctCount = 0;
  let minimalCount = 0;
  let safeCount = 0;

  results.forEach((run) => {
    const strategy = run.evaluation.strategyDetected;
    strategyCounts.set(strategy, (strategyCounts.get(strategy) || 0) + 1);

    if (run.evaluation.isCorrect) {
      correctCount += 1;
    }
    if (run.evaluation.isMinimal) {
      minimalCount += 1;
    }
    if (run.evaluation.isSafe) {
      safeCount += 1;
    }
  });

  const maxStrategyCount = Math.max(...Array.from(strategyCounts.values()));
  const unsafeCount = total - safeCount;
  const safetyMajority = Math.max(safeCount, unsafeCount);

  return {
    consistencyScore: percentage(maxStrategyCount, total),
    correctnessRate: percentage(correctCount, total),
    minimalityRate: percentage(minimalCount, total),
    safetyAgreementRate: percentage(safetyMajority, total),
  };
}

const prompt = `
You are given a bounded React performance issue extracted from AST analysis.

Issue type:
inline-handler-in-map

Goal:
stabilize handler reference to reduce rerenders

Code:
onSelect={() => {
  measureAction('actions.toggleOrderSelection', () => {
    if (selectedOrderIds.includes(entry.order.id)) {
      setSelectedOrderIds(selectedOrderIds.filter(id => id !== entry.order.id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, entry.order.id]);
    }
  }, { kind: 'user', orderId: entry.order.id });
}}

Context:
sortedOrders.map(entry => <OrderRow ... />)

Variables:
["entry","measureAction","selectedOrderIds","setSelectedOrderIds"]

Task:
Suggest the smallest safe React change that would reduce unnecessary rerenders.

Constraints:
- do not rewrite the whole component
- prefer minimal diff
- preserve behavior
- keep instrumentation

Return:
1. explanation
2. minimal fix
2. code example
4. is this safe to auto-apply (yes/no and why)
`;

async function runTest(runId) {
  const start = Date.now();
  const startedAt = getTimeMeta();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    temperature: 0, // критично для стабильности
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const duration = Date.now() - start;
  const finishedAt = getTimeMeta();

  const text = response.content[0].text;
  const evaluation = evaluateResponse(text);

  console.log(`\n--- RUN ${runId} ---`);
  console.log(`Latency: ${duration}ms`);
  console.log(text);

  return {
    runId,
    durationMs: duration,
    startedAt,
    finishedAt,
    prompt,
    text,
    usage: response.usage,
    evaluation,
  };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing. Add it to your .env before running.");
  }

  const sessionStartedAt = getTimeMeta();
  const results = [];

  for (let i = 1; i <= RUN_COUNT; i++) {
    const res = await runTest(i);
    results.push(res);
  }

  const sessionFinishedAt = getTimeMeta();
  const averageLatencyMs =
    results.length > 0
      ? Math.round(results.reduce((sum, run) => sum + run.durationMs, 0) / results.length)
      : 0;

  const report = {
    experiment: EXPERIMENT,
    model: MODEL,
    runCount: RUN_COUNT,
    prompt,
    sessionStartedAt,
    sessionFinishedAt,
    summary: {
      averageLatencyMs,
      minLatencyMs: Math.min(...results.map((run) => run.durationMs)),
      maxLatencyMs: Math.max(...results.map((run) => run.durationMs)),
    },
    evaluationSummary: buildEvaluationSummary(results),
    runs: results,
  };

  const resultsDir = path.resolve(process.cwd(), "scripts", "results");
  await fs.mkdir(resultsDir, { recursive: true });

  const reportFileName = `claude-test-${sessionStartedAt.timestamp}.json`;
  const reportFilePath = path.join(resultsDir, reportFileName);
  await fs.writeFile(reportFilePath, JSON.stringify(report, null, 2), "utf8");

  console.log("\n=== SUMMARY ===");
  results.forEach(r => {
    console.log(`Run ${r.runId}: ${r.durationMs}ms`);
  });
  console.log(`Average: ${averageLatencyMs}ms`);
  console.log(`Saved report: ${reportFilePath}`);
}

main().catch((error) => {
  const apiErrorType = error?.error?.type;
  const apiMessage = error?.error?.message;

  if (apiErrorType === "not_found_error" || String(apiMessage || "").includes("model:")) {
    console.error("Model not found.");
    console.error(`Current model: ${MODEL}`);
    console.error(
      "Set ANTHROPIC_MODEL in .env, for example: ANTHROPIC_MODEL=claude-sonnet-4-20250514"
    );
    process.exit(1);
  }

  console.error(error.message);
  process.exit(1);
});
