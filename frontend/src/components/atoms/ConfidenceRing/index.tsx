interface ConfidenceRingProps {
  score: number // 0–100
  label: string // e.g. "HIGH MATCH"
  colorClass?: string // Tailwind stroke color override
}

export function ConfidenceRing({ score, label, colorClass = 'text-emerald-500' }: ConfidenceRingProps) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            strokeWidth="10"
            className="text-gray-100"
            stroke="currentColor"
          />
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="butt"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={colorClass}
            stroke="currentColor"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800">{score}%</span>
        </div>
      </div>
      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">{label}</span>
    </div>
  )
}
