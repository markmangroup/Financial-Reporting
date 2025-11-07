'use client'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  showDots?: boolean
}

export default function Sparkline({
  data,
  width = 60,
  height = 20,
  color = '#3B82F6',
  showDots = false
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min

  // Normalize data to 0-1 range
  const normalized = data.map(val => {
    if (range === 0) return 0.5
    return (val - min) / range
  })

  // Create SVG path
  const step = width / (data.length - 1)
  const points = normalized.map((val, i) => {
    const x = i * step
    const y = height - val * height
    return `${x},${y}`
  })

  const pathData = `M ${points.join(' L ')}`

  // Determine trend direction
  const firstVal = data[0]
  const lastVal = data[data.length - 1]
  const trend = lastVal > firstVal ? 'up' : lastVal < firstVal ? 'down' : 'flat'

  return (
    <svg
      width={width}
      height={height}
      className="inline-block align-middle"
      style={{ marginLeft: '4px' }}
    >
      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Optional dots */}
      {showDots &&
        normalized.map((val, i) => {
          const x = i * step
          const y = height - val * height
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill={color}
            />
          )
        })}

      {/* Last point highlight */}
      <circle
        cx={points[points.length - 1].split(',')[0]}
        cy={points[points.length - 1].split(',')[1]}
        r="3"
        fill={trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : color}
      />
    </svg>
  )
}
