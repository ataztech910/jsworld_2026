import { DynatraceLogo } from './DynatraceLogo'
import type { SlideProps } from './slides'

type SpeakerSlideProps = SlideProps & {
  talkTitle: string
  day: string
  time: string
  stage: string
  eventName?: string
  eventCity?: string
}

const Gradient = 'bg-gradient-to-br from-[#6a1fc2] via-[#2a5ff5] to-[#00c4b4]'

export function SpeakerSlide({
  talkTitle,
  day,
  time,
  stage,
  slideNumber,
  eventName = 'JSWorld 2026',
  eventCity = 'Amsterdam',
}: SpeakerSlideProps) {
  const hasMeta = day || time || stage
  return (
    <div className={`w-full h-full flex flex-col ${Gradient}`}>
      <div className="flex flex-1 px-12 pt-10 pb-4 gap-12">

        {/* Left: talk title — big */}
        <div className="flex flex-col justify-center flex-1 gap-4">
          {hasMeta && (
            <div className="text-[11px] text-white/50 uppercase tracking-widest">
              {[day, time, stage].filter(Boolean).join(' · ')}
            </div>
          )}
          <h1 className="text-[38px] font-light text-white leading-tight">
            {talkTitle}
          </h1>
          <div className="text-[14px] text-white/60 font-light">
            {eventName} · {eventCity}
          </div>
        </div>

        {/* Right: speaker — smaller */}
        <div className="flex flex-col justify-center gap-3" style={{ minWidth: 220 }}>
          <div className="text-[22px] font-semibold text-white leading-tight">
            Andrei Tazetdinov
          </div>
          <div className="flex items-center gap-3">
            <DynatraceLogo size={36} />
            <div className="text-[13px] text-white/80">
              Senior Software Engineer<br />
              <span className="text-white/60">Dynatrace</span>
            </div>
          </div>
          <div className="text-[12px] text-white/60 leading-5 mt-1">
            AI-Driven React / React-Native Observability Engineer<br />
            Founder of tofo.dev - Desicion Engine for Solo founders<br />
            Published Author - Next.js topics
          </div>
          <div className="text-[12px] text-white/50 leading-5">
            github.com/ataztech910<br />
            andreitazetdinov.com
          </div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 h-9 flex items-center justify-between px-5">
        <span className="text-[10px] uppercase tracking-widest text-white/40">
          {eventName}
        </span>
        <span className="text-xs flex items-center gap-1 text-white/60">
          <span className="w-3.5 h-3.5 rounded-sm bg-white/20" />
          {slideNumber}
        </span>
      </div>
    </div>
  )
}
