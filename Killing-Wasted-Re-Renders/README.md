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
