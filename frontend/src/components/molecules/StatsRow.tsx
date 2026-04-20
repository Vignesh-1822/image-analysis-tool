import { StatBadge } from '@/components/atoms/StatBadge'

export function StatsRow() {
  return (
    <div className="flex items-center gap-10 pt-5 border-t border-gray-200 mt-5">
      <StatBadge label="Resolution Target" value="4K Minimum" />
      <StatBadge label="Analysis Mode" value="Granular Scan" />
      <StatBadge label="Expected Accuracy" value="99.82%" />
    </div>
  )
}
