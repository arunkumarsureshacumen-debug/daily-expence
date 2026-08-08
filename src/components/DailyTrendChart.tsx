import type { DailyTotal } from '../types/expense'

interface DailyTrendChartProps {
  data: DailyTotal[]
}

export function DailyTrendChart({ data }: DailyTrendChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted dark:text-muted-dark py-6 text-center">
        No data yet
      </p>
    )
  }
  const max = data.reduce((m, d) => (d.total > m ? d.total : m), 0)
  const width = 320
  const height = 120
  const padX = 8
  const padY = 12
  const stepX =
    data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0
  const points = data.map((d, i) => {
    const x = padX + stepX * i
    const y =
      max > 0 ? padY + (1 - d.total / max) * (height - padY * 2) : height - padY
    return { x, y, value: d.total, date: d.date }
  })
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
  const areaPath = `${path} L ${points[points.length - 1]?.x ?? 0} ${
    height - padY
  } L ${points[0]?.x ?? 0} ${height - padY} Z`

  return (
    <div className="w-full overflow-x-auto no-scrollbar text-primary dark:text-white">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        role="img"
        aria-label="Daily spending trend"
      >
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#trendFill)" />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.value > 0 ? 2.5 : 1.5}
            fill="currentColor"
          />
        ))}
      </svg>
    </div>
  )
}
