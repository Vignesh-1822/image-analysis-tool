interface ReasoningBoxProps {
  reasoning: string
  issues: string[]
}

export function ReasoningBox({ reasoning, issues }: ReasoningBoxProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        AI Reasoning
      </span>
      <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 flex flex-col gap-2.5">
        <p className="text-[13px] text-gray-800 leading-relaxed">{reasoning}</p>
        {issues.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Issues flagged:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {issues.map((issue, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium bg-red-100 text-red-700 px-2 py-0.5"
                >
                  {issue}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
