import { useEffect, useRef, useState } from 'react'
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
  type HookDiagnosticSnapshot,
  type InteractionScope,
  type PropDiagnosticSnapshot,
  type TrackerSnapshot,
} from './tracker'
import {
  useRenderTracker,
  useTrackedCallback,
  useTrackedEffect,
  useTrackedMemo,
} from './diagnostics'

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

const formatScopeCounts = (
  counts: Record<InteractionScope, number>,
): string => {
  return [
    `drag:${counts.DRAG_NODE}`,
    `pan:${counts.PAN_CANVAS}`,
    `select:${counts.SELECT_NODE}`,
    `idle:${counts.IDLE}`,
  ].join(' ')
}

const formatDependencySummary = (hook: HookDiagnosticSnapshot): string => {
  if (hook.depChanges.length === 0) {
    return 'no dependency changes captured'
  }

  return hook.depChanges
    .slice(0, 3)
    .map((dep) => `dep[${dep.index}] ${dep.valueKind} x${dep.count}`)
    .join(', ')
}

const buildLikelyCauses = (
  hooks: HookDiagnosticSnapshot[],
  props: PropDiagnosticSnapshot[],
): string[] => {
  const lines: string[] = []

  const topReferenceProp = [...props]
    .filter((prop) => prop.referenceOnlyChanges > 0)
    .sort((a, b) => b.referenceOnlyChanges - a.referenceOnlyChanges)[0]

  if (topReferenceProp) {
    lines.push(
      `${componentLabels[topReferenceProp.component]} rerendered mainly because \`${topReferenceProp.propName}\` changed by reference (${topReferenceProp.referenceOnlyChanges}/${topReferenceProp.changes} changes).`,
    )
  }

  const topEffect = [...hooks]
    .filter((hook) => hook.kind === 'effect')
    .sort((a, b) => b.runs - a.runs)[0]

  if (topEffect) {
    const dominantDep = topEffect.depChanges[0]
    lines.push(
      dominantDep
        ? `${componentLabels[topEffect.component]} effect \`${topEffect.hookId}\` reran ${topEffect.runs} times, mostly because dep[${dominantDep.index}] (${dominantDep.valueKind}) changed.`
        : `${componentLabels[topEffect.component]} effect \`${topEffect.hookId}\` reran ${topEffect.runs} times.`,
    )
  }

  const unstableMemo = [...hooks]
    .filter((hook) => hook.kind === 'memo' && hook.invalidatingTooOften)
    .sort((a, b) => b.invalidationRatio - a.invalidationRatio)[0]

  if (unstableMemo) {
    lines.push(
      `${componentLabels[unstableMemo.component]} memo \`${unstableMemo.hookId}\` recomputed on ${(unstableMemo.invalidationRatio * 100).toFixed(0)}% of renders.`,
    )
  }

  const unstableCallback = [...hooks]
    .filter((hook) => hook.kind === 'callback')
    .sort((a, b) => b.runs - a.runs)[0]

  if (unstableCallback && unstableCallback.runs >= 5) {
    lines.push(
      `${componentLabels[unstableCallback.component]} callback \`${unstableCallback.hookId}\` changed identity ${unstableCallback.runs} times (${formatScopeCounts(unstableCallback.byInteraction)}).`,
    )
  }

  if (lines.length === 0) {
    lines.push('Not enough data yet. Run drag, pan, and select interactions to populate diagnostics.')
  }

  return lines
}

const ProfiledNode = (props: NodeProps<FlowNode>) => {
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
      const tagWeight = data.tags.reduce((sum, tag) => sum + tag.length, 0)
      return Math.round(
        data.complexity * 0.6 +
          data.baselineCost * 1.5 +
          data.liveHint.viewportBucket +
          data.liveHint.dragPulse +
          tagWeight * 0.75,
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
    <div className="profiled-node" style={cardStyle}>
      <Handle type="target" position={Position.Top} />
      <div className="node-title">{data.label}</div>
      <div className="node-meta">{data.owner}</div>
      <div className="node-score">score {score}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

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

const DebugPanel = () => {
  const [snapshot, setSnapshot] = useState<TrackerSnapshot>(() => getTrackerSnapshot())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSnapshot(getTrackerSnapshot())
    }, 220)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const resetAll = () => {
    resetTracker()
    setSnapshot(getTrackerSnapshot())
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

  const likelyCauses = buildLikelyCauses(snapshot.diagnostics.hooks, snapshot.diagnostics.props)

  return (
    <section className="panel-card">
      <h2>Debug counters</h2>
      <p className="subtle">
        Active interaction:{' '}
        <strong>{snapshot.active ? interactionLabels[snapshot.active.type] : 'none'}</strong>
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

      <button type="button" onClick={resetAll}>
        Reset counters
      </button>
      <p className="subtle">Breakdown format: {scopeShortLabel('DRAG_NODE')} / {scopeShortLabel('PAN_CANVAS')} / {scopeShortLabel('SELECT_NODE')} / {scopeShortLabel('IDLE')}</p>
    </section>
  )
}

function App() {
  const [nodes, , onNodesChange] = useNodesState<FlowNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 })
  const [dragSample, setDragSample] = useState({ nodeId: 'none', x: 0, y: 0, tick: 0 })

  const selectTimeout = useRef<number | null>(null)

  const runtimeNodes = useTrackedMemo(
    'APP_ROOT',
    'runtimeNodesMemo',
    () => {
      const viewportBucket = Math.round(viewport.zoom * 10)

      return nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          liveHint: {
            viewportBucket,
            dragPulse: dragSample.tick % 11,
          },
        },
        style: {
          ...node.style,
          borderRadius: 12,
        },
      }))
    },
    [nodes, viewport, dragSample, selectedNodeId],
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
          <DetailsPanel
            selectedNode={selectedNode}
            viewport={viewport}
            dragSample={dragSample}
            hotNodeIds={hotNodeIds}
          />
          <DebugPanel />
        </aside>
      </div>
    </div>
  )
}

export default App
