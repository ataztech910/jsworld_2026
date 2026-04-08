export interface Finding {
  findingId: string;
  type: string;
  location: string;
  code: string;
  context: string;
  variables: string[];
  goal: string;
}

function normalizeMultiline(value: string) {
  return (value || '').trim();
}

export function buildPrompt(finding: Finding): string {
  const type = normalizeMultiline(finding.type);
  const goal = normalizeMultiline(finding.goal);
  const code = normalizeMultiline(finding.code);
  const context = normalizeMultiline(finding.context);
  const variables = JSON.stringify(finding.variables || []);

  return [
    'You are given a bounded React performance issue extracted from AST analysis.',
    '',
    'Issue type:',
    type,
    '',
    'Goal:',
    goal,
    '',
    'Code:',
    code,
    '',
    'Context:',
    context,
    '',
    'Variables:',
    variables,
    '',
    'Task:',
    'Suggest the smallest safe React change that would reduce unnecessary rerenders.',
    '',
    'Constraints:',
    '- do not rewrite the whole component',
    '- prefer minimal diff',
    '- preserve behavior',
    '- keep instrumentation',
    '',
    'Return:',
    '1. explanation',
    '2. minimal fix',
    '3. code example',
    '4. is this safe to auto-apply (yes/no and why)',
  ].join('\n');
}

export function buildFullPrompt(code: string): string {
  const normalizedCode = normalizeMultiline(code);

  return [
    'You are given a full React component file.',
    '',
    'Component code:',
    normalizedCode,
    '',
    'Task:',
    'Identify potential performance issues and suggest the smallest safe fixes.',
    '',
    'Constraints:',
    '- do not rewrite the whole component',
    '- prefer minimal diff',
    '- preserve behavior',
    '- keep instrumentation',
    '',
    'Return:',
    '1. detected issues',
    '2. minimal fixes',
    '3. code examples',
    '4. is each fix safe to auto-apply (yes/no and why)',
  ].join('\n');
}
