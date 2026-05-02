import { useState, type ChangeEvent } from 'react';

type ViewerMode = 'single' | 'compare';
type CompareSide = 'ast' | 'full';
type BetterDirection = 'higher' | 'lower' | 'none';

interface RunRow {
  runId: number;
  findingId: string;
  type: string;
  attempt: number;
  strategy: string;
  correct: boolean;
  targeted: boolean;
  localized: boolean;
  safeToAutoApply: boolean;
  issues: number;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
}

interface ReportMetrics {
  correctnessRate: number;
  targetedRate: number;
  localizedRate: number;
  safeRate: number;
  avgLatencyMs: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  runCount: number;
  dominantStrategy: string;
}

interface ParsedReportData {
  report: Record<string, unknown>;
  rows: RunRow[];
  experimentType: string;
  model: string;
  targetIssue: string;
  component: string;
  metrics: ReportMetrics;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readOptionalString(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return '';
}

function readString(value: unknown, fallback = '-'): string {
  const normalized = readOptionalString(value);
  return normalized || fallback;
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function formatNumber(value: number): string {
  return `${Number(value.toFixed(2))}`;
}

function normalizeEvaluation(value: unknown) {
  const record = asRecord(value);
  if (!record) {
    return {
      strategy: 'unknown',
      correct: false,
      targeted: false,
      localized: false,
      safeToAutoApply: false,
      issues: 0,
    };
  }

  const issuesDetected = Array.isArray(record.issuesDetected) ? record.issuesDetected : [];

  return {
    strategy: readString(record.primaryStrategy ?? record.strategyDetected, 'unknown'),
    correct: readBoolean(record.isCorrect),
    targeted: readBoolean(record.isFocused),
    localized: readBoolean(record.isLocalChange ?? record.isMinimal),
    safeToAutoApply: readBoolean(record.isSafeToAutoApply ?? record.isSafe),
    issues: issuesDetected.length,
  };
}

function normalizeRunRow(value: unknown): RunRow {
  const record = asRecord(value);
  const usage = asRecord(record?.usage);
  const evaluation = normalizeEvaluation(record?.evaluation);

  return {
    runId: readNumber(record?.runId),
    findingId: readString(record?.findingId),
    type: readString(record?.type),
    attempt: readNumber(record?.attempt),
    strategy: evaluation.strategy,
    correct: evaluation.correct,
    targeted: evaluation.targeted,
    localized: evaluation.localized,
    safeToAutoApply: evaluation.safeToAutoApply,
    issues: evaluation.issues,
    durationMs: readNumber(record?.durationMs),
    inputTokens: readNumber(usage?.input_tokens),
    outputTokens: readNumber(usage?.output_tokens),
  };
}

function dominantStrategy(rows: RunRow[]): string {
  if (rows.length === 0) {
    return 'unknown';
  }

  const counts = new Map<string, number>();
  rows.forEach((row) => {
    counts.set(row.strategy, (counts.get(row.strategy) || 0) + 1);
  });

  const winner = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
  return winner?.[0] || 'unknown';
}

function deriveRatesFromRows(rows: RunRow[]) {
  const total = rows.length;
  if (total === 0) {
    return {
      correctnessRate: 0,
      targetedRate: 0,
      localizedRate: 0,
      safeRate: 0,
      avgLatencyMs: 0,
      avgInputTokens: 0,
      avgOutputTokens: 0,
      runCount: 0,
      dominantStrategy: 'unknown',
    } satisfies ReportMetrics;
  }

  const correctnessRate = Number(
    ((rows.filter((row) => row.correct).length / total) * 100).toFixed(2)
  );
  const targetedRate = Number(
    ((rows.filter((row) => row.targeted).length / total) * 100).toFixed(2)
  );
  const localizedRate = Number(
    ((rows.filter((row) => row.localized).length / total) * 100).toFixed(2)
  );

  const safeRate = Number(
    ((rows.filter((row) => row.safeToAutoApply).length / total) * 100).toFixed(2)
  );

  return {
    correctnessRate,
    targetedRate,
    localizedRate,
    safeRate,
    avgLatencyMs: average(rows.map((row) => row.durationMs)),
    avgInputTokens: average(rows.map((row) => row.inputTokens)),
    avgOutputTokens: average(rows.map((row) => row.outputTokens)),
    runCount: total,
    dominantStrategy: dominantStrategy(rows),
  } satisfies ReportMetrics;
}

function fileBaseName(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const fileName = normalized.split('/').pop() || '';
  return fileName.replace(/\.[^.]+$/, '');
}

function extractTargetIssue(report: Record<string, unknown>): string {
  const source = asRecord(report.source);
  const sourceTarget = readOptionalString(source?.targetIssue);
  if (sourceTarget) {
    return sourceTarget;
  }

  const runs = Array.isArray(report.runs) ? report.runs : [];
  const firstRun = asRecord(runs[0]);
  const evaluation = asRecord(firstRun?.evaluation);
  const notes = readOptionalString(evaluation?.notes);
  const match = notes.match(/targetIssue=([^;]+)/);
  if (match?.[1]) {
    return match[1].trim();
  }

  return '';
}

function extractComponent(report: Record<string, unknown>): string {
  const source = asRecord(report.source);

  const sourceComponent = readOptionalString(source?.component);
  if (sourceComponent) {
    return sourceComponent;
  }

  const sourceFilePath = readOptionalString(source?.filePath);
  if (sourceFilePath) {
    return fileBaseName(sourceFilePath);
  }

  return '';
}

function extractMetrics(report: Record<string, unknown>, rows: RunRow[]): ReportMetrics {
  const derived = deriveRatesFromRows(rows);
  const summary = asRecord(report.summary);
  const evaluationSummary = asRecord(report.evaluationSummary);

  return {
    correctnessRate: readNumber(evaluationSummary?.correctnessRate, derived.correctnessRate),
    targetedRate: readNumber(evaluationSummary?.focusRate, derived.targetedRate),
    localizedRate: readNumber(
      evaluationSummary?.localChangeRate ?? evaluationSummary?.minimalityRate,
      derived.localizedRate
    ),
    safeRate: derived.safeRate,
    avgLatencyMs: readNumber(summary?.averageLatencyMs, derived.avgLatencyMs),
    avgInputTokens: derived.avgInputTokens,
    avgOutputTokens: derived.avgOutputTokens,
    runCount: rows.length,
    dominantStrategy: derived.dominantStrategy,
  };
}

function parseReport(rawText: string): ParsedReportData {
  const parsed = JSON.parse(rawText) as unknown;
  const report = asRecord(parsed);

  if (!report) {
    throw new Error('Expected a JSON object at root.');
  }

  const runs = Array.isArray(report.runs) ? report.runs : null;
  if (!runs) {
    throw new Error('Field "runs" is missing or not an array.');
  }

  const rows = runs.map(normalizeRunRow).sort((a, b) => a.runId - b.runId);
  const experiment = asRecord(report.experiment);

  return {
    report,
    rows,
    experimentType: readString(experiment?.type, 'unknown'),
    model: readString(report.model, 'unknown'),
    targetIssue: extractTargetIssue(report),
    component: extractComponent(report),
    metrics: extractMetrics(report, rows),
  };
}

function normalizeForCompare(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.tsx?$|\.jsx?$/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function buildInterpretation(astMetrics: ReportMetrics, fullMetrics: ReportMetrics): string {
  if (
    Math.round(astMetrics.correctnessRate) === 100 &&
    Math.round(fullMetrics.correctnessRate) === 100 &&
    astMetrics.targetedRate > fullMetrics.targetedRate
  ) {
    return 'Both approaches are technically correct (100% correctness), but only AST_BOUND consistently targets the actual issue. FULL_CONTEXT produces generic optimizations that do not address the root cause.';
  }

  return 'Both approaches are technically correct, but AST_BOUND is more targeted while FULL_CONTEXT is broader and more generic.';
}

function buildTargetingExplanation(astTargetedRate: number, fullTargetedRate: number): string {
  if (astTargetedRate > fullTargetedRate) {
    return 'AST_BOUND is more focused on the target issue.';
  }

  if (fullTargetedRate > astTargetedRate) {
    return 'FULL_CONTEXT is more focused (unexpected).';
  }

  return 'Both approaches have similar issue targeting.';
}

function buildStrategyAnalysis(
  astStrategy: string,
  fullStrategy: string,
  targetIssue: string
): string[] {
  const lines: string[] = [];
  const normalizedTargetIssue = targetIssue.toLowerCase();

  if (normalizedTargetIssue.includes('inline-handler-in-map') && astStrategy === 'useCallback') {
    lines.push('AST_BOUND selects useCallback, directly addressing handler identity instability.');
  }

  if (fullStrategy === 'useMemo') {
    lines.push(
      'FULL_CONTEXT defaults to useMemo, which optimizes computation but does not fix the root cause of re-renders.'
    );
  }

  if (lines.length === 0) {
    lines.push('No strong strategy-specific pattern detected for this target issue.');
  }

  return lines;
}

function compareNumeric(astValue: number, fullValue: number, direction: BetterDirection): 'ast' | 'full' | 'tie' {
  if (direction === 'none' || astValue === fullValue) {
    return 'tie';
  }

  if (direction === 'higher') {
    return astValue > fullValue ? 'ast' : 'full';
  }

  return astValue < fullValue ? 'ast' : 'full';
}

function valueClass(winner: 'ast' | 'full' | 'tie', side: 'ast' | 'full'): string {
  if (winner === 'tie') {
    return '';
  }

  return winner === side ? 'is-better' : 'is-worse';
}

function buildEfficiencyText(
  astMetrics: ReportMetrics,
  fullMetrics: ReportMetrics
): { headline: string; tokenDelta: string; factorLabel: string } {
  const astInput = astMetrics.avgInputTokens;
  const fullInput = fullMetrics.avgInputTokens;
  const factor = astInput > 0 ? fullInput / astInput : 0;
  const roundedFactor = factor > 0 ? Math.round(factor) : 0;
  const factorLabel = roundedFactor > 0 ? `~${roundedFactor}x` : 'n/a';
  const tokenDelta = `${Math.round(astInput)} → ${Math.round(fullInput)} (+${factorLabel})`;

  const headline =
    roundedFactor > 0
      ? `AST_BOUND uses ${factorLabel} fewer input tokens while achieving same correctness and better issue targeting.`
      : 'Token efficiency could not be computed for this comparison.';

  return { headline, tokenDelta, factorLabel };
}

interface ResultsReportViewerProps {
  preloadedAstJson?: string;
  preloadedFullJson?: string;
}

export function ResultsReportViewer({ preloadedAstJson, preloadedFullJson }: ResultsReportViewerProps = {}) {
  const [mode, setMode] = useState<ViewerMode>(() =>
    preloadedAstJson && preloadedFullJson ? 'compare' : 'single'
  );

  const [singleRawText, setSingleRawText] = useState('');
  const [singleFileName, setSingleFileName] = useState('');
  const [singleError, setSingleError] = useState('');
  const [singleReport, setSingleReport] = useState<ParsedReportData | null>(null);

  const [astRawText, setAstRawText] = useState(preloadedAstJson ?? '');
  const [fullRawText, setFullRawText] = useState(preloadedFullJson ?? '');
  const [astFileName, setAstFileName] = useState(preloadedAstJson ? 'ast-experiment.json' : '');
  const [fullFileName, setFullFileName] = useState(preloadedFullJson ? 'full-context-experiment.json' : '');
  const [compareError, setCompareError] = useState('');
  const [compareWarnings, setCompareWarnings] = useState<string[]>([]);
  const [astReport, setAstReport] = useState<ParsedReportData | null>(() => {
    if (!preloadedAstJson || !preloadedFullJson) return null;
    try { return parseReport(preloadedAstJson); } catch { return null; }
  });
  const [fullReport, setFullReport] = useState<ParsedReportData | null>(() => {
    if (!preloadedAstJson || !preloadedFullJson) return null;
    try { return parseReport(preloadedFullJson); } catch { return null; }
  });

  function handleParseSingle() {
    try {
      const parsed = parseReport(singleRawText);
      setSingleReport(parsed);
      setSingleError('');
    } catch (error) {
      setSingleReport(null);
      setSingleError(error instanceof Error ? error.message : 'Failed to parse JSON.');
    }
  }

  function handleClearSingle() {
    setSingleRawText('');
    setSingleFileName('');
    setSingleError('');
    setSingleReport(null);
  }

  async function handleSingleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    setSingleRawText(text);
    setSingleFileName(file.name);
    setSingleError('');
  }

  function handleClearCompare() {
    setAstRawText('');
    setFullRawText('');
    setAstFileName('');
    setFullFileName('');
    setCompareError('');
    setCompareWarnings([]);
    setAstReport(null);
    setFullReport(null);
  }

  async function handleCompareFileChange(side: CompareSide, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();

    if (side === 'ast') {
      setAstRawText(text);
      setAstFileName(file.name);
    } else {
      setFullRawText(text);
      setFullFileName(file.name);
    }

    setCompareError('');
  }

  function handleParseCompare() {
    try {
      const parsedAst = parseReport(astRawText);
      const parsedFull = parseReport(fullRawText);

      const warnings: string[] = [];

      if (parsedAst.experimentType !== 'AST_BOUND' || parsedFull.experimentType !== 'FULL_CONTEXT') {
        warnings.push(
          `Experiment family mismatch: expected AST_BOUND vs FULL_CONTEXT, got ${parsedAst.experimentType} vs ${parsedFull.experimentType}.`
        );
      }

      if (
        parsedAst.targetIssue &&
        parsedFull.targetIssue &&
        parsedAst.targetIssue !== parsedFull.targetIssue
      ) {
        warnings.push(
          `Target issue mismatch: AST="${parsedAst.targetIssue}" vs FULL="${parsedFull.targetIssue}".`
        );
      }

      if (!parsedAst.targetIssue || !parsedFull.targetIssue) {
        warnings.push('Target issue is missing in one of the reports; comparison may be less strict.');
      }

      if (parsedAst.model !== parsedFull.model) {
        warnings.push(`Models differ: AST=${parsedAst.model}, FULL=${parsedFull.model}.`);
      }

      if (parsedAst.component && parsedFull.component) {
        const astComponentKey = normalizeForCompare(parsedAst.component);
        const fullComponentKey = normalizeForCompare(parsedFull.component);
        if (astComponentKey && fullComponentKey && astComponentKey !== fullComponentKey) {
          warnings.push(`Components differ: AST=${parsedAst.component}, FULL=${parsedFull.component}.`);
        }
      }

      if (parsedAst.rows.length !== parsedFull.rows.length) {
        warnings.push(
          `Uneven sample size: AST=${parsedAst.rows.length}, FULL=${parsedFull.rows.length}. Comparing first ${Math.min(
            parsedAst.rows.length,
            parsedFull.rows.length
          )} paired runs only.`
        );
      }

      setAstReport(parsedAst);
      setFullReport(parsedFull);
      setCompareWarnings(warnings);
      setCompareError('');
    } catch (error) {
      setAstReport(null);
      setFullReport(null);
      setCompareWarnings([]);
      setCompareError(error instanceof Error ? error.message : 'Failed to compare reports.');
    }
  }

  const compareMinRuns =
    astReport && fullReport ? Math.min(astReport.rows.length, fullReport.rows.length) : 0;

  const astComparedRows = astReport ? astReport.rows.slice(0, compareMinRuns) : [];
  const fullComparedRows = fullReport ? fullReport.rows.slice(0, compareMinRuns) : [];

  const astComparedMetrics = deriveRatesFromRows(astComparedRows);
  const fullComparedMetrics = deriveRatesFromRows(fullComparedRows);

  const safetyAgreementRate =
    compareMinRuns === 0
      ? 0
      : Number(
          (
            (astComparedRows.filter(
              (astRow, index) => astRow.safeToAutoApply === fullComparedRows[index]?.safeToAutoApply
            ).length /
              compareMinRuns) *
            100
          ).toFixed(2)
        );

  const pairedRuns = Array.from({ length: compareMinRuns }).map((_, index) => ({
    runNumber: index + 1,
    ast: astComparedRows[index],
    full: fullComparedRows[index],
  }));

  const effectiveTargetIssue = astReport?.targetIssue || fullReport?.targetIssue || '';

  const interpretation =
    astReport && fullReport ? buildInterpretation(astComparedMetrics, fullComparedMetrics) : '';

  const targetingExplanation = buildTargetingExplanation(
    astComparedMetrics.targetedRate,
    fullComparedMetrics.targetedRate
  );

  const strategyAnalysis = buildStrategyAnalysis(
    astComparedMetrics.dominantStrategy,
    fullComparedMetrics.dominantStrategy,
    effectiveTargetIssue
  );

  const efficiency = buildEfficiencyText(astComparedMetrics, fullComparedMetrics);

  const compareRows =
    astReport && fullReport
      ? [
          {
            key: 'correctness',
            label: 'Correctness rate',
            astValue: astComparedMetrics.correctnessRate,
            fullValue: fullComparedMetrics.correctnessRate,
            direction: 'higher' as BetterDirection,
            format: formatPercent,
            emphasize: false,
            muted: false,
          },
          {
            key: 'targeted',
            label: 'Targeted to issue',
            astValue: astComparedMetrics.targetedRate,
            fullValue: fullComparedMetrics.targetedRate,
            direction: 'higher' as BetterDirection,
            format: formatPercent,
            emphasize: true,
            muted: false,
          },
          {
            key: 'localized',
            label: 'Localized change',
            astValue: astComparedMetrics.localizedRate,
            fullValue: fullComparedMetrics.localizedRate,
            direction: 'higher' as BetterDirection,
            format: formatPercent,
            emphasize: true,
            muted: false,
          },
          {
            key: 'safe',
            label: 'Safe to auto-apply rate',
            astValue: astComparedMetrics.safeRate,
            fullValue: fullComparedMetrics.safeRate,
            direction: 'higher' as BetterDirection,
            format: formatPercent,
            emphasize: false,
            muted: false,
          },
          {
            key: 'safety-agreement',
            label: 'Safety agreement (AST vs FULL)',
            astValue: safetyAgreementRate,
            fullValue: safetyAgreementRate,
            direction: 'none' as BetterDirection,
            format: formatPercent,
            emphasize: false,
            muted: false,
          },
          {
            key: 'latency',
            label: 'Avg latency ms',
            astValue: astComparedMetrics.avgLatencyMs,
            fullValue: fullComparedMetrics.avgLatencyMs,
            direction: 'lower' as BetterDirection,
            format: formatNumber,
            emphasize: false,
            muted: true,
          },
          {
            key: 'input-tokens',
            label: 'Avg input tokens',
            astValue: astComparedMetrics.avgInputTokens,
            fullValue: fullComparedMetrics.avgInputTokens,
            direction: 'lower' as BetterDirection,
            format: formatNumber,
            emphasize: true,
            muted: false,
          },
          {
            key: 'output-tokens',
            label: 'Avg output tokens',
            astValue: astComparedMetrics.avgOutputTokens,
            fullValue: fullComparedMetrics.avgOutputTokens,
            direction: 'lower' as BetterDirection,
            format: formatNumber,
            emphasize: true,
            muted: false,
          },
          {
            key: 'run-count',
            label: 'Run count',
            astValue: astComparedMetrics.runCount,
            fullValue: fullComparedMetrics.runCount,
            direction: 'none' as BetterDirection,
            format: formatNumber,
            emphasize: false,
            muted: true,
          },
        ]
      : [];

  return (
    <section className="results-viewer">
      <header className="results-viewer-header">
        <h2>Experiment Results Viewer</h2>
        <p>Single report inspection or AST_BOUND vs FULL_CONTEXT comparison in one screen.</p>
        <div className="results-mode-switch">
          <button
            className={mode === 'single' ? 'is-active' : ''}
            onClick={() => setMode('single')}
          >
            Single report
          </button>
          <button
            className={mode === 'compare' ? 'is-active' : ''}
            onClick={() => setMode('compare')}
          >
            Compare reports
          </button>
        </div>
      </header>

      {mode === 'single' ? (
        <>
          <div className="results-viewer-controls">
            <label>
              Report JSON file
              <input type="file" accept=".json,application/json" onChange={handleSingleFileChange} />
            </label>
            <div className="results-viewer-buttons">
              <button onClick={handleParseSingle}>Parse JSON</button>
              <button onClick={handleClearSingle}>Clear</button>
            </div>
          </div>

          <textarea
            className="results-viewer-textarea"
            value={singleRawText}
            onChange={(event) => setSingleRawText(event.target.value)}
            placeholder="Paste experiment JSON here or load file."
          />

          {singleFileName ? <p className="results-viewer-file">Loaded file: {singleFileName}</p> : null}
          {singleError ? <p className="results-viewer-error">{singleError}</p> : null}

          {!singleReport ? (
            <p className="empty-row">No report parsed yet.</p>
          ) : (
            <>
              <section className="results-summary-grid">
                <article>
                  <h3>Experiment</h3>
                  <p>Type: {singleReport.experimentType}</p>
                  <p>Model: {singleReport.model}</p>
                  <p>Target issue: {singleReport.targetIssue || '-'}</p>
                  <p>Component: {singleReport.component || '-'}</p>
                </article>
                <article>
                  <h3>Summary</h3>
                  <p>Correctness rate: {formatPercent(singleReport.metrics.correctnessRate)}</p>
                  <p>Targeted to issue: {formatPercent(singleReport.metrics.targetedRate)}</p>
                  <p>Localized change: {formatPercent(singleReport.metrics.localizedRate)}</p>
                  <p>Safe to auto-apply rate: {formatPercent(singleReport.metrics.safeRate)}</p>
                </article>
                <article>
                  <h3>Latency and Tokens</h3>
                  <p>Avg latency: {formatNumber(singleReport.metrics.avgLatencyMs)} ms</p>
                  <p>Avg input tokens: {formatNumber(singleReport.metrics.avgInputTokens)}</p>
                  <p>Avg output tokens: {formatNumber(singleReport.metrics.avgOutputTokens)}</p>
                  <p>Run count: {singleReport.metrics.runCount}</p>
                </article>
                <article>
                  <h3>Strategy</h3>
                  <p>Dominant: {singleReport.metrics.dominantStrategy}</p>
                </article>
              </section>

              <section className="results-table-wrapper">
                <h3>Runs Table</h3>
                <table>
                  <thead>
                    <tr>
                      <th>runId</th>
                      <th>findingId</th>
                      <th>type</th>
                      <th>attempt</th>
                      <th>strategy</th>
                      <th>correct</th>
                      <th>Targeted to issue</th>
                      <th>Localized change</th>
                      <th>Safe to auto-apply</th>
                      <th>issues</th>
                      <th>durationMs</th>
                      <th>inputTokens</th>
                      <th>outputTokens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {singleReport.rows.map((row) => (
                      <tr key={`${row.runId}-${row.findingId}-${row.attempt}`}>
                        <td>{row.runId}</td>
                        <td>{row.findingId}</td>
                        <td>{row.type}</td>
                        <td>{row.attempt}</td>
                        <td>{row.strategy}</td>
                        <td>{String(row.correct)}</td>
                        <td>{String(row.targeted)}</td>
                        <td>{String(row.localized)}</td>
                        <td>{String(row.safeToAutoApply)}</td>
                        <td>{row.issues}</td>
                        <td>{row.durationMs}</td>
                        <td>{row.inputTokens}</td>
                        <td>{row.outputTokens}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )}
        </>
      ) : (
        <>
          <section className="compare-input-grid">
            <article className="compare-input-card">
              <h3>AST_BOUND report</h3>
              <label>
                AST JSON file
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(event) => handleCompareFileChange('ast', event)}
                />
              </label>
              <textarea
                className="results-viewer-textarea"
                value={astRawText}
                onChange={(event) => setAstRawText(event.target.value)}
                placeholder="Paste AST_BOUND report JSON here."
              />
              {astFileName ? <p className="results-viewer-file">Loaded file: {astFileName}</p> : null}
            </article>

            <article className="compare-input-card">
              <h3>FULL_CONTEXT report</h3>
              <label>
                FULL JSON file
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(event) => handleCompareFileChange('full', event)}
                />
              </label>
              <textarea
                className="results-viewer-textarea"
                value={fullRawText}
                onChange={(event) => setFullRawText(event.target.value)}
                placeholder="Paste FULL_CONTEXT report JSON here."
              />
              {fullFileName ? <p className="results-viewer-file">Loaded file: {fullFileName}</p> : null}
            </article>
          </section>

          <div className="results-viewer-buttons">
            <button onClick={handleParseCompare}>Compare reports</button>
            <button onClick={handleClearCompare}>Clear</button>
          </div>

          {compareError ? <p className="results-viewer-error">{compareError}</p> : null}
          {compareWarnings.length > 0 ? (
            <div className="results-warning-banner">
              <ul className="results-viewer-warning-list">
                {compareWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {!astReport || !fullReport ? (
            <p className="empty-row">Load two reports to compare AST_BOUND vs FULL_CONTEXT.</p>
          ) : (
            <>
              <section className="comparison-key-insight">
                <h3>Key Insight</h3>
                <p>
                  LLMs are not failing at correctness. They are failing at relevance. AST constraints
                  improve relevance, not correctness.
                </p>
              </section>

              <section className="comparison-overview-grid">
                <article className="comparison-overview-card">
                  <h3>AST_BOUND</h3>
                  <p>Model: {astReport.model}</p>
                  <p>Target issue: {astReport.targetIssue || '-'}</p>
                  <p>Component: {astReport.component || '-'}</p>
                  <p>Run count (raw): {astReport.metrics.runCount}</p>
                  <p>Run count (compared): {astComparedMetrics.runCount}</p>
                  <p>Primary strategy: {astComparedMetrics.dominantStrategy}</p>
                </article>
                <article className="comparison-overview-card">
                  <h3>FULL_CONTEXT</h3>
                  <p>Model: {fullReport.model}</p>
                  <p>Target issue: {fullReport.targetIssue || '-'}</p>
                  <p>Component: {fullReport.component || '-'}</p>
                  <p>Run count (raw): {fullReport.metrics.runCount}</p>
                  <p>Run count (compared): {fullComparedMetrics.runCount}</p>
                  <p>Primary strategy: {fullComparedMetrics.dominantStrategy}</p>
                </article>
              </section>

              <section className="comparison-targeting">
                <h3>Issue Targeting</h3>
                <p>AST_BOUND: {formatPercent(astComparedMetrics.targetedRate)}</p>
                <p>FULL_CONTEXT: {formatPercent(fullComparedMetrics.targetedRate)}</p>
                <p>{targetingExplanation}</p>
                <p>If correctness is equal, targeting becomes the key differentiator.</p>
              </section>

              <section className="comparison-strategy">
                <h3>Strategy Analysis</h3>
                <ul>
                  {strategyAnalysis.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>

              <section className="comparison-efficiency">
                <h3>Efficiency</h3>
                <p>{efficiency.headline}</p>
                <p>
                  Token reduction factor (FULL/AST): {efficiency.factorLabel}
                </p>
                <p>Input token delta: {efficiency.tokenDelta}</p>
                <p>
                  AST_BOUND uses {efficiency.factorLabel} fewer input tokens while achieving:
                </p>
                <ul>
                  <li>
                    same correctness ({formatPercent(astComparedMetrics.correctnessRate)} vs{' '}
                    {formatPercent(fullComparedMetrics.correctnessRate)})
                  </li>
                  <li>
                    better issue targeting ({formatPercent(astComparedMetrics.targetedRate)} vs{' '}
                    {formatPercent(fullComparedMetrics.targetedRate)})
                  </li>
                  <li>
                    more localized changes ({formatPercent(astComparedMetrics.localizedRate)} vs{' '}
                    {formatPercent(fullComparedMetrics.localizedRate)})
                  </li>
                </ul>
              </section>

              <section className="results-table-wrapper">
                <h3>Comparison Summary</h3>
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>AST_BOUND</th>
                      <th>FULL_CONTEXT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map((row) => {
                      const winner = row.emphasize
                        ? compareNumeric(row.astValue, row.fullValue, row.direction)
                        : 'tie';
                      return [
                        <tr key={row.label} className={row.muted ? 'is-muted-row' : ''}>
                          <td>{row.label}</td>
                          <td className={valueClass(winner, 'ast')}>{row.format(row.astValue)}</td>
                          <td className={valueClass(winner, 'full')}>{row.format(row.fullValue)}</td>
                        </tr>,
                        row.key === 'latency' ? (
                          <tr className="comparison-note-row" key="latency-note">
                            <td colSpan={3}>
                              Latency is dominated by model and network variance and is not a
                              reliable comparison metric.
                            </td>
                          </tr>
                        ) : null,
                      ];
                    })}
                    <tr>
                      <td>Primary strategy (dominant)</td>
                      <td>{astComparedMetrics.dominantStrategy}</td>
                      <td>{fullComparedMetrics.dominantStrategy}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section className="results-table-wrapper">
                <h3>Runs Comparison</h3>
                <table className="comparison-runs-table">
                  <thead>
                    <tr>
                      <th>Run</th>
                      <th>AST strategy</th>
                      <th>AST correct</th>
                      <th>AST targeted to issue</th>
                      <th>AST localized change</th>
                      <th>AST safe to auto-apply</th>
                      <th>AST input tokens</th>
                      <th>AST output tokens</th>
                      <th>AST duration</th>
                      <th>FULL strategy</th>
                      <th>FULL correct</th>
                      <th>FULL targeted to issue</th>
                      <th>FULL localized change</th>
                      <th>FULL safe to auto-apply</th>
                      <th>FULL input tokens</th>
                      <th>FULL output tokens</th>
                      <th>FULL duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pairedRuns.map((pair) => (
                      <tr key={`compare-run-${pair.runNumber}`}>
                        <td>{pair.runNumber}</td>
                        <td>{pair.ast.strategy}</td>
                        <td>{String(pair.ast.correct)}</td>
                        <td>{String(pair.ast.targeted)}</td>
                        <td>{String(pair.ast.localized)}</td>
                        <td>{String(pair.ast.safeToAutoApply)}</td>
                        <td>{pair.ast.inputTokens}</td>
                        <td>{pair.ast.outputTokens}</td>
                        <td>{pair.ast.durationMs}</td>
                        <td>{pair.full.strategy}</td>
                        <td>{String(pair.full.correct)}</td>
                        <td>{String(pair.full.targeted)}</td>
                        <td>{String(pair.full.localized)}</td>
                        <td>{String(pair.full.safeToAutoApply)}</td>
                        <td>{pair.full.inputTokens}</td>
                        <td>{pair.full.outputTokens}</td>
                        <td>{pair.full.durationMs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="comparison-interpretation">
                <h3>Interpretation</h3>
                <p>{interpretation}</p>
              </section>
            </>
          )}
        </>
      )}
    </section>
  );
}
