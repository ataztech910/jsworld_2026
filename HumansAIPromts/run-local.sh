#!/bin/bash

echo '{"meta":{"total_tezisy":8},"results":[]}' > results.json
echo "✓ results.json cleared"
echo ""

run() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Running T$1..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  npx tsx src/index.ts --tezis=$1
  echo ""
}

run 4
run 5
run 1
run 3
run 6
run 7
run 8

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All local tests done. results.json ready."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"