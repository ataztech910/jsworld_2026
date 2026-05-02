/**
 * Slide example: React Profiler API vs hook interceptor.
 *
 * Shows what data each approach gives for the same component.
 * This file is for the presentation — not imported anywhere.
 */

import { Profiler, useEffect } from 'react'

// ─── 1. React Profiler API ────────────────────────────────────────────────────

// Wrap the component in <Profiler> — works in any environment.
// onRender fires after every commit inside the tree.

function withProfiler() {
  return (
    <Profiler
      id="GraphNode"
      onRender={(id, phase, actualDuration) => {
        console.log(id, phase, actualDuration)
        // → "GraphNode"  "update"  2.3
        //
        // That's it. We know the component re-rendered and how long it took.
        // We do NOT know:
        //   - which hook triggered the re-render
        //   - which dependency changed
        //   - whether it was a real change or reference churn
      }}
    >
      {/* <GraphNode ... /> */}
    </Profiler>
  )
}

// ─── 2. Hook interceptor (injected by Babel plugin automatically) ─────────────

// Source code — what the developer writes:
function GraphNode_before() {
  useEffect(() => {
    // sync selected state
  }, [nodeStyle, onSelect])
}

// After Babel transform — what actually runs (zero manual changes):
//
//   useEffect(fn, [nodeStyle, onSelect])
//     ↓ babel-plugin-react-hooks-instrumentation
//   useTrackedEffect('GraphNode', 'useEffect_0', fn, [nodeStyle, onSelect])

// What useTrackedEffect records in trackerStore:
//
// {
//   component:        'GRAPH_NODE',
//   hookId:           'useEffect_0',
//   kind:             'effect',
//   runs:             47,
//   byInteraction:    { DRAG_NODE: 47, SELECT_NODE: 0, PAN_CANVAS: 0, IDLE: 0 },
//   depChanges: [
//     { index: 0, valueKind: 'object', count: 47, byInteraction: { DRAG_NODE: 47 } },
//   ],
//   invalidationRatio:   0.94,   // ran 47 times out of 50 renders
//   invalidatingTooOften: true,
// }
//
// Diagnosis: dep[0] (object) changed 47/50 renders during DRAG_NODE
//            → reference-only churn — same value, new object every render

export {}
