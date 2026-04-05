interface ColorValidationBarProps {
  matchScore: number  // 0–100, already a percentage
  extractedHex: string
  targetHex: string
  targetColorName: string
}

export function ColorValidationBar({
  matchScore,
  extractedHex,
  targetHex,
  targetColorName,
}: ColorValidationBarProps) {
  const isGood = matchScore >= 70
  const barColor = isGood ? 'bg-emerald-500' : matchScore >= 40 ? 'bg-amber-400' : 'bg-[#C32032]'
  const textColor = isGood ? 'text-emerald-600' : matchScore >= 40 ? 'text-amber-600' : 'text-[#C32032]'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color Match</span>
        <span className={`text-xs font-bold ${textColor}`}>
          {matchScore.toFixed(1)}%
        </span>
      </div>

      <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${matchScore}%` }}
        />
      </div>

      <div className="flex items-center gap-4 mt-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm border border-gray-200 shrink-0" style={{ backgroundColor: extractedHex }} />
          <span className="text-[10px] text-gray-400 font-medium">Extracted {extractedHex}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm border border-gray-200 shrink-0" style={{ backgroundColor: targetHex }} />
          <span className="text-[10px] text-gray-400 font-medium">{targetColorName}</span>
        </div>
      </div>
    </div>
  )
}
