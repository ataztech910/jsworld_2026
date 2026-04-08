import { useState } from 'react';
import { OrdersDashboard } from './components/OrdersDashboard';
import { ResultsReportViewer } from './components/ResultsReportViewer';

function App() {
  const [view, setView] = useState<'dashboard' | 'results'>('dashboard');

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Orders Dashboard Benchmark</h1>
        <p>
          Intentionally inefficient React + TypeScript demo for AST + AI driven code evolution
          experiments.
        </p>
        <div className="app-view-switch">
          <button
            className={view === 'dashboard' ? 'is-active' : ''}
            onClick={() => setView('dashboard')}
          >
            Dashboard
          </button>
          <button className={view === 'results' ? 'is-active' : ''} onClick={() => setView('results')}>
            Results Viewer
          </button>
        </div>
      </header>
      {view === 'dashboard' ? <OrdersDashboard /> : <ResultsReportViewer />}
    </main>
  );
}

export default App;
