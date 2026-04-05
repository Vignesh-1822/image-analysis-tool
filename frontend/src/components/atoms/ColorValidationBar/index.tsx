interface ColorValidationBarProps {
  matchScore: number // 0–100
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">Color Match</span>
        <span className={`text-xs font-bold ${isGood ? 'text-emerald-600' : 'text-[#C32032]'}`}>
          {matchScore.toFixed(0)}%
        </span>
      </div>

      <div className="h-2 bg-gray-100 w-full">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${matchScore}%` }}
        />
      </div>

      <div className="flex items-center gap-3 mt-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 border border-gray-200 shrink-0" style={{ backgroundColor: extractedHex }} />
          <span className="text-[10px] text-gray-500">Extracted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 border border-gray-200 shrink-0" style={{ backgroundColor: targetHex }} />
          <span className="text-[10px] text-gray-500">{targetColorName}</span>
        </div>
      </div>
    </div>
  )
}
