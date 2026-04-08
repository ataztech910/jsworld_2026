#!/bin/bash

MISTRAL="mistral:instruct"
CODEQWEN="codeqwen:7b"
OLLAMA="http://localhost:11434/api/generate"

call_ollama() {
  local model="$1"
  local prompt="$2"
  curl -s "$OLLAMA" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"$model\",
      \"prompt\": $(echo "$prompt" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))'),
      \"stream\": false,
      \"options\": { \"temperature\": 0.1 }
    }" | python3 -c "import sys,json; print(json.load(sys.stdin)['response'])"
}

# ── VAGUE prompt — как реально пишут ────────────────────────────────
VAGUE_PROMPT="Build a React invoice form with line items and totals."

# ── YAML spec — с реальными бизнес-правилами ────────────────────────
YAML_SPEC="component: InvoiceForm
constraints:
  min_amount_eur: 50
  max_line_items: 10
discount:
  enabled: true
  condition: client_tenure_months >= 6
vat:
  eu: 20
  non_eu: 0
  blocked: [RU, BY]
payment:
  retry_on: [network_error]
  no_retry_on: [validation_error]
analytics:
  provider: internal
  not: google_analytics
persistence:
  autosave_seconds: 30
  confirm_unsaved_on_close: true"

JUDGE_INSTRUCTION='Do NOT write code. Reply ONLY with raw JSON, no markdown, no backticks. Use EXACTLY these keys:
- min_amount: integer or null
- max_line_items: integer or null
- discount_months: integer or null
- vat_eu_pct: integer or null
- vat_non_eu_pct: integer or null
- vat_blocked: array of country codes or null
- retry_network_only: true/false
- analytics_not_ga: true/false
- autosave_seconds: integer or null
- confirm_on_close: true/false
- assumed: array of strings — decisions NOT in the input, that you made yourself'

echo ""
echo "========================================"
echo " REAL WORLD TEST"
echo " Vague prompt vs YAML spec"
echo "========================================"
echo ""
echo "Vague prompt: \"$VAGUE_PROMPT\""
echo ""

# ── A: CodeQwen ← vague text ────────────────────────────────────────
echo "Running A — CodeQwen from vague text..."
RESULT_A=$(call_ollama "$CODEQWEN" "$VAGUE_PROMPT

$JUDGE_INSTRUCTION")

# ── B: Mistral reads vague text → asks clarifying → YAML ────────────
echo "Running B — Mistral: vague text → YAML (with clarifying questions)..."
MISTRAL_PROMPT="You are a spec writer. A developer gave you this vague request:

\"$VAGUE_PROMPT\"

You don't have enough information. List what's missing, then make reasonable assumptions and generate a YAML spec. Output ONLY YAML, no backticks, no explanation."

MISTRAL_YAML=$(call_ollama "$MISTRAL" "$MISTRAL_PROMPT")

echo ""
echo "--- Mistral generated YAML from vague prompt ---"
echo "$MISTRAL_YAML"
echo "------------------------------------------------"

RESULT_B=$(call_ollama "$CODEQWEN" "Build a React invoice form from this spec:

$MISTRAL_YAML

$JUDGE_INSTRUCTION")

# ── C: CodeQwen ← real YAML spec ────────────────────────────────────
echo ""
echo "Running C — CodeQwen from real YAML spec..."
RESULT_C=$(call_ollama "$CODEQWEN" "Build a React invoice form from this spec:

$YAML_SPEC

$JUDGE_INSTRUCTION")

# ── COMPARE ─────────────────────────────────────────────────────────
python3 - "$RESULT_A" "$RESULT_B" "$RESULT_C" << 'EOF'
import sys, json, re

def parse(s):
    try:
        return json.loads(s)
    except:
        m = re.search(r'\{.*\}', s, re.DOTALL)
        if m:
            try:
                return json.loads(m.group())
            except:
                pass
    return {}

a = parse(sys.argv[1])  # vague text direct
b = parse(sys.argv[2])  # vague → mistral yaml → codeqwen
c = parse(sys.argv[3])  # real yaml → codeqwen

expected = {
    "min_amount":        (50,      lambda v: v == 50),
    "max_line_items":    (10,      lambda v: v == 10),
    "discount_months":   (6,       lambda v: v == 6),
    "vat_eu_pct":        (20,      lambda v: v == 20),
    "vat_non_eu_pct":    (0,       lambda v: v == 0),
    "vat_blocked":       ("RU+BY", lambda v: v and "RU" in v and "BY" in v),
    "retry_network_only":("True",  lambda v: v is True),
    "analytics_not_ga":  ("True",  lambda v: v is True),
    "autosave_seconds":  (30,      lambda v: v == 30),
    "confirm_on_close":  ("True",  lambda v: v is True),
}

print(f"\n{'Decision':<25} {'Expected':<10} {'Vague text':<14} {'Vague→YAML':<14} {'Real YAML'}")
print("-" * 80)

ca = cb = cc = 0
for k, (exp_str, check) in expected.items():
    va = a.get(k)
    vb = b.get(k)
    vc = c.get(k)
    oka = "✓" if check(va) else "✗"
    okb = "✓" if check(vb) else "✗"
    okc = "✓" if check(vc) else "✗"
    if oka == "✓": ca += 1
    if okb == "✓": cb += 1
    if okc == "✓": cc += 1
    print(f"{k:<25} {str(exp_str):<10} {oka} {str(va):<12} {okb} {str(vb):<12} {okc} {str(vc)}")

total = len(expected)
print(f"\n{'':25} {'':10} {ca}/{total}{'':10} {cb}/{total}{'':10} {cc}/{total}")
print(f"\nAssumed:{'':17} {len(a.get('assumed',[]))}{'':13} {len(b.get('assumed',[]))}{'':13} {len(c.get('assumed',[]))}")

print(f"\n--- Vague text assumed ({len(a.get('assumed',[]))} things) ---")
for x in a.get('assumed', []): print(f"  - {x}")

print(f"\n--- Real YAML assumed ({len(c.get('assumed',[]))} things) ---")
for x in c.get('assumed', []): print(f"  - {x}")
EOF