import type { SlideDef, SlideProps } from './slides'

const Gradient = 'bg-gradient-to-br from-[#6a1fc2] via-[#2a5ff5] to-[#00c4b4]'

function Footer({ n, light }: { n: number; light?: boolean }) {
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-9 flex items-center justify-between px-5 ${light ? 'bg-white' : ''}`}>
      <span className={`text-[10px] uppercase tracking-widest ${light ? 'text-[#aaa]' : 'text-white/40'}`}>JSWorld 2026</span>
      <span className={`text-xs flex items-center gap-1 ${light ? 'text-[#888]' : 'text-white/60'}`}>
        <span className={`w-3.5 h-3.5 rounded-sm ${light ? 'bg-[#ddd]' : 'bg-white/20'}`} />
        {n}
      </span>
    </div>
  )
}

const kw = (s: string) => <span className="text-[#2a5ff5]">{s}</span>
const st = (s: string) => <span className="text-[#00c4b4]">{s}</span>
const cm = (s: string) => <span className="text-white/40">{s}</span>

const er = (s: string) => <span className="text-[#f87171]">{s}</span>
const hl = (s: string) => <span className="text-[#fbbf24]">{s}</span>

function Code({ children, sm }: { children: React.ReactNode; sm?: boolean }) {
  return (
    <pre className={`bg-black/40 rounded-lg p-3 ${sm ? 'text-[11px]' : 'text-[12px]'} leading-5 text-white/85 font-mono overflow-auto`}>
      <code>{children}</code>
    </pre>
  )
}

// ─── S3: The Story ────────────────────────────────────────────────────────────

function S3_Story({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-8 pb-12 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-5 border-l-[3px] border-[#f87171] pl-3">
        The payment bug that wasn't broken
      </h2>
      <div className="flex gap-8 flex-1 items-start">
        <div className="flex-1 flex flex-col gap-3 text-[13px] text-white/75 leading-6">
          <div className="flex gap-3 items-start">
            <span className="text-white/30 font-mono text-[11px] mt-1 min-w-[48px]">0:20 min</span>
            <div>React invoice form. AI-generated. Tests passed. Code review approved.</div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-white/30 font-mono text-[11px] mt-1 min-w-[48px]">3 weeks</span>
            <div>German customer. VAT calculation <span className="text-[#f87171]">wrong</span>. Not broken — <em>wrong</em>.</div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-white/30 font-mono text-[11px] mt-1 min-w-[48px]">cause</span>
            <div>Model applied standard 20% EU rate. Nobody mentioned B2B exemptions. That rule lived in a Slack thread from 8 months ago.</div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-white/30 font-mono text-[11px] mt-1 min-w-[48px]">fix</span>
            <div>4 hours. Found by a customer — not our tests.</div>
          </div>
        </div>
        <div className="w-[260px] flex flex-col gap-4">
          <div className="bg-[#1a0a0a] rounded-lg p-4 border border-[#f87171]/30">
            <div className="text-[13px] text-white/80 leading-6 italic">
              "The model did exactly what it was supposed to do.
              It applied reasonable defaults.
              We just didn't tell it what we actually needed."
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-[11px] text-white/50 leading-5">
            We were writing prompts.<br />
            But <span className="text-[#f87171]">debugging like it's 2015.</span>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S4: The New Stack ────────────────────────────────────────────────────────

function S4_NewStack({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-8 pb-12 bg-white">
      <h2 className="text-[22px] font-medium text-[#1a3a6b] mb-4 border-b border-[#e0e0e0] pb-2">
        We added a new layer to the stack
      </h2>
      <div className="flex gap-6 flex-1 items-start">
        <table className="flex-1 border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="bg-[#e8edf5] text-[#1a3a6b] px-4 py-2 text-left w-1/2 font-medium">Before</th>
              <th className="bg-[#1a3a6b] text-white px-4 py-2 text-left w-1/2 font-medium">Now</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Developer → writes code', 'Developer → describes intent'],
              ['Code review', 'Prompt review?'],
              ['Tests verify code', '??? verifies generation'],
              ['Debugger', '??? when model decides silently'],
              ['Style guide', '??? for describing intent to AI'],
            ].map(([before, now], i) => (
              <tr key={i} className={i % 2 === 1 ? 'bg-[#f7f9ff]' : ''}>
                <td className="px-4 py-2.5 border-b border-[#e5e5e5] text-[#555]">{before}</td>
                <td className={`px-4 py-2.5 border-b border-[#e5e5e5] font-medium ${now.includes('???') ? 'text-[#dc2626]' : 'text-[#1a3a6b]'}`}>{now}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="w-[220px] flex flex-col gap-3 text-[12px]">
          <div className="bg-[#fff3e0] border border-[#fb923c]/40 rounded-lg p-3 text-[#92400e] leading-5">
            <div className="font-medium mb-1">The question for this talk:</div>
            We added a new layer. But where is the engineering discipline for that layer?
          </div>
          <div className="bg-[#f0f4ff] rounded-lg p-3 text-[#1a3a6b] leading-5">
            <div className="font-medium mb-1">I ran 7 experiments to find out.</div>
            <div className="text-[#555]">4 models · 10 business rules · deterministic TypeScript judge</div>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} light />
    </div>
  )
}

// ─── S5: Methodology ──────────────────────────────────────────────────────────

function S5_Methodology({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-8 pb-12 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-5 border-l-[3px] border-[#2a5ff5] pl-3">
        Experiment setup
      </h2>
      <div className="flex gap-6 flex-1 items-start">
        <div className="flex-1 grid grid-cols-2 gap-3">
          {[
            { label: 'Component', value: 'React invoice form', sub: '10 explicit business rules' },
            { label: 'Models', value: 'Mistral 7b · CodeQwen 7b', sub: 'Gemini Flash · Claude Sonnet' },
            { label: 'Judge', value: 'Deterministic TypeScript', sub: 'Zero AI in scoring — pass/fail assertions' },
            { label: 'Why small models first', value: 'Signal is cleaner', sub: 'Large models compensate for bad prompts — noise is hidden' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white/5 rounded-lg p-4 border-l-[3px] border-[#2a5ff5]">
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{label}</div>
              <div className="text-[14px] text-white font-medium">{value}</div>
              <div className="text-[11px] text-white/50 mt-1">{sub}</div>
            </div>
          ))}
        </div>
        <div className="w-[200px]">
          <div className="bg-black/30 rounded-lg p-3 text-[11px] text-white/70 leading-5">
            <div className="text-[#00c4b4] mb-2">10 business rules tested:</div>
            <div className="font-mono text-[10px] text-white/50 leading-5">
              min_amount_eur: 50{'\n'}
              vat.eu: 20{'\n'}
              vat.blocked: [RU, BY]{'\n'}
              max_line_items: 10{'\n'}
              retry_on: [network_error]{'\n'}
              analytics.provider: internal{'\n'}
              autosave_seconds: 30{'\n'}
              ...
            </div>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S6: T1 Vague vs YAML ─────────────────────────────────────────────────────

function S6_T1({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-10 pt-7 pb-12 bg-[#0d0d12]">
      <h2 className="text-[20px] font-light text-white mb-4 border-l-[3px] border-[#2a5ff5] pl-3">
        T1: Vague text vs structured YAML — same model, same task
      </h2>
      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 flex flex-col gap-2">
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Prompt A — vague</div>
          <Code sm>Build a React invoice form with line items and totals.</Code>
          <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Prompt B — structured</div>
          <Code sm>
{kw('component')}: InvoiceForm{'\n'}
{kw('constraints')}: {'{'}min_amount_eur: 50, max_line_items: 10{'}'}{'\n'}
{kw('vat')}: {'{'}eu: 20, {er('blocked: [RU, BY]')}{'}'}{'\n'}
{kw('payment')}: {'{'}retry_on: [network_error]{'}'}{'\n'}
{kw('analytics')}: {'{'}provider: internal{'}'}
          </Code>
        </div>
        <div className="w-[240px] flex flex-col gap-3">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="bg-[#1a3a6b] text-black px-2 py-1.5 text-left font-medium">Model</th>
                <th className="bg-[#1a3a6b] text-black px-2 py-1.5 text-center font-medium">Vague</th>
                <th className="bg-[#1a3a6b] text-black px-2 py-1.5 text-center font-medium">YAML</th>
              </tr>
            </thead>
            <tbody>
              {[['Mistral 7b', '3/10', '9/10'], ['CodeQwen 7b', '2/10', '9/10']].map(([m, v, y]) => (
                <tr key={m} className="border-b border-white/10">
                  <td className="px-2 py-1.5 text-white/70">{m}</td>
                  <td className="px-2 py-1.5 text-center text-[#f87171] font-mono">{v}</td>
                  <td className="px-2 py-1.5 text-center text-[#4ade80] font-mono">{y}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-[#0a1a0a] border border-[#4ade80]/30 rounded-lg p-3 text-[12px] text-[#4ade80] leading-5">
            Same model. Same task. Same judge.
            <br />
            <strong>3–4× more correct</strong> from format alone.
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S7: T2 Big Models ────────────────────────────────────────────────────────

function S7_T2({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-10 pt-7 pb-12 bg-[#0d0d12]">
      <h2 className="text-[20px] font-light text-white mb-4 border-l-[3px] border-[#f87171] pl-3">
        T2: "Just use a bigger model" — the paradox
      </h2>
      <div className="flex gap-6 flex-1 items-start">
        <div className="flex-1">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Model</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-center font-medium">Score</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-center font-medium">Assumed</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">What happened</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="px-3 py-2 text-white/70">Gemini Flash</td>
                <td className="px-3 py-2 text-center text-[#fbbf24] font-mono">4/10</td>
                <td className="px-3 py-2 text-center text-[#f87171] font-mono">6</td>
                <td className="px-3 py-2 text-[11px] text-white/50">Guessed 4 rules correctly. Didn't tell you.</td>
              </tr>
              <tr className="border-b border-white/10 bg-white/5">
                <td className="px-3 py-2 text-white/70">Claude Sonnet</td>
                <td className="px-3 py-2 text-center text-[#f87171] font-mono">0/10</td>
                <td className="px-3 py-2 text-center text-[#4ade80] font-mono">10 listed</td>
                <td className="px-3 py-2 text-[11px] text-[#4ade80]">Said "I don't know these 10 things."</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-[#1a0a0a] rounded-lg p-3 border border-[#f87171]/30 text-[12px] text-white/70 leading-5">
              <div className="text-[#f87171] font-medium mb-1">If you're Gemini:</div>
              You ship. Something breaks later. You don't know why.
            </div>
            <div className="bg-[#0a1a0a] rounded-lg p-3 border border-[#4ade80]/30 text-[12px] text-white/70 leading-5">
              <div className="text-[#4ade80] font-medium mb-1">If you're Claude:</div>
              You have 10 gaps listed. You fill them. You ship with confidence.
            </div>
          </div>
        </div>
        <div className="w-[210px] flex flex-col gap-3">
          <div className="bg-[#0d1220] rounded-lg p-4 border border-[#2a5ff5]/30 text-[14px] text-white/85 leading-6 italic">
            "Visible failure is recoverable.
            <br /><br />
            Silent success is not."
          </div>
          <div className="text-[11px] text-white/40 leading-5 p-1">
            Gemini didn't solve the problem. It hid it better.
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S8: T3 YAML Equalizes ────────────────────────────────────────────────────

function S8_T3({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-8 pb-12 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-5 border-l-[3px] border-[#4ade80] pl-3">
        T3: Structured spec equalizes all models
      </h2>
      <div className="flex gap-8 flex-1 items-start">
        <div className="flex-1">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Model</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-center font-medium">Vague text</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-center font-medium">Structured YAML</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Mistral 7b (local, free)', '3/10', '9/10'],
                ['CodeQwen 7b (local, free)', '2/10', '9/10'],
                ['Gemini Flash (commercial)', '4/10', '10/10'],
                ['Claude Sonnet (commercial)', '0/10', '10/10'],
              ].map(([m, v, y], i) => (
                <tr key={m} className={`border-b border-white/10 ${i % 2 === 1 ? 'bg-white/5' : ''}`}>
                  <td className="px-3 py-2.5 text-white/70">{m}</td>
                  <td className="px-3 py-2.5 text-center text-[#f87171] font-mono">{v}</td>
                  <td className="px-3 py-2.5 text-center text-[#4ade80] font-mono font-bold">{y}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-[240px] flex flex-col gap-3">
          <div className="bg-[#0a1a0a] border border-[#4ade80]/40 rounded-lg p-4 text-[14px] text-[#4ade80] leading-6">
            A free local model and an expensive commercial model produce <strong>equivalent results</strong> when given the same structured intent.
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-[12px] text-white/60 leading-5">
            <strong className="text-white/80">Format matters more than model selection.</strong>
            <br />
            You don't need a better model. You need a better spec.
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S9: T4 Signal Density ────────────────────────────────────────────────────

function S9_T4({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-10 pt-7 pb-12 bg-[#0d0d12]">
      <h2 className="text-[20px] font-light text-white mb-4 border-l-[3px] border-[#fbbf24] pl-3">
        T4: Why text prompts underperform — signal density
      </h2>
      <div className="flex gap-5 flex-1 min-h-0 items-start">
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Text prompt — 96 words, 39% noise</div>
          <Code sm>
Build a React invoice form {hl('consisting of')} line items,{'\n'}
{hl('which includes')} fields for description, quantity and price.{'\n'}
{hl('Next there will be')} a totals section {hl('inside it')}.{'\n'}
The form {hl('should be able to')} calculate VAT.
          </Code>
          <div className="text-[11px] text-[#fbbf24]">highlighted = structural noise (zero information content)</div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest mt-2">YAML — 54 words, 0% noise</div>
          <Code sm>
{kw('component')}: InvoiceForm{'\n'}
{st('constraints')}: {'{'}min_amount_eur: 50, max_line_items: 10{'}'}{'\n'}
{st('vat')}: {'{'}eu: 20, blocked: [RU, BY]{'}'}{'\n'}
{st('payment')}: {'{'}retry_on: [network_error]{'}'}
          </Code>
          <div className="text-[11px] text-[#4ade80]">zero structural noise · hierarchy via indentation, not words</div>
        </div>
        <div className="w-[180px] flex flex-col gap-3 text-[12px]">
          <div className="bg-black/30 rounded-lg p-3 text-white/70 leading-5">
            <div className="text-[#fbbf24] mb-1">Noise examples</div>
            <div className="font-mono text-[11px] text-white/40 leading-5">
              "consisting of"{'\n'}
              "which includes"{'\n'}
              "next there will be"{'\n'}
              "inside it"
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-white/70 leading-5">
            <div className="text-[#2a5ff5] mb-1">Why YAML wins</div>
            Structure expressed through format — not words. Fewer tokens. More signal.
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S10: T6 Spec Delegation ──────────────────────────────────────────────────

function S10_T6({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-10 pt-7 pb-12 bg-[#0d0d12]">
      <h2 className="text-[20px] font-light text-white mb-4 border-l-[3px] border-[#f87171] pl-3">
        T6: "What if I ask AI to write the spec?" — spec delegation
      </h2>
      <div className="flex gap-5 flex-1 items-start">
        <div className="flex-1">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="bg-[#1a3a6b] text-black px-2 py-1.5 text-left font-medium">Approach</th>
                <th className="bg-[#1a3a6b] text-black px-2 py-1.5 text-center font-medium">Score</th>
                <th className="bg-[#1a3a6b] text-black px-2 py-1.5 text-center font-medium">Tokens</th>
                <th className="bg-[#1a3a6b] text-black px-2 py-1.5 text-center font-medium">Cost vs direct</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Vague → CodeQwen (direct)', '1–2/10', '141', '1×'],
                ['Vague → Mistral spec → CodeQwen', '0/10', '447–585', '3–4×'],
                ['Vague → Gemini spec → CodeQwen', '2/10', '1149', '8×'],
                ['Vague → Claude spec → CodeQwen', '0/10', '1306', '9×'],
              ].map(([a, s, t, c], i) => (
                <tr key={i} className={`border-b border-white/10 ${i % 2 === 1 ? 'bg-white/5' : ''}`}>
                  <td className="px-2 py-2 text-white/70 text-[11px]">{a}</td>
                  <td className={`px-2 py-2 text-center font-mono ${s === '0/10' ? 'text-[#f87171]' : 'text-[#fbbf24]'}`}>{s}</td>
                  <td className="px-2 py-2 text-center text-white/50 font-mono">{t}</td>
                  <td className={`px-2 py-2 text-center font-bold font-mono ${c === '1×' ? 'text-white/40' : 'text-[#f87171]'}`}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-[220px] flex flex-col gap-3">
          <div className="bg-[#1a0a0a] border border-[#f87171]/30 rounded-lg p-3 text-[12px] text-white/70 leading-5">
            <div className="text-[#f87171] font-medium mb-1">9× more expensive. 0 business rules.</div>
            Claude wrote beautiful YAML. With nothing about VAT exemptions. Nothing about blocked countries.
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-[11px] text-white/50 leading-5">
            <code className="text-[#00c4b4] text-[10px]">vat_blocked: [RU, BY]</code>
            <br />
            Legal decision. Slack thread. 8 months ago.
            <br /><br />
            <strong className="text-white/70">No model will invent your domain rules. Ever.</strong>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S11: T8 Assumed Risk ─────────────────────────────────────────────────────

function S11_T8({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-10 pt-7 pb-12 bg-[#0d0d12]">
      <h2 className="text-[20px] font-light text-white mb-4 border-l-[3px] border-[#fbbf24] pl-3">
        T8: "Guessed right" vs "Understood right"
      </h2>
      <div className="flex gap-6 flex-1 items-start">
        <div className="flex-1">
          <table className="w-full border-collapse text-[13px] mb-4">
            <thead>
              <tr>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Format</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-center font-medium">Score</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-center font-medium">Assumed</th>
                <th className="bg-[#1a3a6b] text-black px-3 py-2 text-left font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="px-3 py-2 text-white/70">Pure YAML (no comments)</td>
                <td className="px-3 py-2 text-center text-[#4ade80] font-mono">9/10</td>
                <td className="px-3 py-2 text-center text-[#f87171] font-mono">10</td>
                <td className="px-3 py-2 text-[11px] text-[#f87171]">10 silent decisions embedded in code</td>
              </tr>
              <tr className="border-b border-white/10 bg-white/5">
                <td className="px-3 py-2 text-white/70">YAML + comments</td>
                <td className="px-3 py-2 text-center text-[#4ade80] font-mono">9/10</td>
                <td className="px-3 py-2 text-center text-[#4ade80] font-mono">0</td>
                <td className="px-3 py-2 text-[11px] text-[#4ade80]">Fully reproducible</td>
              </tr>
            </tbody>
          </table>
          <Code sm>
{kw('payment')}:{'\n'}
{'  '}{st('retry_on')}: [network_error]{'\n'}
{'  '}{cm('# NOT validation errors, NOT declined cards')}{'\n'}
{'  '}{cm('# user must fix input — max 3 retries, then contact support')}
          </Code>
        </div>
        <div className="w-[200px] flex flex-col gap-3">
          <div className="bg-[#0d1220] rounded-lg p-4 border border-[#2a5ff5]/30 text-[13px] text-white/85 leading-6 italic">
            "Guessed right" is not reproducible.
            <br /><br />
            "Understood right" is.
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-[11px] text-white/50 leading-5">
            Same score. Completely different risk profile. After generation, ask: "What did you assume I didn't specify?"
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S12: The Gap Diagram ─────────────────────────────────────────────────────

function S12_GapDiagram({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-8 pb-12 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-6 border-l-[3px] border-[#a78bfa] pl-3">
        The gap
      </h2>
      <div className="flex gap-6 flex-1 items-center">
        <div className="flex-1 bg-white/5 rounded-xl p-5 border border-white/10">
          <div className="text-[11px] text-white/40 uppercase tracking-widest mb-3">What you know</div>
          <div className="flex flex-col gap-2">
            {[
              ['vat_blocked: [RU, BY]', 'legal decision · Q2'],
              ['retry_on: [network_error]', 'from prod post-mortem'],
              ['provider: internal', 'GDPR requirement'],
              ['discount > 6 months tenure', 'sales team agreement'],
            ].map(([rule, source]) => (
              <div key={rule} className="flex items-center justify-between">
                <code className="text-[#00c4b4] text-[12px]">{rule}</code>
                <span className="text-[10px] text-white/30">{source}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 px-4">
          <div className="text-[40px] text-[#f87171]">≠</div>
          <div className="text-[11px] text-white/30 uppercase tracking-widest">The gap</div>
        </div>
        <div className="flex-1 bg-white/5 rounded-xl p-5 border border-[#f87171]/30">
          <div className="text-[11px] text-[#f87171] uppercase tracking-widest mb-3">What you wrote</div>
          <div className="text-[20px] text-white/60 font-light italic leading-snug">
            "Build a React invoice form with line items and totals."
          </div>
        </div>
      </div>
      <div className="mt-4 text-[12px] text-white/40 text-center">
        The model worked with everything it received. The problem is the gap between these two things.
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S13: Core Insight ────────────────────────────────────────────────────────

function S13_CoreInsight({ slideNumber }: SlideProps) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center px-16 ${Gradient}`}>
      <div className="text-center max-w-[680px]">
        <div className="text-[32px] font-light text-white leading-snug mb-8">
          "The gap isn't between you and the model.
          <br />
          It's between what you know —
          <br />
          <strong className="font-semibold">and what you wrote down."</strong>
        </div>
        <div className="h-px bg-white/20 mb-6" />
        <div className="text-[16px] text-white/70 font-light leading-relaxed">
          The spec is not a communication tool for the model.
          <br />
          It's a <strong className="text-white font-medium">knowledge extraction tool for you.</strong>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S14: SIFY Intro ──────────────────────────────────────────────────────────

function S14_SIFYIntro({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-8 pb-12 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-6 border-l-[3px] border-[#a78bfa] pl-3">
        SIFY — The Spec Is For You
      </h2>
      <div className="flex gap-8 flex-1 items-center">
        <div className="flex flex-col gap-4">
          {[
            ['S', 'Structure before generation'],
            ['I', 'Intent is yours, not AI\'s'],
            ['F', 'Format over syntax'],
            ['Y', 'Your assumed is your risk'],
          ].map(([letter, label]) => (
            <div key={letter} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6a1fc2] to-[#2a5ff5] flex items-center justify-center text-[28px] font-bold text-white flex-shrink-0">
                {letter}
              </div>
              <div className="text-[18px] text-white/80 font-light">{label}</div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="bg-white/5 rounded-xl p-5 border-l-[3px] border-[#a78bfa]">
            <div className="text-[13px] text-white/60 leading-6 mb-3">Like TDD — not a tool. A habit of thinking.</div>
            <div className="font-mono text-[13px] text-white/80">
              <div>TDD:  <span className="text-[#2a5ff5]">test</span> → code → verify</div>
              <div className="mt-1">SIFY: <span className="text-[#a78bfa]">spec</span> → prompt → generate → audit</div>
            </div>
          </div>
          <div className="text-[12px] text-white/40 leading-5 px-1">
            Write the spec before the prompt. The spec doesn't make you a better prompter — it forces your implicit knowledge into explicit form.
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S15: S — Structure ───────────────────────────────────────────────────────

function S15_Structure({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-10 pt-7 pb-12 bg-[#0d0d12]">
      <h2 className="text-[20px] font-light text-white mb-4 border-l-[3px] border-[#a78bfa] pl-3">
        S — Structure before generation
      </h2>
      <div className="flex gap-5 flex-1 min-h-0 items-start">
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Vague</div>
          <Code sm>Build a checkout button that submits the form.</Code>
          <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Structured — SIFY forces these questions</div>
          <Code sm>
{kw('component')}: CheckoutButton{'\n'}
{kw('on_click')}: validate → submit{'\n'}
{kw('on_network_error')}: retry max 3, then show error{'\n'}
{kw('on_validation_error')}: show inline, keep enabled{'\n'}
{kw('loading_state')}: disabled + spinner{'\n'}
{kw('do_not')}: [disable on validation error, auto-retry declined]
          </Code>
          <div className="text-[11px] text-[#a78bfa] mt-1">
            What happens on network vs validation error? You decided — not the model.
          </div>
        </div>
        <div className="w-[190px] flex flex-col gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-[11px] text-white/70 leading-5 border-t-[3px] border-[#a78bfa]">
            <div className="font-medium text-white mb-2">The contract</div>
            Before spec: measuring against your gut.<br /><br />
            After spec: measuring against a contract.<br /><br />
            <span className="text-[#a78bfa]">A contract doesn't change when the model surprises you.</span>
          </div>
          <div className="bg-black/30 rounded-lg p-2 text-[10px] text-white/40">
            Proven by T1: 2–3/10 → 9/10 from format alone.
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S16: I — Intent ─────────────────────────────────────────────────────────

function S16_Intent({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-10 pt-7 pb-12 bg-[#0d0d12]">
      <h2 className="text-[20px] font-light text-white mb-5 border-l-[3px] border-[#2a5ff5] pl-3">
        I — Intent is yours, not AI's
      </h2>
      <div className="flex gap-5 flex-1 items-start">
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-[13px] text-white/60 mb-1">Three real rules from the invoice form research:</div>
          {[
            ['vat_blocked: [RU, BY]', 'Legal team decision · Post-Brexit compliance'],
            ['retry_on: [network_error]', 'From a production incident six months ago'],
            ['provider: internal', 'GDPR requirement for your market'],
          ].map(([rule, source]) => (
            <div key={rule} className="bg-white/5 rounded-lg p-3 flex gap-3 items-start border-l-[2px] border-[#2a5ff5]">
              <code className="text-[#00c4b4] text-[13px] min-w-[230px]">{rule}</code>
              <div className="text-[11px] text-white/40">{source}</div>
            </div>
          ))}
          <div className="mt-2 text-[13px] text-[#f87171] font-medium">
            None of that is in any training data. None of that will ever be inferred.
          </div>
        </div>
        <div className="w-[210px] flex flex-col gap-3">
          <div className="bg-[#0d1220] rounded-lg p-4 border border-[#2a5ff5]/30 text-[12px] text-white/70 leading-5">
            <div className="text-[#2a5ff5] font-medium mb-2">The extraction test</div>
            Write a vague prompt. Then write a spec. Count lines in the spec that weren't in the prompt.<br /><br />
            <span className="text-white/85">Each one = a business rule that lived only in your head.</span>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S17: F & Y ───────────────────────────────────────────────────────────────

function S17_FY({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-10 pt-7 pb-12 bg-[#0d0d12]">
      <h2 className="text-[20px] font-light text-white mb-4 border-l-[3px] border-[#00c4b4] pl-3">
        F — Format over syntax · Y — Your assumed is your risk
      </h2>
      <div className="flex gap-5 flex-1 items-start">
        <div className="flex-1 flex flex-col gap-3 min-w-[60%]">
          <div className="text-[11px] text-white/40 uppercase tracking-widest">F: T7 — three different formats, identical results</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Standard', code: 'vat:\n  eu: 20\n  blocked: [RU,BY]' },
              { label: 'Renamed', code: 'vat_in:\n  eu: 20\n  restricted: [RU,BY]' },
              { label: 'Abbreviated', code: 'inside_eu_tax: 20\nno_tax_cc: [RU,BY]' },
            ].map(({ label, code }) => (
              <div key={label} className="bg-white/5 rounded-lg p-2">
                <div className="text-[10px] text-white/40 mb-1">{label}</div>
                <pre className="text-[10px] font-mono text-[#00c4b4] leading-4">{code}</pre>
                <div className="text-[10px] text-[#4ade80] mt-1">9–10/10 ✓</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-[#00c4b4]">No standard needed. Pick any format. Write the spec.</div>
        </div>
        <div className="w-1 bg-white/10 self-stretch mx-1 rounded" />
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-[11px] text-white/40 uppercase tracking-widest">Y: Comment the non-obvious</div>
          <Code sm>
{kw('payment')}:{'\n'}
{'  '}{st('retry_on')}: [network_error]{'\n'}
{'  '}{cm('# NOT validation errors')}{'\n'}
{'  '}{cm('# NOT declined cards — user must fix')}{'\n'}
{'  '}{cm('# max 3 — from prod post-mortem')}
          </Code>
          <div className="bg-black/30 rounded-lg p-3 text-[12px] text-white/70 leading-5">
            After generation, ask:<br />
            <span className="text-[#fbbf24] italic">"What did you assume I didn't specify?"</span><br />
            <span className="text-white/40 text-[11px]">The answer is your risk inventory.</span>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S18: SIFY in Practice ────────────────────────────────────────────────────

function S18_Practice({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-10 pt-7 pb-12 bg-[#0d0d12]">
      <h2 className="text-[20px] font-light text-white mb-3 border-l-[3px] border-[#a78bfa] pl-3">
        SIFY in practice — what appears that wasn't in your prompt
      </h2>
      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 flex flex-col gap-2">
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Before</div>
          <Code sm>Build a notification component that shows success, error and warning messages with auto-dismiss.</Code>
          <div className="text-[10px] text-[#a78bfa] uppercase tracking-widest mt-1">After SIFY</div>
          <Code sm>
{kw('component')}: NotificationToast{'\n'}
{kw('types')}:{'\n'}
{'  '}success: {'{'}auto_dismiss_ms: 3000{'}'}{'\n'}
{'  '}{er('error')}: {'{'}auto_dismiss_ms: null{cm('  # errors stay — user must see this')}{'}'}{'\n'}
{'  '}warning: {'{'}auto_dismiss_ms: 5000{'}'}{'\n'}
{kw('behavior')}: {'{'}max_visible: 3{cm('  # 4th pushes oldest out')}{'}'}{'\n'}
{kw('do_not')}: [{er('auto-dismiss errors')}{cm('  # a11y audit')}, show {'>'}3{cm('  # last sprint')}]
          </Code>
        </div>
        <div className="w-[200px] flex flex-col gap-3">
          <div className="bg-[#0a0a1a] rounded-lg p-3 border border-[#a78bfa]/30 text-[11px] text-white/70 leading-5">
            <div className="text-[#a78bfa] font-medium mb-2">What appeared:</div>
            <div className="text-[#f87171]">• Errors don't auto-dismiss</div>
            <div className="text-[#fbbf24]">• 3-notification limit</div>
            <div className="text-[#2a5ff5]">• aria_live: assertive</div>
            <div className="mt-2 text-white/40">None of this was in the original prompt.</div>
          </div>
          <div className="bg-black/30 rounded-lg p-2 text-[11px] text-white/50 leading-5">
            This spec: <strong className="text-white/70">4 minutes.</strong><br />
            The iteration it prevents: <strong className="text-white/70">30 minutes.</strong>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S19: Four Antipatterns ───────────────────────────────────────────────────

function S19_Antipatterns({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-8 pb-12 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-5 border-l-[3px] border-[#f87171] pl-3">
        Four antipatterns — each looks like it's working until it doesn't
      </h2>
      <div className="grid grid-cols-2 gap-4 flex-1">
        {[
          { name: 'Prompt and pray', violates: 'S', desc: 'Iterate without a contract. By message 5 you\'ve forgotten what you wanted. Model optimizes for your last message — not original intent.', worst: false },
          { name: 'Spec delegation', violates: 'I', desc: 'Ask AI to write the spec. T6: 1,306 tokens, 0 of your business rules. The smarter the model — the more convincing the spec with nothing about your domain.', worst: false },
          { name: 'Schema paralysis', violates: 'F', desc: 'Day spent finding the right YAML format. T7 proved: the model doesn\'t care about key names. The only thing paralysis produces is a day without a spec.', worst: false },
          { name: 'Silent success', violates: 'Y', desc: 'Code works. Tests pass. You ship. Ten decisions were made without you. You find out when a German customer tries to pay on a Tuesday afternoon.', worst: true },
        ].map(({ name, violates, desc, worst }) => (
          <div key={name} className={`rounded-lg p-4 border-l-[3px] ${worst ? 'bg-[#1a0505] border-[#f87171]' : 'bg-white/5 border-white/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-[15px] font-medium ${worst ? 'text-[#f87171]' : 'text-white'}`}>{name}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest">violates {violates}</div>
            </div>
            <div className="text-[12px] text-white/55 leading-5">{desc}</div>
            {worst && <div className="mt-2 text-[11px] text-[#f87171] font-medium">← The most dangerous. Looks exactly like success.</div>}
          </div>
        ))}
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S20: Monday Morning ──────────────────────────────────────────────────────

function S20_Monday({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-8 pb-12 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-5 border-l-[3px] border-[#4ade80] pl-3">
        What to do Monday morning
      </h2>
      <div className="flex gap-8 flex-1 items-start">
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-[13px] text-white/60 mb-1">Take one prompt you'll write this week. Before sending it:</div>
          {[
            ['1', 'Write down the constraints', 'Limits, rules, numbers that apply'],
            ['2', 'Write down the edge cases', 'Error? Timeout? Empty state? Blocked?'],
            ['3', 'Write down what should NOT happen', 'This is where your post-mortem knowledge lives'],
            ['4', 'Write down what the model can\'t know', 'Domain rules, legal decisions, team agreements'],
          ].map(([n, label, sub]) => (
            <div key={n} className="flex gap-3 items-start bg-white/5 rounded-lg p-3">
              <div className="w-7 h-7 rounded-full bg-[#4ade80] text-[#0a1a0a] flex items-center justify-center text-[12px] font-bold flex-shrink-0">{n}</div>
              <div>
                <div className="text-[13px] text-white font-medium">{label}</div>
                <div className="text-[11px] text-white/45 mt-0.5">{sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-[220px] flex flex-col gap-3">
          <div className="bg-[#0a1a0a] border border-[#4ade80]/30 rounded-lg p-4 text-[12px] text-white/70 leading-5">
            <div className="text-[#4ade80] font-medium mb-2">After generation, ask:</div>
            <div className="italic">"What decisions did you make that I didn't specify?"</div>
            <div className="mt-2 text-white/40">The answer is your risk inventory.</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-[12px] text-white/60 leading-5">
            That list is your spec. It doesn't need to be YAML. It needs to be <strong className="text-white/80">explicit.</strong>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S21: Close ───────────────────────────────────────────────────────────────

function S21_Close({ slideNumber }: SlideProps) {
  return (
    <div className={`w-full h-full flex flex-col justify-between px-12 pt-12 pb-14 ${Gradient}`}>
      <div className="flex gap-4">
        {['S', 'I', 'F', 'Y'].map((l) => (
          <div key={l} className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-[28px] font-bold text-white">
            {l}
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[36px] font-light text-white leading-snug mb-4 max-w-[600px]">
          The spec is not for the AI.
        </div>
        <div className="text-[36px] font-semibold text-white leading-snug mb-8">
          The spec is for you.
        </div>
        <div className="h-px bg-white/20 mb-6 max-w-[500px]" />
        <div className="flex gap-6 text-[13px] text-white/70">
          <span>github.com/ataztech910/sify-framework</span>
          <span>promptfarm.dev</span>
          <span>github.com/ataztech910</span>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const TALK2_SLIDES: SlideDef[] = [
  { Component: S3_Story },
  { Component: S4_NewStack },
  { Component: S5_Methodology },
  { Component: S6_T1 },
  { Component: S7_T2 },
  { Component: S8_T3 },
  { Component: S9_T4 },
  { Component: S10_T6 },
  { Component: S11_T8 },
  { Component: S12_GapDiagram },
  { Component: S13_CoreInsight },
  { Component: S14_SIFYIntro },
  { Component: S15_Structure },
  { Component: S16_Intent },
  { Component: S17_FY },
  { Component: S18_Practice },
  { Component: S19_Antipatterns },
  { Component: S20_Monday },
  { Component: S21_Close },
]
