# SIFY Antipatterns

Four patterns that look like progress but produce unpredictable results.

---

## AP-1: Prompt and Pray

**Violates:** S — Structure before generation

### What it looks like
```
You:  "Build a checkout form"
AI:   [generates something]
You:  "Add error handling"
AI:   [adds error handling]
You:  "Make it work with our API"
AI:   [rewrites half of it]
You:  "The loading state is wrong"
AI:   [fixes loading, breaks error handling]
```

### Why it happens
It feels productive. Each prompt produces visible output. Progress is measurable in lines of code.

### Why it fails
Without a spec, each iteration redefines the contract. By the fifth prompt, the model is optimizing for your last message — not your original intent. The codebase accumulates decisions nobody made consciously.

### The fix
Write the spec first. Even five minutes of structured thinking before the first prompt eliminates most iteration cycles.

```yaml
component: CheckoutForm
fields: [card_number, expiry, cvv, billing_address]
api:
  endpoint: POST /api/v2/payments
  auth: Bearer token from session
on_success: redirect /confirmation
on_error:
  network: show_retry, keep_form_data
  validation: inline_error per field
  declined: show_message, do_not_retry
loading:
  button: disabled + spinner
  form: keep_visible
```

---

## AP-2: Spec Delegation

**Violates:** I — Intent is yours, not AI's

### What it looks like
```
You:  "Write me a spec for an invoice form"
AI:   [writes beautiful detailed YAML]
You:  [sends that YAML as the prompt]
AI:   [generates code with zero of your business rules]
```

### Why it happens
It feels efficient. Why write the spec yourself when AI can do it?

### Why it fails
AI writes specs from patterns it has seen. It will produce a generic, well-structured, professional-looking spec. It will not produce your spec.

Empirically: AI-generated specs from vague prompts scored 0–2/10 on domain-specific business rules. At 3–9x the token cost.

The expensive version of the problem:

| Who writes the spec | Score | Cost |
|---|---|---|
| You (structured) | 9–10/10 | baseline |
| Mistral from vague | 0/10 | 3x |
| Gemini from vague | 2/10 | 8x |
| Claude from vague | 0/10 | 9x |

### The fix
AI can help you structure a spec you've already thought through. It cannot think through it for you.

```
Wrong: "Write me a spec for an invoice form"

Right: "Here are my requirements: [your rules]. 
        Help me structure this as a YAML spec."
```

Your rules go in first. AI helps format, not invent.

---

## AP-3: Schema Paralysis

**Violates:** F — Format over syntax

### What it looks like
```
Day 1: "Should I use YAML or JSON?"
Day 1: "What's the industry standard for prompt specs?"
Day 1: "Is there a schema validator for this?"
Day 2: [still no spec written]
```

### Why it happens
The format feels important. Getting it wrong feels wasteful. There must be a right answer.

### Why it fails
There is no standard. There is no "correct" format. The model reads context and hierarchy — not key names.

Empirically tested:

```yaml
# These three produce identical results:

# Version 1 — canonical
vat_eu_pct: 20

# Version 2 — renamed  
inside_eu_tax_rate: 20

# Version 3 — weird
vat_in: 20
```

All three: 9–10/10.

### The fix
Pick any format. Write the spec. The format can be changed in five minutes. The thinking cannot be skipped.

```
Rule: whatever makes the structure visible is correct.
```

---

## AP-4: Silent Success

**Violates:** Y — Your assumed is your risk

### What it looks like
```
You:  [sends YAML spec]
AI:   [generates code]
Tests: all green
You:  "Great, shipping"
Prod: [breaks two weeks later on edge case nobody specified]
```

### Why it happens
The code works. The tests pass. There's no visible signal that anything is wrong.

### Why it fails
`assumed: 0` in the model's response doesn't mean zero assumptions were made. It means the assumptions are silent — embedded in generated code, not reported.

Empirically tested:

| Spec format | Score | Silent assumptions |
|---|---|---|
| Pure YAML | 9/10 | 10 |
| YAML + comments | 9/10 | 0 |

Same score. Completely different risk.

The 10 silent assumptions in the pure YAML case:
- Data types not specified → model chose
- Error message text → model invented
- Retry behavior → model assumed "standard"
- Timeout values → model used its defaults
- Edge case handling → model guessed "reasonable"

Each is a future bug waiting for the right conditions.

### The real example
```yaml
# Pure YAML — model assumes timeout, retry logic, error format
payment:
  retry_on: [network_error]

# YAML + comments — model knows exactly what you mean  
payment:
  retry_on: [network_error]
  # network_error only — NOT validation errors, NOT declined cards
  # user must fix input before retry is allowed
  # max 3 retries, then show "contact support" message
```

### The fix
Two habits:

**1. Comment the non-obvious**
Every line that could be interpreted multiple ways needs a comment.

**2. Audit after generation**
Ask: "What did you assume that I didn't specify?"
The answer is your risk inventory. Address each item before shipping.
