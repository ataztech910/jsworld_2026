import type { SlideProps, SlideDef } from './slides'

const Gradient = 'bg-gradient-to-br from-[#6a1fc2] via-[#2a5ff5] to-[#00c4b4]'

function Footer({ n }: { n: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-9 flex items-center justify-between px-5">
      <span className="text-[10px] uppercase tracking-widest text-white/40">JSWorld 2026</span>
      <span className="text-xs flex items-center gap-1 text-white/60">
        <span className="w-3.5 h-3.5 rounded-sm bg-white/20" />
        {n}
      </span>
    </div>
  )
}

// ─── S3: The Gap in AI Tooling ────────────────────────────────────────────────

function T3S03_GapInAI({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <div className="mb-5">
        <span className="text-[11px] uppercase tracking-widest text-[#f57222]/80 font-semibold">Part 1 · The Problem</span>
        <h2 className="text-[26px] font-light text-white mt-1 border-l-[3px] border-[#f57222] pl-3">
          AI fails at relevance, not at correctness
        </h2>
      </div>
      <div className="flex flex-1 gap-8">
        <div className="flex-1 flex flex-col gap-4">
          <p className="text-[13px] text-white/55 leading-relaxed">
            GitHub Copilot, Cursor, ChatGPT — they write code well.<br />
            But they work with <span className="text-white/85 font-semibold">text</span> — they don't understand <span className="text-white/85 font-semibold">structure</span>.
          </p>
          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-white/8">
            <div className="text-[10px] text-white/35 uppercase tracking-wider mb-2">You ask:</div>
            <p className="text-[13px] text-[#2a5ff5] font-mono italic">"Optimize this component for performance"</p>
            <div className="text-[10px] text-white/35 uppercase tracking-wider mt-3 mb-2">AI responds:</div>
            <div className="space-y-1 text-[12px] text-white/50 font-mono">
              <div>• Consider adding useMemo for expensive calculations</div>
              <div>• You might want to use React.memo</div>
              <div>• useCallback could help with event handlers</div>
            </div>
          </div>
          <div className="rounded-xl border border-[#f57222]/25 bg-[#f57222]/8 p-4">
            <div className="text-[11px] text-[#f57222] uppercase tracking-wider mb-2">The real problem</div>
            <p className="text-[14px] text-white/80 leading-relaxed">
              AI is technically correct.<br />
              It just doesn't know <em>where</em> the problem is.
            </p>
          </div>
        </div>
        <div className="w-[250px] flex flex-col gap-4 justify-center">
          <div className="rounded-xl border border-[#2a5ff5]/30 bg-[#2a5ff5]/8 p-5">
            <p className="text-[13px] text-white/70 leading-relaxed">
              It sees text — not scope, not call sites, not which specific expression is the bottleneck.
            </p>
          </div>
          <div className="rounded-xl border border-[#00c4b4]/25 bg-[#00c4b4]/5 p-4">
            <p className="text-[13px] text-white/75 font-light">
              <span className="text-[#00c4b4] font-semibold">The question:</span><br />
              What if we gave AI the structural understanding it's missing?
            </p>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S4: What AI Lacks ────────────────────────────────────────────────────────

function T3S04_WhatAILacks({ slideNumber }: SlideProps) {
  const rows = [
    ['Understands meaning', 'Understands structure'],
    ['Generates suggestions', 'Navigates precisely'],
    ['Works with text', 'Works with syntax tree'],
    ['Sees patterns', 'Sees exact locations'],
    ['"add useMemo everywhere"', '"line 53, this expression — here\'s why"'],
  ]
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[26px] font-light text-white mb-5 border-l-[3px] border-[#2a5ff5] pl-3">
        What AI lacks — and what AST provides
      </h2>
      <div className="flex-1 flex flex-col justify-center gap-3">
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="text-[11px] text-[#f57222] uppercase tracking-widest font-semibold text-center py-2 bg-[#f57222]/10 rounded-lg">
            AI (language model)
          </div>
          <div className="text-[11px] text-[#00c4b4] uppercase tracking-widest font-semibold text-center py-2 bg-[#00c4b4]/10 rounded-lg">
            AST (code structure)
          </div>
        </div>
        <div className="space-y-2">
          {rows.map(([left, right], i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a1010] border border-[#f57222]/15 rounded-lg px-4 py-2.5 text-[13px] text-white/60 font-mono">
                {left}
              </div>
              <div className="bg-[#0a1a18] border border-[#00c4b4]/15 rounded-lg px-4 py-2.5 text-[13px] text-white/85 font-mono">
                {right}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <span className="text-[14px] text-white/45">Complementary forces, not competitors — </span>
          <span className="text-[14px] text-[#2a5ff5] font-semibold">what if we combined them?</span>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S5: AST in One Minute ────────────────────────────────────────────────────

function T3S05_ASTInOneMinute({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <div className="mb-4">
        <span className="text-[11px] uppercase tracking-widest text-[#2a5ff5]/80 font-semibold">Part 2 · What AST Actually Is</span>
        <h2 className="text-[26px] font-light text-white mt-1 border-l-[3px] border-[#2a5ff5] pl-3">
          AST in one minute
        </h2>
      </div>
      <div className="flex flex-1 gap-8">
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-[11px] text-white/35 uppercase tracking-wider">Code — text for us</div>
          <div className="bg-[#12121a] rounded-xl px-5 py-4 font-mono text-[14px] text-[#00c4b4]">
            const x = a + b
          </div>
          <div className="text-[11px] text-white/35 uppercase tracking-wider mt-3">AST — tree for the compiler</div>
          <div className="bg-[#12121a] rounded-xl px-5 py-4 font-mono text-[12px] leading-7 flex-1">
            <div className="text-[#2a5ff5]">VariableDeclaration</div>
            <div className="ml-5 text-white/55">
              {'└── '}<span className="text-[#2a5ff5]">VariableDeclarator</span>
              <span className="text-white/35"> (x)</span>
            </div>
            <div className="ml-12 text-white/55">
              {'└── '}<span className="text-[#00c4b4]">BinaryExpression</span>
              <span className="text-white/35"> (+)</span>
            </div>
            <div className="ml-20 text-white/55">
              {'├── '}<span className="text-[#f57222]">Identifier</span>
              <span className="text-white/35"> (a)</span>
            </div>
            <div className="ml-20 text-white/55">
              {'└── '}<span className="text-[#f57222]">Identifier</span>
              <span className="text-white/35"> (b)</span>
            </div>
          </div>
        </div>
        <div className="w-[260px] flex flex-col gap-4 justify-center">
          <p className="text-[13px] text-white/60 leading-relaxed">
            Code is text for us. For the compiler — it's a tree.
          </p>
          <p className="text-[13px] text-white/60 leading-relaxed">
            Exact, unambiguous representation. No noise. Only structure.
          </p>
          <div className="rounded-xl border border-white/10 bg-white/3 p-4">
            <div className="text-[10px] text-white/35 uppercase tracking-wider mb-2">Tools</div>
            <div className="space-y-1 text-[12px] font-mono text-white/55">
              <div>@babel/parser + traverse</div>
              <div>TypeScript Compiler API</div>
              <div>ts-morph · jscodeshift · SWC</div>
            </div>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S6: Three Things ─────────────────────────────────────────────────────────

function T3S06_ThreeThings({ slideNumber }: SlideProps) {
  const items = [
    {
      num: '1',
      title: 'NAVIGATE PRECISELY',
      color: '#2a5ff5',
      bg: 'bg-[#2a5ff5]/10',
      border: 'border-[#2a5ff5]/30',
      detail: '"Find every inline function inside a .map() call"',
      sub: 'Deterministic. Zero hallucinations. Every single location.',
    },
    {
      num: '2',
      title: 'TRANSFORM SAFELY',
      color: '#00c4b4',
      bg: 'bg-[#00c4b4]/10',
      border: 'border-[#00c4b4]/30',
      detail: 'Rename variable, migrate API across entire codebase',
      sub: 'Knows all usages. Respects scope. No edge cases missed.',
    },
    {
      num: '3',
      title: 'ANALYZE STRUCTURALLY',
      color: '#f57222',
      bg: 'bg-[#f57222]/10',
      border: 'border-[#f57222]/30',
      detail: '"Component X violates 3 rules — line 250, 310, 421"',
      sub: 'Concrete locations. LLM says "consider optimizing". AST says where.',
    },
  ]
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[26px] font-light text-white mb-6 border-l-[3px] border-[#2a5ff5] pl-3">
        Three things AST can do that LLM can't
      </h2>
      <div className="flex flex-1 gap-4">
        {items.map((item) => (
          <div
            key={item.num}
            className={`flex-1 rounded-xl p-5 border ${item.border} ${item.bg} flex flex-col gap-3`}
          >
            <div className="text-[36px] font-bold" style={{ color: item.color }}>{item.num}</div>
            <div className="text-[11px] font-bold tracking-widest" style={{ color: item.color }}>{item.title}</div>
            <div className="text-[13px] text-white/75 font-mono italic leading-snug">{item.detail}</div>
            <div className="text-[12px] text-white/45 leading-relaxed mt-auto">{item.sub}</div>
          </div>
        ))}
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S7: Key Insight ──────────────────────────────────────────────────────────

function T3S07_KeyInsight({ slideNumber }: SlideProps) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center pb-14 ${Gradient}`}>
      <div className="text-center max-w-[620px] px-8">
        <p className="text-[42px] font-light text-white leading-tight mb-6">
          AST tells you <span className="font-semibold">WHERE.</span>
          <br />
          AI tells you <span className="font-semibold">WHAT TO DO.</span>
        </p>
        <div className="h-px w-24 bg-white/30 mx-auto mb-6" />
        <div className="grid grid-cols-3 gap-3 text-[12px]">
          <div className="bg-white/10 rounded-lg p-3 text-white/65">
            <div className="text-white/35 mb-1 uppercase tracking-wider text-[10px]">AST alone</div>
            Precise location,<br />template fix
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-white/90 border border-white/30">
            <div className="text-[#00c4b4] mb-1 uppercase tracking-wider text-[10px]">AST + AI</div>
            Bounded · actionable<br />reproducible
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-white/65">
            <div className="text-white/35 mb-1 uppercase tracking-wider text-[10px]">AI alone</div>
            Broad analysis,<br />generic advice
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S8: Benchmark Component ──────────────────────────────────────────────────

function T3S08_Benchmark({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <div className="mb-4">
        <span className="text-[11px] uppercase tracking-widest text-[#00c4b4]/80 font-semibold">Part 3 · The Experiment</span>
        <h2 className="text-[24px] font-light text-white mt-1 border-l-[3px] border-[#00c4b4] pl-3">
          OrdersDashboard — three classes of anti-patterns
        </h2>
      </div>
      <div className="flex flex-1 gap-5">
        <div className="flex flex-col gap-3 flex-1">
          <div className="rounded-lg border border-[#f57222]/25 bg-[#f57222]/8 p-3">
            <div className="text-[11px] text-[#f57222] uppercase tracking-wider mb-2 font-semibold">① Inline handlers in .map()</div>
            <pre className="font-mono text-[10px] text-white/70 leading-relaxed">{`sortedOrders.map((entry) => (
  <OrderRow
    onSelect={() => { /* new fn every render */ }}
    onBumpPriority={() => { /* same */ }}
  />
))`}</pre>
          </div>
          <div className="rounded-lg border border-[#f57222]/25 bg-[#f57222]/8 p-3">
            <div className="text-[11px] text-[#f57222] uppercase tracking-wider mb-2 font-semibold">② Expensive computation without memo</div>
            <pre className="font-mono text-[10px] text-white/70 leading-relaxed">{`// 600 orders × 240 sin/cos/sqrt per render
const scoredOrders = orders.map(order => ({
  score: calculateExpensiveScore(order) // no useMemo
}))`}</pre>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-[250px]">
          <div className="rounded-lg border border-white/10 bg-white/3 p-3">
            <div className="text-[11px] text-white/35 uppercase tracking-wider mb-2">③ Unstable object references</div>
            <pre className="font-mono text-[10px] text-white/55 leading-relaxed">{`// New object every render
const config = { threshold: 0.8 }
<Component config={config} />`}</pre>
          </div>
          <div className="rounded-xl border border-[#00c4b4]/30 bg-[#00c4b4]/8 p-4 flex-1 flex flex-col justify-center">
            <div className="text-[11px] text-[#00c4b4] uppercase tracking-wider mb-2">Observable</div>
            <p className="text-[12px] text-white/65 leading-relaxed">
              MetricsPanel shows render count growing on every interaction.
            </p>
            <p className="text-[12px] text-white/40 mt-2 font-mono text-[10px]">
              console.log visible in devtools on each render
            </p>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S9: AST Analysis ─────────────────────────────────────────────────────────

function T3S09_ASTAnalysis({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[24px] font-light text-white mb-4 border-l-[3px] border-[#2a5ff5] pl-3">
        AST analysis: what we actually find
      </h2>
      <div className="flex flex-1 gap-6">
        <div className="flex-1 flex flex-col gap-3">
          <div className="font-mono text-[10px] text-white/35 bg-[#12121a] rounded px-3 py-1.5">
            npm run analyze:react -- src/components/OrdersDashboard.tsx
          </div>
          <pre className="bg-[#12121a] rounded-xl p-4 font-mono text-[11px] text-white/75 leading-relaxed flex-1 overflow-auto">{`{
  "findings": [
    {
      "findingId": "finding-001",
      "type": "inline-handler-in-map",
      "location": "OrdersDashboard.tsx:250",
      "code": "onSelect={() => { measureAction(...) }}",
      "variables": [
        "entry",
        "measureAction",
        "selectedOrderIds"
      ],
      "goal": "stabilize handler reference to reduce rerenders"
    }
  ]
}`}</pre>
        </div>
        <div className="w-[230px] flex flex-col gap-3 justify-center">
          <div className="rounded-xl border border-[#2a5ff5]/30 bg-[#2a5ff5]/8 p-4">
            <div className="text-[11px] text-[#2a5ff5] uppercase tracking-wider mb-2">What we extracted</div>
            <ul className="space-y-1.5 text-[12px] text-white/65">
              <li>✓ Exact file + line number</li>
              <li>✓ Anti-pattern type</li>
              <li>✓ The exact code snippet</li>
              <li>✓ Variables in scope</li>
              <li>✓ Optimization goal</li>
            </ul>
          </div>
          <p className="text-[12px] text-white/40 leading-relaxed">
            This is what we'll pass to AI — not the whole file. Just this.
          </p>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S10: Two Strategies ──────────────────────────────────────────────────────

function T3S10_TwoStrategies({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[24px] font-light text-white mb-4 border-l-[3px] border-[#2a5ff5] pl-3">
        Two prompting strategies
      </h2>
      <div className="flex flex-1 gap-5">
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#f57222]/20 text-[#f57222] px-2 py-0.5 rounded-full uppercase tracking-wider">Full context</span>
            <span className="text-[11px] text-white/35 font-mono">~1500 tokens</span>
          </div>
          <pre className="bg-[#12121a] rounded-xl p-4 font-mono text-[11px] leading-relaxed flex-1 border border-[#f57222]/15 text-white/60 overflow-auto">{`Here is the full component:

[...OrdersDashboard.tsx — 1500+ tokens...]

Find performance issues and fix them.`}</pre>
        </div>
        <div className="flex items-center shrink-0">
          <div className="text-[20px] text-white/20">vs</div>
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#00c4b4]/20 text-[#00c4b4] px-2 py-0.5 rounded-full uppercase tracking-wider">AST-bound</span>
            <span className="text-[11px] text-white/35 font-mono">~260 tokens</span>
          </div>
          <pre className="bg-[#12121a] rounded-xl p-4 font-mono text-[11px] leading-relaxed flex-1 border border-[#00c4b4]/20 text-white/75 overflow-auto">{`Issue: inline-handler-in-map
Location: OrdersDashboard.tsx:250
Code: onSelect={() => { measureAction(...) }}
Variables in scope: [entry, measureAction,
                    selectedOrderIds]
Goal: stabilize handler reference

Suggest smallest safe change to reduce rerenders.
Return: explanation + fix + is-safe-to-auto-apply`}</pre>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S11: Correctness ─────────────────────────────────────────────────────────

function T3S11_Correctness({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[24px] font-light text-white mb-5 border-l-[3px] border-[#00c4b4] pl-3">
        Results: correctness
      </h2>
      <div className="flex flex-1 gap-8 items-center">
        <div className="flex-1 flex flex-col gap-4">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[10px] text-black uppercase tracking-wider pb-3 font-normal">Mode</th>
                <th className="text-left text-[10px] text-black uppercase tracking-wider pb-3 font-normal">Correctness</th>
                <th className="text-left text-[10px] text-black uppercase tracking-wider pb-3 font-normal">Strategy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 pr-4">
                  <span className="bg-[#00c4b4]/20 text-[#00c4b4] px-2 py-0.5 rounded text-[11px] font-mono">AST-bound</span>
                </td>
                <td className="py-3 pr-4 text-[#4ade80] font-semibold font-mono">100%</td>
                <td className="py-3 text-white/65 text-[12px]">83% chose useCallback</td>
              </tr>
              <tr>
                <td className="py-3 pr-4">
                  <span className="bg-[#f57222]/20 text-[#f57222] px-2 py-0.5 rounded text-[11px] font-mono">Full context</span>
                </td>
                <td className="py-3 pr-4 text-[#4ade80] font-semibold font-mono">100%</td>
                <td className="py-3 text-white/65 text-[12px]">Mixed — useMemo, React.memo, refactor</td>
              </tr>
            </tbody>
          </table>
          <div className="h-px bg-white/8" />
          <div className="rounded-xl border border-white/10 bg-white/3 p-4">
            <div className="text-[11px] text-white/35 uppercase tracking-wider mb-2">Finding 1</div>
            <p className="text-[14px] text-white/80 leading-relaxed">
              Both approaches are technically correct.
            </p>
            <p className="text-[13px] text-white/45 mt-1">
              "AI is not failing at correctness. Both know what useCallback is."
            </p>
          </div>
        </div>
        <div className="w-[240px] flex flex-col gap-4 items-center">
          <div className="rounded-xl border border-[#4ade80]/30 bg-[#4ade80]/5 p-6 text-center w-full">
            <div className="text-[52px] font-bold text-[#4ade80]">100%</div>
            <div className="text-[12px] text-white/40 mt-1">correct in both modes</div>
          </div>
          <p className="text-[12px] text-white/35 leading-relaxed text-center">
            Differentiation is not in correctness.<br />
            It's in <span className="text-white/60">focus</span> and <span className="text-white/60">efficiency</span>.
          </p>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S12: Relevance ───────────────────────────────────────────────────────────

function T3S12_Relevance({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[24px] font-light text-white mb-5 border-l-[3px] border-[#00c4b4] pl-3">
        Results: relevance & focus
      </h2>
      <div className="flex flex-1 gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[10px] text-white/35 uppercase tracking-wider pb-3 font-normal">Mode</th>
                <th className="text-left text-[10px] text-white/35 uppercase tracking-wider pb-3 font-normal">Focus Rate</th>
                <th className="text-left text-[10px] text-white/35 uppercase tracking-wider pb-3 font-normal">Token Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 pr-4">
                  <span className="bg-[#00c4b4]/20 text-[#00c4b4] px-2 py-0.5 rounded text-[11px] font-mono">AST-bound</span>
                </td>
                <td className="py-3 pr-4 text-white/75 font-mono">33%+</td>
                <td className="py-3 text-[#4ade80] font-mono">~260 tokens</td>
              </tr>
              <tr>
                <td className="py-3 pr-4">
                  <span className="bg-[#f57222]/20 text-[#f57222] px-2 py-0.5 rounded text-[11px] font-mono">Full context</span>
                </td>
                <td className="py-3 pr-4 text-white/45 font-mono">lower, generic</td>
                <td className="py-3 text-[#f57222] font-mono">1500+ tokens</td>
              </tr>
            </tbody>
          </table>
          <div className="rounded-lg border border-[#2a5ff5]/20 bg-[#2a5ff5]/5 p-3">
            <div className="text-[10px] text-[#2a5ff5] uppercase tracking-wider mb-1">Note on 33%</div>
            <p className="text-[12px] text-white/55 leading-relaxed">
              All three responses correctly identified useCallback. The 33% measures explicit focus in the explanation — not correctness of the solution.
            </p>
          </div>
          <div className="rounded-xl border border-[#f57222]/25 bg-[#f57222]/8 p-4">
            <div className="text-[11px] text-[#f57222] uppercase tracking-wider mb-1">Key finding</div>
            <p className="text-[13px] text-white/75 leading-relaxed">
              Full context gives AI too much noise. It names the right solution — but loses focus on why <em>this specific place</em>.
            </p>
          </div>
        </div>
        <div className="w-[200px] flex flex-col gap-4 justify-center">
          <div className="rounded-xl border border-[#00c4b4]/30 bg-[#00c4b4]/8 p-5 text-center">
            <div className="text-[48px] font-bold text-[#00c4b4]">6×</div>
            <div className="text-[12px] text-white/40 mt-1">fewer tokens</div>
            <div className="text-[11px] text-white/30">equal or better targeting</div>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S13: Token Paradox ───────────────────────────────────────────────────────

function T3S13_TokenParadox({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center pb-14 bg-[#0d0d12]">
      <div className="text-center max-w-[680px] px-8">
        <div className="flex items-center justify-center gap-10 mb-8">
          <div className="text-center">
            <div className="text-[60px] font-bold text-[#00c4b4]">260</div>
            <div className="text-[12px] text-white/35 font-mono">AST-bound tokens</div>
            <div className="text-[11px] text-white/25 mt-1">focused · consistent · correct</div>
          </div>
          <div className="text-[28px] text-white/15">vs</div>
          <div className="text-center">
            <div className="text-[60px] font-bold text-[#f57222]">1500+</div>
            <div className="text-[12px] text-white/35 font-mono">full context tokens</div>
            <div className="text-[11px] text-white/25 mt-1">correct · broader · less targeted</div>
          </div>
        </div>
        <div className="h-px w-32 bg-white/12 mx-auto mb-6" />
        <p className="text-[24px] font-light text-white/90 leading-tight mb-3">
          "Providing <span className="text-[#00c4b4] font-semibold">less</span> information produces{' '}
          <span className="text-[#00c4b4] font-semibold">better</span> results."
        </p>
        <p className="text-[14px] text-white/45 mb-5">
          Quality of constraints matters more than quantity of context.
        </p>
        <div className="rounded-lg border border-white/10 bg-white/3 px-5 py-3 inline-block">
          <p className="text-[12px] text-white/45">
            AST makes this programmatic — no manual prompt engineering required.
          </p>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S14: Live Demo ───────────────────────────────────────────────────────────

function T3S14_LiveDemo({ slideNumber, onDemo }: SlideProps) {
  const steps = [
    {
      n: '1',
      action: 'Open OrdersDashboard',
      cmd: 'cd AST+AI && npm run dev',
      detail: 'Watch render count grow on every interaction',
    },
    {
      n: '2',
      action: 'Run AST analysis',
      cmd: 'npm run analyze:react -- src/components/OrdersDashboard.tsx',
      detail: 'See findings-orders-dashboard.json output',
    },
    {
      n: '3',
      action: 'Switch to Results tab',
      cmd: 'Load ast-experiment-*.json + full-context-*.json',
      detail: 'Side-by-side: token usage, strategy, individual responses',
    },
  ]
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <div className="mb-5">
        <div className="text-[11px] uppercase tracking-widest text-[#00c4b4]/60 mb-1">Live Demo</div>
        <h2 className="text-[26px] font-light text-white border-l-[3px] border-[#00c4b4] pl-3">
          Orders Dashboard Benchmark
        </h2>
      </div>
      <div className="flex flex-1 gap-6">
        <div className="flex-1 flex flex-col gap-3">
          {steps.map((step) => (
            <div key={step.n} className="flex gap-4 rounded-xl border border-white/8 bg-white/2 px-5 py-3">
              <div className="text-[24px] font-bold text-[#00c4b4]/50 min-w-[24px] leading-none mt-1">{step.n}</div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="text-[13px] text-white/80 font-medium">{step.action}</div>
                <div className="font-mono text-[11px] text-[#00c4b4]/80 bg-[#12121a] rounded px-2 py-1">{step.cmd}</div>
                <div className="text-[11px] text-white/40">{step.detail}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-[220px] flex flex-col gap-3 justify-center">
          <div className="rounded-xl border border-[#00c4b4]/30 bg-[#00c4b4]/8 p-4">
            <div className="text-[11px] text-[#00c4b4] uppercase tracking-wider mb-2">Highlight</div>
            <ul className="space-y-2 text-[12px] text-white/65">
              <li>→ token usage column<br /><span className="text-white/35 text-[10px]">260 vs 1500+</span></li>
              <li>→ strategy column<br /><span className="text-white/35 text-[10px]">useCallback consistency</span></li>
              <li>→ individual responses<br /><span className="text-white/35 text-[10px]">all runs, nothing hidden</span></li>
            </ul>
          </div>
          <div className="rounded-lg border border-white/8 bg-white/2 p-3 text-center">
            <p className="text-[11px] text-white/40 leading-relaxed">
              Real data from the experiment.<br />
              Not cherry-picked.
            </p>
          </div>
          {onDemo && (
            <button
              onClick={() => onDemo('ast')}
              className="w-full py-2 rounded-lg bg-[#2a5ff5] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#1a4fd5] transition-colors border-0"
            >
              Open Demo →
            </button>
          )}
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S15: API Migrations ──────────────────────────────────────────────────────

function T3S15_APIMigrations({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <div className="mb-4">
        <span className="text-[11px] uppercase tracking-widest text-[#f57222]/80 font-semibold">Part 4 · Beyond Performance</span>
        <h2 className="text-[24px] font-light text-white mt-1 border-l-[3px] border-[#f57222] pl-3">
          Use case: API migrations
        </h2>
      </div>
      <div className="flex flex-1 gap-5">
        <div className="flex flex-col gap-3 flex-1">
          <div className="rounded-lg border border-[#f57222]/20 bg-[#f57222]/5 p-3 text-[12px] text-white/55 font-mono leading-relaxed">
            <span className="text-white/30">"Migrate to new auth API. Update all call sites."</span><br />
            <span className="text-[#f57222]">→ LLM doesn't know how many sites exist</span><br />
            <span className="text-[#f57222]">→ May miss, may break edge cases</span>
          </div>
          <div className="text-[11px] text-white/35 uppercase tracking-wider">React Router v5 → v6 (real case)</div>
          <pre className="bg-[#12121a] rounded-xl p-4 font-mono text-[11px] leading-relaxed flex-1 text-white/70 overflow-auto">{`// AST traversal finds ALL deprecated patterns:
CallExpression {
  callee: MemberExpression {
    property: { name: 'useHistory' } // → useNavigate
  }
}

// <Switch> → <Routes>
// <Redirect> → <Navigate>
// history.push() → navigate()
`}</pre>
        </div>
        <div className="w-[220px] flex flex-col gap-3 justify-center">
          <div className="rounded-xl border border-[#00c4b4]/30 bg-[#00c4b4]/8 p-4">
            <div className="text-[11px] text-[#00c4b4] uppercase tracking-wider mb-3">Pipeline</div>
            <div className="space-y-2 text-[12px] text-white/65">
              <div>1. AST finds all patterns</div>
              <div>2. AI generates each fix</div>
              <div>3. Script applies safe cases</div>
              <div>4. PR for complex ones</div>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/3 p-4 text-center">
            <div className="text-[32px] font-bold text-white/75">47</div>
            <div className="text-[11px] text-white/35">call sites found<br />across 23 files</div>
            <div className="text-[11px] text-white/25 mt-1">deterministically</div>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S16: Observability Hooks ─────────────────────────────────────────────────

function T3S16_Observability({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[24px] font-light text-white mb-4 border-l-[3px] border-[#f57222] pl-3">
        Use case: automated observability hooks
      </h2>
      <div className="flex flex-1 gap-5">
        <div className="flex-1 flex flex-col gap-3">
          <div className="rounded-lg border border-white/8 bg-white/2 p-3 text-[12px] text-white/55">
            <span className="text-[#f57222]">Problem: </span>300+ components need tracing instrumentation. Manual work = 1 month.
          </div>
          <pre className="bg-[#12121a] rounded-xl p-4 font-mono text-[10px] leading-relaxed flex-1 text-white/70 overflow-auto">{`// AST finds: async functions with network calls
FunctionDeclaration
  └── AwaitExpression
        └── CallExpression (fetch / axios / ...)

// Auto-inserts instrumentation wrapper:
async function loadOrders() {
  const span = tracer.startSpan('loadOrders') // ← inserted
  try {
    const result = await fetch('/api/orders')
    span.end()                                 // ← inserted
    return result
  } catch (e) {
    span.recordError(e)                        // ← inserted
    throw e
  }
}`}</pre>
        </div>
        <div className="w-[230px] flex flex-col gap-3 justify-center">
          <div className="rounded-xl border border-[#f57222]/30 bg-[#f57222]/8 p-4">
            <div className="text-[11px] text-[#f57222] uppercase tracking-wider mb-2">Meta moment</div>
            <p className="text-[12px] text-white/65 leading-relaxed">
              This is how the measurement infrastructure in our demo was built.
            </p>
            <p className="text-[11px] text-white/40 mt-2 font-mono">
              useRenderMeasurement,<br />measureComputation
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/3 p-4 text-center">
            <div className="text-[11px] text-white/35 mb-1">Time saved</div>
            <div className="text-[28px] font-bold text-white/75">1 month</div>
            <div className="text-[11px] text-white/30">→ a few hours</div>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S16b: Test Generation ────────────────────────────────────────────────────

function T3S16b_TestGeneration({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[24px] font-light text-white mb-4 border-l-[3px] border-[#2a5ff5] pl-3">
        Use case: AST-guided test generation
      </h2>
      <div className="flex flex-1 gap-5">
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#2a5ff5]/20 text-[#2a5ff5] px-2 py-0.5 rounded-full uppercase tracking-wider">AST step</span>
            <span className="text-[11px] text-white/35">Extract every branch from function</span>
          </div>
          <pre className="bg-[#12121a] rounded-xl p-3 font-mono text-[10px] leading-relaxed text-white/70">{`function processOrder(order) {
  if (order.priority > 0.9) {   // branch A
    return escalate(order)
  }
  if (!order.items.length) {    // branch B
    return reject('empty')
  }
  return process(order)          // branch C
}`}</pre>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#00c4b4]/20 text-[#00c4b4] px-2 py-0.5 rounded-full uppercase tracking-wider">AI step</span>
            <span className="text-[11px] text-white/35">One bounded prompt per branch</span>
          </div>
          <pre className="bg-[#12121a] rounded-xl p-3 font-mono text-[10px] leading-relaxed text-white/60 flex-1">{`Function: processOrder
Branch A: condition = order.priority > 0.9
Returns: escalate(order)
Scope: [order, escalate]

Generate one vitest test for this branch only.`}</pre>
        </div>
        <div className="w-[260px] flex flex-col gap-3">
          <div className="text-[11px] text-white/35 uppercase tracking-wider">Generated output</div>
          <pre className="bg-[#12121a] rounded-xl p-3 font-mono text-[10px] leading-relaxed text-white/70 flex-1">{`it('escalates high-priority orders', () => {
  const order = {
    priority: 0.95,
    items: [{ id: 1 }]
  }
  const result = processOrder(order)
  expect(result).toBe(escalate(order))
})`}</pre>
          <div className="rounded-xl border border-[#2a5ff5]/30 bg-[#2a5ff5]/8 p-3">
            <div className="text-[11px] text-[#2a5ff5] uppercase tracking-wider mb-1">Why it works</div>
            <p className="text-[12px] text-white/60 leading-relaxed">
              AST guarantees every branch is found. AI generates exactly one focused test per branch. Zero missed cases.
            </p>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S16c: Practical Cases ────────────────────────────────────────────────────

function T3S16c_PracticalCases({ slideNumber }: SlideProps) {
  const cases = [
    {
      title: 'Code Review',
      color: '#2a5ff5',
      bg: 'bg-[#2a5ff5]/8',
      border: 'border-[#2a5ff5]/25',
      astStep: 'Find all diff locations matching risk patterns',
      aiStep: 'Generate focused review comment per location',
      outcome: 'Consistent, bounded, specific comments',
    },
    {
      title: 'Refactoring',
      color: '#00c4b4',
      bg: 'bg-[#00c4b4]/8',
      border: 'border-[#00c4b4]/25',
      astStep: 'Identify extraction opportunities + duplication',
      aiStep: 'Suggest smallest refactor with safety score',
      outcome: 'One suggestion per location, not broad rewrites',
    },
    {
      title: 'Pattern Finding',
      color: '#f57222',
      bg: 'bg-[#f57222]/8',
      border: 'border-[#f57222]/25',
      astStep: 'Traverse entire codebase for anti-patterns',
      aiStep: 'Classify severity, explain impact, rank',
      outcome: '300 components → prioritized findings list',
    },
    {
      title: 'Doc Generation',
      color: '#a78bfa',
      bg: 'bg-[#a78bfa]/8',
      border: 'border-[#a78bfa]/25',
      astStep: 'Extract all public exports with exact signatures',
      aiStep: 'Generate JSDoc per function from signature + usage',
      outcome: 'Complete, accurate, always up-to-date',
    },
  ]
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[24px] font-light text-white mb-4 border-l-[3px] border-[#2a5ff5] pl-3">
        The same pattern applies everywhere
      </h2>
      <div className="grid grid-cols-2 gap-4 flex-1">
        {cases.map((c) => (
          <div
            key={c.title}
            className={`rounded-xl p-4 border ${c.border} ${c.bg} flex flex-col gap-2`}
          >
            <div className="text-[14px] font-bold" style={{ color: c.color }}>{c.title}</div>
            <div className="flex gap-2 items-start">
              <span className="text-[10px] bg-white/8 text-white/35 px-1.5 py-0.5 rounded mt-0.5 shrink-0 font-mono">AST</span>
              <span className="text-[11px] text-white/55 leading-snug">{c.astStep}</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-[10px] bg-white/8 text-white/35 px-1.5 py-0.5 rounded mt-0.5 shrink-0 font-mono">AI</span>
              <span className="text-[11px] text-white/55 leading-snug">{c.aiStep}</span>
            </div>
            <div className="mt-auto text-[11px] text-white/40 italic">{c.outcome}</div>
          </div>
        ))}
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S17: The Pipeline Pattern ────────────────────────────────────────────────

function T3S17_Pipeline({ slideNumber }: SlideProps) {
  const steps = [
    { n: '1', label: 'AST ANALYZE', detail: 'Find exact locations + classify issues', color: '#2a5ff5' },
    { n: '2', label: 'BOUND PROMPT', detail: 'Pass finding + context + variables in scope', color: '#a78bfa' },
    { n: '3', label: 'LLM GENERATE', detail: 'Focused fix with minimal diff', color: '#00c4b4' },
    { n: '4', label: 'EVALUATE', detail: 'Correctness + safety + scope check', color: '#f57222' },
    { n: '5', label: 'AUTO-APPLY or PR', detail: 'score > 0.9 → auto · complex → human review', color: '#4ade80' },
  ]
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[24px] font-light text-white mb-2 border-l-[3px] border-[#2a5ff5] pl-3">
        The pattern across all use cases
      </h2>
      <p className="text-[13px] text-white/40 mb-5">
        One deterministic system. AI does only what it does well.
      </p>
      <div className="flex flex-1 gap-2 items-center">
        {steps.map((step, i) => (
          <div key={step.n} className="flex flex-1 items-center gap-2">
            <div
              className="flex-1 rounded-xl p-4 flex flex-col gap-2 border"
              style={{ borderColor: `${step.color}30`, backgroundColor: `${step.color}10` }}
            >
              <div className="text-[28px] font-bold" style={{ color: step.color }}>{step.n}</div>
              <div className="text-[10px] font-bold tracking-widest" style={{ color: step.color }}>{step.label}</div>
              <div className="text-[11px] text-white/50 leading-snug">{step.detail}</div>
            </div>
            {i < steps.length - 1 && (
              <div className="text-[18px] text-white/15 shrink-0">→</div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-white/8 bg-white/2 px-4 py-2.5">
        <p className="text-[12px] text-white/40">
          Auto-apply rate in our experiment: 0% — that's AI being honest about risk. Not a failure. A calibrated threshold.
        </p>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S18: Tooling ─────────────────────────────────────────────────────────────

function T3S18_Tooling({ slideNumber }: SlideProps) {
  const sections = [
    {
      title: 'AST Parsing & Traversal',
      color: '#2a5ff5',
      tools: [
        { name: '@babel/parser + traverse', note: 'JS/JSX/TS — flexible, widely used' },
        { name: 'TypeScript Compiler API', note: 'Deep type integration' },
        { name: 'ts-morph', note: 'Friendly wrapper — best entry point' },
        { name: 'jscodeshift', note: 'Codemod framework by Meta' },
      ],
    },
    {
      title: 'AI Layer',
      color: '#00c4b4',
      tools: [
        { name: 'Claude API / OpenAI', note: 'Bounded finding + scope + goal' },
        { name: 'Temperature: 0–0.2', note: 'Determinism over creativity' },
        { name: 'Structured output schema', note: 'JSON with safety confirmation flag' },
      ],
    },
    {
      title: 'Evaluation & Apply',
      color: '#f57222',
      tools: [
        { name: 'Deterministic script', note: 'Not LLM-judge — fast and reliable' },
        { name: 'Score threshold > 0.9', note: 'Correctness + scope + safety' },
        { name: 'Auto-apply: local only', note: 'No cross-component side effects' },
      ],
    },
  ]
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <div className="mb-4">
        <span className="text-[11px] uppercase tracking-widest text-[#2a5ff5]/80 font-semibold">Part 5 · Building Your Pipeline</span>
        <h2 className="text-[24px] font-light text-white mt-1 border-l-[3px] border-[#2a5ff5] pl-3">
          Tooling today
        </h2>
      </div>
      <div className="flex flex-1 gap-5">
        {sections.map((sec) => (
          <div key={sec.title} className="flex-1 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: sec.color }}>
              {sec.title}
            </div>
            {sec.tools.map((tool) => (
              <div key={tool.name} className="rounded-lg border border-white/8 bg-white/2 px-3 py-2.5">
                <div className="text-[12px] text-white/80 font-mono">{tool.name}</div>
                <div className="text-[11px] text-white/35 mt-0.5">{tool.note}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S19: Where to Start ──────────────────────────────────────────────────────

function T3S19_WhereToStart({ slideNumber }: SlideProps) {
  const steps = [
    {
      n: '1',
      action: 'Pick one repetitive task',
      detail: 'API migration · naming convention · missing error handling',
    },
    {
      n: '2',
      action: 'Write AST traversal that FINDS it',
      detail: 'Babel or ts-morph · 20–50 lines · no AI yet',
    },
    {
      n: '3',
      action: 'Send a bounded prompt per finding',
      detail: 'location + code snippet + variables in scope + goal',
    },
    {
      n: '4',
      action: 'Compare with full-context approach',
      detail: 'Token cost · focus rate · strategy consistency',
    },
    {
      n: '5',
      action: 'Add to CI as automated check',
      detail: 'Or pre-commit suggestion — detect before you automate',
    },
  ]
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[24px] font-light text-white mb-2 border-l-[3px] border-[#00c4b4] pl-3">
        Where to start — next week
      </h2>
      <p className="text-[13px] text-white/35 mb-5">
        Don't build the whole pipeline on day one.
      </p>
      <div className="flex flex-1 flex-col gap-3">
        {steps.map((step) => (
          <div key={step.n} className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/2 px-5 py-3">
            <div className="text-[28px] font-bold text-[#00c4b4]/50 min-w-[30px] leading-none mt-1">{step.n}</div>
            <div>
              <div className="text-[14px] text-white/80 font-medium">{step.action}</div>
              <div className="text-[12px] text-white/40 mt-0.5 font-mono">{step.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S21: Close ───────────────────────────────────────────────────────────────

function T3S21_Close({ slideNumber }: SlideProps) {
  const takeaways = [
    {
      n: '1',
      title: 'AST tells you WHERE. AI tells you WHAT TO DO.',
      sub: 'Separate responsibilities. Complementary, not competing.',
    },
    {
      n: '2',
      title: 'Bounded context beats full context.',
      sub: '6× fewer tokens, equal or better targeting.',
    },
    {
      n: '3',
      title: 'Start with detection, not automation.',
      sub: 'Finding patterns is value in itself. Automate when confident.',
    },
  ]
  return (
    <div className={`w-full h-full flex flex-col pb-14 ${Gradient}`}>
      <div className="flex flex-1 px-12 pt-10 gap-10">
        <div className="flex-1 flex flex-col justify-center gap-5">
          <p className="text-[15px] text-white/65 italic leading-relaxed">
            "AI tools help us write code faster.<br />
            AST tools help us understand code deeper.<br />
            Together — they let code improve itself."
          </p>
          <div className="space-y-4">
            {takeaways.map((t) => (
              <div key={t.n} className="flex gap-3">
                <div className="text-[22px] font-bold text-white/25 min-w-[22px] leading-none mt-0.5">{t.n}</div>
                <div>
                  <div className="text-[14px] text-white font-semibold leading-snug">{t.title}</div>
                  <div className="text-[12px] text-white/50 mt-0.5">{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-9 flex items-center justify-between px-5">
        <span className="text-[10px] uppercase tracking-widest text-white/40">JSWorld 2026</span>
        <span className="text-xs flex items-center gap-1 text-white/60">
          <span className="w-3.5 h-3.5 rounded-sm bg-white/20" />
          {slideNumber}
        </span>
      </div>
    </div>
  )
}

// ─── slide registry ───────────────────────────────────────────────────────────

export const TALK3_SLIDES: SlideDef[] = [
  { Component: T3S03_GapInAI },
  { Component: T3S04_WhatAILacks },
  { Component: T3S05_ASTInOneMinute },
  { Component: T3S06_ThreeThings },
  { Component: T3S07_KeyInsight },
  { Component: T3S08_Benchmark },
  { Component: T3S09_ASTAnalysis },
  { Component: T3S10_TwoStrategies },
  { Component: T3S11_Correctness },
  { Component: T3S12_Relevance },
  { Component: T3S13_TokenParadox },
  { Component: T3S14_LiveDemo },
  { Component: T3S15_APIMigrations },
  { Component: T3S16_Observability },
  { Component: T3S16b_TestGeneration },
  { Component: T3S16c_PracticalCases },
  { Component: T3S17_Pipeline },
  { Component: T3S18_Tooling },
  { Component: T3S19_WhereToStart },
  { Component: T3S21_Close },
]
