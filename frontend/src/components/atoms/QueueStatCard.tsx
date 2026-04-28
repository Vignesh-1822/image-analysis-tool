interface QueueStatCardProps {
  label: string
  value: string
  variant?: 'default' | 'critical'
}

export function QueueStatCard({ label, value, variant = 'default' }: QueueStatCardProps) {
  if (variant === 'critical') {
    return (
      <div className="px-6 py-3 bg-red-50 rounded-lg border-l-4 border-[#C32032] flex flex-col">
        <span className="text-xs text-[#C32032] uppercase font-medium">{label}</span>
        <span className="text-xl font-bold text-[#C32032]">{value}</span>
      </div>
    )
  }
  return (
    <div className="px-6 py-3 bg-gray-50 rounded-lg flex flex-col">
      <span className="text-xs text-gray-500 uppercase font-medium">{label}</span>
      <span className="text-xl font-bold text-gray-900">{value}</span>
    </div>
  )
}
