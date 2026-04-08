/**
 * Diagnostic summary helpers for the demo UI.
 *
 * These helpers turn raw tracker snapshots into human-readable signals that explain
 * why render storms happen during drag/select/pan interactions.
 */

import {
  componentLabels,
  interactionList,
  type HookDiagnosticSnapshot,
  type InteractionScope,
  type PropDiagnosticSnapshot,
  type TrackerSnapshot,
} from './trackerStore'

/**
 * Formats per-interaction counters into a compact line for summary tables.
 */
export const formatScopeCounts = (
  counts: Record<InteractionScope, number>,
): string => {
  return [
    `drag:${counts.DRAG_NODE}`,
    `pan:${counts.PAN_CANVAS}`,
    `select:${counts.SELECT_NODE}`,
    `idle:${counts.IDLE}`,
  ].join(' ')
}

/**
 * Summarizes top dependency changes for a hook so we can quickly spot unstable deps.
 */
export const formatDependencySummary = (hook: HookDiagnosticSnapshot): string => {
  if (hook.depChanges.length === 0) {
    return 'no dependency changes captured'
  }

  return hook.depChanges
    .slice(0, 3)
    .map((dep) => `dep[${dep.index}] ${dep.valueKind} x${dep.count}`)
    .join(', ')
}

/**
 * Sums a metric across all interaction types for before/after comparison tables.
 */
export const sumInteractionMetric = (
  snapshot: TrackerSnapshot,
  metric: 'renders' | 'effects' | 'memos',
): number => {
  return interactionList.reduce((sum, interaction) => {
    return sum + snapshot.interactions[interaction][metric]
  }, 0)
}

/**
 * Returns the most rerendered component label from a snapshot.
 */
export const topRerenderLabel = (snapshot: TrackerSnapshot): string => {
  const topComponent = Object.values(snapshot.diagnostics.renders).sort(
    (a, b) => b.renders - a.renders,
  )[0]

  if (!topComponent) {
    return 'n/a'
  }

  return `${componentLabels[topComponent.component]} (${topComponent.renders})`
}

/**
 * Builds plain-language likely causes from raw hook/prop diagnostics.
 *
 * Signal produced: conference-friendly explanation lines for root-cause storytelling.
 */
export const buildLikelyCauses = (
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
