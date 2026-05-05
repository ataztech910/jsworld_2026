import React, { Profiler, useEffect, useRef, useState } from 'react'
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
  type Viewport,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  componentLabels,
  endInteraction,
  getTrackerSnapshot,
  interactionLabels,
  interactionList,
  resetTracker,
  scopeShortLabel,
  startInteraction,
  type ComponentId,
  type TrackerSnapshot,
} from './instrumentation/trackerStore'
import {
  useRenderTracker,
  useTrackedCallback,
  useTrackedEffect,
  useTrackedMemo,
} from './instrumentation/hookTrackers'
import {
  buildLikelyCauses,
  formatDependencySummary,
  formatScopeCounts,
  sumInteractionMetric,
  topRerenderLabel,
} from './instrumentation/diagnosticSummary'
import {
  buildFixedRuntimeNodes,
  buildProblematicRuntimeNodes,
  type RuntimeNodeCacheEntry,
} from './runtimeNodeStabilization'
import { recordProfilerEvent } from './instrumentation/profilerStore'
import { ProfilerPanel } from './instrumentation/ProfilerPanel'

export type PanelFilter = 'profiler-only' | 'all'

type FlowNodeData = {
  label: string
  owner: string
  complexity: number
  baselineCost: number
  tags: string[]
  liveHint: {
    viewportBucket: number
    dragPulse: number
  }
}

type FlowNode = Node<FlowNodeData, 'profiled'>
type DemoMode = 'problematic' | 'fixed'
type ResetReason = 'manual' | 'mode-switch'
type ModeEntryResetVersion = Record<DemoMode, number>

const modeLabels: Record<DemoMode, string> = {
  problematic: 'Problematic mode',
  fixed: 'Fixed mode',
}

const owners = ['Payments', 'Orders', 'Checkout', 'Identity', 'Catalog', 'Data']
const tagPool = ['cpu', 'latency', 'cache', 'io', 'state', 'edge', 'queue']

const buildInitialNodes = (): FlowNode[] => {
  return Array.from({ length: 24 }, (_, index) => {
    const col = index % 6
    const row = Math.floor(index / 6)

    return {
      id: `node-${index + 1}`,
      type: 'profiled',
      position: {
        x: 120 + col * 220,
        y: 60 + row * 160,
      },
      data: {
        label: `Service ${String(index + 1).padStart(2, '0')}`,
        owner: owners[index % owners.length],
        complexity: 35 + ((index * 11) % 50),
        baselineCost: 10 + ((index * 3) % 24),
        tags: [tagPool[index % tagPool.length], tagPool[(index + 3) % tagPool.length]],
        liveHint: {
          viewportBucket: 0,
          dragPulse: 0,
        },
      },
    }
  })
}

const buildInitialEdges = (): Edge[] => {
  const edges: Edge[] = []

  for (let index = 0; index < 24; index += 1) {
    const right = index + 1
    const down = index + 6

    if (right < 24 && (index + 1) % 6 !== 0) {
      edges.push({
        id: `e-${index}-${right}`,
        source: `node-${index + 1}`,
        target: `node-${right + 1}`,
      })
    }

    if (down < 24) {
      edges.push({
        id: `e-${index}-${down}`,
        source: `node-${index + 1}`,
        target: `node-${down + 1}`,
      })
    }

    if (index % 2 === 0 && down + 1 < 24) {
      edges.push({
        id: `e-diag-${index}-${down + 1}`,
        source: `node-${index + 1}`,
        target: `node-${down + 2}`,
        style: { opacity: 0.45 },
      })
    }
  }

  return edges
}

const initialNodes = buildInitialNodes()
const initialEdges = buildInitialEdges()

function simulateProfilerWork(complexity: number, baselineCost: number, viewportBucket: number) {
  const iterations = 600 + complexity * 8 + baselineCost * 12 + viewportBucket * 20
  let accumulator = 0

  for (let index = 0; index < iterations; index += 1) {
    accumulator += Math.sqrt((index % 17) + complexity) * Math.sin(index / 6)
  }

  return accumulator
}

const ProfiledNode = React.memo((props: NodeProps<FlowNode>) => {
  const { id, data, selected, dragging } = props

  useRenderTracker('GRAPH_NODE', {
    id,
    data,
    selected,
    dragging,
  })

  const score = useTrackedMemo(
    'GRAPH_NODE',
    'scoreMemo',
    () => {
      const renderCost = simulateProfilerWork(
        data.complexity,
        data.baselineCost,
        data.liveHint.viewportBucket,
      )
      const tagWeight = data.tags.reduce((sum, tag) => sum + tag.length, 0)
      return Math.round(
        data.complexity * 0.6 +
          data.baselineCost * 1.5 +
          data.liveHint.viewportBucket +
          data.liveHint.dragPulse +
          tagWeight * 0.75 +
          Math.abs(renderCost % 7),
      )
    },
    [data],
  )

  useTrackedEffect(
    'GRAPH_NODE',
    'selectionEffect',
    () => undefined,
    [selected, data.liveHint, data.tags],
  )

  const cardStyle = {
    borderColor: selected ? '#ea580c' : '#2d3a57',
    boxShadow: selected ? '0 0 0 2px rgba(234, 88, 12, 0.2)' : 'none',
    backgroundColor: selected ? '#fff8f1' : '#ffffff',
  }

  return (
    <Profiler id="GraphNode" onRender={recordProfilerEvent}>
      <div className="profiled-node" style={cardStyle}>
        <Handle type="target" position={Position.Top} />
        <div className="node-title">{data.label}</div>
        <div className="node-meta">{data.owner}</div>
        <div className="node-score">score {score}</div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    </Profiler>
  )
})

type DetailsPanelProps = {
  selectedNode: FlowNode | null
  viewport: Viewport
  dragSample: { nodeId: string; x: number; y: number; tick: number }
  hotNodeIds: string[]
}

const DetailsPanel = ({ selectedNode, viewport, dragSample, hotNodeIds }: DetailsPanelProps) => {
  useRenderTracker('DETAILS_PANEL', {
    selectedNode,
    viewport,
    dragSample,
    hotNodeIds,
  })

  const insightRows = useTrackedMemo(
    'DETAILS_PANEL',
    'insightRowsMemo',
    () => {
      if (!selectedNode) {
        return []
      }

      const density = Math.round((selectedNode.data.complexity * viewport.zoom) / 3)

      return [
        { label: 'Owner', value: selectedNode.data.owner },
        { label: 'Complexity', value: selectedNode.data.complexity },
        { label: 'Baseline cost', value: selectedNode.data.baselineCost },
        { label: 'Viewport density', value: density },
        { label: 'Hot peers', value: hotNodeIds.length },
      ]
    },
    [selectedNode, viewport, dragSample, hotNodeIds],
  )

  const [effectTrail, setEffectTrail] = useState<string[]>([])

  useTrackedEffect(
    'DETAILS_PANEL',
    'effectTrailSync',
    () => {
      if (!selectedNode) {
        return
      }

      const nextLine = `${selectedNode.data.label} z=${viewport.zoom.toFixed(2)} drag=${dragSample.tick}`
      setEffectTrail((current) => [nextLine, ...current].slice(0, 5))
    },
    [selectedNode, insightRows, viewport.zoom, dragSample.tick],
  )

  return (
    <section className="panel-card">
      <h2>Details</h2>
      {selectedNode ? (
        <>
          <p className="subtle">Selected: {selectedNode.data.label}</p>
          <table>
            <tbody>
              {insightRows.map((row) => (
                <tr key={row.label}>
                  <th>{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="subtle">Click a node to inspect details.</p>
      )}
      <div className="trail">
        <strong>Recent panel effects</strong>
        <ul>
          {effectTrail.length === 0 ? <li>no effect runs yet</li> : null}
          {effectTrail.map((line, index) => (
            <li key={`${line}-${index}`}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

type DebugPanelProps = {
  mode: DemoMode
  resetVersion: number
  lastResetReason: ResetReason
  modeSwitchCount: number
  modeEntryResetVersion: ModeEntryResetVersion
  onRequestReset: () => void
}

type CapturedModeSnapshot = {
  mode: DemoMode
  capturedAt: string
  resetVersion: number
  modeSwitchCount: number
  snapshot: TrackerSnapshot
}

const DebugPanel = ({
  mode,
  resetVersion,
  lastResetReason,
  modeSwitchCount,
  modeEntryResetVersion,
  onRequestReset,
}: DebugPanelProps) => {
  const [snapshot, setSnapshot] = useState<TrackerSnapshot>(() => getTrackerSnapshot())
  const [capturedByMode, setCapturedByMode] = useState<
    Partial<Record<DemoMode, CapturedModeSnapshot>>
  >({})
  const [testState, setTestState] = useState<
    'counters reset' | 'ready to run' | 'results captured'
  >('counters reset')

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSnapshot(getTrackerSnapshot())
    }, 220)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    setSnapshot(getTrackerSnapshot())
    setTestState('counters reset')
  }, [resetVersion])

  const resetAll = () => {
    onRequestReset()
    setSnapshot(getTrackerSnapshot())
    setTestState('counters reset')
  }

  const captureCurrentMode = () => {
    const capturedSnapshot = getTrackerSnapshot()

    setCapturedByMode((current) => ({
      ...current,
      [mode]: {
        mode,
        capturedAt: new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        resetVersion,
        modeSwitchCount,
        snapshot: capturedSnapshot,
      },
    }))

    setTestState('results captured')
  }

  const clearCaptured = () => {
    setCapturedByMode({})
    setTestState('counters reset')
  }

  const topRenderComponents = Object.values(snapshot.diagnostics.renders)
    .sort((a, b) => b.renders - a.renders)
    .slice(0, 3)

  const topEffects = snapshot.diagnostics.hooks
    .filter((hook) => hook.kind === 'effect')
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 6)

  const unstableMemoAndCallbacks = snapshot.diagnostics.hooks
    .filter((hook) => hook.kind === 'memo' || hook.kind === 'callback')
    .sort((a, b) => {
      if (a.invalidatingTooOften !== b.invalidatingTooOften) {
        return a.invalidatingTooOften ? -1 : 1
      }

      return b.runs - a.runs
    })
    .slice(0, 8)

  const topChangingProps = snapshot.diagnostics.props
    .sort((a, b) => b.changes - a.changes)
    .slice(0, 8)

  const totalActivitySinceReset =
    sumInteractionMetric(snapshot, 'renders') +
    sumInteractionMetric(snapshot, 'effects') +
    sumInteractionMetric(snapshot, 'memos')
  const hasRunSinceReset = totalActivitySinceReset > 0
  const currentModeCapture = capturedByMode[mode]
  const capturedCurrentModeActivity =
    currentModeCapture && currentModeCapture.resetVersion === resetVersion
      ? sumInteractionMetric(currentModeCapture.snapshot, 'renders') +
        sumInteractionMetric(currentModeCapture.snapshot, 'effects') +
        sumInteractionMetric(currentModeCapture.snapshot, 'memos')
      : -1
  const capturedCurrentMode = Boolean(
    currentModeCapture?.resetVersion === resetVersion &&
      capturedCurrentModeActivity === totalActivitySinceReset,
  )

  useEffect(() => {
    if (testState === 'results captured') {
      if (!capturedCurrentMode) {
        setTestState(hasRunSinceReset ? 'ready to run' : 'counters reset')
      }
      return
    }

    if (hasRunSinceReset) {
      setTestState('ready to run')
    }
  }, [capturedCurrentMode, hasRunSinceReset, testState])

  const likelyCauses = buildLikelyCauses(snapshot.diagnostics.hooks, snapshot.diagnostics.props)
  const capturedProblematic = capturedByMode.problematic
  const capturedFixed = capturedByMode.fixed
  const validProblematic =
    capturedProblematic &&
    capturedProblematic.resetVersion >= modeEntryResetVersion.problematic
      ? capturedProblematic
      : undefined
  const validFixed =
    capturedFixed && capturedFixed.resetVersion >= modeEntryResetVersion.fixed
      ? capturedFixed
      : undefined
  const staleProblematic = Boolean(capturedProblematic && !validProblematic)
  const staleFixed = Boolean(capturedFixed && !validFixed)
  const comparisonWarning =
    Boolean(capturedProblematic && capturedFixed) && (staleProblematic || staleFixed)
  const comparisonPair =
    validProblematic && validFixed
      ? {
          problematic: validProblematic,
          fixed: validFixed,
        }
      : null

  return (
    <section className="panel-card">
      <h2>Debug counters</h2>
      <p className="subtle">
        Active interaction:{' '}
        <strong>{snapshot.active ? interactionLabels[snapshot.active.type] : 'none'}</strong>
      </p>
      <p className="test-state">
        Test state: <strong>{testState}</strong>
      </p>
      <p className="subtle">
        Last reset: <strong>{lastResetReason === 'mode-switch' ? 'auto (mode switch)' : 'manual'}</strong>
      </p>

      <table>
        <thead>
          <tr>
            <th>component</th>
            <th>renders</th>
            <th>effects</th>
            <th>memos</th>
          </tr>
        </thead>
        <tbody>
          {(Object.keys(componentLabels) as ComponentId[]).map((component) => (
            <tr key={component}>
              <th>{componentLabels[component]}</th>
              <td>{snapshot.components[component].renders}</td>
              <td>{snapshot.components[component].effects}</td>
              <td>{snapshot.components[component].memos}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="summary-table">
        <thead>
          <tr>
            <th>interaction</th>
            <th>total renders</th>
            <th>total effects</th>
            <th>total memos</th>
          </tr>
        </thead>
        <tbody>
          {interactionList.map((interaction) => (
            <tr key={interaction}>
              <th>{interactionLabels[interaction]}</th>
              <td>{snapshot.interactions[interaction].renders}</td>
              <td>{snapshot.interactions[interaction].effects}</td>
              <td>{snapshot.interactions[interaction].memos}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table>
        <thead>
          <tr>
            <th>interaction</th>
            <th>runs</th>
            <th>last run (r/e/m)</th>
            <th>last duration</th>
          </tr>
        </thead>
        <tbody>
          {interactionList.map((interaction) => {
            const latest = snapshot.latestByType[interaction]
            return (
              <tr key={`${interaction}-latest`}>
                <th>{interactionLabels[interaction]}</th>
                <td>{snapshot.interactions[interaction].runs}</td>
                <td>{`${latest.renders}/${latest.effects}/${latest.memos}`}</td>
                <td>{`${latest.durationMs} ms`}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <h2>Top rerendered components</h2>
      <table>
        <thead>
          <tr>
            <th>component</th>
            <th>renders</th>
            <th>interaction breakdown</th>
          </tr>
        </thead>
        <tbody>
          {topRenderComponents.map((row) => (
            <tr key={`${row.component}-render-top`}>
              <th>{componentLabels[row.component]}</th>
              <td>{row.renders}</td>
              <td>{formatScopeCounts(row.byInteraction)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Most frequently rerun effects</h2>
      <table>
        <thead>
          <tr>
            <th>hook</th>
            <th>runs</th>
            <th>interaction breakdown</th>
            <th>top changed deps</th>
          </tr>
        </thead>
        <tbody>
          {topEffects.length === 0 ? (
            <tr>
              <th colSpan={4}>No effect runs captured yet.</th>
            </tr>
          ) : null}
          {topEffects.map((hook) => (
            <tr key={`${hook.component}-${hook.hookId}-effect`}>
              <th>{`${componentLabels[hook.component]} / ${hook.hookId}`}</th>
              <td>{hook.runs}</td>
              <td>{formatScopeCounts(hook.byInteraction)}</td>
              <td>{formatDependencySummary(hook)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Most unstable memos/callbacks</h2>
      <table>
        <thead>
          <tr>
            <th>hook</th>
            <th>kind</th>
            <th>runs</th>
            <th>invalidating too often</th>
            <th>interaction breakdown</th>
          </tr>
        </thead>
        <tbody>
          {unstableMemoAndCallbacks.length === 0 ? (
            <tr>
              <th colSpan={5}>No memo/callback diagnostics yet.</th>
            </tr>
          ) : null}
          {unstableMemoAndCallbacks.map((hook) => (
            <tr key={`${hook.component}-${hook.hookId}-${hook.kind}`}>
              <th>{`${componentLabels[hook.component]} / ${hook.hookId}`}</th>
              <td>{hook.kind}</td>
              <td>{hook.runs}</td>
              <td>
                {hook.kind === 'memo'
                  ? `${hook.invalidatingTooOften ? 'yes' : 'no'} (${(hook.invalidationRatio * 100).toFixed(0)}%)`
                  : 'n/a'}
              </td>
              <td>{formatScopeCounts(hook.byInteraction)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Most frequently changing props</h2>
      <table>
        <thead>
          <tr>
            <th>component.prop</th>
            <th>kind</th>
            <th>changes</th>
            <th>reference-only churn</th>
            <th>interaction breakdown</th>
          </tr>
        </thead>
        <tbody>
          {topChangingProps.length === 0 ? (
            <tr>
              <th colSpan={5}>No prop-change data yet.</th>
            </tr>
          ) : null}
          {topChangingProps.map((prop) => (
            <tr key={`${prop.component}-${prop.propName}`}>
              <th>{`${componentLabels[prop.component]} . ${prop.propName}`}</th>
              <td>{prop.valueKind}</td>
              <td>{prop.changes}</td>
              <td>{prop.referenceOnlyChanges}</td>
              <td>{formatScopeCounts(prop.byInteraction)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Likely causes summary</h2>
      <ul>
        {likelyCauses.map((line, index) => (
          <li key={`${line}-${index}`}>{line}</li>
        ))}
      </ul>

      <h2>Problematic vs Fixed comparison</h2>
      <p className="subtle">
        Capture results for each mode after running the same interaction sequence.
      </p>
      <ol className="workflow-list">
        <li className={resetVersion > 0 ? 'done' : ''}>Reset</li>
        <li className={hasRunSinceReset ? 'done' : ''}>Run isolated test</li>
        <li className={capturedCurrentMode ? 'done' : ''}>Capture current mode</li>
        <li className={modeSwitchCount > 0 ? 'done' : ''}>Switch mode</li>
        <li className={lastResetReason === 'mode-switch' ? 'done' : ''}>Auto-reset</li>
        <li
          className={
            validProblematic && validFixed
              ? 'done'
              : validProblematic || validFixed
                ? 'in-progress'
                : ''
          }
        >
          Run same test in second mode
        </li>
        <li className={comparisonPair ? 'done' : ''}>Capture second mode</li>
      </ol>
      <div className="comparison-actions">
        <button type="button" onClick={captureCurrentMode}>
          Snapshot current mode ({modeLabels[mode]})
        </button>
        <button type="button" onClick={clearCaptured}>
          Clear snapshots
        </button>
      </div>
      {comparisonWarning ? (
        <p className="warning">
          Comparison warning: one snapshot is stale after mode change. Switch to that mode, auto-reset will run, then rerun and capture again.
        </p>
      ) : null}

      {comparisonPair ? (
        <>
          <table>
            <thead>
              <tr>
                <th>metric</th>
                <th>{modeLabels.problematic}</th>
                <th>{modeLabels.fixed}</th>
                <th>delta (fixed - problematic)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>total renders</th>
                <td>{sumInteractionMetric(comparisonPair.problematic.snapshot, 'renders')}</td>
                <td>{sumInteractionMetric(comparisonPair.fixed.snapshot, 'renders')}</td>
                <td>
                  {sumInteractionMetric(comparisonPair.fixed.snapshot, 'renders') -
                    sumInteractionMetric(comparisonPair.problematic.snapshot, 'renders')}
                </td>
              </tr>
              <tr>
                <th>total effects</th>
                <td>{sumInteractionMetric(comparisonPair.problematic.snapshot, 'effects')}</td>
                <td>{sumInteractionMetric(comparisonPair.fixed.snapshot, 'effects')}</td>
                <td>
                  {sumInteractionMetric(comparisonPair.fixed.snapshot, 'effects') -
                    sumInteractionMetric(comparisonPair.problematic.snapshot, 'effects')}
                </td>
              </tr>
              <tr>
                <th>total memos</th>
                <td>{sumInteractionMetric(comparisonPair.problematic.snapshot, 'memos')}</td>
                <td>{sumInteractionMetric(comparisonPair.fixed.snapshot, 'memos')}</td>
                <td>
                  {sumInteractionMetric(comparisonPair.fixed.snapshot, 'memos') -
                    sumInteractionMetric(comparisonPair.problematic.snapshot, 'memos')}
                </td>
              </tr>
              <tr>
                <th>top rerendered component</th>
                <td>{topRerenderLabel(comparisonPair.problematic.snapshot)}</td>
                <td>{topRerenderLabel(comparisonPair.fixed.snapshot)}</td>
                <td>n/a</td>
              </tr>
              <tr>
                <th>captured at</th>
                <td>{comparisonPair.problematic.capturedAt}</td>
                <td>{comparisonPair.fixed.capturedAt}</td>
                <td>n/a</td>
              </tr>
            </tbody>
          </table>
          <p className="subtle">
            {modeLabels.problematic}: {buildLikelyCauses(
              comparisonPair.problematic.snapshot.diagnostics.hooks,
              comparisonPair.problematic.snapshot.diagnostics.props,
            )[0]}
          </p>
          <p className="subtle">
            {modeLabels.fixed}: {buildLikelyCauses(
              comparisonPair.fixed.snapshot.diagnostics.hooks,
              comparisonPair.fixed.snapshot.diagnostics.props,
            )[0]}
          </p>
        </>
      ) : (
        <p className="subtle">
          Need two snapshots to compare: one from Problematic mode and one from Fixed mode.
        </p>
      )}

      <button type="button" onClick={resetAll}>
        Reset counters
      </button>
      <p className="subtle">Breakdown format: {scopeShortLabel('DRAG_NODE')} / {scopeShortLabel('PAN_CANVAS')} / {scopeShortLabel('SELECT_NODE')} / {scopeShortLabel('IDLE')}</p>
    </section>
  )
}

function App({ panelFilter = 'all' }: { panelFilter?: PanelFilter }) {
  const [nodes, , onNodesChange] = useNodesState<FlowNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [mode, setMode] = useState<DemoMode>('problematic')
  const [resetVersion, setResetVersion] = useState(0)
  const [lastResetReason, setLastResetReason] = useState<ResetReason>('manual')
  const [modeSwitchCount, setModeSwitchCount] = useState(0)
  const [modeEntryResetVersion, setModeEntryResetVersion] = useState<ModeEntryResetVersion>({
    problematic: 0,
    fixed: -1,
  })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 })
  const [dragSample, setDragSample] = useState({ nodeId: 'none', x: 0, y: 0, tick: 0 })

  const resetVersionRef = useRef(0)
  const selectTimeout = useRef<number | null>(null)
  const runtimeNodeCacheRef = useRef<Map<string, RuntimeNodeCacheEntry<FlowNode>>>(new Map())
  const runtimeNodesSelectionDependency =
    mode === 'problematic' ? selectedNodeId : 'fixed-selection-ignored'

  const performReset = (reason: ResetReason, targetMode: DemoMode) => {
    resetTracker()

    const nextResetVersion = resetVersionRef.current + 1
    resetVersionRef.current = nextResetVersion
    setResetVersion(nextResetVersion)
    setLastResetReason(reason)

    if (reason === 'mode-switch') {
      setModeEntryResetVersion((current) => ({
        ...current,
        [targetMode]: nextResetVersion,
      }))
    }
  }

  const handleModeChange = (nextMode: DemoMode) => {
    if (nextMode === mode) {
      return
    }

    setMode(nextMode)
    setModeSwitchCount((current) => current + 1)
    performReset('mode-switch', nextMode)
  }

  const runtimeNodes = useTrackedMemo(
    'APP_ROOT',
    'runtimeNodesMemo',
    () => {
      const viewportBucket = Math.round(viewport.zoom * 10)
      const sharedDragPulse = dragSample.tick % 11

      if (mode === 'problematic') {
        runtimeNodeCacheRef.current.clear()
        return buildProblematicRuntimeNodes(nodes, viewportBucket, sharedDragPulse)
      }

      const fixedResult = buildFixedRuntimeNodes({
        nodes,
        previousCache: runtimeNodeCacheRef.current,
        viewportBucket,
        sharedDragPulse,
        draggedNodeId: dragSample.nodeId,
      })

      runtimeNodeCacheRef.current = fixedResult.cache
      return fixedResult.nodes
    },
    [nodes, viewport, dragSample, runtimeNodesSelectionDependency, mode],
  )

  const hotNodeIds = useTrackedMemo(
    'APP_ROOT',
    'hotNodeIdsMemo',
    () => {
      return runtimeNodes
        .filter((node) => node.data.complexity + node.data.liveHint.viewportBucket > 70)
        .map((node) => node.id)
    },
    [runtimeNodes, viewport, dragSample],
  )

  const selectedNode = useTrackedMemo(
    'APP_ROOT',
    'selectedNodeMemo',
    () => runtimeNodes.find((node) => node.id === selectedNodeId) ?? null,
    [runtimeNodes, selectedNodeId, viewport],
  )

  const trackedEdges = useTrackedMemo(
    'APP_ROOT',
    'trackedEdgesMemo',
    () => {
      return edges.map((edge) => ({
        ...edge,
        animated: Boolean(selectedNodeId && edge.source === selectedNodeId),
        style: {
          ...edge.style,
          stroke: selectedNodeId && edge.source === selectedNodeId ? '#0ea5e9' : '#6b7280',
        },
      }))
    },
    [edges, selectedNodeId, viewport],
  )

  useTrackedEffect(
    'APP_ROOT',
    'selectedNodeEdgeTouchEffect',
    () => {
      if (!selectedNodeId) {
        return
      }

      setEdges((currentEdges) => {
        return currentEdges.map((edge) => {
          if (edge.source === selectedNodeId) {
            return {
              ...edge,
              data: {
                touchedAt: Date.now(),
              },
            }
          }

          return edge
        })
      })
    },
    [selectedNodeId, viewport.zoom, setEdges],
  )

  useEffect(() => {
    return () => {
      if (selectTimeout.current !== null) {
        window.clearTimeout(selectTimeout.current)
      }
    }
  }, [])

  const handleNodeClick = useTrackedCallback(
    'APP_ROOT',
    'handleNodeClickCallback',
    (_event: React.MouseEvent, node: FlowNode) => {
      startInteraction('SELECT_NODE')
      setSelectedNodeId(node.id)

      if (selectTimeout.current !== null) {
        window.clearTimeout(selectTimeout.current)
      }

      selectTimeout.current = window.setTimeout(() => {
        endInteraction('SELECT_NODE')
      }, 120)
    },
    [viewport, dragSample],
  )

  const handleNodeDragStart = useTrackedCallback(
    'APP_ROOT',
    'handleNodeDragStartCallback',
    () => {
      startInteraction('DRAG_NODE')
    },
    [selectedNodeId],
  )

  const handleNodeDrag = useTrackedCallback(
    'APP_ROOT',
    'handleNodeDragCallback',
    (_event: React.MouseEvent, node: FlowNode) => {
      setDragSample((current) => ({
        nodeId: node.id,
        x: node.position.x,
        y: node.position.y,
        tick: current.tick + 1,
      }))
    },
    [viewport, selectedNodeId],
  )

  const handleNodeDragStop = useTrackedCallback(
    'APP_ROOT',
    'handleNodeDragStopCallback',
    () => {
      window.setTimeout(() => endInteraction('DRAG_NODE'), 0)
    },
    [dragSample],
  )

  const handleMoveStart = useTrackedCallback(
    'APP_ROOT',
    'handleMoveStartCallback',
    () => {
      startInteraction('PAN_CANVAS')
    },
    [selectedNodeId],
  )

  const handleMove = useTrackedCallback(
    'APP_ROOT',
    'handleMoveCallback',
    (_event: any, nextViewport: Viewport) => {
      setViewport(nextViewport)
    },
    [dragSample],
  )

  const handleMoveEnd = useTrackedCallback(
    'APP_ROOT',
    'handleMoveEndCallback',
    () => {
      window.setTimeout(() => endInteraction('PAN_CANVAS'), 0)
    },
    [selectedNodeId],
  )

  const nodeTypes = useTrackedMemo(
    'APP_ROOT',
    'nodeTypesMemo',
    () => ({
      profiled: ProfiledNode,
    }),
    [viewport],
  )

  const unstableFlowOptions = {
    fitView: true,
    fitViewOptions: { padding: 0.22 },
    proOptions: { hideAttribution: true },
  }

  useRenderTracker('APP_ROOT', {
    nodes,
    edges,
    selectedNodeId,
    viewport,
    dragSample,
    runtimeNodes,
    trackedEdges,
    hotNodeIds,
    selectedNode,
    handleNodeClick,
    handleNodeDrag,
    handleMove,
    nodeTypes,
    unstableFlowOptions,
  })

  return (
    <div className="app-shell">
      <header>
        <h1>Killing Wasted Re-renders</h1>
        <p>
          Tiny PoC for measuring how much work a simple interaction can trigger in a React + React Flow app.
        </p>
        <div className="mode-switch">
          <span>Implementation mode:</span>
          <button
            type="button"
            className={mode === 'problematic' ? 'mode-button active' : 'mode-button'}
            onClick={() => handleModeChange('problematic')}
          >
            {modeLabels.problematic}
          </button>
          <button
            type="button"
            className={mode === 'fixed' ? 'mode-button active' : 'mode-button'}
            onClick={() => handleModeChange('fixed')}
          >
            {modeLabels.fixed}
          </button>
          <span className="subtle mode-note">
            Tracker is unchanged across both modes. Use Reset + same interactions for fair comparison.
          </span>
        </div>
      </header>

      <div className="layout">
        <main className="canvas-wrap">
          <ReactFlow<FlowNode, Edge>
            nodes={runtimeNodes}
            edges={trackedEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            onNodeDragStart={handleNodeDragStart}
            onNodeDrag={handleNodeDrag}
            onNodeDragStop={handleNodeDragStop}
            onMoveStart={handleMoveStart}
            onMove={handleMove}
            onMoveEnd={handleMoveEnd}
            minZoom={0.25}
            maxZoom={1.9}
            fitView={unstableFlowOptions.fitView}
            fitViewOptions={unstableFlowOptions.fitViewOptions}
            proOptions={unstableFlowOptions.proOptions}
          >
            <Background color="#ccd6eb" gap={18} />
            <MiniMap pannable zoomable />
            <Controls />
          </ReactFlow>
        </main>

        <aside className="side-panels">
          <ProfilerPanel resetVersion={resetVersion} />
          {panelFilter === 'all' && (
            <>
              <DetailsPanel
                selectedNode={selectedNode}
                viewport={viewport}
                dragSample={dragSample}
                hotNodeIds={hotNodeIds}
              />
              <DebugPanel
                mode={mode}
                resetVersion={resetVersion}
                lastResetReason={lastResetReason}
                modeSwitchCount={modeSwitchCount}
                modeEntryResetVersion={modeEntryResetVersion}
                onRequestReset={() => performReset('manual', mode)}
              />
            </>
          )}
        </aside>
      </div>
    </div>
  )
}

export default App
