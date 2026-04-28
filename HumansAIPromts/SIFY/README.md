# SIFY — The Spec Is For You

> *A thinking framework for working with AI in software development*

---

## The Problem

You ask AI to build a form. It looks perfect. It ships. It breaks.

Not because AI is bad. Because **you didn't know what you wanted** — and AI guessed.

The gap isn't between you and the model. The gap is between your intent and what you actually wrote down.

---

## What is SIFY?

SIFY is a minimal thinking framework — four principles for working with AI-assisted development that actually produces predictable results.

Like TDD, SIFY doesn't prescribe tools. It prescribes a **habit of thinking**.

```
Test-First  →  write the test before the code
SIFY        →  write the intent before the prompt
```

---

## The Four Principles

### S — Structure before generation
Define what you want before you generate it. A prompt without structure is code without tests.

```yaml
# Instead of:
"Build an invoice form with validation"

# Write this first:
component: InvoiceForm
constraints:
  min_amount_eur: 50
  max_line_items: 10
validation:
  on_error: show_inline
  retry_on: [network_error]
```

### I — Intent is yours, not AI's
AI knows patterns. It doesn't know your business. `vat_blocked: [RU, BY]` exists only in your head — until you write it down.

No model will invent your domain rules. Ever.

### F — Format over syntax
Structure matters. Key names don't. `frm`, `component`, `widget` — the model understands all three equally well from context and hierarchy.

You don't need a standard. You need a structure.

### Y — Your assumed is your risk
Every decision the model made without you is a risk you can't see.

`assumed: 0` doesn't mean the model made no assumptions. It means it didn't tell you.

---

## The Core Insight

> **The spec is not for the AI. It's for you.**

Writing a structured spec forces you to make implicit decisions explicit. AI executes what's there. When nothing is there, it guesses — and you don't know it guessed.

| Vague prompt | Structured spec |
|---|---|
| Model guesses | Model follows |
| You think it's ok | You know it's ok |
| Breaks in prod | Predictable output |

---

## This Is Not About YAML

SIFY is not a YAML tutorial. Use whatever format makes your intent explicit:

- YAML
- JSON
- Markdown with headers
- Even structured plain text

The format is irrelevant. The structure is everything.

---

## The Four Antipatterns

| Antipattern | Principle violated | What happens |
|---|---|---|
| **Prompt and pray** | S | Iterate without a contract, lose track of original intent |
| **Spec delegation** | I | Ask AI to write the spec — get beautiful YAML with none of your rules |
| **Schema paralysis** | F | Spend hours finding the "right" format instead of writing the spec |
| **Silent success** | Y | Code works, assumed: 0, but 10 decisions were made without you |

---

## Evidence

SIFY principles were validated through a series of controlled experiments using local (Mistral 7b, CodeQwen 7b) and commercial (Gemini Flash, Claude Sonnet) models.

Key findings:

- Vague text → **2–3/10** business rules reproduced correctly
- Structured YAML spec → **9–10/10** regardless of model size
- AI-generated spec from vague prompt → **0/10** at 3–9x token cost
- Key name variations (canonical vs weird) → **same results**
- YAML + comments → **assumed drops from 10 to 0**

Full research data: [RESEARCH.md](./RESEARCH.md)

---

## Getting Started

Take any prompt you're about to write this week. Before sending it:

1. Write down the constraints
2. Write down the edge cases
3. Write down what should NOT happen

That's your spec. It doesn't need to be YAML. It needs to be explicit.

Notice what appeared that wasn't in your original prompt. Those are your business rules — extracted from your head.

---

## Related

- [PRINCIPLES.md](./PRINCIPLES.md) — detailed breakdown of each principle
- [ANTIPATTERNS.md](./ANTIPATTERNS.md) — four antipatterns with real examples
- [EXAMPLES.md](./EXAMPLES.md) — text vs structured spec, real components
- [RESEARCH.md](./RESEARCH.md) — experimental data behind SIFY

---

## License

CC BY 4.0 — use freely, attribution appreciated.
