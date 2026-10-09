// Падающие «метеоры» в духе Aceternity Meteors. Без анимации не показываются.
const METEORS = [
  { left: '-10%', delay: 0, duration: 6 },
  { left: '2%', delay: -2.4, duration: 7 },
  { left: '12%', delay: -4.1, duration: 5.5 },
  { left: '22%', delay: -1.3, duration: 8 },
  { left: '31%', delay: -5.6, duration: 6.5 },
  { left: '40%', delay: -0.7, duration: 7.5 },
  { left: '48%', delay: -3.3, duration: 5 },
  { left: '57%', delay: -6.2, duration: 9 },
  { left: '66%', delay: -2, duration: 6 },
  { left: '74%', delay: -4.8, duration: 7 },
  { left: '83%', delay: -1.6, duration: 8.5 },
  { left: '90%', delay: -3.9, duration: 6 },
]

export function Meteors() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-1 overflow-hidden motion-reduce:hidden">
      {METEORS.map((meteor) => (
        <span
          key={meteor.left}
          className="absolute top-0 size-0.5 rounded-full bg-glow opacity-0 shadow-[0_0_0_1px_var(--bg-line)] before:absolute before:top-1/2 before:h-px before:w-16 before:-translate-y-1/2 before:bg-linear-to-r before:from-glow before:to-transparent before:content-[''] motion-safe:animate-meteor"
          style={{ left: meteor.left, animationDelay: `${meteor.delay}s`, animationDuration: `${meteor.duration}s` }}
        />
      ))}
    </div>
  )
}
