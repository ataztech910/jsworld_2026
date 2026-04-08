import fs from 'node:fs/promises';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { buildFullPrompt, buildPrompt, type Finding } from './promptBuilder.ts';
import { buildEvaluationSummary, evaluateResponse, type EvaluationResult } from './evaluate.ts';

interface RunTimeMeta {
  timestamp: number;
  iso: string;
  local: string;
}

interface RunRecord {
  runId: number;
  findingId: string;
  type: string;
  location: string;
  attempt: number;
  prompt: string;
  response: string;
  durationMs: number;
  startedAt: RunTimeMeta;
  finishedAt: RunTimeMeta;
  usage: unknown;
  evaluation: EvaluationResult;
}

interface FindingsFilePayload {
  component?: string;
  findings?: Array<Partial<Finding>>;
}

interface LoadedFindings {
  component: string;
  findings: Finding[];
}

interface RunExperimentOptions {
  findingsFilePath: string;
}

interface RunFullContextExperimentOptions {
  filePath: string;
}

interface RunResult {
  report: Record<string, unknown>;
  reportFilePath: string;
}

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_RUN_COUNT = 3;

function getTimeMeta(): RunTimeMeta {
  const now = new Date();
  return {
    timestamp: now.getTime(),
    iso: now.toISOString(),
    local: now.toLocaleString(),
  };
}

function normalizeVariables(variables: unknown): string[] {
  if (!Array.isArray(variables)) {
    return [];
  }

  const unique = new Set<string>();
  variables.forEach((value) => {
    if (typeof value === 'string' && value.trim()) {
      unique.add(value.trim());
    }
  });

  return Array.from(unique);
}

function normalizeFinding(
  raw: Partial<Finding> | null | undefined,
  index: number,
  componentName: string
): Finding {
  const type = typeof raw?.type === 'string' ? raw.type : 'unknown-type';
  const location = typeof raw?.location === 'string' ? raw.location : `${componentName}:?`;

  return {
    findingId:
      typeof raw?.findingId === 'string' && raw.findingId.trim()
        ? raw.findingId.trim()
        : `finding-${String(index + 1).padStart(3, '0')}`,
    type,
    location,
    code: typeof raw?.code === 'string' ? raw.code : '',
    context: typeof raw?.context === 'string' ? raw.context : '',
    variables: normalizeVariables(raw?.variables),
    goal: typeof raw?.goal === 'string' ? raw.goal : '',
  };
}

async function loadFindings(findingsFilePath: string): Promise<LoadedFindings> {
  const absolutePath = path.resolve(process.cwd(), findingsFilePath);
  const rawJson = await fs.readFile(absolutePath, 'utf8');
  const parsed = JSON.parse(rawJson) as FindingsFilePayload | Array<Partial<Finding>>;

  let component = 'UnknownComponent';
  let rawFindings: Array<Partial<Finding>> = [];

  if (Array.isArray(parsed)) {
    rawFindings = parsed;
  } else if (parsed && Array.isArray(parsed.findings)) {
    rawFindings = parsed.findings;
    if (typeof parsed.component === 'string' && parsed.component.trim()) {
      component = parsed.component.trim();
    }
  } else {
    throw new Error('Invalid findings JSON format. Expected { component, findings: [] } or []');
  }

  const findings = rawFindings.map((item, index) => normalizeFinding(item, index, component));

  if (findings.length === 0) {
    throw new Error('Findings JSON is empty. Nothing to run.');
  }

  return {
    component,
    findings,
  };
}

function toResponseText(response: Awaited<ReturnType<Anthropic['messages']['create']>>): string {
  const parts = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block.type === 'text' ? block.text : ''));

  return parts.join('\n').trim();
}

function summarizeLatency(runs: RunRecord[]) {
  if (runs.length === 0) {
    return {
      averageLatencyMs: 0,
      minLatencyMs: 0,
      maxLatencyMs: 0,
    };
  }

  const durations = runs.map((run) => run.durationMs);
  const total = durations.reduce((sum, value) => sum + value, 0);

  return {
    averageLatencyMs: Math.round(total / durations.length),
    minLatencyMs: Math.min(...durations),
    maxLatencyMs: Math.max(...durations),
  };
}

function getModel() {
  return process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
}

function getRunCount() {
  const value = Number.parseInt(process.env.AST_EXPERIMENT_RUNS || String(DEFAULT_RUN_COUNT), 10);
  if (!Number.isFinite(value) || value < 1) {
    throw new Error('AST_EXPERIMENT_RUNS must be a positive integer.');
  }
  return value;
}

function createClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is missing. Add it to your .env before running.');
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

function stripStrings(value: string) {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n\r]*/g, ' ')
    .replace(/(["'`])(?:\\.|(?!\1)[\s\S])*\1/g, ' ');
}

function collectFileVariables(code: string): string[] {
  const source = stripStrings(code);
  const identifiers = source.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) || [];
  const unique = new Set<string>();

  identifiers.forEach((value) => {
    if (value.length > 0) {
      unique.add(value);
    }
  });

  return Array.from(unique).sort();
}

async function persistReport(report: Record<string, unknown>, filePrefix: string, timestamp: number) {
  const resultsDir = path.resolve(process.cwd(), 'scripts', 'results');
  await fs.mkdir(resultsDir, { recursive: true });

  const reportFileName = `${filePrefix}-${timestamp}.json`;
  const reportFilePath = path.join(resultsDir, reportFileName);
  await fs.writeFile(reportFilePath, JSON.stringify(report, null, 2), 'utf8');

  return reportFilePath;
}

async function executePromptRun(
  client: Anthropic,
  model: string,
  runId: number,
  attempt: number,
  finding: Finding,
  prompt: string
): Promise<RunRecord> {
  const startedAt = getTimeMeta();
  const startedMs = Date.now();

  const response = await client.messages.create({
    model,
    max_tokens: 800,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const durationMs = Date.now() - startedMs;
  const finishedAt = getTimeMeta();
  const responseText = toResponseText(response);
  const evaluation = evaluateResponse(responseText, finding);

  console.log(`\n--- RUN ${runId} ---`);
  console.log(`Finding: ${finding.findingId} (${finding.type})`);
  console.log(`Latency: ${durationMs}ms`);
  console.log(responseText);

  return {
    runId,
    findingId: finding.findingId,
    type: finding.type,
    location: finding.location,
    attempt,
    prompt,
    response: responseText,
    durationMs,
    startedAt,
    finishedAt,
    usage: response.usage,
    evaluation,
  };
}

function printSummary(runs: RunRecord[], averageLatencyMs: number, reportFilePath: string) {
  console.log('\n=== SUMMARY ===');
  runs.forEach((run) => {
    console.log(`Run ${run.runId} [${run.findingId}] (${run.type}): ${run.durationMs}ms`);
  });
  console.log(`Average: ${averageLatencyMs}ms`);
  console.log(`Saved report: ${reportFilePath}`);
}

export async function runAstExperiment(options: RunExperimentOptions): Promise<RunResult> {
  const model = getModel();
  const runCountPerFinding = getRunCount();
  const client = createClient();

  const findingsAbsolutePath = path.resolve(process.cwd(), options.findingsFilePath);
  const loaded = await loadFindings(findingsAbsolutePath);

  const sessionStartedAt = getTimeMeta();
  const runs: RunRecord[] = [];
  let nextRunId = 1;

  for (const finding of loaded.findings) {
    const prompt = buildPrompt(finding);

    for (let attempt = 1; attempt <= runCountPerFinding; attempt += 1) {
      const run = await executePromptRun(client, model, nextRunId, attempt, finding, prompt);
      runs.push(run);
      nextRunId += 1;
    }
  }

  const sessionFinishedAt = getTimeMeta();
  const summary = summarizeLatency(runs);
  const evaluationSummary = buildEvaluationSummary(runs);

  const report = {
    experiment: {
      type: 'AST_BOUND',
      description: `AST-driven optimization experiment for ${loaded.component}`,
    },
    source: {
      component: loaded.component,
      findingsFile: findingsAbsolutePath,
      findingCount: loaded.findings.length,
    },
    model,
    runCountPerFinding,
    sessionStartedAt,
    sessionFinishedAt,
    summary,
    evaluationSummary,
    runs,
  };

  const reportFilePath = await persistReport(report, 'ast-experiment', sessionStartedAt.timestamp);
  printSummary(runs, summary.averageLatencyMs, reportFilePath);

  return {
    report,
    reportFilePath,
  };
}

export async function runFullContextExperiment(
  options: RunFullContextExperimentOptions
): Promise<RunResult> {
  const model = getModel();
  const runCount = getRunCount();
  const client = createClient();

  const absoluteFilePath = path.resolve(process.cwd(), options.filePath);
  const fileCode = await fs.readFile(absoluteFilePath, 'utf8');
  const prompt = buildFullPrompt(fileCode);

  const fullFinding: Finding = {
    findingId: 'full-context-001',
    type: 'full-context-analysis',
    location: `${path.basename(absoluteFilePath)}:1`,
    code: fileCode,
    context: `full file context (${path.basename(absoluteFilePath)})`,
    variables: collectFileVariables(fileCode),
    goal: 'identify and optimize performance issues while preserving behavior',
  };

  const sessionStartedAt = getTimeMeta();
  const runs: RunRecord[] = [];

  for (let attempt = 1; attempt <= runCount; attempt += 1) {
    const run = await executePromptRun(client, model, attempt, attempt, fullFinding, prompt);
    runs.push(run);
  }

  const sessionFinishedAt = getTimeMeta();
  const summary = summarizeLatency(runs);
  const evaluationSummary = buildEvaluationSummary(runs);

  const report = {
    experiment: {
      type: 'FULL_CONTEXT',
      description: `Full-context optimization experiment for ${path.basename(absoluteFilePath)}`,
    },
    source: {
      filePath: absoluteFilePath,
    },
    model,
    runCount,
    sessionStartedAt,
    sessionFinishedAt,
    summary,
    evaluationSummary,
    runs,
  };

  const reportFilePath = await persistReport(report, 'full-context-experiment', sessionStartedAt.timestamp);
  printSummary(runs, summary.averageLatencyMs, reportFilePath);

  return {
    report,
    reportFilePath,
  };
}
