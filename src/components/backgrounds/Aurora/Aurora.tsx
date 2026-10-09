// «Северное сияние» в духе Aceternity Aurora Background: размытые пятна бренда + точечная сетка
export function Aurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute -top-1/4 -left-[15%] size-[60vmax] rounded-full bg-radial from-aurora-1 to-transparent to-65% blur-[80px] will-change-transform motion-safe:animate-aurora-a lg:size-[46vmax] lg:blur-[110px]" />
      <span className="absolute -top-[10%] -right-[20%] size-[60vmax] rounded-full bg-radial from-aurora-2 to-transparent to-65% blur-[80px] will-change-transform motion-safe:animate-aurora-b lg:size-[46vmax] lg:blur-[110px]" />
      <span className="absolute -bottom-[35%] left-1/4 size-[60vmax] rounded-full bg-radial from-aurora-3 to-transparent to-65% blur-[80px] will-change-transform motion-safe:animate-aurora-c lg:size-[46vmax] lg:blur-[110px]" />
      <span className="absolute inset-0 bg-[radial-gradient(var(--aurora-dot)_1px,transparent_1.5px)] bg-size-[22px_22px] mask-[radial-gradient(ellipse_70%_60%_at_50%_40%,black_30%,transparent_75%)]" />
    </div>
  )
}
