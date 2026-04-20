import { UserCircle, Settings } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'

export function Navbar() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <header className="border-b border-gray-200 sticky top-0 z-50 bg-[#004990] text-white">
      <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">
        {/* Left: brand — red text only, no badge/pill */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#C32032]">ABC Supply Co.</span>
        </div>

        {/* Center: Admin Tabs */}
        {isAdminRoute && (
          <div className="flex items-center gap-8 h-full">
            <Link
              to="/admin/product-intake"
              className={`text-sm font-bold tracking-wide flex items-center border-b-2 transition-all h-full ${location.pathname === '/admin/product-intake' || location.pathname === '/admin'
                  ? 'text-white border-white'
                  : 'text-blue-300 hover:text-white border-transparent'
                }`}
            >
              Product Intake
            </Link>
            <Link
              to="/admin/validation-queue"
              className={`text-sm font-bold tracking-wide flex items-center border-b-2 transition-all h-full ${location.pathname.startsWith('/admin/validation-queue')
                  ? 'text-white border-white'
                  : 'text-blue-300 hover:text-white border-transparent'
                }`}
            >
              Validation Queue
            </Link>
          </div>
        )}

        {/* Right: icon buttons */}
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/10 rounded transition-colors">
            <UserCircle className="w-5 h-5 text-gray-200" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded transition-colors">
            <Settings className="w-5 h-5 text-gray-200" />
          </button>
        </div>
      </div>
    </header>
  )
}
