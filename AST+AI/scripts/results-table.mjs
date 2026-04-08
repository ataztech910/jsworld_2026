#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

function usage() {
  console.error('Usage: npm run results:table -- scripts/results/<report>.json');
}

function readNumber(value, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeEvaluation(evaluation) {
  if (!evaluation || typeof evaluation !== 'object') {
    return {
      primaryStrategy: 'unknown',
      isCorrect: false,
      isFocused: false,
      isLocalChange: false,
      isSafeToAutoApply: false,
      issuesDetected: [],
    };
  }

  return {
    primaryStrategy: evaluation.primaryStrategy || evaluation.strategyDetected || 'unknown',
    isCorrect: Boolean(evaluation.isCorrect),
    isFocused: Boolean(evaluation.isFocused),
    isLocalChange: Boolean(evaluation.isLocalChange ?? evaluation.isMinimal),
    isSafeToAutoApply: Boolean(evaluation.isSafeToAutoApply ?? evaluation.isSafe),
    issuesDetected: Array.isArray(evaluation.issuesDetected) ? evaluation.issuesDetected : [],
  };
}

function buildRunRow(run) {
  const evaluation = normalizeEvaluation(run.evaluation);
  const usage = run.usage && typeof run.usage === 'object' ? run.usage : {};

  return {
    runId: readNumber(run.runId),
    findingId: run.findingId || '-',
    type: run.type || '-',
    attempt: readNumber(run.attempt),
    strategy: evaluation.primaryStrategy,
    correct: evaluation.isCorrect,
    focused: evaluation.isFocused,
    local: evaluation.isLocalChange,
    safe: evaluation.isSafeToAutoApply,
    issues: evaluation.issuesDetected.length,
    durationMs: readNumber(run.durationMs),
    inTokens: readNumber(usage.input_tokens),
    outTokens: readNumber(usage.output_tokens),
  };
}

function average(values) {
  if (values.length === 0) {
    return 0;
  }
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function computeDerivedSummary(rows) {
  const total = rows.length;
  const strategies = new Map();
  let focused = 0;
  let correct = 0;
  let local = 0;
  let safe = 0;

  rows.forEach((row) => {
    strategies.set(row.strategy, (strategies.get(row.strategy) || 0) + 1);
    if (row.focused) focused += 1;
    if (row.correct) correct += 1;
    if (row.local) local += 1;
    if (row.safe) safe += 1;
  });

  const topStrategy = Array.from(strategies.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

  return {
    runCount: total,
    avgDurationMs: average(rows.map((row) => row.durationMs)),
    avgOutputTokens: average(rows.map((row) => row.outTokens)),
    focusedRate: total > 0 ? Number(((focused / total) * 100).toFixed(2)) : 0,
    correctnessRate: total > 0 ? Number(((correct / total) * 100).toFixed(2)) : 0,
    localRate: total > 0 ? Number(((local / total) * 100).toFixed(2)) : 0,
    safeRate: total > 0 ? Number(((safe / total) * 100).toFixed(2)) : 0,
    topStrategy,
  };
}

async function main() {
  const reportPathArg = process.argv[2];
  if (!reportPathArg) {
    usage();
    process.exit(1);
  }

  const reportPath = path.resolve(process.cwd(), reportPathArg);
  const raw = await fs.readFile(reportPath, 'utf8');
  const report = JSON.parse(raw);

  const runs = Array.isArray(report.runs) ? report.runs : [];
  if (runs.length === 0) {
    console.error('No runs found in report.');
    process.exit(1);
  }

  const rows = runs.map(buildRunRow).sort((a, b) => a.runId - b.runId);
  const derivedSummary = computeDerivedSummary(rows);

  console.log('\n=== REPORT ===');
  console.log(`File: ${reportPath}`);
  console.log(`Type: ${report?.experiment?.type || '-'}`);
  console.log(`Description: ${report?.experiment?.description || '-'}`);
  if (report?.source?.targetIssue) {
    console.log(`Target issue: ${report.source.targetIssue}`);
  }

  console.log('\n=== SUMMARY (from report) ===');
  console.table({
    summary: {
      averageLatencyMs: readNumber(report?.summary?.averageLatencyMs),
      minLatencyMs: readNumber(report?.summary?.minLatencyMs),
      maxLatencyMs: readNumber(report?.summary?.maxLatencyMs),
      consistencyScore: readNumber(report?.evaluationSummary?.consistencyScore),
      correctnessRate: readNumber(report?.evaluationSummary?.correctnessRate),
      focusRate: readNumber(report?.evaluationSummary?.focusRate),
      localChangeRate: readNumber(report?.evaluationSummary?.localChangeRate),
      minimalityRate: readNumber(report?.evaluationSummary?.minimalityRate),
      safetyAgreementRate: readNumber(report?.evaluationSummary?.safetyAgreementRate),
    },
  });

  console.log('\n=== SUMMARY (derived from runs) ===');
  console.table({ derived: derivedSummary });

  console.log('\n=== RUNS ===');
  console.table(rows);
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exit(1);
});

