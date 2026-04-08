# Killing Wasted Re-renders (PoC)

Small local React + React Flow experiment to test one hypothesis:

A single simple interaction can trigger much more render/effect/memo work than developers intuitively expect.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL from Vite (usually `http://localhost:5173`).

## What to do in the demo

1. Click a node (tracks `SELECT_NODE`).
2. Drag a node around for a few seconds (tracks `DRAG_NODE`).
3. Pan the canvas by dragging empty space (tracks `PAN_CANVAS`).
4. Repeat and compare counters in the right-side debug panel.
5. Use **Reset counters** to start a clean run.

## What is instrumented

The demo tracks counts for:

- `renders`
- `effects`
- `memos`

At minimum, it tracks these components:

- `App / Root container`
- `Graph node component`
- `Details side panel`

The debug UI also shows per-interaction totals with this summary table shape:

- interaction | total renders | total effects | total memos

And it includes extra context:

- run count per interaction
- last run metrics (`renders/effects/memos`)
- last run duration

## Cause diagnostics layer (manual, PoC only)

The demo now adds manual tracked wrappers:

- `useRenderTracker`
- `useTrackedEffect`
- `useTrackedMemo`
- `useTrackedCallback`

For each tracked hook/render, it records:

- component + hook id
- run/recompute/identity-change count
- changed dependency indexes
- dependency/prop type (`primitive`, `object`, `function`)
- interaction correlation (`DRAG_NODE`, `PAN_CANVAS`, `SELECT_NODE`, `IDLE`)

Diagnostics sections are shown under the existing counters:

- Top rerendered components
- Most frequently rerun effects
- Most unstable memos/callbacks
- Most frequently changing props
- Likely causes summary

Use these sections to answer "why":

- Which hooks spike during drag vs pan vs select
- Which props are changing most often
- Whether churn is mostly reference-only (`object`/`function` identity changes)
- Whether memo invalidation is frequent enough to reduce memo value

## Interpreting diagnostics in this demo

Run the same interaction sequence repeatedly:

1. `SELECT_NODE` once
2. `DRAG_NODE` for 2-4 seconds
3. `PAN_CANVAS` for 2-4 seconds
4. Reset and repeat

Signals that justify building Babel/plugin-level instrumentation next:

- repeated high-volume rerenders with dominant reference-only prop churn
- effects repeatedly rerunning due to recreated object/function dependencies
- memos invalidating on most renders during a single interaction class
- callbacks changing identity frequently enough to propagate extra renders
- clear interaction-specific patterns that manual logs can identify, but are tedious to track by hand across larger codebases

## Switchable manual fix (Problematic vs Fixed)

The demo now has a mode switch:

- `Problematic mode`: keeps the current behavior that recreates `node.data.liveHint` objects for every node on frequent updates.
- `Fixed mode`: applies a narrow manual fix with structural sharing.
  - Reuses previous runtime node objects when source node + semantic liveHint values are unchanged.
  - Updates `node.data.liveHint` only where semantic values actually changed.
  - During drag, updates drag pulse for the actively dragged node instead of re-writing all node data objects.

Why this fix was chosen:

- diagnostics identified node rerenders driven mostly by `data` object reference churn
- effects/memos tied to `data` were rerunning because object dependencies changed
- this is a single, explainable implementation detail change while tracker + interactions stay identical

Fix implementation is intentionally isolated in:

- `src/runtimeNodeStabilization.ts`

Instrumentation is intentionally isolated in:

- `src/instrumentation/trackerStore.ts` (interaction + render/effect/memo/hook state store)
- `src/instrumentation/hookTrackers.ts` (`useRenderTracker`, `useTrackedEffect`, `useTrackedMemo`, `useTrackedCallback`)
- `src/instrumentation/diagnosticSummary.ts` (likely-cause and comparison summary helpers)

## How to run the comparison

1. Select `Problematic mode`
2. Click **Reset counters**
3. Run the same interaction script (`SELECT_NODE` -> `DRAG_NODE` for 2-4s -> `PAN_CANVAS` for 2-4s)
4. Click `Snapshot current mode`
5. Switch to `Fixed mode`
6. Click **Reset counters**
7. Run the exact same interaction script
8. Click `Snapshot current mode` again
9. Inspect the `Problematic vs Fixed comparison` section

## Metrics to watch in comparison

- total renders / effects / memos
- top rerendered component
- most frequently changing props (especially reference-only churn)
- most unstable memos/callbacks
- likely cause summary first line in each mode

## What would justify building a Babel plugin later

Move to Babel/plugin automation if this manual switch shows a clear and repeatable drop in wasted work while keeping behavior and interaction flow intact, especially when:

- render/effect/memo totals drop materially in Fixed mode
- node-level reference churn is no longer the dominant cause
- likely-cause diagnostics become cleaner and more specific after one targeted fix
- the manual instrumentation already explains the storm, but scaling this visibility by hand is impractical

## Why churn appears here (intentionally, but realistically)

The code includes plausible patterns that commonly appear in real apps:

- unstable object props passed into `ReactFlow`
- derived node/edge arrays recreated frequently
- callbacks with dependencies that change often
- effects depending on values that update during interaction
- memoized computations whose dependencies invalidate often

No intentionally broken hooks or infinite loops are used.

## When to consider the hypothesis validated

The hypothesis is worth deeper exploration if you observe one or more of these:

- one drag causes many more renders than expected
- effects re-run during simple interactions without a clear business reason
- `useMemo` recomputes so often that it provides little value
- updates propagate into components that should feel unrelated

If those patterns are obvious in this tiny demo, it is a strong signal the idea is worth pursuing with a deeper prototype.
