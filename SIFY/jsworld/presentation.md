# JSWorld 2026 — Full Speaker Script
## "The New Frontend Stack: Humans, AI, and Prompts"
### 15 minutes | Arc: problem → data → insight → SIFY methodology

---

## TIMING MAP

| Section | Content | Time | Running |
|---|---|---|---|
| Opening | Hook | 0:60 | 0:01:00 |
| The experiment | Setup + results | 2:30 | 0:03:30 |
| What the data says | T6, T7, T8 | 2:30 | 0:06:00 |
| The insight | The real gap | 2:00 | 0:08:00 |
| SIFY | Four principles | 3:00 | 0:11:00 |
| Antipatterns | Four names | 1:30 | 0:12:30 |
| Close | SIFY + PromptFarm | 2:30 | 0:15:00 |

---

## SLIDE 1 — OPENING
### ⏱ 0:00 – 1:00

**[Walk to center stage. Pause. Make eye contact. Then:]**

> "Last year I shipped a payment component.
>
> It took twenty minutes. AI-generated. Clean code. Tests passed. Code review approved.
>
> Three weeks later, a customer in Germany tried to pay.
> The VAT calculation was wrong.
> Not broken — wrong.
>
> The model had applied a standard rate. Nobody told it we had specific exemptions for B2B transactions between EU companies.
>
> The fix took four hours. The bug had been in production for three weeks.
>
> And here's the thing — the model did exactly what it was supposed to do.
> We just didn't tell it what we actually needed."

**[Pause. Let that land.]**

> "We are writing prompts. But we are debugging like it's 2015."

---

## SLIDE 2 — THE EXPERIMENT
### ⏱ 1:00 – 3:30

**[Casual, like you're sharing research with a colleague]**

> "So I ran an experiment.
>
> One component. A React invoice form. Ten specific business rules defined in advance.
> Things like minimum invoice amount, VAT rates by country, which countries are blocked,
> retry behavior on network errors, analytics provider.
>
> Two prompts. Same models. Same task."

**[Show Prompt A:]**

> "Prompt A:"

```
Build a React invoice form with line items and totals.
```

> "Prompt B — structured spec:"

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
analytics:
  provider: internal
persistence:
  autosave_seconds: 30
```

> "After generation, a deterministic TypeScript script — no AI involvement in scoring —
> checked how many of the ten rules appeared correctly in the output."

**[Show results table:]**

> "Mistral 7b. Vague text: 3 out of 10. Structured spec: 9 out of 10.
>
> CodeQwen 7b. Vague text: 2 out of 10. Structured spec: 9 out of 10.
>
> Same model. Same task. Three to four times more correct.
> Only the format changed."

**[Beat.]**

> "Then we added the big models."

**[Show T2 table:]**

> "Gemini Flash on the vague prompt: 4 out of 10.
> Better — but it made six silent assumptions.
>
> Claude Sonnet: zero out of ten.
> But — it listed ten things it didn't know."

**[Pause. This is the counterintuitive moment.]**

> "Claude got the lowest score.
> Claude gave the most useful output.
>
> Gemini guessed four rules correctly. You wouldn't know it guessed.
> Claude said 'I don't know these ten things.' You can work with that.
>
> Visible failure is recoverable. Silent success is not."

---

## SLIDE 3 — WHAT THE DATA SAYS
### ⏱ 3:30 – 6:00

**[Slower now. This is the analytical section.]**

> "Three more findings from the same research."

**[T6:]**

> "We asked: what if we use one AI to write the spec, then another to execute it?
>
> Vague prompt directly to CodeQwen: 2 out of 10. 141 tokens.
>
> Vague prompt to Claude — Claude writes a spec — spec goes to CodeQwen:
> Zero out of ten. 1,306 tokens.
>
> Nine times more expensive. Worse result.
>
> Claude wrote a beautiful, detailed YAML specification.
> With zero of our business rules.
> Because Claude doesn't know our VAT exemptions.
> Because that knowledge lives in our heads — not anywhere Claude was trained."

**[T7:]**

> "We tested whether key names matter.
>
> Same spec — three versions.
> Standard keys: `vat_eu_pct`.
> Renamed keys: `inside_eu_tax`.
> Weird abbreviated keys: `vat_in`.
>
> All three: nine or ten out of ten.
>
> The model reads context and hierarchy. Not key names.
> You don't need a standard. You need a structure."

**[T8:]**

> "And the subtlest finding.
>
> Pure YAML spec: 9 out of 10. Assumed: ten.
> YAML with comments: 9 out of 10. Assumed: zero.
>
> Same score. Completely different risk.
>
> In the pure YAML case, the model made ten silent decisions.
> It happened to guess correctly — this time.
> Next week, different model version, different context — maybe not.
>
> 'Guessed right' is not reproducible.
> 'Understood right' is."

---

## SLIDE 4 — THE INSIGHT
### ⏱ 6:00 – 8:00

**[Step forward. This is the pivot of the entire talk.]**

> "So what does all of this actually say?
>
> The standard advice is: write better prompts.
> More detail. More context. More instructions.
>
> But T6 showed us something important.
> Even Claude — the most capable model we tested —
> couldn't write a good spec from a vague prompt.
> Not because Claude is bad.
> Because the information doesn't exist outside your head.
>
> `vat_blocked: [RU, BY]` — that's your legal team's decision from eight months ago.
> `retry_on: [network_error]` — that came from a post-mortem after a production incident.
> `provider: internal` — GDPR requirement specific to your market.
>
> None of that is on the internet. None of that is in training data.
> No model has access to it."

**[Pause.]**

> "The gap isn't between you and the model.
>
> The gap is between what you know — and what you wrote down."

**[Let that breathe for two full seconds.]**

> "The model is working with everything you gave it.
> The problem is that you gave it a fraction of what you actually know."

---

## SLIDE 5 — SIFY
### ⏱ 8:00 – 11:00

**[New energy. This is the methodology reveal.]**

> "So we turned this research into a thinking framework.
> Four principles. We call it SIFY."

**[Show: S I F Y]**

> "The Spec Is For You.
>
> Not for the model. For you."

**[S:]**

> "S — Structure before generation.
>
> Like TDD. In Test-Driven Development you write the test before the code.
> The test forces you to define expected behavior before implementation.
>
> In SIFY you write the spec before the prompt.
> The spec forces you to define your intent before generation.
>
> The output isn't just better code.
> It's better thinking."

**[I:]**

> "I — Intent is yours, not AI's.
>
> AI knows patterns. It does not know your business.
> No model will invent your domain rules.
> They exist only in your head — until you write them down."

**[F:]**

> "F — Format over syntax.
>
> Structure matters. Key names don't.
> We proved this empirically — `vat_in` and `vat_eu_pct` produce identical results.
>
> You don't need a standard. You need a structure.
> Pick any format. Write the spec. Move on."

**[Y:]**

> "Y — Your assumed is your risk.
>
> Every decision the model made without explicit instruction
> is a risk you cannot see until it breaks.
>
> `assumed: 0` in the model's response doesn't mean zero assumptions.
> It means the model didn't tell you."

**[Pause. Then the full principle:]**

> "The spec is not for the AI.
> It's for you.
>
> Writing a structured spec before prompting forces your implicit knowledge
> into explicit form.
> AI executes what's there. When nothing is there, it guesses.
> And you don't know it guessed."

---

## SLIDE 6 — ANTIPATTERNS
### ⏱ 11:00 – 12:30

**[Faster pace. These should land like quick punches.]**

> "Four antipatterns. Each one violates a principle.
> Each one looks like it's working — until it doesn't."

**[Show each name as you say it:]**

> "Prompt and pray.
> You iterate without a contract. Each prompt changes the context.
> By the fifth message you've forgotten what you wanted.
>
> Spec delegation.
> You ask AI to write the spec.
> You get beautiful, well-structured YAML — with zero of your business rules.
>
> Schema paralysis.
> You spend a day finding the 'correct' format
> instead of writing the spec.
> Remember T7: format doesn't matter.
>
> Silent success.
> Code works. Tests pass.
> Ten decisions were made without you.
> You'll find out in production."

**[Beat.]**

> "The most dangerous one is silent success.
> Because it feels exactly like success."

---

## SLIDE 7 — CLOSE
### ⏱ 12:30 – 15:00

**[Slow down. Make eye contact. This is the landing.]**

> "We are not in the age of writing applications anymore.
>
> We are in the age of describing what we want — and generating it.
>
> The tools are ready. The models are capable.
> The bottleneck is not the AI.
>
> The bottleneck is the gap between what we know and what we write down."

**[Pause.]**

> "SIFY is our attempt to close that gap.
> Not with a tool. Not with a schema.
> With a habit of thinking."

**[Show: S I F Y one more time]**

> "Structure before generation.
> Intent is yours.
> Format over syntax.
> Your assumed is your risk."

**[Final beat. Slower.]**

> "The spec is not for the AI.
>
> The spec is for you."

**[Two second pause. Then:]**

> "The full framework, research data, and test code are at github.com/sify-framework.
>
> If you want to see what it looks like when you build infrastructure around this idea —
> promptfarm.dev.
>
> Thank you."

**[Step back. Don't say "any questions." Let the MC handle it.]**

---

## BACKUP NOTES

**If you're running ahead:** Slow down on the T2 paradox section — Claude 0/10 vs Gemini 4/10. Let that breathe more.

**If you're running behind:** Cut the T7 section (key names) — go straight from T6 to T8. The core message survives.

**Hardest moment to nail:** The silence after "The gap is between what you know and what you wrote down." Hold it for two full seconds. Resist the urge to fill it.

**Question you will definitely get:** "Is there a standard for these YAML specs?"
Answer: "That's the point of the F principle — there isn't one and you don't need one. Structure is sufficient."

**Question about the test methodology:**
"You wrote the expected values yourself — how is that objective?"
Answer: "Exactly like unit tests. You write the assertions yourself. That's not a bug — it's the point. Explicit expectations are the whole idea."

---

## KEY PHRASES — MEMORIZE THESE

| Moment | Phrase |
|---|---|
| Opening hook | "We are writing prompts. But we are debugging like it's 2015." |
| T2 paradox | "Visible failure is recoverable. Silent success is not." |
| T6 finding | "The information doesn't exist outside your head." |
| Core insight | "The gap is between what you know and what you wrote down." |
| SIFY reveal | "The spec is not for the AI. It's for you." |
| Close | "The spec is for you." |