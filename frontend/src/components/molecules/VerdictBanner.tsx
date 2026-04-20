import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface VerdictBannerProps {
  verdict: string
  verdictNote: string
}

function verdictConfig(verdict: string) {
  switch (verdict) {
    case 'Approved':
      return {
        bg: 'bg-emerald-600',
        icon: <CheckCircle className="w-6 h-6 text-white" />,
        title: 'PRODUCT APPROVED',
      }
    case 'Catalog Only':
      return {
        bg: 'bg-amber-500',
        icon: <AlertTriangle className="w-6 h-6 text-white" />,
        title: 'CATALOG USE ONLY',
      }
    default:
      return {
        bg: 'bg-[#C32032]',
        icon: <XCircle className="w-6 h-6 text-white" />,
        title: 'REPLACE IMAGE',
      }
  }
}

export function VerdictBanner({ verdict, verdictNote }: VerdictBannerProps) {
  const { bg, icon, title } = verdictConfig(verdict)

  return (
    <div className={`${bg} px-6 py-5 flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <p className="text-white font-bold text-sm tracking-wide">{title}</p>
          <p className="text-white/80 text-xs mt-0.5">{verdictNote}</p>
        </div>
      </div>
    </div>
  )
}
