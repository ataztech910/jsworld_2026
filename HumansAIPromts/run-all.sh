#!/bin/bash

echo '{"meta":{"total_tezisy":8},"results":[]}' > results.json
echo "✓ results.json cleared"
echo ""

run() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "T$1 $2"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  npx tsx src/index.ts $3
  echo ""
}

# No API calls
run 4 "(no LLM — token math)" "--tezis=4"
run 5 "(no LLM — token math)" "--tezis=5"

# Local models
run 1 "(local — vague vs yaml)" "--tezis=1"
run 3 "(local — spec on any model)" "--tezis=3"
run 6 "(local — intermediate layer)" "--tezis=6"
run 7 "(local — yaml key names)" "--tezis=7"
run 8 "(local — yaml+text vs pure yaml)" "--tezis=8"

# Big models
run 2 "(big models — hiding the problem)" "--tezis=2 --big"
run 3 "(big models — spec on any model)" "--tezis=3 --big"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All tests done. results.json ready."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"