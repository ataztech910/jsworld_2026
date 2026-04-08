export type MetricsMetadata = Record<string, unknown> | null;

export interface TimingMetric {
  runCount: number;
  lastDuration: number;
  averageDuration: number;
  maxDuration: number;
  totalDuration: number;
}

export interface ActionMetric extends TimingMetric {
  lastMetadata: MetricsMetadata;
}

export type ComponentMetrics = Record<string, TimingMetric>;
export type ComputationMetrics = Record<string, TimingMetric>;
export type ActionMetrics = Record<string, ActionMetric>;

export interface MetricsSnapshot {
  sessionStartedAt: number;
  updatedAt: number;
  components: ComponentMetrics;
  computations: ComputationMetrics;
  actions: ActionMetrics;
}

export interface ExportedMetricsSnapshot extends MetricsSnapshot {
  exportedAt: number;
}
