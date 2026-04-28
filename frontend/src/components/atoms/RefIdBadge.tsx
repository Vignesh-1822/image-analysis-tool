import { cn } from '@/lib/utils'

interface RefIdBadgeProps {
  refId: string
  valid: boolean
}

export function RefIdBadge({ refId, valid }: RefIdBadgeProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Ref ID</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-white">{refId}</span>
        <span
          className={cn(
            'text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5',
            valid ? 'bg-emerald-500 text-white' : 'bg-[#C32032] text-white'
          )}
        >
          {valid ? 'Source Image' : 'Invalid'}
        </span>
      </div>
    </div>
  )
}
