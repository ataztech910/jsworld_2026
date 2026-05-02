export type ProfilerEvent = {
  id: string
  phase: 'mount' | 'update' | 'nested-update'
  actualDuration: number
  baseDuration: number
  timestamp: number
}

export type ProfilerSummary = {
  totalEvents: number
  updateCount: number
  mountCount: number
  avgActualDuration: number
  byComponent: Record<string, { count: number; totalDuration: number; avgDuration: number }>
}

const MAX_LOG = 20

let eventLog: ProfilerEvent[] = []
let totalRecorded = 0
let totalUpdates = 0
let totalMounts = 0
let cumulativeDuration = 0

export const recordProfilerEvent = (
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
) => {
  const event: ProfilerEvent = { id, phase, actualDuration, baseDuration, timestamp: performance.now() }
  eventLog = [event, ...eventLog].slice(0, MAX_LOG)
  totalRecorded += 1
  if (phase === 'mount') {
    totalMounts += 1
  } else {
    totalUpdates += 1
    cumulativeDuration += actualDuration
  }
}

export const getProfilerEvents = (): ProfilerEvent[] => eventLog

export const resetProfilerEvents = () => {
  eventLog = []
  totalRecorded = 0
  totalUpdates = 0
  totalMounts = 0
  cumulativeDuration = 0
}

export const getProfilerSummary = (): ProfilerSummary => {
  const byComponent: ProfilerSummary['byComponent'] = {}
  for (const e of eventLog) {
    if (!byComponent[e.id]) byComponent[e.id] = { count: 0, totalDuration: 0, avgDuration: 0 }
    byComponent[e.id].count += 1
    byComponent[e.id].totalDuration += e.actualDuration
    byComponent[e.id].avgDuration = byComponent[e.id].totalDuration / byComponent[e.id].count
  }

  return {
    totalEvents: totalRecorded,
    updateCount: totalUpdates,
    mountCount: totalMounts,
    avgActualDuration: totalUpdates > 0 ? cumulativeDuration / totalUpdates : 0,
    byComponent,
  }
}
