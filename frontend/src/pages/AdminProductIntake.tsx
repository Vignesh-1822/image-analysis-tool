import { useState } from 'react'
import { Send, FileBracesCorner, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/organisms/Navbar'
import { JsonEditorPanel } from '@/components/molecules/JsonEditorPanel'
import { insertSku } from '@/services/analysis'

export function AdminProductIntake() {
  const [lightJson, setLightJson] = useState('')
  const [lightParsed, setLightParsed] = useState<unknown>(null)
  const [fullJson, setFullJson] = useState('')
  const [fullParsed, setFullParsed] = useState<unknown>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [panelKey, setPanelKey] = useState(0)

  const parseStringified = (raw: string): unknown => {
    if (!raw.trim()) return null
    try {
      const outer = JSON.parse(raw)
      if (outer?.ProductJSON && typeof outer.ProductJSON === 'string') {
        try { return JSON.parse(outer.ProductJSON) } catch { /* keep outer */ }
      }
      return outer
    } catch {
      return null
    }
  }

  const handleSubmit = async () => {
    const lightData = lightParsed ?? parseStringified(lightJson)
    const fullData = fullParsed ?? parseStringified(fullJson)

    if (!lightData || !fullData) {
      toast.error('Both Light Metadata and Full Product JSON are required.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await insertSku(
        lightData as Record<string, unknown>,
        fullData as Record<string, unknown>,
      )
      toast.success(`Product inserted — ${result.item_number} (SKU ${result.sku_id})`)
      setLightJson('')
      setLightParsed(null)
      setFullJson('')
      setFullParsed(null)
      setPanelKey(k => k + 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        <h1 className="text-4xl font-extrabold text-[#004990]">Insert Product</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-4">
          <JsonEditorPanel
            key={`light-${panelKey}`}
            title="Light Metadata JSON"
            icon={FileBracesCorner}
            placeholder='{"ItemNumber": "0101010", "HierarchyId": "Roofing > Shingles"}'
            rawJson={lightJson}
            setRawJson={setLightJson}
            parsedData={lightParsed}
            setParsedData={setLightParsed}
          />
          <JsonEditorPanel
            key={`full-${panelKey}`}
            title="Full Product JSON"
            icon={ShieldCheck}
            placeholder='{"Id": "SKU-001", "Attributes": {"ATT_Primary_Color": "brown"}}'
            rawJson={fullJson}
            setRawJson={setFullJson}
            parsedData={fullParsed}
            setParsedData={setFullParsed}
          />
        </div>

        <div className="mt-2 flex justify-center">
          <button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="bg-gradient-to-br from-[#003367] to-[#004990] text-white px-8 py-4 font-bold text-lg flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? 'Inserting...' : 'Insert Product'}
          </button>
        </div>
      </main>
    </div>
  )
}
