import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { SKUSearch } from '@/pages/SKUSearch'
import { SKUResults } from '@/pages/SKUResults'
import { UploadAnalysis } from '@/pages/UploadAnalysis'
import { AdminProductIntake } from '@/pages/AdminProductIntake'
import { AdminValidationQueue } from '@/pages/AdminValidationQueue'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" theme="light" richColors />
      <Routes>
        <Route path="/" element={<SKUSearch />} />
        <Route path="/results/:identifier" element={<SKUResults />} />
        <Route path="/old" element={<UploadAnalysis />} />
        <Route path="/admin" element={<Navigate to="/admin/product-intake" replace />} />
        <Route path="/admin/product-intake" element={<AdminProductIntake />} />
        <Route path="/admin/validation-queue" element={<AdminValidationQueue />} />
      </Routes>
    </BrowserRouter>
  )
}
