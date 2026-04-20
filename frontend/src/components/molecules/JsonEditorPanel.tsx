import { useState } from 'react'
import { Upload } from 'lucide-react'
import { EditableJsonNode } from '@/components/atoms/EditableJsonNode'

interface JsonEditorPanelProps {
  title: string
  placeholder: string
  icon: React.ElementType
  rawJson: string
  setRawJson: (val: string) => void
  parsedData: unknown
  setParsedData: (val: unknown) => void
}

export function JsonEditorPanel({
  title,
  placeholder,
  icon: Icon,
  rawJson,
  setRawJson,
  parsedData,
  setParsedData,
}: JsonEditorPanelProps) {
  const [isViewingFormatted, setIsViewingFormatted] = useState(false)

  const handleFormatClick = () => {
    try {
      if (!rawJson.trim()) return
      if (!parsedData) {
        const outer = JSON.parse(rawJson)
        let finalJson = outer
        if (outer?.ProductJSON && typeof outer.ProductJSON === 'string') {
          try { finalJson = JSON.parse(outer.ProductJSON) } catch { /* keep outer */ }
        }
        setParsedData(finalJson)
      }
      setIsViewingFormatted(true)
    } catch {
      alert(`Invalid JSON format in ${title}. Please ensure the raw text is valid JSON.`)
    }
  }

  const handleRawChange = (val: string) => {
    setRawJson(val)
    setParsedData(null)
  }

  const dataWrapper = { root: parsedData }

  const handleNodeUpdate = () => {
    const updated = dataWrapper.root
    setParsedData(Array.isArray(updated) ? [...(updated as unknown[])] : { ...(updated as object) })
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6 flex flex-col gap-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="font-bold text-lg text-[#004990] flex items-center gap-2">
          <Icon className="w-5 h-5 flex-shrink-0" />
          {title}
        </h3>
      </div>

      <div className="flex flex-col flex-1">
        <div className="w-full h-[23rem] bg-white border border-gray-200 focus-within:border-[#004990] focus-within:ring-1 focus-within:ring-[#004990] rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center z-10 w-full shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Payload Manager</span>
            <div className="flex gap-1 bg-white p-0.5 rounded shadow-sm border border-gray-200">
              <button
                onClick={() => setIsViewingFormatted(false)}
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all ${!isViewingFormatted ? 'bg-[#004990] text-white shadow' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                Raw Input
              </button>
              <button
                onClick={handleFormatClick}
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all ${isViewingFormatted ? 'bg-[#004990] text-white shadow' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                Formatted View
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50/50 relative">
            {!isViewingFormatted ? (
              <textarea
                value={rawJson}
                onChange={e => handleRawChange(e.target.value)}
                className="absolute inset-0 w-full h-full p-4 bg-transparent border-none focus:ring-0 font-mono text-xs leading-relaxed text-gray-700 resize-none outline-none"
                placeholder={placeholder}
                spellCheck="false"
              />
            ) : (
              <div className="p-4">
                {parsedData ? (
                  <EditableJsonNode
                    data={parsedData}
                    initialExpanded
                    parentData={dataWrapper as Record<string, unknown>}
                    parentKey="root"
                    onUpdate={handleNodeUpdate}
                  />
                ) : (
                  <div className="text-red-500 text-sm font-medium">Failed to render JSON data.</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="relative shrink-0 mt-4">
          <input className="hidden" id={`file-${title.replace(/\s+/g, '-')}`} type="file" />
          <label
            className="w-full flex items-center justify-center gap-3 py-3 border-2 border-dashed border-gray-300 hover:border-[#004990] hover:bg-white transition-all cursor-pointer rounded-lg text-gray-500"
            htmlFor={`file-${title.replace(/\s+/g, '-')}`}
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm font-semibold">Upload .json file</span>
          </label>
        </div>
      </div>
    </div>
  )
}
