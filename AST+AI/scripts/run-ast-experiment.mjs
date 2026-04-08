#!/usr/bin/env node

import { runAstExperiment } from '../pipeline/runExperiment.ts';

async function main() {
  const findingsPath = process.argv[2];

  if (!findingsPath) {
    console.error('Usage: npm run experiment:ast -- path/to/findings.json');
    process.exit(1);
  }

  await runAstExperiment({
    findingsFilePath: findingsPath,
  });
}

main().catch((error) => {
  const apiErrorType = error?.error?.type;
  const apiMessage = error?.error?.message;
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

  if (apiErrorType === 'not_found_error' || String(apiMessage || '').includes('model:')) {
    console.error('Model not found.');
    console.error(`Current model: ${model}`);
    console.error(
      'Set ANTHROPIC_MODEL in .env, for example: ANTHROPIC_MODEL=claude-sonnet-4-20250514'
    );
    process.exit(1);
  }

  console.error(error.message || String(error));
  process.exit(1);
});
