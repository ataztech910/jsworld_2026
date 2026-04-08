#!/bin/bash

MODEL="mistral:instruct"
OLLAMA="http://localhost:11434/api/generate"

echo ""
echo "========================================"
echo " SPEC TEST: text prompt vs YAML spec"
echo " Model: $MODEL"
echo "========================================"

call_ollama() {
  local prompt="$1"
  curl -s "$OLLAMA" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"$MODEL\",
      \"prompt\": $(echo "$prompt" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))'),
      \"stream\": false,
      \"options\": { \"temperature\": 0.1 }
    }" | python3 -c "import sys,json; print(json.load(sys.stdin)['response'])"
}

SHARED_INSTRUCTION="Do NOT write any code. Reply ONLY with a raw JSON object — no markdown, no explanation, no backticks. Keys:
- timeout_ms: integer — what auto-dismiss timeout did you choose
- has_pause_on_hover: true or false
- has_queue: true or false
- max_visible: integer or null
- has_aria_live: true or false
- has_keyboard_dismiss: true or false
- handles_duplicates: true or false
- assumed: array of strings — every decision you made that was NOT explicitly stated in the input"

PROMPT_A="Build a React toast notification component that shows success, error, and info messages. Toasts should auto-dismiss after a few seconds and the user can close them manually.

$SHARED_INSTRUCTION"

PROMPT_B="Build a React toast notification component from this spec:

component: ToastNotification
types: [success, error, info, warning]
behavior:
  auto_dismiss:
    enabled: true
    duration_ms: 4000
    pause_on_hover: true
  queue:
    max_visible: 3
    strategy: stack_bottom
  dismiss:
    user_can_close: true
    close_on_outside_click: false
accessibility:
  role: alert
  aria_live: polite
  keyboard_dismissible: true
edge_cases:
  - duplicate_messages: ignore
  - rapid_fire: queue, do not drop

$SHARED_INSTRUCTION"

echo ""
echo "--- PROMPT A (text) ---"
RESULT_A=$(call_ollama "$PROMPT_A")
echo "$RESULT_A"

echo ""
echo "--- PROMPT B (yaml) ---"
RESULT_B=$(call_ollama "$PROMPT_B")
echo "$RESULT_B"

echo ""
echo "========================================"
echo " DIFF"
echo "========================================"

python3 - "$RESULT_A" "$RESULT_B" << 'EOF'
import sys, json

def parse(s):
    try:
        return json.loads(s)
    except:
        # try to extract json from string
        import re
        m = re.search(r'\{.*\}', s, re.DOTALL)
        if m:
            try:
                return json.loads(m.group())
            except:
                pass
        return {}

a = parse(sys.argv[1])
b = parse(sys.argv[2])

keys = ['timeout_ms', 'has_pause_on_hover', 'has_queue', 'max_visible',
        'has_aria_live', 'has_keyboard_dismiss', 'handles_duplicates']

print(f"\n{'Feature':<25} {'Text prompt':<20} {'YAML spec':<20}")
print("-" * 65)
for k in keys:
    va = str(a.get(k, '—'))
    vb = str(b.get(k, '—'))
    diff = " ←" if va != vb else ""
    print(f"{k:<25} {va:<20} {vb:<20}{diff}")

print()
print(f"Assumed by A ({len(a.get('assumed', []))} things):")
for x in a.get('assumed', []):
    print(f"  - {x}")

print(f"\nAssumed by B ({len(b.get('assumed', []))} things):")
for x in b.get('assumed', []):
    print(f"  - {x}")
EOF