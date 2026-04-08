# SIFY Research

Experimental data behind the SIFY principles.

---

## Methodology

We designed a controlled experiment to test how prompt format affects AI output predictability.

**Component tested:** React invoice form with 10 specific business rules defined in advance.

**Models tested:**
- Local: Mistral 7b Instruct, CodeQwen 7b
- Commercial: Gemini 2.5 Flash, Claude Sonnet

**Judge:** Deterministic TypeScript script — no LLM involvement in scoring. Each of the 10 rules was checked with an explicit assertion against the model's output.

**Why small models:** Large models compensate for vague prompts using their training knowledge. Small models return exactly what they receive — making the signal cleaner. Large models were added to test the "hiding" effect.

**Why local models first:** Reproducibility. Every run produces comparable results. No version drift, no caching, no memory.

---

## Results

### T1 — Vague text vs structured YAML spec

Same model, same task, different prompt format.

| Model | Prompt | Rules correct | Assumed |
|---|---|---|---|
| Mistral | vague text | 3/10 | 2 |
| Mistral | YAML spec | 9/10 | 2 |
| CodeQwen | vague text | 2/10 | 0 |
| CodeQwen | YAML spec | 9/10 | 0 |

**Finding:** Format alone produces a 3–4x difference in correctness. Same model, same task.

---

### T2 — Vague text across model sizes

Does a bigger, smarter model solve the problem?

| Model | Type | Rules correct | Assumed |
|---|---|---|---|
| Mistral | small / local | 3/10 | 2 |
| CodeQwen | small / local | 2/10 | 0 |
| Gemini Flash | large / commercial | 4/10 | 6 |
| Claude Sonnet | large / commercial | 0/10 | 10 |

**Finding:** Large models do not solve the problem — they hide it. Gemini guessed 4 rules correctly but made 6 silent assumptions. Claude honestly reported 10 gaps (assumed:10) — scoring 0/10 but providing the most actionable output.

The paradox: Claude's 0/10 with assumed:10 is safer than Gemini's 4/10 with assumed:6. Visible failure is recoverable. Silent success is not.

---

### T3 — Structured YAML spec across all models

Does the spec work regardless of model size?

| Model | Type | Rules correct | Assumed |
|---|---|---|---|
| Mistral | small | 9/10 | 2 |
| CodeQwen | small | 9/10 | 0 |
| Gemini Flash | large | 10/10 | 4 |
| Claude Sonnet | large | 10/10 | 5 |

**Finding:** The spec equalizes all models. A small local model and a large commercial model produce equivalent results when given the same structured intent.

Format matters more than model selection.

---

### T4 — Signal density: text vs YAML

How much of a text prompt actually carries information?

| Format | Words | Structural noise | Ambiguities |
|---|---|---|---|
| Text (dashboard) | 96 | 39% | 4 |
| YAML (dashboard) | 54 | 0% | 0 |

Structural noise examples from text: "consisting of", "which includes", "next there will be", "inside it" — words that describe structure instead of expressing it.

YAML expresses structure through indentation. Zero filler words needed.

---

### T5 — Token efficiency at different complexity levels

| Complexity | Text (t/decision) | YAML (t/decision) |
|---|---|---|
| Simple (3 rules) | 9.0 | 7.0 |
| Medium (8 rules) | 7.4 | 5.1 |
| Complex (16 rules) | 6.7 | 7.1 |
| Very complex (24 rules) | 7.7 | 7.2 |

**Finding:** YAML is more efficient at simple and medium complexity. At high complexity, both formats converge. The advantage of YAML at high complexity is not token count — it's readability and auditability.

---

### T6 — AI-generated specs (spec delegation test)

What happens when you ask AI to write the spec from a vague prompt?

| Chain | Rules correct | Tokens |
|---|---|---|
| Vague → CodeQwen directly | 1–2/10 | 141 |
| Vague → Mistral YAML → CodeQwen | 0/10 | 447–585 |
| Vague → Gemini YAML → CodeQwen | 2/10 | 1149 |
| Vague → Claude YAML → CodeQwen | 0/10 | 1306 |

**Finding:** AI-generated specs from vague prompts perform worse than direct prompts at 3–9x the token cost. The intermediate AI layer produces well-structured, professional-looking YAML with zero domain-specific business rules.

Conclusion: AI cannot generate knowledge it doesn't have. Domain rules exist only in the human's head — until explicitly written down.

---

### T7 — Key name sensitivity

Does the model require specific key names or schemas?

| Key style | Example | Score |
|---|---|---|
| Canonical | `vat_eu_pct: 20` | 9/10 |
| Renamed | `inside_eu_tax: 20` | 9/10 |
| Weird/abbreviated | `vat_in: 20` | 10/10 |

**Finding:** Model performance is identical across key naming styles. The model reads intent from context and hierarchy, not from key names.

No standard is required. No schema validator is needed. Structure is sufficient.

---

### T8 — Pure YAML vs YAML with comments

Does adding text context to a YAML spec change outcomes?

| Format | Rules correct | Assumed |
|---|---|---|
| Pure YAML (Mistral) | 9/10 | 10 |
| YAML + comments (Mistral) | 9/10 | 0 |
| Pure YAML (CodeQwen) | 9/10 | 0 |
| YAML + comments (CodeQwen) | 9/10 | 0 |

**Finding:** Score is identical. Risk profile is not.

Pure YAML with Mistral produced 10 silent assumptions — the model guessed correctly this time. YAML with comments produced 0 assumptions — the model understood explicitly.

"Guessed right" is not reproducible. "Understood right" is.

---

## Limitations

1. **Self-designed judge:** Expected values were defined by the researchers. This is equivalent to writing your own unit test assertions — not independent validation. This is a feature (explicit expectations) not a bug (bias).

2. **Single domain:** All tests used an invoice form. Generalizability to other domains requires additional testing.

3. **Small model limitations:** Mistral and CodeQwen occasionally failed to parse YAML structure correctly, returning nested JSON instead of flat keys. This required flexible judge logic and may affect real-world results with poorly formatted specs.

4. **No real code evaluation:** We tested decision extraction, not actual code quality. A model can correctly identify all 10 rules and still write buggy implementation.

---

## Reproduction

All test code is available at: [github.com/your-repo/sify-research](https://github.com)

Requirements:
- Ollama with `mistral:instruct` and `codeqwen:7b`
- Node.js 18+
- API keys for commercial models (optional)

```bash
git clone https://github.com/your-repo/sify-research
cd sify-research
npm install
./run-local.sh    # local models only
./run-all.sh      # includes commercial models
```
