/**
 * Demo hook-level instrumentation.
 *
 * These tracked hooks keep normal React behavior but add metadata so we can explain
 * why render storms happen (dependency churn, callback identity churn, prop churn).
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type DependencyList,
  type EffectCallback,
} from 'react'
import {
  trackHookRun,
  trackMetric,
  trackRender,
  type ChangedDependency,
  type ChangedProp,
  type ComponentId,
  type ValueKind,
} from './trackerStore'

/**
 * Classifies a value into primitive/object/function to explain churn type in diagnostics.
 */
const classifyValue = (value: unknown): ValueKind => {
  if (typeof value === 'function') {
    return 'function'
  }

  if (value !== null && typeof value === 'object') {
    return 'object'
  }

  return 'primitive'
}

/**
 * Detects which dependency indexes changed since the previous hook execution.
 *
 * Signal produced: dependency index + value type for effect/memo/callback diagnostics.
 */
const findChangedDependencies = (
  previous: DependencyList | undefined,
  current: DependencyList,
): ChangedDependency[] => {
  if (!previous) {
    return current.map((value, index) => ({
      index,
      valueKind: classifyValue(value),
    }))
  }

  const maxLength = Math.max(previous.length, current.length)
  const changed: ChangedDependency[] = []

  for (let index = 0; index < maxLength; index += 1) {
    if (!Object.is(previous[index], current[index])) {
      changed.push({
        index,
        valueKind: classifyValue(current[index]),
      })
    }
  }

  return changed
}

/**
 * Detects changed props between renders using reference comparison.
 *
 * Signal produced: prop name, value type, and whether it looks like reference-only churn.
 */
const findChangedProps = (
  previous: Record<string, unknown> | null,
  current: Record<string, unknown>,
): ChangedProp[] => {
  const keys = new Set<string>([
    ...Object.keys(previous ?? {}),
    ...Object.keys(current),
  ])

  const changed: ChangedProp[] = []

  for (const key of keys) {
    const previousValue = previous?.[key]
    const currentValue = current[key]

    if (Object.is(previousValue, currentValue)) {
      continue
    }

    const valueKind = classifyValue(currentValue)
    const previousKind = classifyValue(previousValue)

    changed.push({
      propName: key,
      valueKind,
      referenceOnly:
        (valueKind === 'object' || valueKind === 'function') &&
        (previousKind === 'object' || previousKind === 'function'),
    })
  }

  return changed
}

/**
 * Tracks rerenders for a component and records changed props since the previous render.
 *
 * Helps diagnose whether rerenders are driven by semantic updates or by object/function churn.
 */
export const useRenderTracker = (
  component: ComponentId,
  props: Record<string, unknown>,
) => {
  const previousPropsRef = useRef<Record<string, unknown> | null>(null)

  trackMetric(component, 'renders')

  const changedProps = findChangedProps(previousPropsRef.current, props)
  trackRender(component, changedProps)

  previousPropsRef.current = props
}

/**
 * Tracks effect reruns together with dependency-change metadata.
 *
 * Helps show when effects rerun due to recreated object/function dependencies.
 */
export const useTrackedEffect = (
  component: ComponentId,
  hookId: string,
  effect: EffectCallback,
  dependencies: DependencyList,
) => {
  const previousDepsRef = useRef<DependencyList | undefined>(undefined)

  useEffect(() => {
    trackMetric(component, 'effects')

    const changedDependencies = findChangedDependencies(
      previousDepsRef.current,
      dependencies,
    )

    trackHookRun('effect', component, hookId, changedDependencies)
    previousDepsRef.current = dependencies

    return effect()
  }, dependencies)
}

/**
 * Tracks memo recomputations and changed dependencies.
 *
 * Helps diagnose whether memoization is effective or invalidating too often to help.
 */
export const useTrackedMemo = <T,>(
  component: ComponentId,
  hookId: string,
  build: () => T,
  dependencies: DependencyList,
): T => {
  const previousDepsRef = useRef<DependencyList | undefined>(undefined)

  return useMemo(() => {
    trackMetric(component, 'memos')

    const changedDependencies = findChangedDependencies(
      previousDepsRef.current,
      dependencies,
    )

    trackHookRun('memo', component, hookId, changedDependencies)
    previousDepsRef.current = dependencies

    return build()
  }, dependencies)
}

/**
 * Tracks callback identity changes and the dependencies that caused them.
 *
 * Helps diagnose callback churn that can fan out rerenders through prop reference changes.
 */
export const useTrackedCallback = <T extends (...args: any[]) => any>(
  component: ComponentId,
  hookId: string,
  callback: T,
  dependencies: DependencyList,
): T => {
  const previousDepsRef = useRef<DependencyList | undefined>(undefined)
  const previousCallbackRef = useRef<T | null>(null)

  const memoizedCallback = useCallback(callback, dependencies)

  useEffect(() => {
    if (previousCallbackRef.current !== memoizedCallback) {
      const changedDependencies = findChangedDependencies(
        previousDepsRef.current,
        dependencies,
      )

      trackHookRun('callback', component, hookId, changedDependencies)
      previousCallbackRef.current = memoizedCallback
      previousDepsRef.current = dependencies
    }
  }, [memoizedCallback, component, hookId])

  return memoizedCallback
}
