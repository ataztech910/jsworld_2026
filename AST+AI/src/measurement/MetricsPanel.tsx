import { useState } from 'react';
import { exportMetricsSnapshot, resetMetrics } from './api';
import { useMetricsSnapshot } from './hooks';
import type { ActionMetric, ActionMetrics, TimingMetric } from './types';

function formatDuration(duration: number, fractionDigits = 3) {
  return `${duration.toFixed(fractionDigits)} ms`;
}

function calculateAverageDuration(metrics: Record<string, TimingMetric>) {
  const entries = Object.values(metrics);
  const totalRuns = entries.reduce((sum, entry) => sum + entry.runCount, 0);
  const totalDuration = entries.reduce((sum, entry) => sum + entry.totalDuration, 0);

  if (totalRuns === 0) {
    return 0;
  }

  return totalDuration / totalRuns;
}

function isAsyncAction(metric: ActionMetric) {
  if (!metric.lastMetadata) {
    return false;
  }

  return metric.lastMetadata.kind === 'async';
}

function calculateAverageAsyncActionDuration(actions: ActionMetrics) {
  const entries = Object.values(actions).filter(isAsyncAction);
  const totalRuns = entries.reduce((sum, entry) => sum + entry.runCount, 0);
  const totalDuration = entries.reduce((sum, entry) => sum + entry.totalDuration, 0);

  if (totalRuns === 0) {
    return 0;
  }

  return totalDuration / totalRuns;
}

function serializeMetadata(metadata: ActionMetric['lastMetadata']) {
  if (!metadata) {
    return '-';
  }

  try {
    return JSON.stringify(metadata);
  } catch {
    return '[unserializable]';
  }
}

function downloadSnapshotJson(json: string, exportedAt: number) {
  const timestamp = new Date(exportedAt).toISOString().replace(/[:.]/g, '-');
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `metrics-snapshot-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function MetricsPanel() {
  const snapshot = useMetricsSnapshot();
  const [lastExportJson, setLastExportJson] = useState('');

  const mainComponent = snapshot.components.OrdersDashboard;
  const childComponent = snapshot.components.OrderRow;

  const averageRenderDuration = calculateAverageDuration(snapshot.components);
  const averageComputationDuration = calculateAverageDuration(snapshot.computations);
  const averageAsyncActionDuration = calculateAverageAsyncActionDuration(snapshot.actions);

  const computationNames = Object.keys(snapshot.computations);
  const actionNames = Object.keys(snapshot.actions);

  return (
    <section className="measurement-panel">
      <div className="measurement-header">
        <h2>Measurement Panel</h2>
        <p>
          Session started: {new Date(snapshot.sessionStartedAt).toLocaleTimeString()} · Last update:{' '}
          {new Date(snapshot.updatedAt).toLocaleTimeString()}
        </p>
      </div>

      <div className="measurement-summary">
        <article>
          <h3>Main Component Renders</h3>
          <p>{mainComponent ? mainComponent.runCount : 0}</p>
        </article>
        <article>
          <h3>Child Row Renders</h3>
          <p>{childComponent ? childComponent.runCount : 0}</p>
        </article>
        <article>
          <h3>Average Render Duration</h3>
          <p>{formatDuration(averageRenderDuration)}</p>
        </article>
        <article>
          <h3>Average Computation Duration</h3>
          <p>{formatDuration(averageComputationDuration)}</p>
        </article>
        <article>
          <h3>Average Async Action Duration</h3>
          <p>{formatDuration(averageAsyncActionDuration)}</p>
        </article>
      </div>

      <div className="measurement-controls">
        <button onClick={() => resetMetrics()}>Reset Metrics</button>
        <button
          onClick={() => {
            const exportSnapshot = exportMetricsSnapshot();
            const json = JSON.stringify(exportSnapshot, null, 2);
            setLastExportJson(json);
            downloadSnapshotJson(json, exportSnapshot.exportedAt);
          }}
        >
          Export Snapshot JSON
        </button>
      </div>

      <div className="measurement-table-wrapper">
        <h3>Computations</h3>
        {computationNames.length === 0 ? (
          <p className="empty-row">No computation metrics yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Runs</th>
                <th>Last</th>
                <th>Average</th>
                <th>Max</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {computationNames.map((name) => {
                const metric = snapshot.computations[name];
                return (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{metric.runCount}</td>
                    <td>{formatDuration(metric.lastDuration)}</td>
                    <td>{formatDuration(metric.averageDuration)}</td>
                    <td>{formatDuration(metric.maxDuration)}</td>
                    <td>{formatDuration(metric.totalDuration)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="measurement-table-wrapper">
        <h3>Actions</h3>
        {actionNames.length === 0 ? (
          <p className="empty-row">No action metrics yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Runs</th>
                <th>Last</th>
                <th>Average</th>
                <th>Max</th>
                <th>Total</th>
                <th>Last Metadata</th>
              </tr>
            </thead>
            <tbody>
              {actionNames.map((name) => {
                const metric = snapshot.actions[name];
                return (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{metric.runCount}</td>
                    <td>{formatDuration(metric.lastDuration)}</td>
                    <td>{formatDuration(metric.averageDuration)}</td>
                    <td>{formatDuration(metric.maxDuration)}</td>
                    <td>{formatDuration(metric.totalDuration)}</td>
                    <td className="metadata-cell">{serializeMetadata(metric.lastMetadata)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {lastExportJson ? (
        <div className="measurement-export-preview">
          <h3>Last Export Preview</h3>
          <pre>{lastExportJson}</pre>
        </div>
      ) : null}
    </section>
  );
}
