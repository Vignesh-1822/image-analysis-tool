import { Navbar } from '@/components/organisms/Navbar';
import { Search, Filter, ChevronRight, Activity, FileCheck2, AlertTriangle, Zap } from "lucide-react";

export function AdminValidationQueue() {
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
            <div className="px-6 py-3 bg-gray-50 rounded-lg flex flex-col">
              <span className="text-xs text-gray-500 uppercase font-medium">Total Flagged</span>
              <span className="text-xl font-bold text-gray-900">1,284</span>
            </div>
            <div className="px-6 py-3 bg-red-50 rounded-lg border-l-4 border-[#C32032] flex flex-col">
              <span className="text-xs text-[#C32032] uppercase font-medium">Critical Failures</span>
              <span className="text-xl font-bold text-[#C32032]">42</span>
            </div>
          </div>
        </header>

        <section className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
          <div className="flex gap-1">
            <button className="px-4 py-2 text-sm font-bold bg-white text-[#004990] shadow-sm rounded">All</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded transition-all">Catalog Only</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded transition-all">Replace</button>
          </div>
          <div className="flex items-center gap-3 pr-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 focus:outline-none focus:border-[#004990] transition-all text-sm w-64 rounded-md"
                placeholder="Search by product name..."
                type="text"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-md text-sm font-medium transition-all text-gray-700">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </section>

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
              <tr className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs text-gray-500">#VAL-90234</td>
                <td className="px-6 py-4 font-semibold text-gray-900 text-sm">Titanium Chronograph V2</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#C32032] flex items-center justify-center text-[10px] font-bold text-[#C32032]">
                      24
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-red-100 text-[#C32032] text-[10px] font-bold rounded uppercase tracking-wider">Replace</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="inline-flex items-center gap-1 text-xs font-bold text-[#004990] hover:bg-blue-50 px-3 py-1.5 rounded transition-all">
                    VIEW DETAILS
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs text-gray-500">#VAL-88412</td>
                <td className="px-6 py-4 font-semibold text-gray-900 text-sm">AeroStride X1 - Crimson</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-orange-500 flex items-center justify-center text-[10px] font-bold text-orange-600">
                      62
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-blue-100 text-[#004990] text-[10px] font-bold rounded uppercase tracking-wider">Catalog Only</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="inline-flex items-center gap-1 text-xs font-bold text-[#004990] hover:bg-blue-50 px-3 py-1.5 rounded transition-all">
                    VIEW DETAILS
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <footer className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
            <p className="text-xs text-gray-500 font-medium">SHOWING 1-50 OF 1,284 RESULTS</p>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center bg-[#004990] text-white text-sm font-bold rounded">1</button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 text-gray-700 text-sm rounded">2</button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 text-gray-700 text-sm rounded">3</button>
              <span className="px-2 text-gray-400">...</span>
            </div>
          </footer>
        </div>

      </main>
    </div>
  );
}
