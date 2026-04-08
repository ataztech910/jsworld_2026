# How to Write Your First Intent Spec

*Three real examples, a five-question checklist, and one thing to do today.*

---

In the [previous article](./article-2.md) we covered SIFY — four principles for working with AI that produce predictable results. This is the practical part.

No theory. Just three components, before and after.

---

## How to read these examples

For each component:
1. The vague prompt — what most people write
2. What the model guessed — decisions made without you
3. The structured spec — same component, explicit intent
4. What changed — the questions the spec forced you to answer

The format doesn't matter. The thinking does.

---

## Example 1: Invoice Form

### The vague prompt
```
Build a React invoice form with line items and totals.
```

### What the model guessed
- Minimum amount: nothing — no limit
- VAT: standard rate, applied uniformly
- Which countries are blocked: none
- Retry on error: always
- Analytics: probably Google Analytics
- Autosave: maybe, maybe not

### The structured spec
```yaml
component: InvoiceForm

constraints:
  min_amount_eur: 50        # below this: payment processing costs exceed margin
  max_line_items: 10        # hard DB limit — enforced server-side too

discount:
  condition: client_tenure_months >= 6
  # loyalty only — new clients and trials not eligible

vat:
  eu: 20                    # standard EU VAT
  non_eu: 0                 # export, VAT-exempt
  blocked: [RU, BY]         # legal/compliance — block form entirely

payment:
  retry_on: [network_error]
  no_retry_on: [validation_error, card_declined]
  # user must fix input — never auto-retry declined cards

analytics:
  provider: internal        # ClickHouse, GDPR requirement — NOT Google Analytics
  events: [form_open, line_item_added, submitted, error]

persistence:
  autosave_seconds: 30
  confirm_unsaved_on_close: true
```

### What changed
The spec forced seven decisions that the vague prompt skipped entirely. None of them are obvious from "build an invoice form." All of them are business rules that would have been guessed — probably wrong, definitely inconsistently.

**Score: vague prompt 2/10 → structured spec 9/10**

---

## Example 2: Dashboard Component

This example is about structure, not business rules.

### The vague prompt
```
I need a dashboard with a header that includes logo, navigation and 
user menu. Then a sidebar with nav items and a collapse button. 
And a grid with stat cards, chart cards, and a table.
```

Count the structural noise words: "that includes", "then a", "and a", "with" — words that describe structure instead of expressing it. In 45 words, roughly 40% carry zero information.

### What the model guessed
- Logo: has a link? to where?
- Navigation: active state is a prop or internal state?
- Stat card trend: up/down indicator or percentage?
- Chart card data: dataset object or date string?
- Table columns: sortable flag per column?

Four ambiguities. Four places where "reasonable default" diverges from your actual requirement.

### The structured spec
```yaml
component: Dashboard

header:
  logo:
    props: [src, href]
  navigation:
    link:
      props: [label, href, active]
  user_menu:
    props: [avatar, dropdown_items]

sidebar:
  nav_item:
    props: [icon, label, active]
  collapse_button:
    props: [collapsed]

grid:
  layout: grid
  stat_card:
    props: [title, value, trend, color]
  chart_card:
    props: [title, type, data, legend]
  table_card:
    columns:
      props: [label, key, sortable]
    rows: [data]
    pagination:
      props: [page, per_page, total]
```

54 words. Zero structural noise. Zero ambiguities. Every prop is explicit.

### What changed
The hierarchy is visible. The props are defined. No "reasonable default" decisions — every field is intentional.

This also makes the spec reviewable. A teammate can read it in thirty seconds and spot a missing prop. They cannot do that with the prose version.

---

## Example 3: Toast Notification System

### The vague prompt
```
Build a toast notification component. Show success, error, and info 
messages. Auto-dismiss after a few seconds. User can close manually.
```

"A few seconds" — the model chose 3000ms. Maybe 5000ms. You don't know.

"User can close manually" — button only? Escape key? Swipe on mobile? The model chose.

What about multiple toasts? What about duplicates? Accessibility? The model chose, silently.

### The structured spec
```yaml
component: ToastNotification

types: [success, error, info, warning]

behavior:
  auto_dismiss:
    duration_ms: 4000         # enough time to read, not so long it's annoying
    pause_on_hover: true      # user should be able to read it

  queue:
    max_visible: 3            # more than 3 is overwhelming
    strategy: stack_bottom
    drop_on_overflow: false   # never drop — queue them

  dismiss:
    user_can_close: true
    keyboard: Escape
    swipe: left               # mobile
    close_on_outside_click: false  # accidental taps shouldn't dismiss

accessibility:
  role: alert
  aria_live: polite           # assertive only for critical errors
  keyboard_dismissible: true

edge_cases:
  - duplicate_messages: ignore within 2s
  - network_offline: persist error toasts until reconnected
```

### What changed
Every behavioral decision is explicit. `4000ms` not "a few seconds." `pause_on_hover: true` not "standard behavior." `drop_on_overflow: false` — a decision that requires deliberate thought.

The edge cases section is the most valuable part. "What happens when the network goes offline?" — that question only surfaces when you're writing the spec. Not when you're prompting. Not when you're reviewing the generated code. In the vague version, you discover it in production.

---

## The five-question checklist

Before writing any non-trivial prompt, answer these:

**1. What are the hard constraints?**
Numbers, limits, minimums, maximums. Things that cannot be approximate.

**2. What are the business rules that differ from the generic case?**
If a standard e-commerce component would do X, but yours does Y — that's a business rule. Write it down.

**3. What should explicitly NOT happen?**
No-retry on validation errors. No GA. No auto-dismiss for error toasts. The "not" decisions are as important as the "yes" decisions.

**4. What edge cases exist that the model won't anticipate?**
Offline behavior. Blocked countries. Users with specific account states. Anything that requires domain knowledge.

**5. What would you be embarrassed to discover the model assumed?**
This question surfaces the silent decisions. If the answer makes you uncomfortable — it needs to be in the spec.

Write the answers in any format. That's the spec.

---

## One thing to do today

Take the next prompt you're about to write. Before you send it, spend five minutes answering the five questions above.

Write the answers in YAML, JSON, markdown, plain text — it doesn't matter. What matters is that you write them.

Then compare what you wrote to what you would have sent. Count the lines that weren't in the original prompt. Each one is a business rule that lived in your head — and would have been guessed by the model.

That's the value. Not better AI output. Better thinking — with AI output as a useful side effect.

---

## What's available

**SIFY repository** — the full framework, principles, antipatterns, and research data:
[github.com/your-repo/sify](https://github.com)

The research includes all test scripts, raw results, and the deterministic judge used to score model outputs. Everything is reproducible with local models — no paid API required.

**PromptFarm** — a platform built on SIFY principles for structuring, versioning, and reusing prompts as first-class engineering artifacts:
[promptfarm.dev](https://promptfarm.dev)

---

## The series

- **Part 1:** [Why Your AI-Generated Code Keeps Breaking](./article-1.md)
- **Part 2:** [SIFY: The Spec Is For You](./article-2.md)
- **Part 3:** How to Write Your First Intent Spec *(this article)*

---

*Examples in this article are composites based on common patterns observed across engineering teams.*