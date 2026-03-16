/**
 * AtsScoreGauge — circular progress indicator for ATS score.
 * Uses SVG arc — no external charting library needed.
 *
 * Usage: <AtsScoreGauge score={84} size={96} />
 */
export default function AtsScoreGauge({ score, size = 80, className = '' }) {
  const radius   = (size - 12) / 2
  const circ     = 2 * Math.PI * radius
  const progress = score != null ? Math.min(Math.max(score, 0), 100) : 0
  const offset   = circ * (1 - progress / 100)

  const color = progress >= 80 ? '#2D7A4F'
               : progress >= 60 ? '#B08C38'
               : '#8C2A2A'

  const label = progress >= 80 ? 'Excellent'
               : progress >= 60 ? 'Good'
               : progress >= 40 ? 'Fair'
               : 'Needs work'

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="#ECEAE3"
          strokeWidth={8}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={score != null ? color : '#ECEAE3'}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
        {/* Score text */}
        <text
          x={size / 2} y={size / 2 - 5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.24}
          fontWeight="500"
          fill={score != null ? '#1C2540' : '#9EA5B8'}
          fontFamily='"DM Sans", sans-serif'
        >
          {score != null ? score : '—'}
        </text>
        <text
          x={size / 2} y={size / 2 + size * 0.17}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.12}
          fill="#9EA5B8"
          fontFamily='"DM Sans", sans-serif'
        >
          / 100
        </text>
      </svg>
      {score != null && (
        <span
          className="text-2xs font-medium uppercase tracking-wide"
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
