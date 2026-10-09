// Сетка с «дышащими» клетками в духе Magic UI Animated Grid Pattern.
// Клетки заданы статически, чтобы пре-рендер и гидрация совпадали.
const CELL = 48

// [колонка, строка, задержка в секундах]
const CELLS: [number, number, number][] = [
  [3, 1, 0],
  [7, 2, 1.5],
  [12, 0, 3],
  [5, 4, 2.2],
  [15, 3, 0.8],
  [9, 5, 4],
  [18, 1, 2.8],
  [1, 6, 3.6],
  [21, 4, 1.1],
  [14, 6, 4.6],
  [24, 2, 5.2],
  [11, 3, 5.6],
]

export function GridPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden mask-[radial-gradient(ellipse_80%_70%_at_50%_0%,black_20%,transparent_80%)]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--bg-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--bg-grid-line)_1px,transparent_1px)] bg-size-[48px_48px]" />
      {CELLS.map(([col, row, delay]) => (
        <span
          key={`${col}-${row}`}
          className="absolute size-[47px] bg-grid-cell opacity-0 motion-safe:animate-cell"
          style={{ left: col * CELL + 1, top: row * CELL + 1, animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  )
}
