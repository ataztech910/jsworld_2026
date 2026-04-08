# AST + AI Orders Benchmark Demo

Small React + TypeScript app (Vite) with an intentionally inefficient `OrdersDashboard`.

## Purpose

This repo is a controlled baseline for conference demos about AST + AI driven code evolution.
The implementation is intentionally suboptimal so optimization passes can produce measurable wins.

## Stack

- React + TypeScript
- Vite
- No UI framework
- No backend
- Deterministic mock data only

## Run locally

```bash
npm install
npm run dev
```

## AST analysis script

Analyze a React TSX/JSX file for simple performance anti-patterns:

```bash
npm run analyze:react -- src/components/OrdersDashboard.tsx
```

## AST experiment pipeline

Run Claude on precomputed AST findings JSON:

```bash
npm run experiment:ast -- path/to/findings.json
```

Full-context mode (no AST hints, model detects issues itself):

```bash
npm run experiment:full -- path/to/component.tsx
```

Expected input shape:

```json
{
  "component": "OrdersDashboard",
  "findings": [
    {
      "type": "inline-handler-in-map",
      "location": "OrdersDashboard.tsx:250",
      "code": "...",
      "context": "...",
      "variables": ["entry"],
      "goal": "stabilize handler reference to reduce rerenders"
    }
  ]
}
```

## What the app includes

- 600 deterministic mock orders generated from a seeded pseudo-random generator
- Filtering + sorting controls
- Derived summaries (totals, grouped values, combined expensive score)
- Fake async action (`Run Fake Async Sync`) that waits and mutates data
- Child `OrderRow` component rendered in a long list
- Visible metrics in UI:
  - main render count
  - child row render count
  - last, average, max, and total durations
  - computation metrics by name
  - action metrics by name

## Measurement Layer (local only)

Location:

- `src/measurement/types.ts`
- `src/measurement/store.ts`
- `src/measurement/api.ts`
- `src/measurement/hooks.ts`
- `src/measurement/MetricsPanel.tsx`

Core API:

- `recordComponentRender(componentName, duration)`
- `recordComputation(name, duration)`
- `recordAction(name, duration, metadata?)`
- `resetMetrics()`
- `exportMetricsSnapshot()`

How to use during experiments:

1. Run baseline and interact with the dashboard in a fixed sequence.
2. Click `Export Snapshot JSON` to save a local snapshot.
3. Repeat the same sequence for Claude-only and AST+AI versions.
4. Compare JSON snapshots (render/computation/action averages, max, totals, run counts).
5. Use `Reset Metrics` between runs to isolate sessions.

## Intentionally inserted anti-patterns

These are deliberately present for later optimization experiments:

- Expensive computations executed directly during render (`calculateExpensiveScore` and summary reductions)
- No `useMemo`
- Inline event handlers inside mapped lists (`onSelect`, `onBumpPriority` in `filteredOrders.map`)
- No `React.memo` on child `OrderRow`
- No external telemetry/tracing service or backend
- No `data-testid` attributes
- Obvious low-quality pattern: `console.log('OrdersDashboard render', ...)` in the main component

## Notes

- This baseline prioritizes repeatability and visible inefficiency over best practices.
- React Strict Mode is enabled, so development render counts are expected to be higher.
