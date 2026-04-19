import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShieldCheck, Zap, Lock } from 'lucide-react'
import { Navbar } from '@/components/organisms/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SKUSearch() {
  const [identifier, setIdentifier] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    const trimmed = identifier.trim()
    if (!trimmed) return
    navigate(`/results/${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-20">
        {/* Hero */}
        <div className="text-center mb-12 max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
            Precision Retrieval Engine
          </p>
          <h1 className="text-5xl font-bold mb-4 text-[#004990]">Image Analysis Tool</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Enter a SKU or product item number to retrieve high-fidelity imagery and run
            AI-powered validation against your product specifications.
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-xl mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Enter SKU ID or Item Number..."
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="pl-9 h-11 rounded-xl border-gray-200 text-sm"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!identifier.trim()}
              className="h-11 px-6 rounded-xl bg-[#004990] hover:bg-[#003a7a] text-white text-sm font-semibold"
            >
              Fetch Analysis
            </Button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xl mt-8">
          <FeatureCard
            icon={<ShieldCheck className="w-5 h-5 text-[#004990]" />}
            title="Verified Data"
            description="Direct sync with the product catalog"
          />
          <FeatureCard
            icon={<Zap className="w-5 h-5 text-[#004990]" />}
            title="Instant Analysis"
            description="AI-driven extraction of material specs"
          />
          <FeatureCard
            icon={<Lock className="w-5 h-5 text-[#004990]" />}
            title="Secure Access"
            description="End-to-end encrypted image retrieval"
          />
        </div>
      </main>

      <footer className="text-center py-6 text-[11px] text-gray-400">
        © 2025 Image Analysis Tool ·{' '}
        <a href="/old" className="underline hover:text-gray-600">
          Classic Upload Mode
        </a>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 flex items-center flex-col gap-2 shadow-sm">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-xs font-semibold text-gray-800">{title}</p>
      <p className="text-[11px] text-gray-400 leading-relaxed text-center">{description}</p>
    </div>
  )
}
