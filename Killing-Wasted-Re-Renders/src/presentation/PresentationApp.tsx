import { useEffect, useRef, useState } from 'react'
import App from '../App'
import { AstDemoApp } from '../ast-demo/AstDemoApp'
import { SLIDES } from './slides'
import type { SlideDef, SlideProps } from './slides'
import { TALK2_SLIDES } from './talk2Slides'
import { TALK3_SLIDES } from './talk3Slides'
import { SpeakerSlide } from './SpeakerSlide'

type DemoMode = 'profiler' | 'full' | 'ast' | null

const STORAGE_KEY = 'jsworld-pres-v1'
const TALK_DURATION = 30 * 60

type PersistedPresentationState = {
  talk?: number
  slides?: number[]
  timerStartedAt?: number | null
}

function readPersistedState(): PersistedPresentationState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return {}
    return JSON.parse(saved) as PersistedPresentationState
  } catch {
    return {}
  }
}

function buildEvenCuePoints(slideCount: number): number[] {
  if (slideCount <= 1) return [0]
  return Array.from({ length: slideCount }, (_, index) =>
    Math.round((index / (slideCount - 1)) * TALK_DURATION),
  )
}

// ─── Talk definitions ─────────────────────────────────────────────────────────

type TalkDef = {
  title: string
  shortTitle: string
  day: string
  time: string
  stage: string
  slides: SlideDef[]
  cuePointsSec: number[]
}

const TALKS: TalkDef[] = [
  {
    title: 'Killing Wasted Re-Renders with Production Hook Instrumentation',
    shortTitle: 'Re-Renders',
    day: 'Day 1 · May 07',
    time: '15:00',
    stage: 'Duck Stage 2',
    slides: SLIDES,
    cuePointsSec: [
      0, 60, 150, 240, 330, 420, 510, 630, 720, 810,
      900, 990, 1080, 1170, 1260, 1380, 1500, 1620, 1710, 1800,
    ],
  },
  {
    title: 'The New Frontend Stack: Humans, AI, and Prompts',
    shortTitle: 'AI Stack',
    day: 'Day 2 · May 08',
    time: '09:30',
    stage: 'Duck Stage 2',
    slides: TALK2_SLIDES,
    cuePointsSec: buildEvenCuePoints(TALK2_SLIDES.length + 1),
  },
  {
    title: 'AST + AI = Developer Co-Pilot 2.0',
    shortTitle: 'AST + AI',
    day: 'Day 2 · May 08',
    time: '11:00',
    stage: 'Duck Stage 3',
    slides: TALK3_SLIDES,
    cuePointsSec: buildEvenCuePoints(TALK3_SLIDES.length + 1),
  },
]

function makeSpeakerSlideDef(talk: TalkDef): SlideDef {
  const SpeakerSlideComponent = ({ slideNumber, total }: SlideProps) => (
    <SpeakerSlide
      talkTitle={talk.title}
      day={talk.day}
      time={talk.time}
      stage={talk.stage}
      slideNumber={slideNumber}
      total={total}
      onDemo={() => {}}
    />
  )
  SpeakerSlideComponent.displayName = `SpeakerSlide_${talk.shortTitle}`
  return { Component: SpeakerSlideComponent }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── PresentationApp ──────────────────────────────────────────────────────────

export function PresentationApp() {
  const [currentTalk, setCurrentTalk] = useState<0 | 1 | 2>(() => {
    const { talk } = readPersistedState()
    if (talk === 0 || talk === 1 || talk === 2) return talk
    return 0
  })

  const [currentSlides, setCurrentSlides] = useState<number[]>(() => {
    const { slides } = readPersistedState()
    if (Array.isArray(slides) && slides.length === 3) return slides
    return [0, 0, 0]
  })

  const [demoMode, setDemoMode] = useState<DemoMode>(null)
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(() => {
    const { timerStartedAt } = readPersistedState()
    return typeof timerStartedAt === 'number' ? timerStartedAt : null
  })
  const [elapsed, setElapsed] = useState(0)
  const presRef = useRef<HTMLDivElement>(null)

  const talk = TALKS[currentTalk]
  const allSlides: SlideDef[] = [makeSpeakerSlideDef(talk), ...talk.slides]
  const total = allSlides.length
  const current = currentSlides[currentTalk]

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          talk: currentTalk,
          slides: currentSlides,
          timerStartedAt,
        }),
      )
    } catch {}
  }, [currentTalk, currentSlides, timerStartedAt])

  // Timer tick
  useEffect(() => {
    if (!timerStartedAt) {
      setElapsed(0)
      return
    }
    const updateElapsed = () => {
      const secs = Math.floor((Date.now() - timerStartedAt) / 1000)
      setElapsed(Math.min(Math.max(secs, 0), TALK_DURATION))
    }
    updateElapsed()
    const id = setInterval(() => {
      updateElapsed()
    }, 1000)
    return () => clearInterval(id)
  }, [timerStartedAt])

  const go = (delta: number) => {
    setCurrentSlides((prev) => {
      const next = [...prev]
      next[currentTalk] = Math.max(0, Math.min(total - 1, prev[currentTalk] + delta))
      return next
    })
  }

  const switchTalk = (idx: 0 | 1 | 2) => {
    setCurrentTalk(idx)
    setTimerStartedAt(null)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (demoMode) {
        if (e.key === 'Escape') setDemoMode(null)
        return
      }
      if (e.key === 'ArrowRight' || e.key === ' ') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [demoMode, currentTalk, currentSlides])

  useEffect(() => {
    const updateZoom = () => {
      const el = presRef.current
      if (!el) return
      ;(el.style as any).zoom = 1
      const zoomW = Math.min(window.innerWidth, 2000) / 900
      const zoomH = window.innerHeight / (el.offsetHeight || 1)
      ;(el.style as any).zoom = Math.min(zoomW, zoomH)
    }
    updateZoom()
    window.addEventListener('resize', updateZoom)
    return () => window.removeEventListener('resize', updateZoom)
  }, [demoMode])

  if (demoMode) {
    return (
      <div className="fixed inset-0 z-50 overflow-auto" style={{ background: demoMode === 'ast' ? '#f4f7fb' : '#f2f5fb' }}>
        {demoMode === 'ast'
          ? <AstDemoApp />
          : <App panelFilter={demoMode === 'profiler' ? 'profiler-only' : 'all'} />
        }
        <button
          onClick={() => setDemoMode(null)}
          className="fixed top-3 right-4 z-50 bg-[#1a3a6b] text-white text-xs px-3 py-1.5 rounded cursor-pointer hover:bg-[#2a5ff5] transition-colors"
        >
          ← slides (Esc)
        </button>
      </div>
    )
  }

  const remaining = Math.max(0, TALK_DURATION - elapsed)
  const progress = (elapsed / TALK_DURATION) * 100
  const barColor = remaining > 10 * 60 ? '#4ade80' : remaining > 5 * 60 ? '#fbbf24' : '#f87171'
  const slide = allSlides[current]
  const slideMarkers = talk.cuePointsSec.slice(0, total).map((cuePointSec, index) => ({
    index,
    label: index + 1,
    left: `${(cuePointSec / TALK_DURATION) * 100}%`,
    isActive: index === current,
  }))

  return (
    <div className="bg-[#1a1a2e] min-h-screen flex items-start justify-center">
      <div ref={presRef} style={{ width: 900 }}>

        {/* Talk tab bar */}
        <div className="flex bg-[#0d0d12]">
          {TALKS.map((t, i) => (
            <button
              key={i}
              onClick={() => switchTalk(i as 0 | 1 | 2)}
              className={`m-2 flex-1 px-3 py-2 text-xs text-left transition-all border-0 cursor-pointer border-b-[3px] ${
                currentTalk === i
                  ? 'bg-[#1a3a6b] text-white border-[#00c4b4]'
                  : 'bg-[#111] text-white/40 border-transparent hover:text-white/70 hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="font-semibold truncate">{t.shortTitle}</div>
              <div className={`text-[10px] mt-0.5 ${currentTalk === i ? 'text-white/60' : 'text-white/30'}`}>
                {t.day} · {t.time} · {t.stage}
              </div>
            </button>
          ))}
        </div>

        {/* Timer bar */}
        <div className="bg-[#0a0a10] px-3 py-1.5 pt-0 flex items-center gap-3 border-b border-white/5">
          {timerStartedAt ? (
            <>
              <div className="text-[11px] font-mono text-white/80 min-w-[48px]">
                {formatTime(remaining)}
              </div>
              <div className="relative flex-1 h-6">
                <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%`, backgroundColor: barColor }}
                  />
                </div>
                {slideMarkers.map((marker) => (
                  <div
                    key={marker.index}
                    className="absolute top-0 bottom-0 pointer-events-none"
                    style={{ left: marker.left }}
                  >
                    <div
                      className={`absolute left-1/2 top-0 -translate-x-1/2 text-[9px] font-mono ${
                        marker.isActive ? 'text-white/90' : 'text-white/35'
                      }`}
                    >
                      {marker.label}
                    </div>
                    <div
                      className={`absolute left-1/2 top-3 h-3 w-px -translate-x-1/2 ${
                        marker.isActive ? 'bg-white/90' : 'bg-white/30'
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-white/40">
                {formatTime(elapsed)} elapsed
              </div>
              <button
                onClick={() => setTimerStartedAt(null)}
                className="text-[10px] text-white/40 hover:text-white/70 border-0 bg-transparent cursor-pointer px-0"
              >
                ■ stop
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setTimerStartedAt(Date.now())}
                className="text-[11px] text-white/50 hover:text-white/80 border border-white/10 hover:border-white/30 bg-transparent cursor-pointer px-2 py-0.5 rounded transition-colors"
              >
                ▶ start 30 min
              </button>
              <div className="relative flex-1 h-6">
                <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/5" />
                {slideMarkers.map((marker) => (
                  <div
                    key={marker.index}
                    className="absolute top-0 bottom-0 pointer-events-none"
                    style={{ left: marker.left }}
                  >
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 text-[9px] font-mono text-white/30">
                      {marker.label}
                    </div>
                    <div className="absolute left-1/2 top-3 h-3 w-px -translate-x-1/2 bg-white/20" />
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-white/20">timer not running</div>
            </>
          )}
        </div>

        {/* Slide */}
        <div
          className="relative overflow-hidden rounded-b-lg"
          style={{ aspectRatio: '16/9' }}
        >
          <slide.Component
            onDemo={setDemoMode}
            slideNumber={current + 1}
            total={total}
          />
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between py-2 gap-2">
          <button
            onClick={() => go(-1)}
            className="bg-[#1a3a6b] text-white border-0 px-4 py-1.5 rounded cursor-pointer text-sm hover:bg-[#2a5ab0] transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-[#aaa]">
            {current + 1} / {total}
          </span>
          <button
            onClick={() => go(1)}
            className="bg-[#1a3a6b] text-white border-0 px-4 py-1.5 rounded cursor-pointer text-sm hover:bg-[#2a5ab0] transition-colors"
          >
            Next →
          </button>
        </div>

      </div>
    </div>
  )
}
