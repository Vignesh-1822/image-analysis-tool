import { useState } from 'react'
import { Navbar } from '@/components/organisms/Navbar'
import { ValidationQueueTable } from '@/components/organisms/ValidationQueueTable'
import { ValidationFilterBar } from '@/components/molecules/ValidationFilterBar'
import { QueueStatCard } from '@/components/atoms/QueueStatCard'

const MOCK_ITEMS = [
  { itemNumber: '#VAL-90234', productName: 'Titanium Chronograph V2', score: 24, verdict: 'Replace' },
  { itemNumber: '#VAL-88412', productName: 'AeroStride X1 - Crimson', score: 62, verdict: 'Catalog Only' },
]

export function AdminValidationQueue() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = MOCK_ITEMS.filter(item => {
    const matchesFilter = activeFilter === 'All' || item.verdict === activeFilter
    const matchesSearch = item.productName.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-8 py-12 space-y-10">
        <header className="flex justify-between items-end border-b border-gray-200 pb-6">
          <div>
            <p className="text-xs font-bold text-[#004990] tracking-widest uppercase mb-2">System Diagnostics</p>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Failed Validations Queue</h1>
          </div>
          <div className="flex gap-4 items-center">
            <QueueStatCard label="Total Flagged" value="1,284" />
            <QueueStatCard label="Critical Failures" value="42" variant="critical" />
          </div>
        </header>

        <ValidationFilterBar
          activeFilter={activeFilter}
          onFilterChange={f => { setActiveFilter(f); setCurrentPage(1) }}
          search={search}
          onSearchChange={s => { setSearch(s); setCurrentPage(1) }}
        />

        <ValidationQueueTable
          items={filtered}
          totalResults={1284}
          currentPage={currentPage}
          totalPages={26}
          onPageChange={setCurrentPage}
          onViewDetails={itemNumber => console.log('View', itemNumber)}
        />
      </main>
    </div>
  )
}
