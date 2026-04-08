#!/bin/bash

MODEL="mistral:instruct"
OLLAMA="http://localhost:11434/api/generate"

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

INSTRUCTION='Do NOT write code. Reply ONLY with raw JSON, no markdown, no backticks. Keys:
- timeout_success_ms: integer
- timeout_error_ms: integer or "never"
- pause_on_hover: true/false
- max_visible: integer or null
- queue_drops_overflow: true/false
- keyboard_dismiss: true/false
- swipe_dismiss: true/false
- close_on_outside_click: true/false
- dedup_window_ms: integer or null
- offline_persists_errors: true/false
- has_aria_live: true/false
- has_rtl: true/false
- has_analytics: true/false
- has_custom_content: true/false
- has_theming: true/false
- assumed: array of strings — decisions NOT explicitly stated in the input'

PROMPT_TEXT="Build a production-ready React toast notification system. Requirements: support success, error, info, warning, and loading types. Loading toasts should be updatable to success or error. Auto-dismiss after 4 seconds for success and info, never for error and loading. Pause timer on hover. Stack from bottom-right, max 3 visible, queue rest without dropping. User can dismiss with button or Escape. Swiping left on mobile should dismiss. Clicking outside should NOT dismiss. Deduplicate messages within 2 seconds window. Keep error toasts if network is offline, restore auto-dismiss when reconnected. Full accessibility: aria-live polite, role=alert, keyboard navigation between toasts, screen reader announcements. Support RTL. Log shown, dismissed, clicked, expired events to analytics. Persist dismissed toast IDs in sessionStorage so they don't reappear on navigation. Support custom React components as toast content. Theming via CSS variables.

$INSTRUCTION"

PROMPT_YAML='Build a React toast notification component from this spec:

component: ToastNotification
types: [success, error, info, warning, loading]
behavior:
  auto_dismiss:
    success: 4000
    info: 4000
    error: never
    loading: never
    pause_on_hover: true
  loading_to_result: { updatable: true, targets: [success, error] }
  queue: { max_visible: 3, strategy: stack_bottom, drop_on_overflow: false }
  dismiss:
    user_can_close: true
    keyboard: Escape
    swipe: { direction: left, mobile_only: true }
    close_on_outside_click: false
edge_cases:
  - duplicate_messages: { window_ms: 2000 }
  - network_offline: { persist: [error, loading], restore_on_reconnect: true }
  - navigation: { persist_dismissed_ids: sessionStorage }
accessibility: { aria_live: polite, role: alert, keyboard_nav: true, rtl: true }
analytics: { events: [shown, dismissed, clicked, expired] }
customization: { custom_content: React.ReactNode, theming: css_variables }

'"$INSTRUCTION"

echo "Sending prompt A (text)..."
RESULT_A=$(call_ollama "$PROMPT_TEXT")
echo "Sending prompt B (yaml)..."
RESULT_B=$(call_ollama "$PROMPT_YAML")

python3 - "$RESULT_A" "$RESULT_B" << 'EOF'
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

a = parse(sys.argv[1])
b = parse(sys.argv[2])

# Expected values from the spec
expected = {
    "timeout_success_ms": 4000,
    "timeout_error_ms": "never",
    "pause_on_hover": True,
    "max_visible": 3,
    "queue_drops_overflow": False,
    "keyboard_dismiss": True,
    "swipe_dismiss": True,
    "close_on_outside_click": False,
    "dedup_window_ms": 2000,
    "offline_persists_errors": True,
    "has_aria_live": True,
    "has_rtl": True,
    "has_analytics": True,
    "has_custom_content": True,
    "has_theming": True,
}

print(f"\n{'Decision':<30} {'Expected':<12} {'Text':<14} {'YAML':<14}")
print("-" * 72)

correct_a = 0
correct_b = 0

for k, exp in expected.items():
    va = a.get(k, '—')
    vb = b.get(k, '—')
    ok_a = "✓" if str(va) == str(exp) else "✗"
    ok_b = "✓" if str(vb) == str(exp) else "✗"
    if ok_a == "✓": correct_a += 1
    if ok_b == "✓": correct_b += 1
    print(f"{k:<30} {str(exp):<12} {ok_a} {str(va):<12} {ok_b} {str(vb):<12}")

total = len(expected)
print(f"\nCorrect: text {correct_a}/{total}  YAML {correct_b}/{total}")

print(f"\nAssumed by text ({len(a.get('assumed', []))} things):")
for x in a.get('assumed', []): print(f"  - {x}")

print(f"\nAssumed by YAML ({len(b.get('assumed', []))} things):")
for x in b.get('assumed', []): print(f"  - {x}")
EOF