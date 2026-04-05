import { UserCircle, Settings } from 'lucide-react'

export function Navbar() {
  return (
    <header className="border-b border-gray-200 sticky top-0 z-50 bg-[#004990] text-white">
      <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">
        {/* Left: brand — red text only, no badge/pill */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#C32032]">RoofPrecise AI</span>
          <span className="text-gray-300 text-xs">|</span>
          <span className="text-sm text-gray-500">Image Analysis Tool</span>
        </div>

        {/* Right: icon buttons */}
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 transition-colors">
            <UserCircle className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  )
}
