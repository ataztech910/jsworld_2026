import type { Finding } from './promptBuilder.ts';

export interface EvaluationResult {
  isCorrect: boolean;
  isFocused: boolean;
  isLocalChange: boolean;
  isSafeToAutoApply: boolean;
  primaryStrategy: 'useCallback' | 'useMemo' | 'memo' | 'refactor' | 'mixed' | 'unknown';
  issuesDetected: string[];
  notes: string;
}

export interface EvaluationSummary {
  consistencyScore: number;
  correctnessRate: number;
  focusRate: number;
  localChangeRate: number;
  minimalityRate: number;
  safetyAgreementRate: number;
}

const BUILTIN_IDENTIFIERS = new Set([
  'React',
  'useCallback',
  'useMemo',
  'useRef',
  'useState',
  'useEffect',
  'memo',
  'Math',
  'Date',
  'Array',
  'Object',
  'String',
  'Number',
  'Boolean',
  'Promise',
  'JSON',
  'console',
  'return',
  'const',
  'let',
  'var',
  'function',
  'if',
  'else',
  'for',
  'while',
  'true',
  'false',
  'null',
  'undefined',
]);

function percentage(part: number, total: number) {
  if (total <= 0) {
    return 0;
  }
  return Number(((part / total) * 100).toFixed(2));
}

function countMatches(text: string, pattern: RegExp) {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

function detectPrimaryStrategy(
  text: string
): 'useCallback' | 'useMemo' | 'memo' | 'refactor' | 'mixed' | 'unknown' {
  const counts = {
    useCallback: countMatches(text, /\buseCallback\b/gi),
    useMemo: countMatches(text, /\buseMemo\b/gi) + countMatches(text, /\bmemoiz(?:e|ed|ation)?\b/gi),
    memo:
      countMatches(text, /\bReact\.memo\b/gi) +
      countMatches(text, /\bwrap\b[^\n]{0,60}\bmemo\b/gi) +
      countMatches(text, /\bmemoized component\b/gi),
    refactor:
      countMatches(text, /\brefactor\b/gi) +
      countMatches(text, /\brestructure\b/gi) +
      countMatches(text, /\brewrite\b/gi) +
      countMatches(text, /\breplace the component\b/gi),
  };

  const entries = Object.entries(counts).filter(([, value]) => value > 0) as Array<[
    'useCallback' | 'useMemo' | 'memo' | 'refactor',
    number,
  ]>;

  if (entries.length === 0) {
    return 'unknown';
  }

  entries.sort((a, b) => b[1] - a[1]);
  const [topName, topValue] = entries[0];
  const secondValue = entries[1]?.[1] ?? 0;

  if (entries.length > 1 && topValue === secondValue) {
    return 'mixed';
  }

  return topName;
}

function hasRewriteSignal(text: string) {
  return (
    /\brewrite\b/i.test(text) ||
    /\bfull rewrite\b/i.test(text) ||
    /\bentire component\b/i.test(text) ||
    /\bfull component\b/i.test(text) ||
    /\breplace the component\b/i.test(text)
  );
}

function extractCodeLikeSections(text: string) {
  const sections: string[] = [];
  const fenced = text.match(/```[\s\S]*?```/g) || [];
  const inline = text.match(/`[^`\n]+`/g) || [];

  fenced.forEach((chunk) => {
    sections.push(chunk.replace(/```[\w-]*\n?/, '').replace(/```$/, ''));
  });

  inline.forEach((chunk) => {
    sections.push(chunk.slice(1, -1));
  });

  return sections;
}

function stripStrings(value: string) {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n\r]*/g, ' ')
    .replace(/(["'`])(?:\\.|(?!\1)[\s\S])*\1/g, ' ');
}

function collectDeclaredVariables(codeText: string) {
  const declared = new Set<string>();
  const declarationRegex = /\b(?:const|let|var|function)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  const arrowParamRegex = /\b([A-Za-z_][A-Za-z0-9_]*)\s*=>/g;

  let match: RegExpExecArray | null;
  while ((match = declarationRegex.exec(codeText)) !== null) {
    declared.add(match[1]);
  }

  while ((match = arrowParamRegex.exec(codeText)) !== null) {
    declared.add(match[1]);
  }

  return declared;
}

function collectUnknownVariables(responseText: string, finding: Finding) {
  const sections = extractCodeLikeSections(responseText);
  const allowed = new Set([...(finding.variables || []), ...BUILTIN_IDENTIFIERS]);
  const unknown = new Set<string>();

  sections.forEach((section) => {
    const source = stripStrings(section);
    const declared = collectDeclaredVariables(source);
    const regex = /\b[A-Za-z_][A-Za-z0-9_]*\b/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(source)) !== null) {
      const token = match[0];
      const index = match.index;
      const previousChar = index > 0 ? source[index - 1] : '';

      if (previousChar === '.') {
        continue;
      }

      if (declared.has(token) || allowed.has(token)) {
        continue;
      }

      if (/^[A-Z]/.test(token)) {
        continue;
      }

      if (token.length <= 2) {
        continue;
      }

      unknown.add(token);
    }
  });

  return Array.from(unknown).sort();
}

function cleanIssueLine(line: string) {
  return line
    .replace(/^#{1,6}\s*/, '')
    .replace(/^[-*+]\s*/, '')
    .replace(/^\d+[.)]\s*/, '')
    .replace(/^\*\*|\*\*$/g, '')
    .replace(/\*\*/g, '')
    .replace(/^\*+\s*issue:\s*/i, '')
    .replace(/^\*+issue:\s*/i, '')
    .replace(/^issue:\s*/i, '')
    .trim();
}

function extractIssuesDetected(responseText: string): string[] {
  const lines = responseText.split(/\r?\n/).map((line) => line.trim());
  const issues: string[] = [];

  lines.forEach((line) => {
    if (!line) {
      return;
    }

    const looksLikeIssueLine =
      /^#{1,6}\s*/.test(line) ||
      /^[-*+]\s+/.test(line) ||
      /^\d+[.)]\s+/.test(line) ||
      /^\*\*Issue\b/i.test(line);

    if (!looksLikeIssueLine) {
      return;
    }

    const cleaned = cleanIssueLine(line);
    if (!cleaned || cleaned.length < 4) {
      return;
    }

    if (
      /^detected performance issues$/i.test(cleaned) ||
      /^minimal fixes$/i.test(cleaned) ||
      /^code example/i.test(cleaned) ||
      /^fix\s*\d+/i.test(cleaned)
    ) {
      return;
    }

    if (
      /(issue|inline|handler|rerender|render|memo|computation|expensive|sort|filter|reduce|callback|performance)/i.test(
        cleaned
      )
    ) {
      issues.push(cleaned);
    }
  });

  const deduped = Array.from(new Set(issues));
  return deduped.slice(0, 10);
}

function targetKeywords(targetIssue: string): RegExp[] {
  const normalized = (targetIssue || '').toLowerCase();

  if (normalized.includes('inline-handler-in-map')) {
    return [
      /inline\s+(event\s+)?(function|handler|callback)/i,
      /handler\s+inside\s+map/i,
      /function\s+inside\s+map/i,
      /new\s+function\s+on\s+each\s+render/i,
      /onselect/i,
      /onbumppriority/i,
    ];
  }

  if (normalized.includes('heavy-computation-in-render')) {
    return [
      /expensive\s+computation/i,
      /recompute/i,
      /reduce|sort|filter|map/i,
      /during\s+render/i,
    ];
  }

  if (normalized.includes('missing-memoization')) {
    return [/missing\s+memo/i, /usememo/i, /memoiz/i];
  }

  const tokens = normalized
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);

  return tokens.map((token) => new RegExp(token, 'i'));
}

function matchesTarget(text: string, targetIssue: string) {
  const rules = targetKeywords(targetIssue);
  return rules.some((rule) => rule.test(text));
}

function getPrimarySection(responseText: string) {
  const lines = responseText.split(/\r?\n/).slice(0, 40).join('\n');
  return lines.slice(0, 1200);
}

function detectFocus(responseText: string, issuesDetected: string[], targetIssue: string, primaryStrategy: string) {
  const targetMentioned = matchesTarget(responseText, targetIssue);
  if (!targetMentioned) {
    return {
      isFocused: false,
      reason: 'target issue is not explicitly addressed',
    };
  }

  const primarySection = getPrimarySection(responseText);
  if (!matchesTarget(primarySection, targetIssue)) {
    return {
      isFocused: false,
      reason: 'target issue is not addressed in the primary response section',
    };
  }

  if (issuesDetected.length > 0) {
    const firstTargetIndex = issuesDetected.findIndex((issue) => matchesTarget(issue, targetIssue));
    if (firstTargetIndex > 0) {
      return {
        isFocused: false,
        reason: 'target issue is not presented as a primary issue',
      };
    }
  }

  if (targetIssue === 'inline-handler-in-map' && primaryStrategy === 'useMemo') {
    return {
      isFocused: false,
      reason: 'response is dominated by useMemo guidance instead of inline-handler fix',
    };
  }

  if (targetIssue === 'inline-handler-in-map') {
    const useMemoMentions = countMatches(responseText, /\buseMemo\b/gi);
    const useCallbackMentions = countMatches(responseText, /\buseCallback\b/gi);
    const inlineMentions = countMatches(responseText, /inline\s+(function|handler|callback)|handler\s+inside\s+map/gi);

    if (useMemoMentions >= 2 && useCallbackMentions === 0 && inlineMentions <= 1) {
      return {
        isFocused: false,
        reason: 'response mostly proposes broad useMemo optimizations instead of the inline-handler target',
      };
    }
  }

  return {
    isFocused: true,
    reason: 'target issue is directly addressed as a primary concern',
  };
}

function detectLocalChange(responseText: string, targetIssue: string) {
  const fixSectionCount = countMatches(responseText, /(?:^|\n)\s*(?:#+\s*)?fix\s*\d+/gi);
  const broadMemoCount = countMatches(
    responseText,
    /memoiz(?:e|ing)\s+(?:expensive|filtered|sorted|summary|multiple|all|derived)/gi
  );

  const broadScopeSignals =
    /multiple derived state calculations/i.test(responseText) ||
    /all .* calculations/i.test(responseText) ||
    /across the component/i.test(responseText) ||
    /component-wide/i.test(responseText);

  if (hasRewriteSignal(responseText)) {
    return {
      isLocalChange: false,
      reason: 'component rewrite/refactor scope detected',
    };
  }

  if (fixSectionCount >= 3 || broadMemoCount >= 2 || broadScopeSignals) {
    return {
      isLocalChange: false,
      reason: 'response proposes broad multi-area changes instead of localized edits',
    };
  }

  if (targetIssue === 'inline-handler-in-map') {
    const localInlineSignal =
      /onselect|onbumppriority|inline\s+handler|usecallback|factory/i.test(responseText);

    if (!localInlineSignal) {
      return {
        isLocalChange: false,
        reason: 'no localized handler-level change suggested for inline-handler issue',
      };
    }
  }

  return {
    isLocalChange: true,
    reason: 'suggested changes are localized near the target issue',
  };
}

function detectSafeToAutoApply(responseText: string, isFocused: boolean, isLocalChange: boolean) {
  const uncertaintySignals =
    /not\s+safe\b/i.test(responseText) ||
    /unsafe\b/i.test(responseText) ||
    /manual\s+review/i.test(responseText) ||
    /requires\s+careful/i.test(responseText) ||
    /need\s+to\s+verify/i.test(responseText) ||
    /depends\s+on/i.test(responseText) ||
    /without\s+full\s+context/i.test(responseText) ||
    /cannot\s+guarantee|can't\s+guarantee/i.test(responseText);

  const explicitSafe =
    /safe\s+to\s+auto-apply\s*:\s*yes/i.test(responseText) ||
    /\bit\s+is\s+safe\b/i.test(responseText) ||
    /\bsafe\s+to\s+apply\b/i.test(responseText);

  if (!explicitSafe) {
    return {
      isSafeToAutoApply: false,
      reason: 'response does not explicitly confirm safe auto-apply',
    };
  }

  if (uncertaintySignals) {
    return {
      isSafeToAutoApply: false,
      reason: 'response includes uncertainty or manual-review signals',
    };
  }

  if (!isFocused || !isLocalChange) {
    return {
      isSafeToAutoApply: false,
      reason: 'response is not focused/local enough for low-risk auto-apply',
    };
  }

  return {
    isSafeToAutoApply: true,
    reason: 'explicitly safe, focused, and localized recommendation',
  };
}

function detectCorrectness(responseText: string, primaryStrategy: string) {
  const hasPerformanceIntent =
    /performance|rerender|render|expensive|memo|optimi/i.test(responseText);

  const hasValidTechnique =
    primaryStrategy !== 'unknown' || /usecallback|usememo|react\.memo|memoiz/i.test(responseText);

  const harmfulSignals =
    /disable\s+strict\s+mode/i.test(responseText) ||
    /remove\s+instrumentation/i.test(responseText) ||
    /ignore\s+dependencies/i.test(responseText) ||
    /mutate\s+state\s+directly/i.test(responseText);

  return hasPerformanceIntent && hasValidTechnique && !harmfulSignals;
}

export function evaluateResponse(
  responseText: string,
  finding: Finding,
  targetIssue = finding.type
): EvaluationResult {
  const primaryStrategy = detectPrimaryStrategy(responseText);
  const issuesDetected = extractIssuesDetected(responseText);

  const isCorrect = detectCorrectness(responseText, primaryStrategy);
  const focusResult = detectFocus(responseText, issuesDetected, targetIssue, primaryStrategy);
  const localResult = detectLocalChange(responseText, targetIssue);
  const safeResult = detectSafeToAutoApply(responseText, focusResult.isFocused, localResult.isLocalChange);

  const unknownVariables = collectUnknownVariables(responseText, finding);

  const notes = [
    `targetIssue=${targetIssue}`,
    `isFocused=${focusResult.isFocused} (${focusResult.reason})`,
    `isLocalChange=${localResult.isLocalChange} (${localResult.reason})`,
    `isSafeToAutoApply=${safeResult.isSafeToAutoApply} (${safeResult.reason})`,
    unknownVariables.length > 0
      ? `variables outside finding.variables: ${unknownVariables.join(', ')}`
      : 'no unknown variables in code snippets',
  ].join('; ');

  return {
    isCorrect,
    isFocused: focusResult.isFocused,
    isLocalChange: localResult.isLocalChange,
    isSafeToAutoApply: safeResult.isSafeToAutoApply,
    primaryStrategy,
    issuesDetected,
    notes,
  };
}

export function buildEvaluationSummary(
  runs: Array<{ evaluation: EvaluationResult }>
): EvaluationSummary {
  const total = runs.length;
  if (total === 0) {
    return {
      consistencyScore: 0,
      correctnessRate: 0,
      focusRate: 0,
      localChangeRate: 0,
      minimalityRate: 0,
      safetyAgreementRate: 0,
    };
  }

  const strategyCounts = new Map<string, number>();
  let correctCount = 0;
  let focusedCount = 0;
  let localCount = 0;
  let safeCount = 0;

  runs.forEach((run) => {
    const strategy = run.evaluation.primaryStrategy;
    strategyCounts.set(strategy, (strategyCounts.get(strategy) || 0) + 1);

    if (run.evaluation.isCorrect) {
      correctCount += 1;
    }
    if (run.evaluation.isFocused) {
      focusedCount += 1;
    }
    if (run.evaluation.isLocalChange) {
      localCount += 1;
    }
    if (run.evaluation.isSafeToAutoApply) {
      safeCount += 1;
    }
  });

  const maxStrategyCount = Math.max(...Array.from(strategyCounts.values()));
  const unsafeCount = total - safeCount;
  const safetyMajorityCount = Math.max(safeCount, unsafeCount);
  const localRate = percentage(localCount, total);

  return {
    consistencyScore: percentage(maxStrategyCount, total),
    correctnessRate: percentage(correctCount, total),
    focusRate: percentage(focusedCount, total),
    localChangeRate: localRate,
    minimalityRate: localRate,
    safetyAgreementRate: percentage(safetyMajorityCount, total),
  };
}
