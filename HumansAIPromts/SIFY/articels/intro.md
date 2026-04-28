# Why Your AI-Generated Code Keeps Breaking

*And why switching to a smarter model won't fix it.*

---

It was a Tuesday. The kind of Tuesday where everything is technically fine until it isn't.

A senior developer on our team had shipped a payment component three weeks earlier. It looked clean. Code review passed. Tests were green. The component was AI-generated — Cursor, a well-crafted prompt, maybe twenty minutes of work.

On Tuesday, a customer in Germany tried to pay. The VAT calculation was wrong. Not broken — wrong. The model had applied a standard 20% VAT rate globally. Nobody had told it that our platform had specific exemptions for B2B transactions between EU companies with valid VAT numbers. Nobody had specified that customers from certain countries should see a completely different flow.

The model didn't know. Nobody told it. It did what any reasonable system would do with incomplete information: it guessed. And it guessed well enough to pass review.

The fix took four hours. The bug had been in production for three weeks.

---

## The real problem isn't the code

Here's what we told ourselves: *we need better prompts*.

So we wrote better prompts. Longer, more detailed, with explicit instructions about edge cases. The code got better. But something else happened that nobody expected.

The better the prompt, the harder it was to know what the model had decided on its own.

A short vague prompt produces obviously broken code. A long detailed prompt produces code that looks completely correct — until it breaks on something you never thought to mention. The failure mode shifts from "clearly wrong" to "subtly wrong in the worst possible moment."

We had optimized for confidence without increasing actual correctness.

---

## We ran an experiment

Earlier this year, I ran a series of controlled tests to understand exactly how much prompt format affects AI output.

The setup was simple: one component — a React invoice form — with ten specific business rules defined in advance. Rules like minimum invoice amount, VAT rates by country, which countries are blocked entirely, retry behavior on network errors vs validation errors, analytics provider, autosave interval.

Then I gave the same task to several models using two different prompts:

**Prompt A — vague text:**
```
Build a React invoice form with line items and totals.
```

**Prompt B — structured YAML spec:**
```yaml
component: InvoiceForm
constraints:
  min_amount_eur: 50
  max_line_items: 10
vat:
  eu: 20
  non_eu: 0
  blocked: [RU, BY]
payment:
  retry_on: [network_error]
  no_retry_on: [validation_error]
analytics:
  provider: internal
persistence:
  autosave_seconds: 30
  confirm_unsaved_on_close: true
```

After generation, a deterministic script — no AI involvement — checked how many of the ten rules appeared correctly in the output.

The results:

| Model | Vague text | Structured spec |
|---|---|---|
| Mistral 7b | 3/10 | 9/10 |
| CodeQwen 7b | 2/10 | 9/10 |

Same model. Same task. Three to four times more correct with structured input.

---

## Then we added the big models

The natural question: does a smarter model fix the problem?

I ran the same vague prompt through Gemini Flash and Claude Sonnet.

| Model | Vague text | Assumed |
|---|---|---|
| Mistral 7b | 3/10 | 2 |
| CodeQwen 7b | 2/10 | 0 |
| Gemini Flash | 4/10 | 6 |
| Claude Sonnet | 0/10 | 10 |

Gemini scored slightly better — 4/10. But it made six silent assumptions. Decisions it made without telling me.

Claude scored zero. But it listed ten things it didn't know — ten explicit gaps it couldn't fill from the vague prompt.

This is where it gets interesting.

---

## The paradox

Claude got the lowest score. Claude gave the most useful output.

Think about that for a moment.

Gemini guessed four rules correctly. That sounds better. But "guessed correctly" means the model happened to make the same decision I would have made — this time. With this prompt. With this version of the model.

Claude admitted it didn't know. That's recoverable. I can look at its list of unknowns and answer each one. The output becomes a checklist of what I need to specify.

Gemini's silent assumptions are invisible. They're embedded in the generated code. You won't find them until the German customer tries to pay on a Tuesday.

**Visible failure is recoverable. Silent success is not.**

---

## The real gap isn't between you and the model

It's between your intent and what you wrote down.

The ten rules in my experiment — minimum amount, VAT logic, retry behavior, analytics provider — none of them are obvious from "build a React invoice form." They exist in product specs, in legal requirements, in Slack conversations from six months ago, in your head.

The model doesn't have access to any of that. It has training data. It has patterns. It has what you gave it in the prompt.

When you write a vague prompt, you're not asking the model to build what you want. You're asking it to guess what you want from insufficient evidence. Sometimes it guesses right. Usually it guesses approximately right. Occasionally it guesses in ways that pass code review and fail in production three weeks later.

And here's the critical thing: the model can't tell you it's guessing. It generates with the same confidence whether it knows exactly what you want or whether it's making it up entirely.

---

## What about better prompts?

"Just write better prompts."

This is the standard advice. More detail, more context, more explicit instructions. And it works — partially.

We tested what happens when you take a vague prompt and ask another AI model to write a better spec from it:

| Chain | Score | Tokens |
|---|---|---|
| Vague → CodeQwen directly | 2/10 | 141 |
| Vague → Gemini writes spec → CodeQwen | 2/10 | 1,149 |
| Vague → Claude writes spec → CodeQwen | 0/10 | 1,306 |

Claude wrote a beautiful, detailed, well-structured YAML specification. It cost nine times more tokens. It produced a worse result.

Because Claude doesn't know your minimum invoice amount. It doesn't know which countries are blocked. It doesn't know that you use internal analytics instead of Google Analytics for GDPR reasons.

Those rules exist only in your head.

No amount of prompt engineering, chain-of-thought, or model capability closes that gap. The information has to come from you.

---

## The question nobody is asking

We've spent two years optimizing how we talk to AI. Better prompts, better tools, better models. The implicit assumption is that the bottleneck is on the AI side — that if we communicate better with the model, results will improve.

But the experiment suggests something different.

The bottleneck isn't between you and the model. The bottleneck is between your implicit knowledge and your explicit output. Between what you know and what you wrote down.

The model is working with everything you gave it. The problem is that you gave it a fraction of what you actually know.

This changes the question. Not "how do I prompt better?" but "how do I know what I know?"

---

## What's next

In the next article, I'll introduce SIFY — a four-principle thinking framework for working with AI that addresses this directly.

It's not about YAML. It's not about prompt templates. It's about a habit of thinking that forces your implicit knowledge into explicit form — before you generate anything.

The framework came out of the same research that produced these results. Four principles, each one tested. Each one with a corresponding antipattern that looks like it's working right up until it doesn't.

If you've ever shipped AI-generated code that broke on something you "should have specified" — that's exactly what we're going to fix.

---

*Examples in this article are composites based on common patterns observed across engineering teams. Specific details have been changed.*

*The full research data, test scripts, and results are available at [github.com/your-repo/sify-research](https://github.com).*