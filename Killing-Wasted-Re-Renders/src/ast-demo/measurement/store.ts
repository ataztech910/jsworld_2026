import type {
  ActionMetric,
  ActionMetrics,
  ComponentMetrics,
  ComputationMetrics,
  MetricsMetadata,
  MetricsSnapshot,
  TimingMetric,
} from './types';

interface MetricsState {
  sessionStartedAt: number;
  updatedAt: number;
  components: ComponentMetrics;
  computations: ComputationMetrics;
  actions: ActionMetrics;
}

type Listener = () => void;

const listeners = new Set<Listener>();

const state: MetricsState = {
  sessionStartedAt: Date.now(),
  updatedAt: Date.now(),
  components: {},
  computations: {},
  actions: {},
};

let currentSnapshot = createSnapshot(state);

function createTimingMetric(): TimingMetric {
  return {
    runCount: 0,
    lastDuration: 0,
    averageDuration: 0,
    maxDuration: 0,
    totalDuration: 0,
  };
}

function createActionMetric(): ActionMetric {
  return {
    ...createTimingMetric(),
    lastMetadata: null,
  };
}

function sanitizeDuration(duration: number) {
  if (!Number.isFinite(duration) || duration < 0) {
    return 0;
  }

  return duration;
}

function updateTimingMetric(metric: TimingMetric, duration: number) {
  const value = sanitizeDuration(duration);
  metric.runCount += 1;
  metric.lastDuration = value;
  metric.totalDuration += value;
  metric.maxDuration = Math.max(metric.maxDuration, value);
  metric.averageDuration = metric.totalDuration / metric.runCount;
}

function recordIntoTimingMap(metrics: Record<string, TimingMetric>, name: string, duration: number) {
  const metric = metrics[name] ?? createTimingMetric();
  updateTimingMetric(metric, duration);
  metrics[name] = metric;
}

function recordIntoActionMap(
  metrics: ActionMetrics,
  name: string,
  duration: number,
  metadata: MetricsMetadata
) {
  const metric = metrics[name] ?? createActionMetric();
  updateTimingMetric(metric, duration);
  metric.lastMetadata = metadata;
  metrics[name] = metric;
}

function cloneTimingMap(metrics: Record<string, TimingMetric>) {
  const next: Record<string, TimingMetric> = {};

  Object.keys(metrics)
    .sort()
    .forEach((name) => {
      next[name] = { ...metrics[name] };
    });

  return next;
}

function cloneActionMap(metrics: ActionMetrics) {
  const next: ActionMetrics = {};

  Object.keys(metrics)
    .sort()
    .forEach((name) => {
      next[name] = {
        ...metrics[name],
        lastMetadata: metrics[name].lastMetadata,
      };
    });

  return next;
}

function createSnapshot(source: MetricsState): MetricsSnapshot {
  return {
    sessionStartedAt: source.sessionStartedAt,
    updatedAt: source.updatedAt,
    components: cloneTimingMap(source.components),
    computations: cloneTimingMap(source.computations),
    actions: cloneActionMap(source.actions),
  };
}

function notify() {
  currentSnapshot = createSnapshot(state);
  listeners.forEach((listener) => listener());
}

function touchAndNotify() {
  state.updatedAt = Date.now();
  notify();
}

export function subscribeToMetricsStore(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMetricsSnapshot() {
  return currentSnapshot;
}

export function recordComponentRenderInStore(componentName: string, duration: number) {
  recordIntoTimingMap(state.components, componentName, duration);
  touchAndNotify();
}

export function recordComputationInStore(name: string, duration: number) {
  recordIntoTimingMap(state.computations, name, duration);
  touchAndNotify();
}

export function recordActionInStore(name: string, duration: number, metadata: MetricsMetadata = null) {
  recordIntoActionMap(state.actions, name, duration, metadata);
  touchAndNotify();
}

export function resetMetricsInStore() {
  state.sessionStartedAt = Date.now();
  state.updatedAt = state.sessionStartedAt;
  state.components = {};
  state.computations = {};
  state.actions = {};
  notify();
}
