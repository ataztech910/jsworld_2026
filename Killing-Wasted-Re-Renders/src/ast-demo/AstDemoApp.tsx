import { useState } from 'react'
import './ast-demo.css'
import { resetMetrics } from './measurement/api'
import { OrdersDashboard } from './components/OrdersDashboard'
import { OrdersDashboardFixed } from './components/OrdersDashboardFixed'
import { ResultsReportViewer } from './components/ResultsReportViewer'
import astJson from './data/ast-experiment.json'
import fullJson from './data/full-context-experiment.json'

type View = 'dashboard' | 'results'
type DashMode = 'before' | 'after'

const astJsonStr = JSON.stringify(astJson)
const fullJsonStr = JSON.stringify(fullJson)

export function AstDemoApp() {
  const [view, setView] = useState<View>('dashboard')
  const [dashMode, setDashMode] = useState<DashMode>('before')

  function switchDashMode(next: DashMode) {
    resetMetrics()
    setDashMode(next)
  }

  return (
    <div
      style={{
        fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
        background: 'radial-gradient(circle at top left, #f9fbff 0%, #e8f0fb 55%, #d9e8f8 100%)',
        minHeight: '100%',
        color: '#182332',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {/* Header */}
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>
            Orders Dashboard Benchmark
          </h1>
          <p style={{ margin: '0 0 12px', color: '#395470', fontSize: 13 }}>
            AST + AI driven code evolution — intentionally inefficient React demo
          </p>

          {/* Tab switch */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setView('dashboard')}
              style={tabStyle(view === 'dashboard')}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('results')}
              style={tabStyle(view === 'results')}
            >
              Results Viewer
            </button>

            {/* Before / After toggle — only on dashboard tab */}
            {view === 'dashboard' && (
              <div style={{
                marginLeft: 16,
                display: 'flex',
                gap: 6,
                alignItems: 'center',
                background: '#e8f0fb',
                borderRadius: 10,
                padding: '4px 8px',
              }}>
                <span style={{ fontSize: 12, color: '#395470', marginRight: 4 }}>AST fix:</span>
                <button
                  onClick={() => switchDashMode('before')}
                  style={modeStyle(dashMode === 'before', 'before')}
                >
                  ✗ Before
                </button>
                <button
                  onClick={() => switchDashMode('after')}
                  style={modeStyle(dashMode === 'after', 'after')}
                >
                  ✓ After
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        {view === 'dashboard' ? (
          dashMode === 'before'
            ? <OrdersDashboard />
            : <OrdersDashboardFixed />
        ) : (
          <ResultsReportViewer
            preloadedAstJson={astJsonStr}
            preloadedFullJson={fullJsonStr}
          />
        )}
      </div>
    </div>
  )
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    border: '1px solid',
    borderColor: active ? '#7699c5' : '#a9bdd7',
    borderRadius: 8,
    background: active ? '#d9e9ff' : '#eef4ff',
    minHeight: 34,
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: 14,
    color: 'black',
  }
}

function modeStyle(active: boolean, mode: 'before' | 'after'): React.CSSProperties {
  const colors = {
    before: { bg: '#fde8e8', border: '#e57373', activeBg: '#f44336', activeColor: '#fff' },
    after:  { bg: '#e8f5e9', border: '#81c784', activeBg: '#2e7d32', activeColor: '#fff' },
  }
  const c = colors[mode]
  return {
    border: `1px solid ${active ? c.activeBg : c.border}`,
    borderRadius: 6,
    background: active ? c.activeBg : c.bg,
    color: active ? c.activeColor : '#333',
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 700 : 400,
  }
}
