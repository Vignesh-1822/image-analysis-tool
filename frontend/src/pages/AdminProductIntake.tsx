import { useState } from 'react';
import { Navbar } from '@/components/organisms/Navbar';
import { Upload, Send, FileBracesCorner, ShieldCheck } from "lucide-react";

function EditableJsonNode({ 
  name, 
  data, 
  parentData,
  parentKey,
  initialExpanded = false,
  onUpdate
}: { 
  name?: string; 
  data: any; 
  parentData?: any;
  parentKey?: string | number;
  initialExpanded?: boolean;
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [keyInput, setKeyInput] = useState(name || '');

  const [isEditingValue, setIsEditingValue] = useState(false);
  const [valInput, setValInput] = useState('');

  const isArray = Array.isArray(data);
  const isObject = data !== null && typeof data === 'object' && !isArray;

  const saveKey = () => {
    setIsEditingKey(false);
    if (keyInput && keyInput !== name && parentData && parentKey !== undefined && !Array.isArray(parentData)) {
      parentData[keyInput] = parentData[parentKey];
      delete parentData[parentKey];
      onUpdate();
    }
  };

  const startEditValue = () => {
    setValInput(typeof data === 'string' ? data : JSON.stringify(data));
    setIsEditingValue(true);
  };

  const saveValue = () => {
    setIsEditingValue(false);
    if (parentData && parentKey !== undefined) {
      let parsedVal = valInput;
      if (valInput === 'true') parsedVal = true as any;
      else if (valInput === 'false') parsedVal = false as any;
      else if (valInput === 'null') parsedVal = null as any;
      else if (!isNaN(Number(valInput)) && valInput.trim() !== '') parsedVal = Number(valInput) as any;
      
      parentData[parentKey] = parsedVal;
      onUpdate();
    }
  };

  const renderKey = () => {
    if (!name && name !== "") return null;
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
      );
    }
    return (
      <span 
        className="font-semibold text-[#004990] mr-2 cursor-text hover:bg-blue-50 rounded px-0.5" 
        onClick={(e) => { e.stopPropagation(); setIsEditingKey(true); }}
        title="Click to edit key"
      >
        {name}:
      </span>
    );
  };

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
             className={`cursor-text hover:bg-gray-100 px-1 rounded ${typeof data === 'string' ? "text-green-700 break-all" : "text-orange-600"}`}
             onClick={() => startEditValue()}
             title="Click to edit value"
           >
             {typeof data === 'string' ? `"${data}"` : String(data)}
           </span>
         )}
      </div>
    );
  }

  const keys = Object.keys(data);
  const isEmpty = keys.length === 0;

  return (
    <div className="pl-4 font-mono text-[12px] leading-relaxed">
      <div 
        className="flex items-center cursor-pointer hover:bg-gray-100 select-none py-0.5 rounded transition-colors -ml-4 pl-4"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="w-4 text-center text-gray-400 text-[10px] mr-1 -ml-4">
          {isEmpty ? '' : (expanded ? '▼' : '▶')}
        </span>
        {renderKey()}
        <span className="text-gray-500 italic text-[11px]">
          {isArray ? `Array(${keys.length})` : `Object{${keys.length}}`}
        </span>
      </div>
      
      {expanded && !isEmpty && (
        <div className="border-l-2 border-gray-100 ml-1 pl-1 my-0.5">
          {keys.map((k) => (
            <EditableJsonNode 
              key={k} 
              data={data[k as keyof typeof data]} 
              name={isArray ? "" : k} 
              parentData={data}
              parentKey={isArray ? Number(k) : k}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function JsonEditorPanel({ 
  title, 
  level, 
  placeholder, 
  icon: Icon,
  rawJson, 
  setRawJson 
}: { 
  title: string, 
  level: string, 
  placeholder: string, 
  icon: any,
  rawJson: string, 
  setRawJson: (val: string) => void 
}) {
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [isViewingFormatted, setIsViewingFormatted] = useState(false);

  const handleFormatClick = () => {
    try {
      if (!rawJson.trim()) return;
      const outer = JSON.parse(rawJson);
      let finalJson = outer;
      if (outer && outer.ProductJSON && typeof outer.ProductJSON === 'string') {
        try { 
          finalJson = JSON.parse(outer.ProductJSON); 
        } catch(e) {}
      }
      setParsedJson(finalJson);
      setIsViewingFormatted(true);
      // Auto-update raw with formatted string
      setRawJson(JSON.stringify(finalJson, null, 2));
    } catch(e) {
      alert(`Invalid JSON format in ${title}. Please ensure the raw text is valid JSON.`);
    }
  };

  const dataWrapper = { root: parsedJson };

  const handleNodeUpdate = () => {
    let updated = dataWrapper.root;
    // Force a new object reference to trigger React re-render
    updated = Array.isArray(updated) ? [...updated] : { ...updated };
    setParsedJson(updated);
    setRawJson(JSON.stringify(updated, null, 2));
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 flex flex-col gap-4 group transition-all duration-300 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="font-bold text-lg text-[#004990] flex items-center gap-2">
          <Icon className="w-5 h-5 flex-shrink-0" />
          {title}
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-200 px-2 py-1 rounded">
          {level}
        </span>
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
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all flex items-center gap-1 ${isViewingFormatted ? 'bg-[#004990] text-white shadow' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                Formatted View
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50/50 relative">
            {!isViewingFormatted ? (
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                className="absolute inset-0 w-full h-full p-4 bg-transparent border-none focus:ring-0 font-mono text-xs leading-relaxed text-gray-700 resize-none outline-none"
                placeholder={placeholder}
                spellCheck="false"
              ></textarea>
            ) : (
              <div className="p-4 relative">
                {parsedJson ? (
                  <EditableJsonNode 
                    data={parsedJson} 
                    initialExpanded={true} 
                    parentData={dataWrapper}
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
          <input className="hidden" id={`file-${title.replace(/\s+/g,'-')}`} type="file" />
          <label className="w-full flex items-center justify-center gap-3 py-3 border-2 border-dashed border-gray-300 hover:border-[#004990] hover:bg-white transition-all cursor-pointer rounded-lg text-gray-500" htmlFor={`file-${title.replace(/\s+/g,'-')}`}>
            <Upload className="w-5 h-5" />
            <span className="text-sm font-semibold">Upload .json file</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export function AdminProductIntake() {
  const [lightJson, setLightJson] = useState('');
  const [fullJson, setFullJson] = useState('');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        <section className="space-y-4">
          <h1 className="text-4xl font-extrabold text-[#004990]">Insert Product</h1>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-4">
          <JsonEditorPanel
            title="Light Metadata JSON"
            level="Level 01"
            icon={FileBracesCorner}
            placeholder='{"id": "PX-900", "status": "pending"}'
            rawJson={lightJson}
            setRawJson={setLightJson}
          />

          <JsonEditorPanel
            title="Full Product JSON"
            level="Level 03"
            icon={ShieldCheck}
            placeholder='Paste JSON here... e.g. {"ProductJSON": "{\"Name\":\"Product\"}"}'
            rawJson={fullJson}
            setRawJson={setFullJson}
          />
        </div>

        <div className="mt-2 flex justify-center">
          <button 
            className="bg-gradient-to-br from-[#003367] to-[#004990] text-white px-8 py-4 font-bold text-lg flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
            onClick={() => console.log('Submitting:', lightJson, fullJson)}
          >
            <Send className="w-5 h-5" />
            Insert Product
          </button>
        </div>
      </main>
    </div>
  );
}
