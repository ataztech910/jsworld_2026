import { useEffect, useState } from 'react'
import {
  getProfilerEvents,
  getProfilerSummary,
  resetProfilerEvents,
  type ProfilerEvent,
} from './profilerStore'

export const ProfilerPanel = ({ resetVersion }: { resetVersion: number }) => {
  const [events, setEvents] = useState<ProfilerEvent[]>(() => getProfilerEvents())

  useEffect(() => {
    const id = window.setInterval(() => setEvents(getProfilerEvents()), 220)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    resetProfilerEvents()
    setEvents([])
  }, [resetVersion])

  const summary = getProfilerSummary()
  const recentUpdates = events.filter((e) => e.phase !== 'mount').slice(0, 12)

  return (
    <section className="panel-card">
      <h2>React Profiler API</h2>
      <p className="subtle">
        What <code>{'<Profiler onRender>'}</code> gives you:
      </p>

      <table>
        <tbody>
          <tr>
            <th>total renders</th>
            <td>{summary.totalEvents}</td>
          </tr>
          <tr>
            <th>updates</th>
            <td>{summary.updateCount}</td>
          </tr>
          <tr>
            <th>avg duration</th>
            <td>{summary.avgActualDuration.toFixed(4)} ms</td>
          </tr>
        </tbody>
      </table>

      <h2>Recent update events</h2>
      {recentUpdates.length === 0 ? (
        <p className="subtle">Drag a node to see Profiler events.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>phase</th>
              <th>actual ms</th>
            </tr>
          </thead>
          <tbody>
            {recentUpdates.map((e, i) => (
              <tr key={i}>
                <td>{e.id}</td>
                <td>{e.phase}</td>
                <td>{e.actualDuration.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="subtle" style={{ marginTop: '0.75rem', color: '#b45309' }}>
        ↑ component name, phase, duration — no hook info, no dep info, no reference churn
      </p>
    </section>
  )
}
