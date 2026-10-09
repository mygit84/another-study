import { useOffscreen } from '@/hooks/useOffscreen'

// «Северное сияние» в духе Aceternity Aurora Background: размытые пятна бренда + точечная сетка.
// Пятна и сетка уезжают со скроллом с разной скоростью — получается глубина.
export function Aurora() {
  const ref = useOffscreen<HTMLDivElement>()
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 motion-safe:parallax-far">
        <span className="absolute -top-1/4 -left-[15%] size-[60vmax] rounded-full bg-radial from-aurora-1 to-transparent to-65% blur-[80px] will-change-transform pause-offscreen motion-safe:animate-aurora-a lg:size-[46vmax] lg:blur-[110px]" />
        <span className="absolute -top-[10%] -right-[20%] size-[60vmax] rounded-full bg-radial from-aurora-2 to-transparent to-65% blur-[80px] will-change-transform pause-offscreen motion-safe:animate-aurora-b lg:size-[46vmax] lg:blur-[110px]" />
        <span className="absolute -bottom-[35%] left-1/4 size-[60vmax] rounded-full bg-radial from-aurora-3 to-transparent to-65% blur-[80px] will-change-transform pause-offscreen motion-safe:animate-aurora-c lg:size-[46vmax] lg:blur-[110px]" />
      </div>
      <span className="absolute inset-0 bg-[radial-gradient(var(--aurora-dot)_1px,transparent_1.5px)] bg-size-[22px_22px] mask-[radial-gradient(ellipse_70%_60%_at_50%_40%,black_30%,transparent_75%)] motion-safe:parallax-near" />
    </div>
  )
}
