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

TEXT_PROMPT="Build a React invoice form component. It should let users add line items and calculate totals. Minimum invoice amount is 50 euros. Maximum 10 line items. Discount is only available for clients who have been with us more than 6 months. VAT is 20% for EU countries, 0% for non-EU, and blocked entirely for RU and BY. Payment retry should only happen on network errors, not validation errors. Log all form events to our internal analytics system, not Google Analytics. Auto-save draft every 30 seconds. Show a confirmation dialog if user tries to close with unsaved changes."

JUDGE_INSTRUCTION='Do NOT write code. Reply ONLY with raw JSON, no markdown, no backticks. Use EXACTLY these keys:
- min_amount: integer or null
- max_line_items: integer or null
- discount_months: integer or null — minimum months of client tenure for discount
- vat_eu_pct: integer or null
- vat_non_eu_pct: integer or null
- vat_blocked: array of country codes or null
- retry_network_only: true/false
- analytics_not_ga: true/false
- autosave_seconds: integer or null
- confirm_on_close: true/false
- assumed: array of strings — decisions NOT explicitly stated in the input'

echo ""
echo "========================================"
echo " TWO-LAYER LLM TEST v2"
echo "========================================"

# ── STEP 1: Mistral → YAML ───────────────────────────────────────────
echo "Step 1 — Mistral: text → YAML..."

MISTRAL_PROMPT="You are a spec writer. Convert this feature request into a precise YAML spec. Be explicit. No assumptions. Output ONLY valid YAML, no backticks, no explanation.

$TEXT_PROMPT"

YAML_SPEC=$(call_ollama "$MISTRAL" "$MISTRAL_PROMPT")
echo ""
echo "--- Mistral YAML ---"
echo "$YAML_SPEC"
echo "--------------------"

# ── STEP 2: CodeQwen ← YAML ─────────────────────────────────────────
echo ""
echo "Step 2 — CodeQwen from YAML..."

RESULT_YAML=$(call_ollama "$CODEQWEN" "Build a React invoice form from this spec:

$YAML_SPEC

$JUDGE_INSTRUCTION")

# ── STEP 3: CodeQwen ← raw text ─────────────────────────────────────
echo ""
echo "Step 3 — CodeQwen from raw text..."

RESULT_TEXT=$(call_ollama "$CODEQWEN" "Build a React invoice form component.

$TEXT_PROMPT

$JUDGE_INSTRUCTION")

# ── COMPARE ──────────────────────────────────────────────────────────
echo ""
python3 - "$RESULT_TEXT" "$RESULT_YAML" << 'EOF'
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

a = parse(sys.argv[1])  # direct
b = parse(sys.argv[2])  # 2-layer

expected = {
    "min_amount":        (50,   lambda v: v == 50),
    "max_line_items":    (10,   lambda v: v == 10),
    "discount_months":   (6,    lambda v: v == 6),
    "vat_eu_pct":        (20,   lambda v: v == 20),
    "vat_non_eu_pct":    (0,    lambda v: v == 0),
    "vat_blocked":       ("RU+BY", lambda v: v and "RU" in v and "BY" in v),
    "retry_network_only":(True, lambda v: v is True),
    "analytics_not_ga":  (True, lambda v: v is True),
    "autosave_seconds":  (30,   lambda v: v == 30),
    "confirm_on_close":  (True, lambda v: v is True),
}

print(f"\n{'Decision':<25} {'Expected':<10} {'Direct':<16} {'2-layer'}")
print("-" * 68)

ca = cb = 0
for k, (exp_str, check) in expected.items():
    va = a.get(k)
    vb = b.get(k)
    oka = "✓" if check(va) else "✗"
    okb = "✓" if check(vb) else "✗"
    if oka == "✓": ca += 1
    if okb == "✓": cb += 1
    print(f"{k:<25} {str(exp_str):<10} {oka} {str(va):<14} {okb} {str(vb)}")

total = len(expected)
print(f"\nCorrect:  direct {ca}/{total}   2-layer {cb}/{total}")
print(f"Assumed:  direct {len(a.get('assumed',[]))}    2-layer {len(b.get('assumed',[]))}")

if a.get('assumed'):
    print(f"\nDirect assumed:")
    for x in a['assumed']: print(f"  - {x}")

if b.get('assumed'):
    print(f"\n2-layer assumed:")
    for x in b['assumed']: print(f"  - {x}")
EOF