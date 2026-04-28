import { useState } from 'react'

interface EditableJsonNodeProps {
  name?: string
  data: unknown
  parentData?: Record<string | number, unknown> | unknown[]
  parentKey?: string | number
  initialExpanded?: boolean
  onUpdate: () => void
}

export function EditableJsonNode({
  name,
  data,
  parentData,
  parentKey,
  initialExpanded = false,
  onUpdate,
}: EditableJsonNodeProps) {
  const [expanded, setExpanded] = useState(initialExpanded)
  const [isEditingKey, setIsEditingKey] = useState(false)
  const [keyInput, setKeyInput] = useState(name || '')
  const [isEditingValue, setIsEditingValue] = useState(false)
  const [valInput, setValInput] = useState('')

  const isArray = Array.isArray(data)
  const isObject = data !== null && typeof data === 'object' && !isArray

  const saveKey = () => {
    setIsEditingKey(false)
    if (keyInput && keyInput !== name && parentData && parentKey !== undefined && !Array.isArray(parentData)) {
      const obj = parentData as Record<string, unknown>
      obj[keyInput] = obj[parentKey as string]
      delete obj[parentKey as string]
      onUpdate()
    }
  }

  const startEditValue = () => {
    setValInput(typeof data === 'string' ? data : JSON.stringify(data))
    setIsEditingValue(true)
  }

  const saveValue = () => {
    setIsEditingValue(false)
    if (parentData && parentKey !== undefined) {
      let parsed: unknown = valInput
      if (valInput === 'true') parsed = true
      else if (valInput === 'false') parsed = false
      else if (valInput === 'null') parsed = null
      else if (!isNaN(Number(valInput)) && valInput.trim() !== '') parsed = Number(valInput)
      ;(parentData as Record<string | number, unknown>)[parentKey] = parsed
      onUpdate()
    }
  }

  const renderKey = () => {
    if (!name && name !== '') return null
    if (isEditingKey) {
      return (
        <input
          autoFocus
          className="text-[#004990] font-semibold bg-blue-50 border border-blue-200 outline-none px-1 rounded mr-1 w-24 text-[12px]"
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          onBlur={saveKey}
          onKeyDown={e => e.key === 'Enter' && saveKey()}
        />
      )
    }
    return (
      <span
        className="font-semibold text-[#004990] mr-2 cursor-text hover:bg-blue-50 rounded px-0.5"
        onClick={e => { e.stopPropagation(); setIsEditingKey(true) }}
        title="Click to edit key"
      >
        {name}:
      </span>
    )
  }

  if (!isObject && !isArray) {
    return (
      <div className="pl-4 font-mono text-[12px] leading-relaxed py-0.5 flex flex-wrap items-center">
        {renderKey()}
        {isEditingValue ? (
          <input
            autoFocus
            className="text-gray-800 bg-gray-50 border border-gray-200 outline-none px-1 rounded flex-1 min-w-[100px] text-[12px]"
            value={valInput}
            onChange={e => setValInput(e.target.value)}
            onBlur={saveValue}
            onKeyDown={e => e.key === 'Enter' && saveValue()}
          />
        ) : (
          <span
            className={`cursor-text hover:bg-gray-100 px-1 rounded ${typeof data === 'string' ? 'text-green-700 break-all' : 'text-orange-600'}`}
            onClick={startEditValue}
            title="Click to edit value"
          >
            {typeof data === 'string' ? `"${data}"` : String(data)}
          </span>
        )}
      </div>
    )
  }

  const obj = data as Record<string, unknown>
  const keys = Object.keys(obj)
  const isEmpty = keys.length === 0

  return (
    <div className="pl-4 font-mono text-[12px] leading-relaxed">
      <div
        className="flex items-center cursor-pointer hover:bg-gray-100 select-none py-0.5 rounded transition-colors -ml-4 pl-4"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="w-4 text-center text-gray-400 text-[10px] mr-1 -ml-4">
          {isEmpty ? '' : expanded ? '▼' : '▶'}
        </span>
        {renderKey()}
        <span className="text-gray-500 italic text-[11px]">
          {isArray ? `Array(${keys.length})` : `Object{${keys.length}}`}
        </span>
      </div>
      {expanded && !isEmpty && (
        <div className="border-l-2 border-gray-100 ml-1 pl-1 my-0.5">
          {keys.map(k => (
            <EditableJsonNode
              key={k}
              data={obj[k]}
              name={isArray ? '' : k}
              parentData={obj}
              parentKey={isArray ? Number(k) : k}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
