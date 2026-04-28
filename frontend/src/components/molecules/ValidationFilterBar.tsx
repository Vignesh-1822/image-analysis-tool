import { Search, Filter } from 'lucide-react'

const FILTERS = ['All', 'Catalog Only', 'Replace'] as const

interface ValidationFilterBarProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
  search: string
  onSearchChange: (val: string) => void
}

export function ValidationFilterBar({
  activeFilter,
  onFilterChange,
  search,
  onSearchChange,
}: ValidationFilterBarProps) {
  return (
    <section className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
      <div className="flex gap-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`px-4 py-2 text-sm rounded transition-all ${
              activeFilter === f
                ? 'bg-white text-[#004990] font-bold shadow-sm'
                : 'font-medium text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 pr-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 focus:outline-none focus:border-[#004990] transition-all text-sm w-64 rounded-md"
            placeholder="Search by product name..."
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-md text-sm font-medium transition-all text-gray-700">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>
    </section>
  )
}
