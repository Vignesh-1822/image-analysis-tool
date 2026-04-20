interface ConfidenceRingProps {
  score: number  // 0–100, already a percentage
  label: string
  color: string  // hex e.g. '#22c55e'
}

const RADIUS = 70
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ConfidenceRing({ score, label, color }: ConfidenceRingProps) {
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
          <circle
            cx="90" cy="90" r={RADIUS}
            fill="none"
            strokeWidth="13"
            stroke="#f3f4f6"
          />
          <circle
            cx="90" cy="90" r={RADIUS}
            fill="none"
            strokeWidth="13"
            strokeLinecap="butt"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            stroke={color}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800">{score.toFixed(1)}%</span>
        </div>
      </div>
      <span
        className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
        style={{ color, backgroundColor: `${color}18` }}
      >
        {label}
      </span>
    </div>
  )
}
