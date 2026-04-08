export interface JudgeResult {
  score: number;
  total: number;
  assumed: number;
  assumedList: string[];
  decisions: Record<string, { expected: string; got: string; correct: boolean }>;
}

export interface ExpectedDecisions {
  [key: string]: {
    expected: unknown;
    check: (parsed: Record<string, unknown>) => boolean;
    label: string;
  };
}

export function parseJSON(raw: string): Record<string, unknown> {
  const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    const matches = [...clean.matchAll(/\{[\s\S]*\}/g)];
    for (const match of matches.sort((a, b) => b[0].length - a[0].length)) {
      try {
        return JSON.parse(match[0]);
      } catch {
        let attempt = match[0];
        const opens = (attempt.match(/\{/g) || []).length;
        const closes = (attempt.match(/\}/g) || []).length;
        attempt += "}".repeat(opens - closes);
        try { return JSON.parse(attempt); } catch { continue; }
      }
    }
    return {};
  }
}

function get(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

export function judge(raw: string, expected: ExpectedDecisions): JudgeResult {
  const parsed = parseJSON(raw);
  let score = 0;
  const total = Object.keys(expected).length;
  const decisions: JudgeResult["decisions"] = {};

  for (const [key, { expected: exp, check }] of Object.entries(expected)) {
    const correct = check(parsed);
    if (correct) score++;
    const val = parsed[key] ?? get(parsed, key) ?? "—";
    decisions[key] = { expected: String(exp), got: String(val), correct };
  }

  const assumedList = Array.isArray(parsed.assumed) ? (parsed.assumed as string[]) : [];
  return { score, total, assumed: assumedList.length, assumedList, decisions };
}

export const INVOICE_EXPECTED: ExpectedDecisions = {
  min_amount: {
    expected: 50, label: "Minimum amount €50",
    check: (p) => p["min_amount"] === 50 || get(p, "constraints.min_amount") === 50 || get(p, "constraints.min_amount_eur") === 50,
  },
  max_line_items: {
    expected: 10, label: "Max 10 line items",
    check: (p) => p["max_line_items"] === 10 || get(p, "constraints.max_line_items") === 10,
  },
  discount_months: {
    expected: 6, label: "Discount after 6 months",
    check: (p) => {
      const v = p["discount_months"] ?? get(p, "discount.condition");
      if (typeof v === "number") return v === 6;
      if (typeof v === "string") return v.includes("6");
      return false;
    },
  },
  vat_eu_pct: {
    expected: 20, label: "EU VAT 20%",
    check: (p) => p["vat_eu_pct"] === 20 || get(p, "vat.eu") === 20,
  },
  vat_non_eu_pct: {
    expected: 0, label: "Non-EU VAT 0%",
    check: (p) => p["vat_non_eu_pct"] === 0 || get(p, "vat.non_eu") === 0,
  },
  vat_blocked: {
    expected: "RU+BY", label: "VAT blocked for RU, BY",
    check: (p) => {
      const v = (p["vat_blocked"] as string[]) ?? (get(p, "vat.blocked") as string[]);
      return Array.isArray(v) && v.includes("RU") && v.includes("BY");
    },
  },
  retry_network_only: {
    expected: true, label: "Retry on network errors only",
    check: (p) => p["retry_network_only"] === true || (Array.isArray(get(p, "payment.retry_on")) && !(get(p, "payment.retry_on") as string[]).includes("validation_error")),
  },
  analytics_not_ga: {
    expected: true, label: "Internal analytics not GA",
    check: (p) => p["analytics_not_ga"] === true || get(p, "analytics.provider") === "internal",
  },
  autosave_seconds: {
    expected: 30, label: "Autosave every 30s",
    check: (p) => p["autosave_seconds"] === 30 || get(p, "persistence.autosave_seconds") === 30,
  },
  confirm_on_close: {
    expected: true, label: "Confirm dialog on close",
    check: (p) => p["confirm_on_close"] === true || get(p, "persistence.confirm_unsaved_on_close") === true,
  },
};

export const JUDGE_INSTRUCTION = `
Reply ONLY with raw JSON, no markdown, no backticks, no explanation.
Use EXACTLY these keys:
- min_amount: integer or null
- max_line_items: integer or null
- discount_months: integer or null
- vat_eu_pct: integer or null
- vat_non_eu_pct: integer or null
- vat_blocked: array of country codes or null
- retry_network_only: true/false
- analytics_not_ga: true/false
- autosave_seconds: integer or null
- confirm_on_close: true/false
- assumed: array of strings — decisions NOT explicitly stated in the input
`.trim();