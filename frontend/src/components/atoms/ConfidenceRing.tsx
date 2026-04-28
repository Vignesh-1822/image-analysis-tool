import { useState } from "react"

interface ScoreBreakdown {
  label: string
  score: number
  weight: number
  contribution: number
}

interface ConfidenceRingProps {
  score: number
  label: string
  color: string
  breakdown?: ScoreBreakdown[]
}

const RADIUS = 70
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ConfidenceRing({ score, label, color, breakdown }: ConfidenceRingProps) {
  const [hovered, setHovered] = useState(false)
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-44 h-44 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
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
          <span className="text-3xl font-bold text-gray-800">
            {score.toFixed(1)}%
          </span>
        </div>

        {/* Tooltip */}
        {hovered && breakdown && breakdown.length > 0 && (
          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 z-50 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-4">
            {/* Arrow */}
            <div className="absolute top-1/2 -translate-y-1/2 right-full w-3 h-3 overflow-hidden">
              <div className="w-3 h-3 bg-white border-l border-b border-gray-200 rotate-45 translate-x-1.5" />
            </div>

            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">
              Score Breakdown
            </p>

            <div className="flex flex-col gap-2">
              {breakdown.map((item) => {
                const maxPts = item.weight * 100
                const earnedPts = item.contribution
                return (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">{item.label}</span>
                      <span className="text-xs font-semibold text-gray-800">
                        {earnedPts.toFixed(1)} / {maxPts.toFixed(0)} pts
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(earnedPts / maxPts) * 100}%`,
                            backgroundColor: color,
                            opacity: 0.7,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 w-14 text-right">
                        {(item.weight * 100).toFixed(0)}% weight
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Total</span>
              <span className="text-xs text-gray-400">
                {breakdown.reduce((s, i) => s + i.contribution, 0).toFixed(1)} / 100 pts
              </span>
            </div>
          </div>
        )}
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