import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SKUSearch } from '@/pages/SKUSearch'
import { SKUResults } from '@/pages/SKUResults'
import { UploadAnalysis } from '@/pages/UploadAnalysis'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SKUSearch />} />
        <Route path="/results/:identifier" element={<SKUResults />} />
        <Route path="/old" element={<UploadAnalysis />} />
      </Routes>
    </BrowserRouter>
  )
}
