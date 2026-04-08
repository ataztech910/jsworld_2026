# SIFY Principles — Detailed Reference

---

## S — Structure before generation

### The principle
Define what you want before you generate it.

### Why it matters
A prompt without structure is a conversation without a contract. Every iteration changes the context. By the fifth prompt, you've drifted from your original intent without noticing.

Structure creates a fixed point. The spec doesn't change when the model surprises you — the model's output is measured against the spec, not the other way around.

### What structure means
Structure is not YAML. Structure is any format that makes your decisions explicit and enumerable:

- What does this component do?
- What are the constraints?
- What are the edge cases?
- What should NOT happen?

### The TDD analogy
In TDD you write the test before the code. The test is a contract — it doesn't care how the code works internally, only that the output matches the expectation.

In SIFY you write the spec before the prompt. The spec is a contract — it doesn't care which model runs it, only that the output matches the intent.

```
TDD:   test → code → verify
SIFY:  spec → prompt → generate → audit
```

### In practice

Before:
```
"Build a checkout button that handles errors"
```

After:
```yaml
component: CheckoutButton
behavior:
  on_click: validate_cart → call_payment_api
  on_success: redirect to /confirmation
  on_error:
    network: show_retry_banner, keep_button_enabled
    validation: show_inline_error, do_not_retry
    timeout_ms: 8000
accessibility:
  role: button
  aria_label: "Complete purchase"
  keyboard: Enter, Space
```

### What to notice
The structured version forced you to answer: what happens on network error vs validation error? Are those different? In the text version — you skipped that. The model decided for you.

---

## I — Intent is yours, not AI's

### The principle
AI knows patterns from training data. It does not know your business rules. No model will invent your domain knowledge — ever.

### Why it matters
This is the most important principle and the most misunderstood one.

People assume that a smart enough model will "figure it out." It won't. Not because models are bad — because your business rules don't exist anywhere in their training data.

`vat_blocked: [RU, BY]` — this is your rule. It comes from your legal team, your compliance requirements, your specific market. No model has seen it. No model can infer it.

### The delegation trap
The natural reaction is: "I'll ask AI to write the spec for me."

This is Spec Delegation — the most expensive antipattern. Empirically tested:

| Chain | Score | Tokens |
|---|---|---|
| Vague → model directly | 2/10 | 141 |
| Vague → AI writes spec → model | 0/10 | 447–1306 |

The AI-generated spec is beautiful, well-structured, and contains zero of your business rules. It costs 3–9x more and performs worse.

### What "intent is yours" means in practice
Before writing any prompt, ask yourself:

- What does this component know about our system specifically?
- What rules exist that aren't obvious from the feature name?
- What would break if the model made a reasonable default choice?

Each answer is a line in your spec.

### The knowledge extraction test
Write a vague prompt. Then write a structured spec for the same thing. Count how many lines in the spec weren't in the prompt. Each one is a business rule that lived only in your head.

That's the value of the spec — not for AI, but for you.

---

## F — Format over syntax

### The principle
Structure matters. Key names don't. You don't need a standard — you need a structure.

### Why it matters
"Schema paralysis" kills adoption. People spend hours researching the "correct" YAML format instead of writing the spec. This is backwards.

The format is a delivery mechanism. The intent is the content.

### Empirical evidence
Three versions of the same spec were tested — canonical keys, renamed keys, and deliberately weird abbreviated keys:

| Key style | Example | Score |
|---|---|---|
| Canonical | `vat_eu_pct: 20` | 9/10 |
| Renamed | `inside_eu_tax: 20` | 9/10 |
| Weird | `vat_in: 20` | 10/10 |

The model reads context and hierarchy, not key names. `frm`, `component`, `widget`, `thing` — all understood equally well.

### What this means for you
Pick any format that feels natural. Stick to it for consistency. Don't change it just because you found a "better" schema.

Consistency within a project matters more than correctness across projects.

### Format options that work
All of these are valid:

```yaml
# YAML
component: InvoiceForm
min_amount: 50
```

```json
// JSON
{ "component": "InvoiceForm", "min_amount": 50 }
```

```markdown
## InvoiceForm
- min_amount: 50€
- max_items: 10
```

```
// Plain structured text
component: InvoiceForm
min_amount: 50
max_items: 10
```

Pick one. Write the spec. Move on.

---

## Y — Your assumed is your risk

### The principle
Every decision the model made without explicit instruction is a risk you cannot see until it breaks.

### Why this is subtle
This is the hardest principle to internalize because it's invisible by design.

When a model returns `assumed: 0` — that doesn't mean it made no assumptions. It means it didn't report them. The assumptions are embedded in the generated code, not in the response metadata.

### The silent success trap
Empirically tested with pure YAML vs YAML with comments:

| Format | Score | Assumed |
|---|---|---|
| Pure YAML | 9/10 | 10 (silent) |
| YAML + comments | 9/10 | 0 |

Same score. Completely different risk profile.

In the pure YAML case, the model made 10 decisions silently — about data types, edge cases, defaults. It happened to guess correctly. Next time, different model, different context — it might not.

In the YAML + comments case, every decision was explicit. The result is reproducible.

### "Guessed right" vs "understood right"
This is the core distinction:

- **Guessed right**: the output is correct, but the path to correctness was probabilistic
- **Understood right**: the output is correct because the intent was explicit

Only the second one is reproducible at scale, across models, across time.

### How to reduce assumed
Two techniques:

**1. Add comments to your spec**
```yaml
vat:
  eu: 20          # standard EU VAT rate, legal requirement
  non_eu: 0       # export, VAT-exempt by law
  blocked: [RU, BY]  # compliance — do not render form, not just 0%
```

**2. Ask the model explicitly**
After generating, ask: "What decisions did you make that I didn't specify?" The answer is your risk inventory.

### The audit habit
The spec defines what you expect. The audit answers: did the model do what you expected?

This is not code review. This is intent verification — checking the output against the contract, not against your gut feeling.
