export type ComponentId = 'APP_ROOT' | 'GRAPH_NODE' | 'DETAILS_PANEL'
export type MetricId = 'renders' | 'effects' | 'memos'
export type InteractionType = 'DRAG_NODE' | 'SELECT_NODE' | 'PAN_CANVAS'
export type InteractionScope = InteractionType | 'IDLE'
export type HookKind = 'effect' | 'memo' | 'callback'
export type ValueKind = 'primitive' | 'object' | 'function'

export type ChangedDependency = {
  index: number
  valueKind: ValueKind
}

export type ChangedProp = {
  propName: string
  valueKind: ValueKind
  referenceOnly: boolean
}

type MetricBag = Record<MetricId, number>
type InteractionCounter = Record<InteractionScope, number>

type ActiveInteraction = {
  type: InteractionType
  startedAt: number
  metrics: MetricBag
}

type InteractionTotals = MetricBag & {
  runs: number
  totalDurationMs: number
}

type LastInteraction = MetricBag & {
  durationMs: number
  finishedAt: string
}

type HookDepStat = {
  index: number
  valueKind: ValueKind
  count: number
  byInteraction: InteractionCounter
}

type HookStat = {
  component: ComponentId
  hookId: string
  kind: HookKind
  runs: number
  byInteraction: InteractionCounter
  depChanges: Record<string, HookDepStat>
}

type PropStat = {
  component: ComponentId
  propName: string
  valueKind: ValueKind
  changes: number
  referenceOnlyChanges: number
  byInteraction: InteractionCounter
}

type RenderStat = {
  component: ComponentId
  renders: number
  byInteraction: InteractionCounter
}

export type HookDiagnosticSnapshot = {
  component: ComponentId
  hookId: string
  kind: HookKind
  runs: number
  byInteraction: InteractionCounter
  depChanges: HookDepStat[]
  invalidationRatio: number
  invalidatingTooOften: boolean
}

export type PropDiagnosticSnapshot = {
  component: ComponentId
  propName: string
  valueKind: ValueKind
  changes: number
  referenceOnlyChanges: number
  byInteraction: InteractionCounter
}

export type TrackerSnapshot = {
  components: Record<ComponentId, MetricBag>
  interactions: Record<InteractionType, InteractionTotals>
  latestByType: Record<InteractionType, LastInteraction>
  active: ActiveInteraction | null
  diagnostics: {
    renders: Record<ComponentId, RenderStat>
    hooks: HookDiagnosticSnapshot[]
    props: PropDiagnosticSnapshot[]
  }
}

const componentIds: ComponentId[] = ['APP_ROOT', 'GRAPH_NODE', 'DETAILS_PANEL']
const interactionIds: InteractionType[] = ['DRAG_NODE', 'SELECT_NODE', 'PAN_CANVAS']
const allScopes: InteractionScope[] = ['DRAG_NODE', 'SELECT_NODE', 'PAN_CANVAS', 'IDLE']

const createMetricBag = (): MetricBag => ({
  renders: 0,
  effects: 0,
  memos: 0,
})

const createCounter = (): InteractionCounter => ({
  DRAG_NODE: 0,
  SELECT_NODE: 0,
  PAN_CANVAS: 0,
  IDLE: 0,
})

const createInteractionTotals = (): InteractionTotals => ({
  ...createMetricBag(),
  runs: 0,
  totalDurationMs: 0,
})

const createLastInteraction = (): LastInteraction => ({
  ...createMetricBag(),
  durationMs: 0,
  finishedAt: '-',
})

const createRenderStat = (component: ComponentId): RenderStat => ({
  component,
  renders: 0,
  byInteraction: createCounter(),
})

const createInitialState = (): TrackerSnapshot => ({
  components: {
    APP_ROOT: createMetricBag(),
    GRAPH_NODE: createMetricBag(),
    DETAILS_PANEL: createMetricBag(),
  },
  interactions: {
    DRAG_NODE: createInteractionTotals(),
    SELECT_NODE: createInteractionTotals(),
    PAN_CANVAS: createInteractionTotals(),
  },
  latestByType: {
    DRAG_NODE: createLastInteraction(),
    SELECT_NODE: createLastInteraction(),
    PAN_CANVAS: createLastInteraction(),
  },
  active: null,
  diagnostics: {
    renders: {
      APP_ROOT: createRenderStat('APP_ROOT'),
      GRAPH_NODE: createRenderStat('GRAPH_NODE'),
      DETAILS_PANEL: createRenderStat('DETAILS_PANEL'),
    },
    hooks: [],
    props: [],
  },
})

let state: TrackerSnapshot = createInitialState()

const hookRegistry = new Map<string, HookStat>()
const propRegistry = new Map<string, PropStat>()

const currentScope = (): InteractionScope => state.active?.type ?? 'IDLE'

const copyMetricBag = (source: MetricBag): MetricBag => ({
  renders: source.renders,
  effects: source.effects,
  memos: source.memos,
})

const copyCounter = (source: InteractionCounter): InteractionCounter => ({
  DRAG_NODE: source.DRAG_NODE,
  SELECT_NODE: source.SELECT_NODE,
  PAN_CANVAS: source.PAN_CANVAS,
  IDLE: source.IDLE,
})

const formatTime = (): string => {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const finalizeActiveInteraction = () => {
  if (!state.active) {
    return
  }

  const { type, startedAt, metrics } = state.active
  const durationMs = Math.round(performance.now() - startedAt)

  state.interactions[type].runs += 1
  state.interactions[type].totalDurationMs += durationMs
  state.interactions[type].renders += metrics.renders
  state.interactions[type].effects += metrics.effects
  state.interactions[type].memos += metrics.memos

  state.latestByType[type] = {
    ...copyMetricBag(metrics),
    durationMs,
    finishedAt: formatTime(),
  }

  state.active = null
}

const rebuildDiagnosticArrays = () => {
  state.diagnostics.hooks = Array.from(hookRegistry.values()).map((hookStat) => {
    const depChanges = Object.values(hookStat.depChanges).sort((a, b) => b.count - a.count)
    const componentRenders = state.diagnostics.renders[hookStat.component].renders
    const invalidationRatio = componentRenders > 0 ? hookStat.runs / componentRenders : 0

    return {
      component: hookStat.component,
      hookId: hookStat.hookId,
      kind: hookStat.kind,
      runs: hookStat.runs,
      byInteraction: copyCounter(hookStat.byInteraction),
      depChanges,
      invalidationRatio,
      invalidatingTooOften:
        hookStat.kind === 'memo' && hookStat.runs >= 5 && invalidationRatio >= 0.7,
    }
  })

  state.diagnostics.props = Array.from(propRegistry.values()).map((propStat) => ({
    component: propStat.component,
    propName: propStat.propName,
    valueKind: propStat.valueKind,
    changes: propStat.changes,
    referenceOnlyChanges: propStat.referenceOnlyChanges,
    byInteraction: copyCounter(propStat.byInteraction),
  }))
}

export const trackMetric = (component: ComponentId, metric: MetricId) => {
  state.components[component][metric] += 1

  if (state.active) {
    state.active.metrics[metric] += 1
  }
}

export const trackRender = (component: ComponentId, changedProps: ChangedProp[]) => {
  const scope = currentScope()
  const renderStat = state.diagnostics.renders[component]

  renderStat.renders += 1
  renderStat.byInteraction[scope] += 1

  for (const changedProp of changedProps) {
    const key = `${component}.${changedProp.propName}`
    let stat = propRegistry.get(key)

    if (!stat) {
      stat = {
        component,
        propName: changedProp.propName,
        valueKind: changedProp.valueKind,
        changes: 0,
        referenceOnlyChanges: 0,
        byInteraction: createCounter(),
      }
      propRegistry.set(key, stat)
    }

    stat.changes += 1
    stat.byInteraction[scope] += 1
    stat.valueKind = changedProp.valueKind

    if (changedProp.referenceOnly) {
      stat.referenceOnlyChanges += 1
    }
  }

  rebuildDiagnosticArrays()
}

export const trackHookRun = (
  kind: HookKind,
  component: ComponentId,
  hookId: string,
  changedDependencies: ChangedDependency[],
) => {
  const scope = currentScope()
  const key = `${kind}:${component}:${hookId}`
  let stat = hookRegistry.get(key)

  if (!stat) {
    stat = {
      component,
      hookId,
      kind,
      runs: 0,
      byInteraction: createCounter(),
      depChanges: {},
    }
    hookRegistry.set(key, stat)
  }

  stat.runs += 1
  stat.byInteraction[scope] += 1

  for (const dependency of changedDependencies) {
    const depKey = `${dependency.index}:${dependency.valueKind}`

    if (!stat.depChanges[depKey]) {
      stat.depChanges[depKey] = {
        index: dependency.index,
        valueKind: dependency.valueKind,
        count: 0,
        byInteraction: createCounter(),
      }
    }

    stat.depChanges[depKey].count += 1
    stat.depChanges[depKey].byInteraction[scope] += 1
  }

  rebuildDiagnosticArrays()
}

export const startInteraction = (type: InteractionType) => {
  if (state.active?.type === type) {
    return
  }

  if (state.active) {
    finalizeActiveInteraction()
  }

  state.active = {
    type,
    startedAt: performance.now(),
    metrics: createMetricBag(),
  }
}

export const endInteraction = (type?: InteractionType) => {
  if (!state.active) {
    return
  }

  if (type && state.active.type !== type) {
    return
  }

  finalizeActiveInteraction()
}

export const resetTracker = () => {
  state = createInitialState()
  hookRegistry.clear()
  propRegistry.clear()
}

export const getTrackerSnapshot = (): TrackerSnapshot => {
  const copied = createInitialState()

  for (const componentId of componentIds) {
    copied.components[componentId] = copyMetricBag(state.components[componentId])

    copied.diagnostics.renders[componentId] = {
      component: componentId,
      renders: state.diagnostics.renders[componentId].renders,
      byInteraction: copyCounter(state.diagnostics.renders[componentId].byInteraction),
    }
  }

  for (const interactionId of interactionIds) {
    copied.interactions[interactionId] = {
      ...copyMetricBag(state.interactions[interactionId]),
      runs: state.interactions[interactionId].runs,
      totalDurationMs: state.interactions[interactionId].totalDurationMs,
    }

    copied.latestByType[interactionId] = {
      ...copyMetricBag(state.latestByType[interactionId]),
      durationMs: state.latestByType[interactionId].durationMs,
      finishedAt: state.latestByType[interactionId].finishedAt,
    }
  }

  copied.diagnostics.hooks = state.diagnostics.hooks.map((hookStat) => ({
    component: hookStat.component,
    hookId: hookStat.hookId,
    kind: hookStat.kind,
    runs: hookStat.runs,
    byInteraction: copyCounter(hookStat.byInteraction),
    depChanges: hookStat.depChanges.map((depStat) => ({
      index: depStat.index,
      valueKind: depStat.valueKind,
      count: depStat.count,
      byInteraction: copyCounter(depStat.byInteraction),
    })),
    invalidationRatio: hookStat.invalidationRatio,
    invalidatingTooOften: hookStat.invalidatingTooOften,
  }))

  copied.diagnostics.props = state.diagnostics.props.map((propStat) => ({
    component: propStat.component,
    propName: propStat.propName,
    valueKind: propStat.valueKind,
    changes: propStat.changes,
    referenceOnlyChanges: propStat.referenceOnlyChanges,
    byInteraction: copyCounter(propStat.byInteraction),
  }))

  copied.active = state.active
    ? {
        type: state.active.type,
        startedAt: state.active.startedAt,
        metrics: copyMetricBag(state.active.metrics),
      }
    : null

  return copied
}

export const interactionLabels: Record<InteractionType, string> = {
  DRAG_NODE: 'DRAG_NODE',
  SELECT_NODE: 'SELECT_NODE',
  PAN_CANVAS: 'PAN_CANVAS',
}

export const componentLabels: Record<ComponentId, string> = {
  APP_ROOT: 'App / Root container',
  GRAPH_NODE: 'Graph node component',
  DETAILS_PANEL: 'Details side panel',
}

export const interactionList: InteractionType[] = ['DRAG_NODE', 'SELECT_NODE', 'PAN_CANVAS']
export const interactionScopes: InteractionScope[] = ['DRAG_NODE', 'PAN_CANVAS', 'SELECT_NODE', 'IDLE']

export const scopeShortLabel = (scope: InteractionScope): string => {
  if (scope === 'DRAG_NODE') {
    return 'drag'
  }

  if (scope === 'PAN_CANVAS') {
    return 'pan'
  }

  if (scope === 'SELECT_NODE') {
    return 'select'
  }

  return 'idle'
}

export const allValueKinds: ValueKind[] = ['primitive', 'object', 'function']
export const allHookKinds: HookKind[] = ['effect', 'memo', 'callback']

export const copyInteractionCounter = (counter: InteractionCounter): InteractionCounter => {
  const copied = createCounter()

  for (const scope of allScopes) {
    copied[scope] = counter[scope]
  }

  return copied
}
