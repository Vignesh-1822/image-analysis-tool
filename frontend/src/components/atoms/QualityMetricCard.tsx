import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

interface QualityMetricCardProps {
  label: string
  value: string
  icon: ReactNode
  passed?: boolean
  neutral?: boolean
  info?: string
}

export function QualityMetricCard({ label, value, icon, passed, neutral, info }: QualityMetricCardProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const borderClass = neutral ? 'border-gray-100' : passed ? 'border-gray-100' : 'border-red-100'
  const iconClass = neutral ? 'text-gray-400' : passed ? 'text-emerald-500' : 'text-[#C32032]'

  return (
    <div ref={ref} className={`relative flex flex-col items-center gap-2 py-4 px-3 bg-white border flex-1 ${borderClass}`}>
      {info && (
        <button
          onClick={() => setOpen(o => !o)}
          className="absolute top-2 right-2 text-gray-300 hover:text-[#004990] transition-colors"
          aria-label="More info"
        >
          <Info className="w-3 h-3" />
        </button>
      )}

      <div className={iconClass}>{icon}</div>
      <span className="text-sm font-bold text-gray-800">{value}</span>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold text-center">{label}</span>

      {open && info && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200" />
          <p className="text-[11px] text-gray-600 leading-relaxed">{info}</p>
        </div>
      )}
    </div>
  )
}
