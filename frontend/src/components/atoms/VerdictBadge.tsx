interface VerdictBadgeProps {
  verdict: string
}

const config: Record<string, { bg: string; text: string }> = {
  'Approved':     { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Catalog Only': { bg: 'bg-blue-100',    text: 'text-[#004990]' },
  'Replace':      { bg: 'bg-red-100',     text: 'text-[#C32032]' },
}

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  const { bg, text } = config[verdict] ?? config['Replace']
  return (
    <span className={`px-2.5 py-1 ${bg} ${text} text-[10px] font-bold rounded uppercase tracking-wider`}>
      {verdict}
    </span>
  )
}
