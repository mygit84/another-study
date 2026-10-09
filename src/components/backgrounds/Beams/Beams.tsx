// Прожектор сверху и вертикальные линии с бегущими бликами — для тёмных секций
const BEAMS = [
  { left: '6%', delay: 0, duration: 9 },
  { left: '21%', delay: -3.5, duration: 11 },
  { left: '38%', delay: -1.2, duration: 8 },
  { left: '62%', delay: -5, duration: 10 },
  { left: '79%', delay: -2.2, duration: 12 },
  { left: '94%', delay: -6.4, duration: 9 },
]

export function Beams() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute top-0 left-1/2 h-[520px] w-[1100px] max-w-[160%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial from-glow/30 via-glow-warm/10 to-transparent to-70% blur-3xl motion-safe:animate-spotlight" />
      {BEAMS.map((beam) => (
        <span key={beam.left} className="absolute inset-y-0 w-px bg-line" style={{ left: beam.left }}>
          <span
            className="absolute -inset-x-px top-0 h-1/4 bg-linear-to-b from-transparent via-glow to-transparent blur-[1px] motion-safe:animate-beam motion-reduce:hidden"
            style={{ animationDelay: `${beam.delay}s`, animationDuration: `${beam.duration}s` }}
          />
        </span>
      ))}
    </div>
  )
}
