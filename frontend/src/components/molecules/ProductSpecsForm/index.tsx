import { ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ProductSpecsFormProps {
  description: string
  onDescriptionChange: (val: string) => void
  onAnalyze: () => void
  isLoading: boolean
}

export function ProductSpecsForm({
  description,
  onDescriptionChange,
  onAnalyze,
  isLoading,
}: ProductSpecsFormProps) {
  return (
    <div className="bg-gray-100 border-l-4 border-l-[#004990] px-6 py-5 flex flex-col gap-5">
      {/* Section header */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
        <span className="text-[14px] font-bold text-[#004990] uppercase tracking-widest">
          Product Specifications
        </span>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500">
            Product Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="e.g. CertainTeed Landmark Algae Resistant Max Def Moire Black 3 Bundle Per Square"
            className="rounded-none text-sm resize-none min-h-[110px] border-gray-300 focus-visible:ring-0 focus-visible:border-[#004990]"
          />
        </div>
      </div>

      {/* AI note — plain text, no box, no background */}
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-400 leading-relaxed">
          AI will validate visual evidence against provided text
        </p>
      </div>

      {/* CTA */}
      <Button
        onClick={onAnalyze}
        disabled={isLoading}
        className="w-full bg-[#004990] hover:bg-[#003a7a] text-white font-semibold gap-2 h-11 rounded-none"
      >
        <Zap className="w-4 h-4" />
        {isLoading ? 'Analysing…' : 'Start Analysis'}
      </Button>
    </div>
  )
}
