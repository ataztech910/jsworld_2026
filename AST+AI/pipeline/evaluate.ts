import type { Finding } from './promptBuilder.ts';

export interface EvaluationResult {
  strategyDetected: string;
  isCorrect: boolean;
  isMinimal: boolean;
  isSafe: boolean;
  respectsConstraints: boolean;
  hallucinations: boolean;
  notes: string;
}

export interface EvaluationSummary {
  consistencyScore: number;
  correctnessRate: number;
  minimalityRate: number;
  safetyAgreementRate: number;
}

const STRATEGY_RULES = [
  { strategy: 'useCallback', test: (text: string) => /\buseCallback\b/i.test(text) },
  { strategy: 'factory', test: (text: string) => /\bfactory\b/i.test(text) || /\(\)\s*=>\s*\(\)/.test(text) },
  {
    strategy: 'rewrite',
    test: (text: string) =>
      /\brewrite\b/i.test(text) ||
      /\bfull component\b/i.test(text) ||
      /\bentire component\b/i.test(text) ||
      /\breplace the component\b/i.test(text),
  },
];

const LOCAL_CHANGE_RULES = [
  (text: string) => /\buseCallback\b/i.test(text),
  (text: string) => /\buseMemo\b/i.test(text),
  (text: string) => /\bmemoiz/i.test(text),
  (text: string) => /\bReact\.memo\b/i.test(text),
  (text: string) => /\bfactory\b/i.test(text),
];

const REWRITE_RULES = [
  (text: string) => /\brewrite\b/i.test(text),
  (text: string) => /\bfull rewrite\b/i.test(text),
  (text: string) => /\bentire component\b/i.test(text),
  (text: string) => /\bfull component\b/i.test(text),
  (text: string) => /\breplace the component\b/i.test(text),
];

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

function detectStrategy(text: string) {
  for (const rule of STRATEGY_RULES) {
    if (rule.test(text)) {
      return rule.strategy;
    }
  }
  return 'unknown';
}

function hasRewriteSignal(text: string) {
  return REWRITE_RULES.some((rule) => rule(text));
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

  if (sections.length === 0) {
    return [];
  }

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

export function evaluateResponse(responseText: string, finding: Finding): EvaluationResult {
  const strategyDetected = detectStrategy(responseText);
  const rewriteSignal = hasRewriteSignal(responseText);

  const mentionsRerenders = /\bre-?renders?\b/i.test(responseText);
  const mentionsInlineProblem =
    /\binline (function|handler|callback)\b/i.test(responseText) ||
    /\bfunction inside map\b/i.test(responseText) ||
    /\bhandler inside map\b/i.test(responseText) ||
    /\bnew function on each render\b/i.test(responseText);

  const localChangeSignal = LOCAL_CHANGE_RULES.some((rule) => rule(responseText));

  const isCorrect = mentionsRerenders && mentionsInlineProblem;
  const isMinimal = !rewriteSignal && localChangeSignal;
  const respectsConstraints = !rewriteSignal;

  let isSafe = false;
  if (/\bnot safe\b/i.test(responseText) || /\bunsafe\b/i.test(responseText)) {
    isSafe = false;
  } else if (/\bsafe\b/i.test(responseText)) {
    isSafe = true;
  }

  const unknownVariables = collectUnknownVariables(responseText, finding);
  const hallucinations = unknownVariables.length > 0;

  const notes = [
    `strategy: ${strategyDetected}`,
    isCorrect ? 'mentions rerenders and inline handler issue' : 'missing correctness signals',
    isMinimal ? 'local/minimal optimization suggested' : 'non-minimal or unclear change scope',
    isSafe ? 'model marks change as safe' : 'safe flag not confirmed or marked unsafe',
    respectsConstraints ? 'no component rewrite detected' : 'component rewrite signal detected',
    hallucinations
      ? `variables outside finding.variables: ${unknownVariables.join(', ')}`
      : 'no unknown variables in code snippets',
  ].join('; ');

  return {
    strategyDetected,
    isCorrect,
    isMinimal,
    isSafe,
    respectsConstraints,
    hallucinations,
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
      minimalityRate: 0,
      safetyAgreementRate: 0,
    };
  }

  const strategyCounts = new Map<string, number>();
  let correctCount = 0;
  let minimalCount = 0;
  let safeCount = 0;

  runs.forEach((run) => {
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
  const safetyMajorityCount = Math.max(safeCount, unsafeCount);

  return {
    consistencyScore: percentage(maxStrategyCount, total),
    correctnessRate: percentage(correctCount, total),
    minimalityRate: percentage(minimalCount, total),
    safetyAgreementRate: percentage(safetyMajorityCount, total),
  };
}
