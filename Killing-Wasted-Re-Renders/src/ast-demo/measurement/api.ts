import {
  getMetricsSnapshot,
  recordActionInStore,
  recordComponentRenderInStore,
  recordComputationInStore,
  resetMetricsInStore,
} from './store';
import type { ExportedMetricsSnapshot, MetricsMetadata } from './types';

export function recordComponentRender(componentName: string, duration: number) {
  recordComponentRenderInStore(componentName, duration);
}

export function recordComputation(name: string, duration: number) {
  recordComputationInStore(name, duration);
}

export function recordAction(name: string, duration: number, metadata: MetricsMetadata = null) {
  recordActionInStore(name, duration, metadata);
}

export function resetMetrics() {
  resetMetricsInStore();
}

export function exportMetricsSnapshot(): ExportedMetricsSnapshot {
  const snapshot = getMetricsSnapshot();
  return {
    sessionStartedAt: snapshot.sessionStartedAt,
    updatedAt: snapshot.updatedAt,
    components: snapshot.components,
    computations: snapshot.computations,
    actions: snapshot.actions,
    exportedAt: Date.now(),
  };
}

export function measureComputation<T>(name: string, computation: () => T): T {
  const startedAt = performance.now();

  try {
    return computation();
  } finally {
    recordComputation(name, performance.now() - startedAt);
  }
}

export function measureAction<T>(
  name: string,
  action: () => T,
  metadata: MetricsMetadata = null
): T {
  const startedAt = performance.now();

  try {
    return action();
  } finally {
    recordAction(name, performance.now() - startedAt, metadata);
  }
}

export async function measureAsyncAction<T>(
  name: string,
  action: () => Promise<T>,
  metadata: MetricsMetadata = null
): Promise<T> {
  const startedAt = performance.now();

  try {
    return await action();
  } finally {
    recordAction(name, performance.now() - startedAt, metadata);
  }
}
