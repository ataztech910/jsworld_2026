/**
 * Manual stabilization fix used only in this demo.
 *
 * It targets reference churn in React Flow node data (`data.liveHint`) by preserving
 * runtime node references when semantic values are unchanged.
 *
 * Goal: reduce wasted renders, effect reruns, and memo invalidations while keeping
 * the tracker and interaction protocol unchanged.
 */

type NodeWithLiveHint = {
  id: string
  data: {
    liveHint: {
      viewportBucket: number
      dragPulse: number
    }
  }
  style?: unknown
}

export type RuntimeNodeCacheEntry<TNode extends NodeWithLiveHint> = {
  sourceNode: TNode
  runtimeNode: TNode
  viewportBucket: number
  dragPulse: number
}

/**
 * Recreates every runtime node and its `data.liveHint` on every update.
 *
 * This intentionally keeps the problematic behavior for before/after comparison:
 * object references churn even when semantic values are effectively the same.
 */
export const buildProblematicRuntimeNodes = <TNode extends NodeWithLiveHint>(
  nodes: TNode[],
  viewportBucket: number,
  sharedDragPulse: number,
): TNode[] => {
  return nodes.map((node) =>
    createRuntimeNode(node, {
      viewportBucket,
      dragPulse: sharedDragPulse,
    }),
  )
}

/**
 * Builds runtime nodes with structural sharing for Fixed mode.
 *
 * Returns the original cached runtime node reference when:
 * - source node reference is unchanged
 * - semantic liveHint values are unchanged
 *
 * Creates a new runtime node object only when a meaningful change occurred.
 */
export const buildFixedRuntimeNodes = <TNode extends NodeWithLiveHint>(params: {
  nodes: TNode[]
  previousCache: Map<string, RuntimeNodeCacheEntry<TNode>>
  viewportBucket: number
  sharedDragPulse: number
  draggedNodeId: string
}): { nodes: TNode[]; cache: Map<string, RuntimeNodeCacheEntry<TNode>> } => {
  const nextCache = new Map<string, RuntimeNodeCacheEntry<TNode>>()

  const nextNodes = params.nodes.map((node) => {
    const perNodeDragPulse = getPerNodeDragPulse(
      node.id,
      params.draggedNodeId,
      params.sharedDragPulse,
    )
    const cachedEntry = params.previousCache.get(node.id)

    if (canReuseCachedRuntimeNode(cachedEntry, node, params.viewportBucket, perNodeDragPulse)) {
      nextCache.set(node.id, cachedEntry)
      return cachedEntry.runtimeNode
    }

    const runtimeNode = createRuntimeNode(node, {
      viewportBucket: params.viewportBucket,
      dragPulse: perNodeDragPulse,
    })

    nextCache.set(node.id, {
      sourceNode: node,
      runtimeNode,
      viewportBucket: params.viewportBucket,
      dragPulse: perNodeDragPulse,
    })

    return runtimeNode
  })

  return {
    nodes: nextNodes,
    cache: nextCache,
  }
}

/**
 * Applies drag pulse only to the currently dragged node.
 *
 * This avoids propagating drag-only churn into unrelated nodes.
 */
const getPerNodeDragPulse = (
  nodeId: string,
  draggedNodeId: string,
  sharedDragPulse: number,
): number => {
  return nodeId === draggedNodeId ? sharedDragPulse : 0
}

/**
 * Decides whether we can return the previous runtime node reference as-is.
 *
 * Reuse is allowed only when both source identity and semantic liveHint values match.
 * This prevents unnecessary object recreation that would retrigger memo/effect chains.
 */
const canReuseCachedRuntimeNode = <TNode extends NodeWithLiveHint>(
  cachedEntry: RuntimeNodeCacheEntry<TNode> | undefined,
  sourceNode: TNode,
  viewportBucket: number,
  dragPulse: number,
): cachedEntry is RuntimeNodeCacheEntry<TNode> => {
  return Boolean(
    cachedEntry &&
      cachedEntry.sourceNode === sourceNode &&
      cachedEntry.viewportBucket === viewportBucket &&
      cachedEntry.dragPulse === dragPulse,
  )
}

/**
 * Creates a new runtime node object with updated visual metadata.
 *
 * This is the only place where `data` and `style` references are recreated,
 * so object churn stays local to nodes that actually changed.
 */
const createRuntimeNode = <TNode extends NodeWithLiveHint>(
  sourceNode: TNode,
  liveHint: {
    viewportBucket: number
    dragPulse: number
  },
): TNode => {
  return {
    ...sourceNode,
    data: {
      ...sourceNode.data,
      liveHint: {
        viewportBucket: liveHint.viewportBucket,
        dragPulse: liveHint.dragPulse,
      },
    },
    style: {
      ...(sourceNode.style as Record<string, unknown> | undefined),
      borderRadius: 12,
    },
  }
}
