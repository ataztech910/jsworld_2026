# SIFY: The Spec Is For You

*A four-principle thinking framework for working with AI that actually produces predictable results.*

---

In the [previous article](./article-1.md), we ran a controlled experiment. Same component, same models, two different prompt formats. Vague text scored 2–3 out of 10 business rules. Structured spec scored 9–10 out of 10.

The obvious conclusion: write better prompts.

But here's what the data actually shows — and why "write better prompts" misses the point entirely.

---

## The delegation trap

When developers hear "write better prompts," the natural next step is: ask AI to help write the prompt. Or better — ask AI to write the spec.

We tested this too.

We took the same vague prompt and ran it through three different models as "spec writers" — Mistral, Gemini, and Claude. Each model generated a detailed YAML specification. Then we fed that spec to CodeQwen and measured the result.

| Chain | Rules correct | Tokens |
|---|---|---|
| Vague → CodeQwen directly | 2/10 | 141 |
| Vague → Mistral spec → CodeQwen | 0/10 | 447 |
| Vague → Gemini spec → CodeQwen | 2/10 | 1,149 |
| Vague → Claude spec → CodeQwen | 0/10 | 1,306 |

Claude wrote a beautiful, detailed, well-structured specification. It cost nine times more tokens. It scored zero.

Why? Because Claude doesn't know your minimum invoice amount. It doesn't know which countries are blocked for legal reasons. It doesn't know that you use internal analytics instead of Google Analytics for GDPR compliance.

Those rules live in your head. No model has access to them. No amount of spec generation, chain-of-thought prompting, or model capability closes that gap.

The bottleneck isn't between you and the model. The bottleneck is between what you know and what you wrote down.

---

## What TDD taught us about this

Test-Driven Development solved a similar problem thirty years ago.

Before TDD, developers wrote code and then tested it. The tests were an afterthought — often written to confirm that the code worked the way it was written, not the way it was supposed to work.

TDD inverted this. Write the test first. The test is a contract — it forces you to define expected behavior before you implement anything. The result isn't just better tests. It's better thinking. Writing the test first surfaces ambiguities you didn't know existed.

```
TDD:   test → code → verify
```

SIFY applies the same inversion to AI-assisted development:

```
SIFY:  spec → prompt → generate → audit
```

The spec is not documentation. It's not bureaucracy. It's a thinking tool — the act of writing it forces your implicit knowledge into explicit form.

Just as writing a test forces you to answer "what should this code do?", writing a spec forces you to answer "what do I actually want here?"

---

## The four principles

### S — Structure before generation

Define what you want before you generate it.

A prompt without structure is a conversation without a contract. Each iteration changes the context. By the fifth prompt you've drifted from your original intent without noticing, and the model is optimizing for your last message — not your first.

Structure creates a fixed point. When the model surprises you, you measure its output against the spec — not against your gut feeling in the moment.

**The antipattern: Prompt and pray**

```
You:  "Build a checkout form"
AI:   [generates something]
You:  "Add error handling"  
AI:   [adds error handling, changes something else]
You:  "The loading state broke"
AI:   [fixes loading, breaks error handling]
```

No contract. No fixed point. Just iteration toward an undefined target.

---

### I — Intent is yours, not AI's

AI knows patterns. It does not know your business.

`vat_blocked: [RU, BY]` — this is your rule. It comes from your legal team, your compliance requirements, your specific market situation. No model has seen it. No model can infer it from "build an invoice form."

The model fills gaps with reasonable defaults. Reasonable defaults are not your business rules. They're what a generic system would do — which is almost, but not exactly, what you need. And "almost" in production is a bug waiting for the right conditions.

**The antipattern: Spec delegation**

Asking AI to write the spec is asking it to invent knowledge it doesn't have. The output will be well-structured and confidently wrong on every domain-specific decision.

Your intent must come from you. AI can help you structure it. It cannot create it.

---

### F — Format over syntax

Structure matters. Key names don't.

This was one of the more surprising findings. We tested the same spec with three different naming styles:

| Style | Example | Score |
|---|---|---|
| Canonical | `vat_eu_pct: 20` | 9/10 |
| Renamed | `inside_eu_tax: 20` | 9/10 |
| Weird/abbreviated | `vat_in: 20` | 10/10 |

The model reads context and hierarchy — not key names. `frm`, `component`, `widget`, `thing` — understood equally well from context.

You don't need a standard. You don't need a schema validator. You don't need to research the "correct" YAML format before writing your first spec.

**The antipattern: Schema paralysis**

Spending time finding the right format instead of writing the spec. The format can be changed in five minutes. The thinking cannot be skipped.

Pick any format that makes your intent explicit. Write the spec. Move on.

---

### Y — Your assumed is your risk

Every decision the model made without explicit instruction is a risk you cannot see until it breaks.

This is the subtlest principle — and the most important one.

We tested pure YAML against YAML with explanatory comments:

| Format | Score | Silent assumptions |
|---|---|---|
| Pure YAML (Mistral) | 9/10 | 10 |
| YAML + comments (Mistral) | 9/10 | 0 |

Same score. Completely different risk profile.

In the pure YAML case, the model made ten decisions silently — about data types, edge cases, defaults, error messages. It happened to guess correctly. Next week, different context, different model version — it might not.

In the YAML + comments case, every decision was explicit. The result is reproducible.

**The antipattern: Silent success**

Code works. Tests pass. `assumed: 0` in the response. Everything looks fine.

But `assumed: 0` doesn't mean zero assumptions. It means the model didn't report them. They're embedded in the generated code, invisible until the specific condition that exposes them.

"Guessed right" is not reproducible. "Understood right" is.

---

## The core insight

Here's what connects all four principles:

> **The spec is not for the AI. It's for you.**

Writing a structured spec before prompting does something that has nothing to do with the model. It forces you to make implicit decisions explicit. To answer questions you were avoiding. To discover the gaps in your own understanding before they become gaps in the code.

The German customer on Tuesday didn't break because the AI was bad. The AI did exactly what it was designed to do — pattern match on available information and generate the most probable output.

The break happened because the developer never asked themselves: what should happen when a B2B customer with a valid EU VAT number tries to pay?

The spec would have surfaced that question. Not because YAML is magic. Because writing things down forces thinking.

---

## Why this is different from SDD

Spec-Driven Development already exists — GitHub's Spec Kit, AWS Kiro, Cursor's plan mode. All of them are good tools.

SIFY is not a tool. It's a thinking framework — four principles that apply regardless of which tool you use, which model you run, which IDE you work in.

The difference is the direction of the insight:

- SDD says: "write a spec so AI understands you better"
- SIFY says: "write a spec so *you* understand yourself better"

This changes what the spec is for. Not a better input for the model — a mirror for your own thinking.

---

## What changes on Monday

Before you write your next prompt, answer four questions:

1. What are the constraints? *(minimum values, maximum limits, hard rules)*
2. What are the edge cases? *(what should NOT happen)*
3. Where does my business logic differ from the generic case?
4. What would I be embarrassed to discover the model assumed?

Write the answers down. In any format. That's your spec.

Notice what appeared that wasn't in your original prompt idea. Those are your business rules — extracted from your head into explicit form where they can actually be used.

---

## Next

In the final article, I'll show exactly what this looks like in practice — three real component specs, built step by step, with before-and-after comparisons. Including the checklist I use before every non-trivial prompt.

The SIFY principles and full research data are available at [github.com/your-repo/sify](https://github.com).

---

*Examples in this article are composites based on common patterns observed across engineering teams.*