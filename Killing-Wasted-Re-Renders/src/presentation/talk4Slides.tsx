import type { SlideProps, SlideDef } from './slides'

const Gradient = 'bg-gradient-to-br from-[#6a1fc2] via-[#2a5ff5] to-[#00c4b4]'

function Footer({ n }: { n: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-9 flex items-center justify-between px-5">
      <span className="text-[10px] uppercase tracking-widest text-white/40">DevBcn 2026</span>
      <span className="text-xs flex items-center gap-1 text-white/60">
        <span className="w-3.5 h-3.5 rounded-sm bg-white/20" />
        {n}
      </span>
    </div>
  )
}

// ─── S02: Core Idea ───────────────────────────────────────────────────────────

function T4S02_CoreIdea({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 bg-[#0d0d12]">
      <div className="text-[52px] font-light text-white leading-tight text-center">
        We write software
        <br />
        <span className="text-white/50">to solve problems.</span>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S03: The Twist ───────────────────────────────────────────────────────────

function T4S03_Twist({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 bg-[#0d0d12]">
      <div className="text-[52px] font-light text-white/40 leading-tight text-center mb-4">
        We write software to solve problems.
      </div>
      <div className="text-[52px] font-semibold text-[#f87171] leading-tight text-center">
        Not to create new ones.
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S04: Relocated Complexity ────────────────────────────────────────────────

function T4S04_Relocated({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-12 pb-14 bg-[#0d0d12]">
      <div className="flex-1 flex flex-col justify-center gap-8">
        <div className="flex gap-6 items-center">
          <div className="w-2 h-20 bg-[#4ade80] rounded-full flex-shrink-0" />
          <div>
            <div className="text-[13px] text-[#4ade80] uppercase tracking-widest mb-2">Then</div>
            <div className="text-[26px] font-light text-white">
              Automation <span className="text-[#4ade80]">removed</span> complexity.
            </div>
            <div className="text-[14px] text-white/40 mt-1">Assembly → languages. Manual builds → make, npm. Dependency tracking → package managers.</div>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <div className="w-2 h-20 bg-[#f87171] rounded-full flex-shrink-0" />
          <div>
            <div className="text-[13px] text-[#f87171] uppercase tracking-widest mb-2">Now</div>
            <div className="text-[26px] font-light text-white">
              We started <span className="text-[#f87171]">relocating</span> it.
            </div>
            <div className="text-[14px] text-white/40 mt-1">Same problem. New abstraction. New name. Handed back to the developer.</div>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S05: AI Won't Fix This ───────────────────────────────────────────────────

function T4S05_AI({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-8 border-l-[3px] border-[#fbbf24] pl-3">
        The obvious answer
      </h2>
      <div className="flex-1 flex flex-col justify-center items-center gap-6">
        <div className="text-[64px] text-white font-light text-center leading-none">
          "Just ask AI."
        </div>
        <div className="text-[16px] text-white/40 text-center max-w-[560px] leading-relaxed">
          You don't know the gcloud command? Ask AI.
          <br />
          Don't understand the Dockerfile? Ask AI.
          <br />
          IAM permissions failing? Ask AI.
        </div>
        <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-xl px-6 py-4 text-[14px] text-[#fbbf24] text-center max-w-[480px]">
          "It's fine — developers can just ask AI."
          <span className="text-white/40 block mt-1 text-[12px]">becoming a justification for leaving bad DX in place</span>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S06: The Difference ─────────────────────────────────────────────────────

function T4S06_Difference({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <div className="flex-1 flex gap-6 items-stretch">
        <div className="flex-1 bg-[#1a1a0a] border border-[#fbbf24]/30 rounded-xl p-6 flex flex-col gap-4">
          <div className="text-[11px] text-[#fbbf24] uppercase tracking-widest">AI</div>
          <div className="text-[26px] font-light text-white leading-snug">
            Makes complexity <span className="text-[#fbbf24]">tolerable</span>.
          </div>
          <div className="text-[13px] text-white/50 leading-6 flex-1">
            You still need to know enough to ask the right question.
            <br />You still verify the output.
            <br />You still know when it's wrong.
            <br /><br />
            The cognitive layer is still there.
            <br />AI just made it slightly thinner.
          </div>
        </div>
        <div className="flex items-center text-white/20 text-[32px] font-thin px-2">≠</div>
        <div className="flex-1 bg-[#0a1a0a] border border-[#4ade80]/30 rounded-xl p-6 flex flex-col gap-4">
          <div className="text-[11px] text-[#4ade80] uppercase tracking-widest">Real automation</div>
          <div className="text-[26px] font-light text-white leading-snug">
            Makes it <span className="text-[#4ade80]">disappear</span>.
          </div>
          <div className="text-[13px] text-white/50 leading-6 flex-1">
            You don't ask AI how to configure your Vercel deployment.
            <br /><br />
            You don't think about it.
            <br /><br />
            <span className="text-white/80">It just works.</span>
            <br /><br />
            That's a fundamentally different thing.
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S07: Lefty Setup ─────────────────────────────────────────────────────────

function T4S07_LeftySetup({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 bg-[#0d0d12]">
      <div className="text-[13px] text-white/30 uppercase tracking-widest mb-6">Nikolai Leskov, 1881</div>
      <div className="text-[40px] font-light text-white leading-snug text-center max-w-[640px]">
        A 19th century Russian story
        <br />
        about a craftsman
        <br />
        <span className="text-[#f97316]">and a flea.</span>
      </div>
      <div className="mt-8 text-[14px] text-white/35 text-center max-w-[480px] leading-relaxed">
        The English built a mechanical flea — tiny, perfect, it dances.
        <br />
        The Tsar brings it to Russia and asks: can you do something with this?
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S08: The Punchline ───────────────────────────────────────────────────────

function T4S08_Punchline({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-10 pb-14 bg-[#0d0d12]">
      <div className="flex-1 flex gap-8 items-center">
        <div className="flex-1 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="text-[13px] text-[#4ade80] uppercase tracking-widest">The masterwork</div>
            <div className="text-[28px] font-light text-white leading-snug">
              Microscopic horseshoes.
              <br />
              Each one engraved with the craftsman's name.
              <br />
              Too small to see with the naked eye.
            </div>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex flex-col gap-2">
            <div className="text-[13px] text-[#f87171] uppercase tracking-widest">The consequence</div>
            <div className="text-[28px] font-light text-[#f87171] leading-snug">
              The flea no longer dances.
            </div>
            <div className="text-[14px] text-white/40 leading-relaxed">
              The mechanism was disrupted by the very improvement
              <br />
              that was meant to prove its value.
            </div>
          </div>
        </div>
        <div className="w-[240px] flex flex-col gap-4">
          <div className="bg-[#1a0a00] border border-[#f97316]/30 rounded-xl p-5 text-[13px] text-white/70 leading-6 italic">
            "So focused on demonstrating their skill that they forgot to ask: does the thing still do what it's supposed to do?"
          </div>
          <div className="text-[11px] text-white/30 text-center">We do this with developer tooling all the time.</div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S09: The Real Question ───────────────────────────────────────────────────

function T4S09_RealQuestion({ slideNumber }: SlideProps) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center px-16 ${Gradient}`}>
      <div className="text-center max-w-[660px]">
        <div className="text-[44px] font-light text-white leading-snug mb-6">
          Is your tool solving the problem?
        </div>
        <div className="h-px bg-white/20 mb-6" />
        <div className="text-[44px] font-semibold text-white leading-snug">
          Or is it the horseshoe?
        </div>
        <div className="mt-8 text-[15px] text-white/60">Does the developer still ship? Or are they spending their time learning the tool that was supposed to help them ship?</div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S10: Personal Story Setup ────────────────────────────────────────────────

function T4S10_PersonalSetup({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 bg-[#0d0d12]">
      <div className="text-[13px] text-white/30 uppercase tracking-widest mb-6">Personal story</div>
      <div className="text-[44px] font-light text-white leading-snug text-center">
        I was a frontend developer
        <br />
        at a <span className="text-[#00c4b4]">backend startup</span>.
      </div>
      <div className="mt-8 text-[14px] text-white/40 text-center max-w-[480px] leading-relaxed">
        Small team. Two backend engineers and me.
        <br />
        First production release. A big moment.
        <br />
        My colleagues turned to me: "Can you handle the deploy?"
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S11: The Moment ─────────────────────────────────────────────────────────

function T4S11_Moment({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 bg-[#0d0d12]">
      <div className="bg-[#0d1a0d] border border-[#00c4b4]/30 rounded-2xl px-10 py-8 text-center max-w-[600px]">
        <div className="text-[48px] font-light text-white leading-snug mb-2">
          "Just merge to prod.
        </div>
        <div className="text-[48px] font-light text-white leading-snug mb-4">
          It'll deploy automatically."
        </div>
        <div className="text-[16px] text-[#00c4b4] font-light">— me</div>
        <div className="mt-5 text-[13px] text-white/35 leading-relaxed">
          On Vercel, on AWS Amplify — that's how it works.
          I'd done this dozens of times.
          I merged, opened a new tab, and waited.
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S12: Nothing Happened ────────────────────────────────────────────────────

function T4S12_Nothing({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 bg-[#0d0d12]">
      <div className="text-[72px] font-light text-white/20 leading-none mb-8">
        . . .
      </div>
      <div className="text-[64px] font-semibold text-[#f87171] leading-none mb-8">
        Nothing happened.
      </div>
      <div className="text-[15px] text-white/40 text-center max-w-[520px] leading-relaxed">
        They weren't doing anything wrong.
        They had pipelines. Everything was correctly set up for their workflow.
        <br /><br />
        The problem was entirely me.
        <br />
        I had <span className="text-white/60">completely forgotten the other world existed.</span>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S13: The Question It Raised ─────────────────────────────────────────────

function T4S13_QuestionRaised({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 bg-[#0d0d12]">
      <div className="text-[36px] font-light text-white leading-snug text-center max-w-[680px]">
        Why does the frontend ecosystem
        <br />
        have platforms that just handle it —
        <br />
        <span className="text-[#f87171]">and the backend ecosystem doesn't?</span>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S14: Ecosystem Map ───────────────────────────────────────────────────────

function T4S14_EcosystemMap({ slideNumber }: SlideProps) {
  const rows: [string, string, string, 'ok' | 'warn' | 'none'][] = [
    ['JavaScript / TS', 'Vercel, Deno Deploy', 'zero-config, push to deploy', 'ok'],
    ['PHP / Laravel', 'Laravel Cloud', 'fully managed, Feb 2025', 'ok'],
    ['Ruby / Rails', 'Kamal (bring your server)', 'need Docker, own server', 'warn'],
    ['Go', '—', '', 'none'],
    ['Python', '—', '', 'none'],
    ['Java', '—', '', 'none'],
    ['Rust', '—', '', 'none'],
  ]
  return (
    <div className="w-full h-full flex flex-col px-10 pt-8 pb-12 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-5 border-l-[3px] border-[#a78bfa] pl-3">
        Which ecosystems solved this — and which didn't
      </h2>
      <div className="flex-1 flex flex-col justify-center">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[11px] text-white/30 uppercase tracking-widest pb-2 pl-3">Stack</th>
              <th className="text-left text-[11px] text-white/30 uppercase tracking-widest pb-2">Platform</th>
              <th className="text-left text-[11px] text-white/30 uppercase tracking-widest pb-2">Note</th>
              <th className="text-center text-[11px] text-white/30 uppercase tracking-widest pb-2 pr-3">DX</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([stack, platform, note, status]) => (
              <tr key={stack} className="border-b border-white/5">
                <td className="py-2.5 pl-3 text-[14px] text-white/80 font-mono">{stack}</td>
                <td className="py-2.5 text-[13px] text-white/55">{platform}</td>
                <td className="py-2.5 text-[11px] text-white/30">{note}</td>
                <td className="py-2.5 pr-3 text-center text-[18px]">
                  {status === 'ok' && <span className="text-[#4ade80]">✓</span>}
                  {status === 'warn' && <span className="text-[#fbbf24]">⚠</span>}
                  {status === 'none' && <span className="text-[#f87171]">✗</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-[12px] text-white/30 text-center">
          Pattern: ecosystems that solved this had strong centralized leadership that decided to own the deployment story.
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S15: The Conversation That Stuck ────────────────────────────────────────

function T4S15_Conversation({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-10 pb-14 bg-[#0d0d12]">
      <div className="flex-1 flex gap-8 items-center">
        <div className="flex-1">
          <div className="bg-[#0a0d1a] border border-[#2a5ff5]/30 rounded-xl p-6 text-[18px] text-white/80 leading-8 italic mb-5">
            "But how does it know what to build?
            <br />
            Who configures the pipeline?
            <br />
            Where are the build steps?"
          </div>
          <div className="text-[13px] text-white/40">
            — a DevOps engineer, day two of the conversation
          </div>
          <div className="mt-5 text-[13px] text-white/55 leading-6">
            Experienced. Smart. Knew infrastructure deeply.
            <br /><br />
            He genuinely could not believe a platform could deploy
            without a configured pipeline.
            <br /><br />
            Every question: <em>"Someone must have set this up somewhere."</em>
          </div>
        </div>
        <div className="w-[260px] flex flex-col gap-4">
          <div className="bg-[#0d1220] border border-[#2a5ff5]/30 rounded-xl p-5 text-[13px] text-white/70 leading-6">
            <div className="text-[#2a5ff5] font-medium mb-2">My answer</div>
            "No, it just detects it. It just knows."
          </div>
          <div className="bg-black/30 rounded-xl p-4 text-[12px] text-white/45 leading-5">
            Vercel had made those decisions so invisible that a senior infrastructure engineer couldn't believe they existed at all.
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S16: Why Frontend Feels Different ───────────────────────────────────────

function T4S16_WhyFrontend({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 bg-[#0d0d12]">
      <div className="text-center max-w-[680px]">
        <div className="text-[14px] text-white/30 uppercase tracking-widest mb-6">The insight</div>
        <div className="text-[42px] font-light text-white/50 leading-snug mb-4">
          Vercel didn't make deployment easier.
        </div>
        <div className="h-px bg-white/15 mb-6" />
        <div className="text-[42px] font-semibold text-white leading-snug">
          They made it disappear.
        </div>
        <div className="mt-8 text-[14px] text-white/40 leading-relaxed">
          Making something easier: you still do it, with less friction.
          <br />
          Making it disappear: it's no longer part of your cognitive load at all.
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S17: Principle 1 — Detect ────────────────────────────────────────────────

function T4S17_Detect({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-10 pb-14 bg-[#0d0d12]">
      <div className="text-[11px] text-[#a78bfa]/70 uppercase tracking-widest mb-2">Principle 1</div>
      <h2 className="text-[32px] font-light text-white mb-8 border-l-[3px] border-[#a78bfa] pl-3">
        Auto-detection.
      </h2>
      <div className="flex gap-8 flex-1 items-center">
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-white/5 rounded-xl p-5 border-l-[3px] border-[#a78bfa]">
            <div className="text-[16px] text-white/80 leading-relaxed">
              The platform figures out what you have.
              <br />
              <span className="text-[#a78bfa] font-medium">You don't tell it.</span>
            </div>
          </div>
          <div className="text-[13px] text-white/45 leading-6">
            You push a Next.js project — the platform knows.
            <br />
            You push a Remix app, an Astro site — it recognizes them.
            <br /><br />
            No config file that says "this is Next.js, please use the Next.js pipeline."
            <br />
            The platform reads your project and figures it out.
          </div>
        </div>
        <div className="w-[260px] bg-black/30 rounded-xl p-5 text-[13px] text-white/60 leading-6">
          <div className="text-[#a78bfa] font-medium mb-3">Why it matters</div>
          The developer's first action when they want to deploy is
          <span className="text-white/85"> writing code</span> —
          not writing configuration that describes the code they're about to write.
          <br /><br />
          The absence of that first config step changes everything.
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S18: Principle 2 — Decide ────────────────────────────────────────────────

function T4S18_Decide({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-10 pb-14 bg-[#0d0d12]">
      <div className="text-[11px] text-[#2a5ff5]/70 uppercase tracking-widest mb-2">Principle 2</div>
      <h2 className="text-[32px] font-light text-white mb-8 border-l-[3px] border-[#2a5ff5] pl-3">
        Zero-config defaults.
      </h2>
      <div className="flex gap-8 flex-1 items-center">
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-white/5 rounded-xl p-5 border-l-[3px] border-[#2a5ff5]">
            <div className="text-[16px] text-white/80 leading-relaxed">
              Reasonable decisions made once —
              <br />
              <span className="text-[#2a5ff5] font-medium">not by every developer every time.</span>
            </div>
          </div>
          <div className="text-[13px] text-white/45 leading-6">
            Build command, output directory, caching strategy —
            all decided by the platform.
            <br /><br />
            The collective knowledge of "how to deploy correctly"
            lives in the platform — not in a wiki page,
            not in tribal knowledge that only the senior engineer has.
          </div>
        </div>
        <div className="w-[260px] bg-black/30 rounded-xl p-5 text-[13px] text-white/60 leading-6">
          <div className="text-[#2a5ff5] font-medium mb-3">The key</div>
          When you need to override — you can.
          <br /><br />
          But you don't have to <em>understand</em> it
          <br />
          before you can <em>start</em>.
          <br /><br />
          <span className="text-white/35 text-[11px]">It's encoded. It's automatic.</span>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S19: Principle 3 — Defer ────────────────────────────────────────────────

function T4S19_Defer({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-10 pb-14 bg-[#0d0d12]">
      <div className="text-[11px] text-[#00c4b4]/70 uppercase tracking-widest mb-2">Principle 3</div>
      <h2 className="text-[32px] font-light text-white mb-8 border-l-[3px] border-[#00c4b4] pl-3">
        Progressive complexity.
      </h2>
      <div className="flex gap-8 flex-1 items-center">
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white/5 rounded-xl p-5 border-l-[3px] border-[#00c4b4]">
            <div className="text-[16px] text-white/80 leading-relaxed">
              Simple things simple.
              <br />
              <span className="text-[#00c4b4] font-medium">Advanced things possible — not required.</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 bg-[#0a1a1a] rounded-xl p-4 border border-[#00c4b4]/20">
              <div className="text-[11px] text-[#00c4b4] uppercase tracking-widest mb-2">Frontend</div>
              <div className="text-[12px] text-white/55 leading-5">Complexity deferred until you need it. Start simple. Ship something.</div>
            </div>
            <div className="flex-1 bg-[#1a0a0a] rounded-xl p-4 border border-[#f87171]/20">
              <div className="text-[11px] text-[#f87171] uppercase tracking-widest mb-2">Backend</div>
              <div className="text-[12px] text-white/55 leading-5">Complexity front-loaded. IAM, registries, build pipelines — all prerequisites.</div>
            </div>
          </div>
        </div>
        <div className="w-[240px] bg-black/30 rounded-xl p-5 text-[13px] text-white/60 leading-6">
          <div className="text-[#00c4b4] font-medium mb-3">The inversion</div>
          On the backend, the advanced stuff isn't optional —
          it's a <em>prerequisite</em>.
          <br /><br />
          Progressive complexity flips that.
          <br /><br />
          <span className="text-white/35 text-[11px]">This is the one the backend world gets most wrong.</span>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S20: Backend Reality Setup ───────────────────────────────────────────────

function T4S20_BackendReality({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 bg-[#0d0d12]">
      <div className="text-[13px] text-white/30 uppercase tracking-widest mb-6">Backend reality</div>
      <div className="text-[40px] font-light text-white leading-snug text-center mb-6">
        To deploy a Go service
        <br />
        from scratch:
      </div>
      <div className="text-[14px] text-white/40 text-center">
        I want to walk through the standard path.
        <br />
        Notice: how many steps before any business logic.
        <br />
        Notice: how each step assumes knowledge from the previous one.
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S21: The List ────────────────────────────────────────────────────────────

function T4S21_TheList({ slideNumber }: SlideProps) {
  const steps = [
    ['1', 'Install the CLI'],
    ['2', 'Configure a project'],
    ['3', 'Enable required APIs'],
    ['4', 'Set up a container registry'],
    ['5', 'Configure service account + IAM roles'],
    ['6', 'Write a Dockerfile (or learn Buildpacks)'],
    ['7', 'Set up a build pipeline'],
    ['8', 'Deploy'],
  ]
  return (
    <div className="w-full h-full flex flex-col px-10 pt-8 pb-12 bg-[#0d0d12]">
      <div className="flex gap-8 flex-1">
        <div className="flex-1 flex flex-col gap-2 justify-center">
          {steps.map(([n, label]) => (
            <div key={n} className="flex items-center gap-4 py-1.5 border-b border-white/5">
              <span className="text-[13px] font-mono text-white/25 min-w-[20px]">{n}.</span>
              <span className="text-[15px] text-white/70">{label}</span>
            </div>
          ))}
        </div>
        <div className="w-[240px] flex flex-col justify-center gap-4">
          <div className="bg-[#1a0a0a] border border-[#f87171]/30 rounded-xl p-5 text-[13px] text-[#f87171] leading-6 font-mono text-[20px] text-center">
            9.<br />
            <span className="text-[16px] text-white/60 font-sans font-light">Write some code?</span>
          </div>
          <div className="text-[11px] text-white/30 text-center leading-5">
            A dependency chain of infrastructure knowledge that has nothing to do with whether your service actually works.
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S22: Not All Stacks Equal ────────────────────────────────────────────────

function T4S22_NotAllStacks({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 bg-[#0d0d12]">
      <div className="text-[13px] text-white/30 uppercase tracking-widest mb-6">Stack-specific knowledge</div>
      <div className="text-[40px] font-light text-white leading-snug text-center mb-8">
        Not all stacks have
        <br />
        the same story.
      </div>
      <div className="text-[14px] text-white/40 text-center max-w-[500px] leading-relaxed">
        The right deployment target depends on your stack.
        <br />
        Most developers don't know this until they pick the wrong one.
        <br /><br />
        This is the kind of knowledge that should live in a tool.
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S23: The Comparison ─────────────────────────────────────────────────────

function T4S23_Comparison({ slideNumber }: SlideProps) {
  const rows: [string, string, string, string][] = [
    ['Go', 'single binary', '✓ Lambda', '✓ Cloud Run'],
    ['Node', 'SSR / runtime', '⚠ Lambda', '✓ Cloud Run'],
    ['Ruby', 'needs runtime', '✗ Lambda', '✓ Cloud Run'],
    ['PHP', 'needs runtime', '✗ Lambda', '✓ Cloud Run'],
  ]
  return (
    <div className="w-full h-full flex flex-col px-10 pt-8 pb-12 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-5 border-l-[3px] border-[#fbbf24] pl-3">
        Stack → deployment target fit
      </h2>
      <div className="flex gap-6 flex-1">
        <div className="flex-1 flex flex-col justify-center">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[11px] text-white/30 uppercase tracking-widest pb-3 pl-3">Stack</th>
                <th className="text-left text-[11px] text-white/30 uppercase tracking-widest pb-3">Runtime</th>
                <th className="text-center text-[11px] text-white/30 uppercase tracking-widest pb-3">Lambda</th>
                <th className="text-center text-[11px] text-white/30 uppercase tracking-widest pb-3 pr-3">Cloud Run</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([stack, runtime, lambda, cloudrun]) => (
                <tr key={stack} className="border-b border-white/5">
                  <td className="py-3 pl-3 text-[16px] text-white/85 font-mono">{stack}</td>
                  <td className="py-3 text-[13px] text-white/40">{runtime}</td>
                  <td className={`py-3 text-center text-[18px] ${lambda.startsWith('✓') ? 'text-[#4ade80]' : lambda.startsWith('⚠') ? 'text-[#fbbf24]' : 'text-[#f87171]'}`}>{lambda}</td>
                  <td className={`py-3 pr-3 text-center text-[18px] ${cloudrun.startsWith('✓') ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>{cloudrun}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-[240px] flex flex-col gap-4">
          <div className="bg-[#0d1a0d] border border-[#4ade80]/20 rounded-xl p-4 text-[12px] text-white/60 leading-5">
            <div className="text-[#4ade80] font-medium mb-2">Go single binary</div>
            No runtime deps. Fast cold starts. Near-perfect for Lambda. Cloud Run works great too.
          </div>
          <div className="bg-[#1a1a0a] border border-[#fbbf24]/20 rounded-xl p-4 text-[12px] text-white/60 leading-5">
            <div className="text-[#fbbf24] font-medium mb-2">The point</div>
            This decision can be automated.
            <br />
            A tool that detects your stack can apply the right default.
            <br />
            <span className="text-white/35">This knowledge should live in tooling.</span>
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S24: Where It Came From ─────────────────────────────────────────────────

function T4S24_WhereFrom({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-10 pb-14 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-6 border-l-[3px] border-[#a78bfa] pl-3">
        Why this happened — and why it's not anyone's fault
      </h2>
      <div className="flex gap-8 flex-1 items-center">
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-white/5 rounded-xl p-5">
            <div className="text-[13px] text-[#a78bfa] uppercase tracking-widest mb-2">Built for</div>
            <div className="text-[16px] text-white/80 leading-relaxed">
              gcloud, kubectl, terraform — built for infrastructure engineers
              who manage systems at scale.
            </div>
          </div>
          <div className="bg-[#1a0a0a] rounded-xl p-5 border-l-[3px] border-[#f87171]">
            <div className="text-[13px] text-[#f87171] uppercase tracking-widest mb-2">The shift</div>
            <div className="text-[16px] text-white/80 leading-relaxed">
              The industry moved toward microservices.
              Every team owning their own deployment.
              <br /><br />
              Suddenly every backend developer was expected to also be
              a little bit of an ops engineer.
            </div>
          </div>
        </div>
        <div className="w-[260px] bg-black/30 rounded-xl p-5 text-[13px] text-white/60 leading-6">
          <div className="font-medium text-white/80 mb-3">The tools didn't change.</div>
          The audience did.
          <br /><br />
          The assumption was that developers would learn the tools.
          <br /><br />
          And some did.
          <br />
          But a lot just got stuck.
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S25: The Right Order ────────────────────────────────────────────────────

function T4S25_RightOrder({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 bg-[#0d0d12]">
      <div className="text-[13px] text-white/30 uppercase tracking-widest mb-6">Learning order</div>
      <div className="text-[36px] font-light text-white leading-snug text-center mb-8 max-w-[600px]">
        The order you encounter things
        <br />
        shapes how you understand them.
      </div>
      <div className="text-[14px] text-white/40 text-center max-w-[520px] leading-relaxed">
        A developer who spends week one writing business logic
        has a completely different relationship with infrastructure when they get there.
        <br /><br />
        The complexity has <span className="text-white/60">context</span>.
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S26: Progressive Path ───────────────────────────────────────────────────

function T4S26_ProgressivePath({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-10 pb-14 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-8 border-l-[3px] border-[#4ade80] pl-3">
        The right order of learning
      </h2>
      <div className="flex-1 flex flex-col gap-5 justify-center">
        {[
          { day: 'Day 1', label: 'Write logic. Ship something.', desc: "It doesn't need to be perfect infrastructure. It needs to be running — so you have something real to work with.", color: '#4ade80' },
          { day: 'Day 30', label: 'Understand what\'s running it.', desc: "You've shipped a few things, you're hitting real constraints. That knowledge has context now.", color: '#2a5ff5' },
          { day: 'Day 90', label: 'Own the infrastructure.', desc: "You've earned the complexity because you understand what it's for.", color: '#a78bfa' },
        ].map(({ day, label, desc, color }) => (
          <div key={day} className="flex gap-5 items-start">
            <div className="w-20 text-right">
              <span className="text-[13px] font-mono" style={{ color }}>{day}</span>
            </div>
            <div className="w-px self-stretch mx-1" style={{ backgroundColor: color + '40' }} />
            <div className="flex-1">
              <div className="text-[18px] font-medium text-white">{label}</div>
              <div className="text-[12px] text-white/40 mt-1 leading-5">{desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-[11px] text-white/25 text-center">
        Progressive complexity isn't about hiding things forever. It's about the right time.
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S27: The Standard ───────────────────────────────────────────────────────

function T4S27_Standard({ slideNumber }: SlideProps) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center px-16 ${Gradient}`}>
      <div className="text-center max-w-[680px]">
        <div className="text-[36px] font-light text-white leading-snug mb-6">
          Does this tool remove the problem?
        </div>
        <div className="h-px bg-white/20 mb-6" />
        <div className="text-[22px] font-light text-white/60 leading-relaxed">
          Or does it just make the problem
          <br />
          <span className="text-white font-medium">easier to deal with?</span>
        </div>
        <div className="mt-8 bg-white/10 rounded-xl px-6 py-4 text-[14px] text-white/70 leading-relaxed">
          When make automated compilation, developers stopped thinking about compilation.
          The problem <em>disappeared</em>. That's the bar.
          <br /><br />
          We've started accepting "easier to deal with" as good enough.
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S28: Demo Intro ─────────────────────────────────────────────────────────

function T4S28_DemoIntro({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 bg-[#0d0d12]">
      <div className="text-[13px] text-white/30 uppercase tracking-widest mb-6">Proof of concept</div>
      <div className="text-[44px] font-light text-white leading-snug text-center mb-8">
        What if the backend had this too?
      </div>
      <div className="text-[14px] text-white/40 text-center max-w-[520px] leading-relaxed">
        I spent months thinking about this gap.
        I decided to try something.
        <br /><br />
        Same three principles —
        <span className="text-white/70"> detect, decide, defer</span>
        — applied to backend deployment.
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S29: Demo ────────────────────────────────────────────────────────────────

function T4S29_Demo({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0f]">
      <video
        src="/advncd-demo.mov"
        controls
        className="w-full h-full object-contain"
        style={{ maxHeight: 'calc(100% - 36px)' }}
      >
        <track kind="captions" />
      </video>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S30: How It Works ───────────────────────────────────────────────────────

function T4S30_HowItWorks({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-6 border-l-[3px] border-[#00c4b4] pl-3">
        How it works — not magic
      </h2>
      <div className="flex gap-8 flex-1 items-center">
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white/5 rounded-xl p-5">
            <div className="text-[13px] text-[#00c4b4] uppercase tracking-widest mb-3">Stack detection</div>
            <div className="text-[14px] text-white/70 leading-6 font-mono">
              go.mod &nbsp;&nbsp;&nbsp; → Go project<br />
              package.json → Node<br />
              Gemfile &nbsp;&nbsp;&nbsp; → Ruby<br />
              composer.json → PHP
            </div>
          </div>
          <div className="text-[13px] text-white/45 leading-6">
            ~300 lines of Go.
            <br />
            From that it knows: runtime, likely entry point, what kind of container to build.
            <br /><br />
            The defaults — port, memory, minimum instances — are decisions made once.
            Based on what works for most services.
          </div>
        </div>
        <div className="w-[280px] flex flex-col gap-4">
          <div className="bg-[#0a1a1a] border border-[#00c4b4]/30 rounded-xl p-5 text-[13px] text-white/70 leading-6">
            <div className="text-[#00c4b4] font-medium mb-3">Detect → Decide → Defer</div>
            The complexity didn't disappear.
            <br /><br />
            It moved — from every developer's head into one place where it can be maintained and improved.
          </div>
          <div className="bg-black/30 rounded-xl p-4 text-[12px] text-white/40 leading-5">
            Same three principles that made frontend delivery feel lightweight.
          </div>
        </div>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S31: What You Can Do ─────────────────────────────────────────────────────

function T4S31_WhatYouCan({ slideNumber }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-9 pb-14 bg-[#0d0d12]">
      <h2 className="text-[22px] font-light text-white mb-6 border-l-[3px] border-[#fbbf24] pl-3">
        You don't need a new tool. You need a new question.
      </h2>
      <div className="flex-1 flex flex-col gap-4 justify-center">
        {[
          {
            n: '1',
            title: 'Separate "deploy for the developer" from "infrastructure for ops."',
            desc: 'These are different problems with different audiences. A developer shipping a feature shouldn\'t need to understand your full infrastructure topology.',
          },
          {
            n: '2',
            title: 'Put your deployment defaults somewhere executable.',
            desc: 'Not a wiki. Not a Notion doc six months out of date. A script, a config file, something that runs. Decisions made once — not rediscovered by every new hire.',
          },
          {
            n: '3',
            title: 'Audit your onboarding.',
            desc: 'What step is required that shouldn\'t be? What knowledge is a prerequisite on day one that could wait until day thirty?',
          },
        ].map(({ n, title, desc }) => (
          <div key={n} className="flex gap-5 items-start bg-white/5 rounded-xl p-4">
            <div className="w-8 h-8 rounded-full bg-[#fbbf24] text-black flex items-center justify-center text-[13px] font-bold flex-shrink-0">{n}</div>
            <div>
              <div className="text-[14px] text-white font-medium leading-snug mb-1">{title}</div>
              <div className="text-[12px] text-white/40 leading-5">{desc}</div>
            </div>
          </div>
        ))}
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── S32: Close ──────────────────────────────────────────────────────────────

function T4S32_Close({ slideNumber }: SlideProps) {
  return (
    <div className={`w-full h-full flex flex-col justify-between px-12 pt-12 pb-14 ${Gradient}`}>
      <div />
      <div className="flex flex-col gap-6">
        <div className="text-[38px] font-light text-white leading-snug">
          We write software to solve problems.
        </div>
        <div className="h-px bg-white/20 max-w-[500px]" />
        <div className="text-[22px] text-white/75 font-light leading-relaxed">
          What problems is your deployment process solving?
          <br />
          <span className="text-white font-medium">What problems is it creating?</span>
        </div>
        <div className="mt-2 text-[14px] text-white/50 leading-relaxed max-w-[580px]">
          Give the developer you hire next month the chance to write logic on day one.
          The infrastructure will still be there when they're ready for it.
        </div>
      </div>
      <div className="flex gap-6 text-[13px] text-white/50">
        <span>andreitazetdinov.com</span>
        <span>github.com/ataztech910</span>
      </div>
      <Footer n={slideNumber} />
    </div>
  )
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const TALK4_SLIDES: SlideDef[] = [
  { Component: T4S02_CoreIdea },
  { Component: T4S03_Twist },
  { Component: T4S04_Relocated },
  { Component: T4S05_AI },
  { Component: T4S06_Difference },
  { Component: T4S07_LeftySetup },
  { Component: T4S08_Punchline },
  { Component: T4S09_RealQuestion },
  { Component: T4S10_PersonalSetup },
  { Component: T4S11_Moment },
  { Component: T4S12_Nothing },
  { Component: T4S13_QuestionRaised },
  { Component: T4S14_EcosystemMap },
  { Component: T4S15_Conversation },
  { Component: T4S16_WhyFrontend },
  { Component: T4S17_Detect },
  { Component: T4S18_Decide },
  { Component: T4S19_Defer },
  { Component: T4S20_BackendReality },
  { Component: T4S21_TheList },
  { Component: T4S22_NotAllStacks },
  { Component: T4S23_Comparison },
  { Component: T4S24_WhereFrom },
  { Component: T4S25_RightOrder },
  { Component: T4S26_ProgressivePath },
  { Component: T4S27_Standard },
  { Component: T4S28_DemoIntro },
  { Component: T4S29_Demo },
  { Component: T4S30_HowItWorks },
  { Component: T4S31_WhatYouCan },
  { Component: T4S32_Close },
]
