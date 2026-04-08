// T4 + T5: pure math, no LLM calls
// T4: YAML is more token-efficient for nested logic
// T5: text degrades as complexity grows

interface PromptPair {
  label: string;
  text: string;
  yaml: string;
  decisions: number;
  noiseWords?: number;
  ambiguities?: number;
}

const PAIRS: PromptPair[] = [
  {
    label: "simple",
    decisions: 3,
    text: `Build a React invoice form that shows line items and calculates totals. Support adding and removing items.`,
    yaml: `component: InvoiceForm
features:
  line_items: true
  totals: true
  add_remove: true`,
  },
  {
    label: "medium",
    decisions: 8,
    text: `Build a React invoice form with line items and totals. Minimum amount is 50 euros. Maximum 10 line items. Apply 20% VAT for EU customers, 0% for non-EU. Auto-save every 30 seconds. Show confirmation dialog on close with unsaved changes.`,
    yaml: `component: InvoiceForm
constraints:
  min_amount_eur: 50
  max_line_items: 10
vat:
  eu: 20
  non_eu: 0
persistence:
  autosave_seconds: 30
  confirm_on_close: true`,
  },
  {
    label: "complex",
    decisions: 16,
    text: `Build a React invoice form. Minimum invoice amount is 50 euros. Maximum 10 line items. Discount only for clients over 6 months. VAT is 20% for EU, 0% for non-EU, blocked for RU and BY. Retry payments only on network errors, not validation errors. Log to internal analytics not Google Analytics. Auto-save every 30 seconds. Confirm dialog on close. Support multiple currencies. Show tax breakdown. Export to PDF. Send by email.`,
    yaml: `component: InvoiceForm
constraints:
  min_amount_eur: 50
  max_line_items: 10
discount:
  condition: client_tenure_months >= 6
vat:
  eu: 20
  non_eu: 0
  blocked: [RU, BY]
payment:
  retry_on: [network_error]
  no_retry_on: [validation_error]
analytics:
  provider: internal
  not: google_analytics
persistence:
  autosave_seconds: 30
  confirm_on_close: true
features:
  multi_currency: true
  tax_breakdown: true
  export_pdf: true
  send_email: true`,
  },
  {
    label: "very_complex",
    decisions: 24,
    text: `Build a production-ready React invoice form. Minimum amount 50 euros, maximum 10 line items. Discounts only for clients over 6 months tenure. VAT: 20% EU, 0% non-EU, completely blocked for RU and BY. Payment retry only on network errors not validation. Internal analytics only, not GA. Auto-save draft every 30 seconds. Confirm dialog on unsaved close. Multi-currency support with live exchange rates. Full tax breakdown by line item. PDF export with company branding. Email sending with template selection. Recurring invoice support. Client portal access. Digital signature support. Audit log for all changes. Role-based access control for approvals. Integration with accounting software. Multi-language support. Offline mode with sync.`,
    yaml: `component: InvoiceForm
constraints:
  min_amount_eur: 50
  max_line_items: 10
discount:
  condition: client_tenure_months >= 6
vat:
  eu: 20
  non_eu: 0
  blocked: [RU, BY]
payment:
  retry_on: [network_error]
  no_retry_on: [validation_error]
analytics:
  provider: internal
  not: google_analytics
persistence:
  autosave_seconds: 30
  confirm_on_close: true
features:
  multi_currency: { live_rates: true }
  tax_breakdown: per_line_item
  export:
    pdf: { branding: true }
  email: { templates: true }
  recurring: true
  client_portal: true
  digital_signature: true
  audit_log: true
  rbac: { approvals: true }
  integrations: [accounting]
  i18n: true
  offline: { sync: true }`,
  },
  {
    // Real-world nested component example
    // Text written exactly how developers write prompts
    label: "dashboard_nested",
    decisions: 14,
    noiseWords: 37,
    ambiguities: 4,
    text: `I need a dashboard consisting of a Header component which includes Logo Navigation and Menu. Logo will have links and Menu will have avatar and dropdowns. Next there will be a Sidebar with a navigation element inside it. It will need to handle active state icon and label, also need to add a collapse button component. Next there will be a Grid component consisting of a Stat Card with title value trend and color. Then a Chart Card with title type data and description. And then a Table inside a card with columns rows and pagination.`,
    yaml: `component: Dashboard

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
      props: [page, per_page, total]`,
  },
];

export function runTezis4() {
  const results = [];

  for (const pair of PAIRS) {
    const textWords = pair.text.split(/\s+/).length;
    const yamlWords = pair.yaml.split(/\s+/).length;
    const textTokens = Math.round(pair.text.length / 4);
    const yamlTokens = Math.round(pair.yaml.length / 4);
    const noiseWords = pair.noiseWords ?? 0;
    const noisePct = noiseWords ? Math.round(noiseWords / textWords * 100) : 0;
    const ambiguities = pair.ambiguities ?? 0;

    results.push({
      tezis: 4,
      name: "YAML is more signal-dense than text",
      model: "none",
      runs: [
        {
          prompt_type: "text",
          complexity: pair.label,
          decision_count: pair.decisions,
          word_count: textWords,
          tokens_prompt: textTokens,
          tokens_completion: 0,
          tokens_per_decision: +(textTokens / pair.decisions).toFixed(1),
          noise_words: noiseWords,
          noise_pct: noisePct,
          ambiguities,
          score: pair.decisions,
          total: pair.decisions,
          assumed: 0,
          assumedList: [],
          decisions: {},
        },
        {
          prompt_type: "yaml",
          complexity: pair.label,
          decision_count: pair.decisions,
          word_count: yamlWords,
          tokens_prompt: yamlTokens,
          tokens_completion: 0,
          tokens_per_decision: +(yamlTokens / pair.decisions).toFixed(1),
          noise_words: 0,
          noise_pct: 0,
          ambiguities: 0,
          score: pair.decisions,
          total: pair.decisions,
          assumed: 0,
          assumedList: [],
          decisions: {},
        },
      ],
    });
  }

  return results;
}

export function runTezis5() {
  const results = [];
  let prevText = 0;
  let prevYaml = 0;

  for (const pair of PAIRS) {
    const textTokens = Math.round(pair.text.length / 4);
    const yamlTokens = Math.round(pair.yaml.length / 4);

    results.push({
      tezis: 5,
      name: "Text degrades in readability as complexity grows",
      model: "none",
      runs: [
        {
          prompt_type: "text",
          complexity: pair.label,
          decision_count: pair.decisions,
          tokens_prompt: textTokens,
          tokens_delta: textTokens - prevText,
          tokens_per_decision: +(textTokens / pair.decisions).toFixed(1),
          score: pair.decisions,
          total: pair.decisions,
          assumed: 0,
          assumedList: [],
          decisions: {},
          tokens_completion: 0,
        },
        {
          prompt_type: "yaml",
          complexity: pair.label,
          decision_count: pair.decisions,
          tokens_prompt: yamlTokens,
          tokens_delta: yamlTokens - prevYaml,
          tokens_per_decision: +(yamlTokens / pair.decisions).toFixed(1),
          score: pair.decisions,
          total: pair.decisions,
          assumed: 0,
          assumedList: [],
          decisions: {},
          tokens_completion: 0,
        },
      ],
    });

    prevText = textTokens;
    prevYaml = yamlTokens;
  }

  return results;
}