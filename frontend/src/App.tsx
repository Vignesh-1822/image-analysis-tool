import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute'
import { Login } from '@/pages/Login'
import { SKUSearch } from '@/pages/SKUSearch'
import { SKUResults } from '@/pages/SKUResults'
import { UploadAnalysis } from '@/pages/UploadAnalysis'
import { AdminProductIntake } from '@/pages/AdminProductIntake'
import { AdminValidationQueue } from '@/pages/AdminValidationQueue'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" theme="light" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SKUSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results/:identifier"
            element={
              <ProtectedRoute>
                <SKUResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/old"
            element={
              <ProtectedRoute>
                <UploadAnalysis />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/product-intake" replace />} />
          <Route
            path="/admin/product-intake"
            element={
              <ProtectedRoute>
                <AdminProductIntake />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/validation-queue"
            element={
              <ProtectedRoute>
                <AdminValidationQueue />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
