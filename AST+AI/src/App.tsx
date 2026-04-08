import { OrdersDashboard } from './components/OrdersDashboard';

function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Orders Dashboard Benchmark</h1>
        <p>
          Intentionally inefficient React + TypeScript demo for AST + AI driven code evolution
          experiments.
        </p>
      </header>
      <OrdersDashboard />
    </main>
  );
}

export default App;
