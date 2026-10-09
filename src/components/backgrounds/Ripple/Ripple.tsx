// Концентрические круги в духе Magic UI Ripple
const RINGS = 8

export function Ripple() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden mask-[linear-gradient(to_bottom,black,transparent_85%)]"
    >
      {Array.from({ length: RINGS }, (_, i) => (
        <span
          key={i}
          className="absolute top-[18%] left-1/2 -translate-1/2 rounded-full border border-ripple motion-safe:animate-ripple lg:top-1/4 lg:left-[82%]"
          style={{
            width: 180 + i * 90,
            height: 180 + i * 90,
            opacity: 1 - i * 0.11,
            animationDelay: `${i * 0.08}s`,
            borderStyle: i === RINGS - 1 ? 'dashed' : 'solid',
          }}
        />
      ))}
    </div>
  )
}
