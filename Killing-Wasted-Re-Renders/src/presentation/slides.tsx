import { ProfilerPanel } from '../instrumentation/ProfilerPanel'

type DemoMode = 'profiler' | 'full' | 'ast' | null

export type SlideProps = {
  onDemo: (mode: DemoMode) => void
  slideNumber: number
  total: number
}

export type SlideDef = {
  Component: React.FC<SlideProps>
}

// ─── shared primitives ────────────────────────────────────────────────────────

const Gradient = 'bg-gradient-to-br from-[#6a1fc2] via-[#2a5ff5] to-[#00c4b4]'

function Footer({ n, light }: { n: number; light?: boolean }) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 h-9 flex items-center justify-between px-5 ${
        light ? 'bg-white' : ''
      }`}
    >
      <span className={`text-[10px] uppercase tracking-widest ${light ? 'text-[#aaa]' : 'text-white/40'}`}>
        JSWorld 2025
      </span>
      <span className={`text-xs flex items-center gap-1 ${light ? 'text-[#888]' : 'text-white/60'}`}>
        <span className={`w-3.5 h-3.5 rounded-sm ${light ? 'bg-[#ddd]' : 'bg-white/20'}`} />
        {n}
      </span>
    </div>
  )
}

// code token helpers
const kw = (s: string) => <span className="text-[#2a5ff5]">{s}</span>
const st = (s: string) => <span className="text-[#00c4b4]">{s}</span>
const cm = (s: string) => <span className="text-white/40">{s}</span>
const hl = (s: string) => <span className="text-[#a78bfa]">{s}</span>
const ok = (s: string) => <span className="text-[#4ade80]">{s}</span>
const er = (s: string) => <span className="text-[#f87171]">{s}</span>

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-black/40 rounded-lg p-4 text-[13px] leading-6 text-white/85 font-mono overflow-auto">
      <code>{children}</code>
    </pre>
  )
}

// ─── SLIDE 2: Hook ────────────────────────────────────────────────────────────

function S02_Hook({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[26px] font-light text-white mb-8 border-l-[3px] border-[#2a5ff5] pl-3">
        The problem
      </h2>
      <div className="flex flex-col gap-5 flex-1 justify-center">
        <div className="text-[28px] text-white/90 font-light leading-snug">
          ~50% of re-renders in your app<br />
          are <span className="text-[#f87171] font-normal">wasted</span>. Right now.
        </div>
        <div className="text-[18px] text-white/50 font-light leading-relaxed">
          You don't know which ones.<br />
          DevTools won't tell you.<br />
          React Profiler gives you timing — not causes.
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 3: Section Act 1 ───────────────────────────────────────────────────

function S03_Act1({ slideNumber }: SlideProps) {
  return (
    <div className={`w-full h-full flex items-center justify-center ${Gradient}`}>
      <div className="bg-white/95 rounded-lg px-16 py-10 text-center min-w-[55%]">
        <div className="text-[11px] text-[#888] tracking-widest mb-2">ACT 1</div>
        <h2 className="text-[32px] font-light text-[#1a3a6b] mb-3">The Problem</h2>
        <p className="text-[16px] text-[#555]">What we have vs. what we need</p>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 4: React Profiler code ─────────────────────────────────────────────

function S04_ProfilerCode({ slideNumber, onDemo }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-5 border-l-[3px] border-[#2a5ff5] pl-3">
        React Profiler API — what you get
      </h2>
      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 min-w-0">
          <Code>
{kw('return')} ({'\n'}
{'  '}&lt;{hl('Profiler')}{'\n'}
{'    '}id={st('"GraphNode"')}{'\n'}
{'    '}onRender={'{'}(id, phase, actualDuration) {'=>'} {'{'}{'\n'}
{'      '}console.log(id, phase, actualDuration){'\n'}
{'      '}{cm('// "GraphNode"  "update"  0.00')}{'\n'}
{'      '}{'\n'}
{'      '}{er('// ❌ which hook triggered?')}{'\n'}
{'      '}{er('// ❌ which dependency changed?')}{'\n'}
{'      '}{er('// ❌ reference churn vs real change?')}{'\n'}
{'    }'}{'}'}){'\n'}
{'  '}&gt;{'\n'}
{'    '}&lt;{hl('GraphNode')} /&gt;{'\n'}
{'  '}&lt;/{hl('Profiler')}&gt;{'\n'}
)
          </Code>
        </div>
        <div className="w-[220px] flex flex-col gap-3">
          <div className="bg-black/30 rounded-lg p-3 text-[11px] text-white/60 leading-5">
            <div className="text-[#2a5ff5] font-mono mb-2">onRender gives you:</div>
            <div>{ok('✓')} id — component name</div>
            <div>{ok('✓')} phase — mount / update</div>
            <div>{ok('✓')} actualDuration — ms</div>
            <div>{ok('✓')} baseDuration — ms</div>
            <div className="mt-2 border-t border-white/10 pt-2">
              <div>{er('✗')} which hook ran</div>
              <div>{er('✗')} which dep changed</div>
              <div>{er('✗')} reference churn</div>
              <div>{er('✗')} interaction context</div>
            </div>
          </div>
          <button
            onClick={() => onDemo('profiler')}
            className="bg-[#1a3a6b] hover:bg-[#2a5ff5] text-white text-xs px-3 py-2 rounded cursor-pointer border-0 transition-colors"
          >
            Launch demo — Profiler only (F)
          </button>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 5: Profiler panel live ─────────────────────────────────────────────

function S05_ProfilerLive({ slideNumber, onDemo }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-4 border-l-[3px] border-[#2a5ff5] pl-3">
        Profiler data — after dragging nodes
      </h2>
      <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <ProfilerPanel resetVersion={0} />
        </div>
        <div className="w-[220px] flex flex-col gap-3 text-[12px] text-white/60 leading-6">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-[#f87171] mb-1">What's missing:</div>
            <div>We know <strong className="text-white/80">GraphNode</strong> updated 47 times.</div>
            <div className="mt-2">We don't know:</div>
            <div className="ml-2 text-white/40">— which hook</div>
            <div className="ml-2 text-white/40">— which dep</div>
            <div className="ml-2 text-white/40">— was it real?</div>
          </div>
          <button
            onClick={() => onDemo('profiler')}
            className="bg-[#1a3a6b] hover:bg-[#2a5ff5] text-white text-xs px-3 py-2 rounded cursor-pointer border-0 transition-colors"
          >
            Run demo to collect data
          </button>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 6: Comparison table ────────────────────────────────────────────────

function S06_Comparison({ slideNumber }: SlideProps) {
  const rows = [
    ['Component re-rendered', true, true],
    ['Render duration (ms)', true, true],
    ['Which hook triggered', false, true],
    ['Which dep changed', false, true],
    ['Value type (object / fn)', false, true],
    ['Reference churn vs real change', false, true],
    ['Interaction context (drag / select)', false, true],
    ['47 / 50 renders had churn', false, true],
  ] as const

  return (
    <div className="w-full h-full flex flex-col px-12 pt-8 pb-12 bg-white">
      <h2 className="text-[22px] font-medium text-[#1a3a6b] mb-4 border-b border-[#e0e0e0] pb-2">
        Profiler API vs hook interceptor
      </h2>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium w-[50%]">Signal</th>
            <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium w-[25%]">
              {'<Profiler>'}
            </th>
            <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium w-[25%]">
              Hook interceptor
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, profiler, hook], i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-[#f7f9ff]' : ''}>
              <td className="px-3 py-2 border-b border-[#e5e5e5] text-[#333]">{label}</td>
              <td className="px-3 py-2 border-b border-[#e5e5e5]">
                {profiler ? (
                  <span className="text-[#146c2e] font-medium">✓ yes</span>
                ) : (
                  <span className="text-[#dc2626]">✗ no</span>
                )}
              </td>
              <td className="px-3 py-2 border-b border-[#e5e5e5]">
                {hook ? (
                  <span className="text-[#146c2e] font-medium">✓ yes</span>
                ) : (
                  <span className="text-[#dc2626]">✗ no</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-[#888] mt-3">
        React DevTools issue #16477, #21856 — hook-level data in Profiler: open since 2019.
      </p>
      <Footer n={slideNumber} light />
    </div>
  )
}

// ─── SLIDE 7: Section Act 2 ───────────────────────────────────────────────────

function S07_Act2({ slideNumber }: SlideProps) {
  return (
    <div className={`w-full h-full flex items-center justify-center ${Gradient}`}>
      <div className="bg-white/95 rounded-lg px-16 py-10 text-center min-w-[55%]">
        <div className="text-[11px] text-[#888] tracking-widest mb-2">ACT 2</div>
        <h2 className="text-[32px] font-light text-[#1a3a6b] mb-3">
          Compile-time Instrumentation
        </h2>
        <p className="text-[16px] text-[#555]">
          What if the build pipeline adds the tracking?
        </p>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 8: Babel transform ─────────────────────────────────────────────────

function S08_BabelTransform({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-5 border-l-[3px] border-[#6a1fc2] pl-3">
        Babel AST transform — zero source changes
      </h2>
      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-[11px] uppercase tracking-widest text-[#a78bfa] mb-2">AST</div>
              <div className="text-[12px] text-white/75 leading-5">
                Code represented as <strong className="text-white">structure</strong>, not raw text.
                Function. Call. Arguments. Dependencies.
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-[11px] uppercase tracking-widest text-[#2a5ff5] mb-2">Babel</div>
              <div className="text-[12px] text-white/75 leading-5">
                Reads that tree, walks it, and <strong className="text-white">rewrites code before runtime</strong>.
              </div>
            </div>
          </div>
          <div className="text-[11px] text-white/40 uppercase tracking-widest">Before (what you write)</div>
          <Code>
{kw('useEffect')}(() {'=>'} syncState(), [nodeStyle, onSelect])
          </Code>
          <div className="text-[11px] text-white/40 uppercase tracking-widest mt-1">After (Babel plugin, automatic)</div>
          <Code>
{kw('useTrackedEffect')}({'\n'}
{'  '}{st('"GraphNode"')},{'   '}{cm('// ← component name (from AST)')}{'\n'}
{'  '}{st('"useEffect_0"')},{'  '}{cm('// ← hook id (counter per component)')}{'\n'}
{'  '}() {'=>'} syncState(),{'\n'}
{'  '}[nodeStyle, onSelect]{'\n'}
)
          </Code>
        </div>
        <div className="w-[220px] flex flex-col gap-3">
          <div className="bg-black/30 rounded-lg p-3 text-[11px] text-white/70 leading-5">
            <div className="text-[#a78bfa] font-mono mb-2">Why AST matters here</div>
            <div>no string matching</div>
            <div>exact component context</div>
            <div>exact hook position</div>
            <div className="mt-2 border-t border-white/10 pt-2">
              <div className="text-[#a78bfa] font-mono mb-1">Then Babel rewrites:</div>
              <div>useEffect → useTrackedEffect</div>
              <div>useMemo → useTrackedMemo</div>
              <div>useCallback → useTrackedCallback</div>
            </div>
            <div className="mt-2 border-t border-white/10 pt-2 text-[#00c4b4]">
              Auto-injects import at Program.exit
            </div>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 8b: How the plugin traverses AST ──────────────────────────────────

function S08b_ASTTraversal({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-10 pt-8 pb-12 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-6 border-l-[3px] border-[#a78bfa] pl-3">
        Three AST visitors — that's the whole plugin
      </h2>
      <div className="bg-[#111827] border border-white/10 rounded-lg px-4 py-3 text-[12px] text-white/65 mb-4">
        Not magic. Just structured access to code.
      </div>
      <div className="grid grid-cols-3 gap-4 flex-1">
        <div className="bg-white/5 rounded-lg p-4 border-t-[3px] border-[#a78bfa]">
          <div className="text-[#a78bfa] text-[11px] uppercase tracking-widest mb-3">1. Function visitor</div>
          <div className="font-mono text-[13px] text-white/80 mb-3">find the component</div>
          <div className="text-[12px] text-white/50 leading-5">
            Uppercase name?<br />Has a return?<br />
            <span className="text-white/80">→ set componentName</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border-t-[3px] border-[#2a5ff5]">
          <div className="text-[#2a5ff5] text-[11px] uppercase tracking-widest mb-3">2. CallExpression</div>
          <div className="font-mono text-[13px] text-white/80 mb-3">find tracked hooks</div>
          <div className="text-[12px] text-white/50 leading-5">
            useEffect / useMemo / useCallback<br />
            <span className="text-white/80">→ inject componentName + "useEffect_0"</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border-t-[3px] border-[#00c4b4]">
          <div className="text-[#00c4b4] text-[11px] uppercase tracking-widest mb-3">3. Program.exit</div>
          <div className="font-mono text-[13px] text-white/80 mb-3">finish the file</div>
          <div className="text-[12px] text-white/50 leading-5">
            if anything was instrumented<br />
            <span className="text-white/80">→ inject import from hookTrackers once</span>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 9: Enable ──────────────────────────────────────────────────────────

function S09_Enable({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-5 border-l-[3px] border-[#00c4b4] pl-3">
        Toggle with an env var — nothing else changes
      </h2>
      <div className="flex gap-6 flex-1 min-h-0 items-start">
        <div className="flex-1">
          <Code>
{cm('# package.json scripts')}{'\n'}
{st('"dev"')}{': '}{st('"vite"')}{cm('                              // clean')}{'\n'}
{st('"fix"')}{': '}{st('"VITE_ENABLE_BABEL_INSTRUMENTATION=true vite"')}{cm('  // instrumented')}{'\n'}
{'\n'}
{cm('# vite-plugin.ts')}{'\n'}
{kw('const')} enabled = options?.enabled === {kw('true')}{'\n'}
{cm('// default: off — production build is never instrumented')}
          </Code>
        </div>
        <div className="w-[220px] flex flex-col gap-3 text-[12px]">
          <div className="bg-black/30 rounded-lg p-3 text-white/70 leading-6">
            <div className="text-[#00c4b4] mb-1">npm run dev</div>
            <div className="text-white/40 text-[11px]">clean graph, no panels</div>
            <div className="text-[#2a5ff5] mt-3 mb-1">npm run fix</div>
            <div className="text-white/40 text-[11px]">panels appear, hooks tracked</div>
          </div>
          <div className="bg-[#1a3a6b]/40 rounded-lg p-3 text-[11px] text-white/60 leading-5 border border-[#2a5ff5]/30">
            Production code is never instrumented. Same binary. Zero overhead in prod.
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 10: Full live demo ─────────────────────────────────────────────────

function S10_LiveDemo({ slideNumber, onDemo }: SlideProps) {
  return (
    <div className={`w-full h-full flex items-center justify-center ${Gradient}`}>
      <div className="bg-white/95 rounded-lg px-12 py-10 text-center min-w-[55%]">
        <div className="text-[11px] text-[#888] tracking-widest mb-2">LIVE DEMO</div>
        <h2 className="text-[28px] font-light text-[#1a3a6b] mb-6">
          Full instrumentation
        </h2>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => onDemo('profiler')}
            className="bg-[#1a3a6b] hover:bg-[#2a5ff5] text-white px-6 py-3 rounded-lg cursor-pointer border-0 text-[14px] transition-colors"
          >
            Profiler only
          </button>
          <button
            onClick={() => onDemo('full')}
            className="bg-[#6a1fc2] hover:bg-[#2a5ff5] text-white px-6 py-3 rounded-lg cursor-pointer border-0 text-[14px] transition-colors"
          >
            Full instrumentation
          </button>
        </div>
        <p className="text-[12px] text-[#888] mt-5">Press F to launch · Esc to return</p>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 10b: trackerStore architecture ────────────────────────────────────

function S10b_TrackerStore({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-10 pt-8 pb-12 bg-[#0d0d12]">
      <h2 className="text-[20px] font-light text-white mb-4 border-l-[3px] border-[#2a5ff5] pl-3">
        trackerStore — measuring without triggering renders
      </h2>
      <div className="flex gap-5 flex-1 min-h-0 items-start">
        <div className="flex-1">
          <Code>
{kw('type')} ComponentId = {st('"APP_ROOT"')} | {st('"GRAPH_NODE"')} | {st('"DETAILS_PANEL"')}{'\n'}
{kw('type')} InteractionType = {st('"DRAG_NODE"')} | {st('"SELECT_NODE"')} | {st('"PAN_CANVAS"')}{'\n'}
{'\n'}
{cm('// Module-level state — NOT React state')}{'\n'}
{cm('// Mutations here never trigger a re-render')}{'\n'}
{kw('let')} state: TrackerSnapshot = createInitialState(){'\n'}
{'\n'}
{cm('// DebugPanel polls this every 220ms')}{'\n'}
{kw('export const')} getTrackerSnapshot = (): TrackerSnapshot {'=>'} copyState(state){'\n'}
{'\n'}
{cm('// Interaction windows group activity by user action')}{'\n'}
{kw('const')} handleNodeDragStart = () {'=>'} startInteraction({st('"DRAG_NODE"')}){'\n'}
{kw('const')} handleNodeDragStop = () {'=>'} endInteraction({st('"DRAG_NODE"')}){'\n'}
{cm('// → all hook runs between start/stop are tagged DRAG_NODE')}
          </Code>
        </div>
        <div className="w-[200px] flex flex-col gap-3 text-[11px]">
          <div className="bg-black/30 rounded-lg p-3 text-white/70 leading-5">
            <div className="text-[#f87171] mb-2">Why not useState?</div>
            <div>Every tracker update would re-render the component we're measuring.</div>
            <div className="mt-2 text-white/40">Module-level state + 220ms polling = zero render cost.</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-white/70 leading-5">
            <div className="text-[#2a5ff5] mb-1">What's stored per hook run</div>
            <div className="font-mono text-[10px] text-white/60">
              component · hookId · kind<br />
              runs · byInteraction<br />
              depChanges[]
            </div>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 11: Problem found ──────────────────────────────────────────────────

function S11_ProblemFound({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-5 border-l-[3px] border-[#f87171] pl-3">
        What the instrumentation found
      </h2>
      <div className="flex gap-6 flex-1 min-h-0 items-start">
        <div className="flex-1">
          <table className="w-full border-collapse text-[12px] bg-white rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Signal</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Measured value</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">What it means</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Interaction scope', 'DRAG_NODE · 50 runs', 'We only measured the drag sequence'],
                ['Component', 'GRAPH_NODE', 'Problem appears in the node component'],
                ['Hook', 'useEffect_0', 'Same hook shows up repeatedly'],
                ['Changed dep', 'dep[0]', 'The first dependency is the trigger'],
                ['Type', 'object', 'Reference identity matters here'],
                ['Pattern', '47 / 50 renders', 'Enough to call this systemic'],
                ['Diagnosis', 'reference-only churn', 'Same meaning, new reference'],
              ].map(([signal, value, meaning], i) => (
                <tr key={signal} className={i % 2 === 1 ? 'bg-[#f7f9ff]' : ''}>
                  <td className="px-3 py-2 border-b border-[#e5e5e5] text-[#1a3a6b] font-medium">{signal}</td>
                  <td className={`px-3 py-2 border-b border-white/10 font-mono ${
                    signal === 'Diagnosis'
                      ? 'text-[#0f766e]'
                      : signal === 'Pattern'
                        ? 'text-[#dc2626]'
                        : 'text-[#333]'
                  }`}
                  >
                    {value}
                  </td>
                  <td className="px-3 py-2 border-b border-[#e5e5e5] text-[#555]">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-[220px] flex flex-col gap-3">
          <div className="bg-black/30 rounded-lg p-3 text-[12px] text-white/70 leading-6">
            <div className="text-[#f87171] mb-2">This is enough</div>
            <div>hook + dependency index + type + frequency = diagnosis</div>
            <div className="mt-2 border-t border-white/10 pt-2 text-white/50 text-[11px]">
              We do not need five more charts once the pattern is this clear.
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-[12px] text-white/70 leading-6">
            <div className="text-[#f87171] mb-2">Root cause</div>
            <div className="font-mono text-[11px]">
              {'nodes.map(node => ({'}
              <br />
              {'  ...node,'}
              <br />
              {'  style: { ...s }  '}
              <span className="text-[#f87171]">// ← new ref</span>
              <br />
              {'}))'}</div>
            <div className="mt-2 border-t border-white/10 pt-2 text-white/50 text-[11px]">
              dragPulse applied to ALL nodes, not just the dragged one.
              React sees new reference → re-renders every child.
            </div>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 11b: findChangedDependencies ──────────────────────────────────────

function S11b_FindChangedDeps({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-10 pt-8 pb-12 bg-[#0d0d12]">
      <h2 className="text-[20px] font-light text-white mb-4 border-l-[3px] border-[#f87171] pl-3">
        How we detect reference-only churn
      </h2>
      <div className="flex gap-5 flex-1 min-h-0 items-start">
        <div className="flex-1 flex flex-col gap-3">
          <div className="bg-[#111827] border border-white/10 rounded-lg px-4 py-3 text-[12px] text-white/65">
            We diagnose reference behavior because React itself compares references.
          </div>
          <table className="w-full border-collapse text-[12px] bg-white rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Check</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Condition</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Why it matters</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1', 'prev !== next', 'React already thinks the dependency changed'],
                ['2', 'valueKind === "object"', 'Objects are reference-sensitive'],
                ['3', 'pattern repeats N / M renders', 'This is systemic, not accidental'],
                ['4', 'same interaction scope', 'We can tie the churn to a user action'],
              ].map(([step, condition, why], i) => (
                <tr key={step} className={i % 2 === 1 ? 'bg-[#f7f9ff]' : ''}>
                  <td className="px-3 py-2 border-b border-[#e5e5e5] text-[#1a3a6b] font-medium">{step}</td>
                  <td className="px-3 py-2 border-b border-[#e5e5e5] text-[#b45309] font-mono">{condition}</td>
                  <td className="px-3 py-2 border-b border-[#e5e5e5] text-[#555]">{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-black/30 rounded-lg p-3 text-[11px] text-white/60 leading-5 font-mono">
            if (!Object.is(previous[i], current[i])) → classifyValue(current[i]) → aggregate pattern
          </div>
        </div>
        <div className="w-[200px] flex flex-col gap-3 text-[11px]">
          <div className="bg-black/30 rounded-lg p-3 text-white/70 leading-5">
            <div className="text-[#f87171] mb-2">The detection rule</div>
            <div>{ok('prev !== next')} (Object.is)</div>
            <div className="text-white/40 mt-1">+ valueKind === "object"</div>
            <div className="text-white/40">+ pattern repeats N/M renders</div>
            <div className="mt-2 text-[#f87171]">→ reference-only churn</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-white/70 leading-5">
            <div className="text-[#00c4b4] mb-1">Why not deep equal?</div>
            <div className="text-white/50">We don't need to know IF values changed — React already re-rendered. We need to know WHY it thought they did.</div>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 12: Section Act 3 ──────────────────────────────────────────────────

function S12_Act3({ slideNumber }: SlideProps) {
  return (
    <div className={`w-full h-full flex items-center justify-center ${Gradient}`}>
      <div className="bg-white/95 rounded-lg px-16 py-10 text-center min-w-[55%]">
        <div className="text-[11px] text-[#888] tracking-widest mb-2">ACT 3</div>
        <h2 className="text-[32px] font-light text-[#1a3a6b] mb-3">The Fix</h2>
        <p className="text-[16px] text-[#555]">Structural sharing — 50 lines</p>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 13: Fix code ───────────────────────────────────────────────────────

function S13_FixCode({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-5 border-l-[3px] border-[#00c4b4] pl-3">
        Structural sharing — same reference if nothing changed
      </h2>
      <div className="flex gap-6 flex-1 min-h-0 items-start">
        <div className="flex-1 flex flex-col gap-3">
          <table className="w-full border-collapse text-[12px] bg-white rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Diagnostic step</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Measured signal</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Conclusion</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Most frequently changing props', 'GRAPH_NODE · data changes every drag tick', 'A new object reference reaches the node'],
                ['How many nodes show it?', 'All 24 GraphNodes', 'The issue is above GraphNode, not inside one node'],
                ['APP_ROOT / runtimeNodesMemo', 'Runs on every dragSample update', 'nodes.map() recreates the whole graph on drag'],
              ].map(([step, signal, conclusion], i) => (
                <tr key={step} className={i % 2 === 1 ? 'bg-[#f7f9ff]' : ''}>
                  <td className="px-3 py-2 border-b border-[#e5e5e5] text-[#1a3a6b] font-medium">{step}</td>
                  <td className="px-3 py-2 border-b border-[#e5e5e5] text-[#dc2626] font-mono">{signal}</td>
                  <td className="px-3 py-2 border-b border-[#e5e5e5] text-[#555]">{conclusion}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[11px] text-white/40 uppercase tracking-widest mt-2">Before — new object every render</div>
          <Code>
nodes.map(node {'=>'} {'({'}{'\n'}
{'  '}...node,{'\n'}
{'  '}style: {'{ '}...computedStyle{'  '}{er('// ← new reference every render')}{'\n'}
{'}'}))
          </Code>
          <div className="text-[11px] text-white/40 uppercase tracking-widest mt-2">After — structural sharing</div>
          <Code>
{kw('if')} ({'\n'}
{'  '}sourceNode === cached.sourceNode{'\n'}
{'  '}&& viewportBucket === cached.viewportBucket{'\n'}
{'  '}&& dragPulse === cached.dragPulse{'\n'}
) {'{'}{'\n'}
{'  '}{kw('return')} cached.node{'  '}{ok('// ← same reference → no re-render')}{'\n'}
{'}'}{'\n'}
{cm('// dragPulse applied only to the dragged node, not all 24')}
          </Code>
        </div>
        <div className="w-[200px] flex flex-col gap-3">
          <div className="bg-black/30 rounded-lg p-3 text-[11px] text-white/70 leading-5">
            <div className="text-[#00c4b4] mb-2">Object identity matters</div>
            <div>React uses <strong className="text-white/85">===</strong> for dep comparison.</div>
            <div className="mt-2">If reference didn't change → effect doesn't run → no re-render.</div>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 14: React.memo ────────────────────────────────────────────────────

function S14_ReactMemo({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-10 pt-8 pb-12 bg-[#0d0d12]">
      <h2 className="text-[20px] font-light text-white mb-4 border-l-[3px] border-[#f87171] pl-3">
        "You didn't need instrumentation to know about React.memo"
      </h2>
      <div className="flex gap-5 flex-1 min-h-0">
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="text-[11px] text-white/40 uppercase tracking-widest">What instrumentation showed — useRenderTracker, Fixed mode</div>
          <div className="bg-black/40 rounded-lg p-3 text-[12px] font-mono leading-6 text-white/85">
            <div>{cm('// GRAPH_NODE, DRAG_NODE: 3590 renders')}</div>
            <div>{cm('// changedProps → ')}{ok('empty')} {cm('on most of them')}</div>
            <div>{cm('// same node object, same values, zero changes')}</div>
            <div className="mt-2">{cm('// That\'s the signal:')}</div>
            <div>{cm('// renders happen, nothing actually changes')}</div>
            <div>{cm('// → React.memo will eliminate them completely')}</div>
          </div>
          <div className="text-[11px] text-white/40 uppercase tracking-widest">The fix</div>
          <div className="bg-black/40 rounded-lg p-3 text-[12px] font-mono leading-6 text-white/85">
            <div>{kw('const')} ProfiledNode = {hl('React.memo')}((props) {'=> { ... }'})</div>
          </div>
        </div>
        <div className="w-[230px] flex flex-col gap-3 text-[12px]">
          <div className="bg-[#1a1a2e] rounded-lg p-3 border border-white/10">
            <div className="text-white/50 text-[11px] mb-2 uppercase tracking-wide">Without instrumentation</div>
            <div className="text-white/70 leading-5">You add React.memo <em>everywhere</em> as cargo-cult.</div>
            <div className="text-white/40 text-[11px] mt-2">No proof. No numbers. Guess-based optimization.</div>
          </div>
          <div className="bg-[#0d2010] rounded-lg p-3 border border-[#4ade80]/30">
            <div className="text-[#4ade80] text-[11px] mb-2 uppercase tracking-wide">With instrumentation</div>
            <div className="text-white/70 leading-5">You add React.memo <em>here, specifically</em>, because changedProps = 0.</div>
            <div className="text-[#4ade80] text-[11px] mt-2">And you have the number to prove it worked.</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-[11px] text-white/50 leading-5">
            React.memo works because structural sharing already gave stable references. Without that — memo would have been useless.
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 15: Before/After ───────────────────────────────────────────────────

function S15_BeforeAfter({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-8 pb-12 bg-white">
      <h2 className="text-[22px] font-medium text-[#1a3a6b] mb-3 border-b border-[#e0e0e0] pb-2">
        Before / After — same drag sequence, measured by instrumentation
      </h2>
      <table className="w-full border-collapse text-[12px] mb-3">
        <thead>
          <tr>
            <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Metric</th>
            <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Problematic</th>
            <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Fixed</th>
            <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">What fixed it</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['total effects', '2029', '303', 'structural sharing'],
            ['total memos', '2270', '741', 'structural sharing'],
            ['GRAPH_NODE renders', '3774', '~200', 'structural sharing + React.memo'],
            ['reference-only churn', '47/50', '0/50', 'structural sharing'],
            ['changedProps on GRAPH_NODE', 'high', '0', 'React.memo skips render'],
          ].map(([m, b, a, fix], i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-[#f7f9ff]' : ''}>
              <td className="px-3 py-2 border-b border-[#e5e5e5] font-medium text-[#1a3a6b]">{m}</td>
              <td className="px-3 py-2 border-b border-[#e5e5e5] text-[#dc2626]">{b}</td>
              <td className="px-3 py-2 border-b border-[#e5e5e5] text-[#146c2e] font-medium">{a}</td>
              <td className="px-3 py-2 border-b border-[#e5e5e5] text-[#555] text-[11px]">{fix}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-4 py-2 text-[11px] text-[#166534]">
        Every number confirmed by the Debug panel — not estimated. Instrumentation told us what to fix and proved it worked.
      </div>
      <Footer n={slideNumber} light />
    </div>
  )
}

// ─── SLIDE 16: Takeaways ──────────────────────────────────────────────────────

function S16_Takeaways({ slideNumber }: SlideProps) {
  const items = [
    ['Production code ≠ instrumented code', 'You don\'t have to choose. Env var toggles it.'],
    ['Object identity matters more than you think', 'One new reference fans out to every child that depends on it.'],
    ['Compile-time tooling is the next level', 'DevTools show WHAT. AST transform shows WHY.'],
    ['Structural sharing is correctness, not optimization', '50 lines. Eliminates the entire class of problem.'],
  ]

  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-6 border-l-[3px] border-[#2a5ff5] pl-3">
        Takeaways
      </h2>
      <div className="grid grid-cols-2 gap-4 flex-1">
        {items.map(([title, body], i) => (
          <div key={i} className="bg-white/5 rounded-lg p-4 border-l-[3px] border-[#2a5ff5]">
            <div className="text-white font-medium text-[14px] mb-1">{title}</div>
            <div className="text-white/50 text-[12px] leading-5">{body}</div>
          </div>
        ))}
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── SLIDE 17: End ────────────────────────────────────────────────────────────

function S17_End({ slideNumber }: SlideProps) {
  return (
    <div className={`w-full h-full flex flex-col justify-end pb-14 px-12 ${Gradient}`}>
      <h1 className="text-[36px] font-light text-white leading-tight max-w-[85%] mb-4">
        Thank you
      </h1>
      <p className="text-[16px] text-white/65 font-light">
        github.com/ataztech910 · Killing Wasted Re-Renders
      </p>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── slide registry ───────────────────────────────────────────────────────────

export const SLIDES: SlideDef[] = [
  { Component: S02_Hook },
  { Component: S03_Act1 },
  { Component: S04_ProfilerCode },
  { Component: S05_ProfilerLive },
  { Component: S06_Comparison },
  { Component: S07_Act2 },
  { Component: S08_BabelTransform },
  { Component: S08b_ASTTraversal },
  { Component: S09_Enable },
  { Component: S10_LiveDemo },
  { Component: S10b_TrackerStore },
  { Component: S11_ProblemFound },
  { Component: S11b_FindChangedDeps },
  { Component: S12_Act3 },
  { Component: S13_FixCode },
  { Component: S14_ReactMemo },
  { Component: S15_BeforeAfter },
  { Component: S16_Takeaways },
  { Component: S17_End },
]
