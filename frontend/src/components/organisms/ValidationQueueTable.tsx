import { ValidationQueueRow } from '@/components/molecules/ValidationQueueRow'

interface QueueItem {
  itemNumber: string
  productName: string
  score: number
  verdict: string
}

interface ValidationQueueTableProps {
  items: QueueItem[]
  totalResults: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onViewDetails: (itemNumber: string) => void
}

export function ValidationQueueTable({
  items,
  totalResults,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetails,
}: ValidationQueueTableProps) {
  const pageNumbers = Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1)

  return (
    <div className="bg-white border border-gray-200 overflow-hidden rounded-lg shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Item Number</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Score</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Verdict</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map(item => (
            <ValidationQueueRow
              key={item.itemNumber}
              itemNumber={item.itemNumber}
              productName={item.productName}
              score={item.score}
              verdict={item.verdict}
              onViewDetails={() => onViewDetails(item.itemNumber)}
            />
          ))}
        </tbody>
      </table>

      <footer className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
        <p className="text-xs text-gray-500 font-medium">
          SHOWING {Math.min(50, totalResults)} OF {totalResults.toLocaleString()} RESULTS
        </p>
        <div className="flex items-center gap-1">
          {pageNumbers.map(p => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center text-sm rounded ${
                currentPage === p
                  ? 'bg-[#004990] text-white font-bold'
                  : 'hover:bg-gray-200 text-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
          {totalPages > 3 && <span className="px-2 text-gray-400">...</span>}
        </div>
      </footer>
    </div>
  )
}
