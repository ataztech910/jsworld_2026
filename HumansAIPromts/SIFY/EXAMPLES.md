# SIFY Examples

Real component specs — text vs structured intent.

---

## Example 1: Invoice Form

A billing form with domain-specific business rules. Classic case where vague text fails.

### Vague text prompt
```
Build a React invoice form with line items and totals.
```

**Result:** 1–3 out of 10 business rules reproduced correctly.

What the model doesn't know:
- Minimum amount is €50
- Maximum 10 line items
- Discount only for clients > 6 months
- VAT blocked for RU and BY
- Retry only on network errors
- Internal analytics, not GA
- Autosave every 30 seconds

### Structured spec
```yaml
component: InvoiceForm

constraints:
  min_amount_eur: 50        # below this: payment processing costs exceed margin
  max_line_items: 10        # hard DB limit, enforced server-side too

discount:
  condition: client_tenure_months >= 6
  # loyalty only — trials and new clients are not eligible

vat:
  eu: 20                    # standard EU VAT
  non_eu: 0                 # export, VAT-exempt
  blocked: [RU, BY]         # legal/compliance — block form entirely, not just 0%

payment:
  retry_on: [network_error]
  no_retry_on: [validation_error, card_declined]
  # user must fix input before retry — never auto-retry declined cards

analytics:
  provider: internal        # ClickHouse, GDPR requirement — NOT Google Analytics
  events: [form_open, line_item_added, submitted, error]

persistence:
  autosave_seconds: 30      # users leave tab open — prevent data loss
  confirm_unsaved_on_close: true
```

**Result:** 9–10 out of 10 business rules reproduced correctly, across all models tested.

---

## Example 2: Dashboard Component

A nested UI component. Classic case where text produces structural noise.

### Vague text prompt (96 words, 39% structural noise)
```
I need a dashboard consisting of a Header component which includes Logo 
Navigation and Menu. Logo will have links and Menu will have avatar and 
dropdowns. Next there will be a Sidebar with a navigation element inside it. 
It will need to handle active state icon and label, also need to add a 
collapse button component. Next there will be a Grid component consisting of 
a Stat Card with title value trend and color. Then a Chart Card with title 
type data and description. And then a Table inside a card with columns rows 
and pagination.
```

Structural noise words: "consisting of", "which includes", "will have", 
"next there will be", "inside it", "also need to add" — 37 words that 
describe structure instead of expressing it.

Ambiguities: 4
- "Logo will have links" — href on logo itself? or nav links?
- "handle active state" — prop or internal state?
- "data" — dataset or date?
- "columns" — does each column have a sortable flag?

### Structured spec (54 words, 0% noise, 0 ambiguities)
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

The structure is visible. Every prop is explicit. No ambiguity.

---

## Example 3: Toast Notification System

A UI component with behavioral complexity. Classic case where edge cases are invisible in text.

### Vague text prompt
```
Build a toast notification component that shows success, error, and info 
messages. Toasts should auto-dismiss after a few seconds and the user 
can close them manually.
```

What "a few seconds" means: the model decided. Probably 3000ms. Maybe 5000ms.
What happens with multiple toasts: the model decided. Probably stacks them.
What happens on hover: the model decided. Probably nothing.
What about duplicates: the model decided. Probably shows both.
Accessibility: the model decided. Maybe added aria-live, maybe not.

### Structured spec
```yaml
component: ToastNotification

types: [success, error, info, warning]

behavior:
  auto_dismiss:
    duration_ms: 4000
    pause_on_hover: true    # UX: user should be able to read it
  
  queue:
    max_visible: 3          # more than 3 is overwhelming
    strategy: stack_bottom
    drop_on_overflow: false # never drop — queue them
  
  dismiss:
    user_can_close: true
    keyboard: Escape
    close_on_outside_click: false  # accidental clicks shouldn't dismiss

accessibility:
  role: alert
  aria_live: polite         # assertive only for critical errors
  keyboard_dismissible: true

edge_cases:
  - duplicate_messages: ignore   # same message within 2s = one toast
  - rapid_fire: queue, do not drop
  - network_offline: persist error toasts until reconnected
```

Now every behavioral decision is explicit. The model executes — it doesn't invent.

---

## The Pattern

In every example, the structured spec does two things the text does not:

**1. Forces decisions you were avoiding**
You can't write `pause_on_hover: true` without first deciding whether hover should pause the timer. The text version lets you skip that decision — and the model makes it for you.

**2. Makes assumptions visible**
When you read the spec before generating, you see the gaps. When you only have the text, the gaps are invisible until production.

This is SIFY in practice: not a formatting exercise, but a thinking exercise that happens to produce a useful artifact.
