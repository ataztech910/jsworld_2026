import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import {
  measureAction,
  measureAsyncAction,
  measureComputation,
  recordComponentRender,
} from './api';
import { getMetricsSnapshot, subscribeToMetricsStore } from './store';
import type { MetricsMetadata } from './types';

export function useMetricsSnapshot() {
  return useSyncExternalStore(subscribeToMetricsStore, getMetricsSnapshot, getMetricsSnapshot);
}

export function useRenderMeasurement(componentName: string) {
  const renderStartedAtRef = useRef(0);
  renderStartedAtRef.current = performance.now();

  useLayoutEffect(() => {
    const duration = performance.now() - renderStartedAtRef.current;
    recordComponentRender(componentName, duration);
  });
}

export function useMeasuredComputation() {
  return function runMeasuredComputation<T>(name: string, computation: () => T): T {
    return measureComputation(name, computation);
  };
}

export function useMeasuredAction() {
  return function runMeasuredAction<T>(
    name: string,
    action: () => T,
    metadata: MetricsMetadata = null
  ): T {
    return measureAction(name, action, metadata);
  };
}

export function useMeasuredAsyncAction() {
  return function runMeasuredAsyncAction<T>(
    name: string,
    action: () => Promise<T>,
    metadata: MetricsMetadata = null
  ): Promise<T> {
    return measureAsyncAction(name, action, metadata);
  };
}
