import dynatraceEmblem from '../assets/Dynatrace-Emblem.png'

export function DynatraceLogo({ size = 80 }: { size?: number }) {
  return (
    <img
      src={dynatraceEmblem}
      width={size}
      height={size}
      alt="Dynatrace"
      style={{ objectFit: 'contain' }}
    />
  )
}
