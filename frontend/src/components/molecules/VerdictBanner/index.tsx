import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <div className={`${bg} px-8 py-5 flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <p className="text-white font-bold text-base tracking-wide">{title}</p>
          <p className="text-white/80 text-xs mt-0.5">{verdictNote}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="rounded-none border-white/40 text-white hover:bg-white/10 hover:text-white bg-transparent text-xs h-9"
        >
          Log Result
        </Button>
        <Button
          className="rounded-none bg-white text-gray-800 hover:bg-gray-100 text-xs h-9 font-semibold"
        >
          View Specs
        </Button>
      </div>
    </div>
  )
}
