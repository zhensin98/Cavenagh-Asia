import { useRef, useState } from 'react'
import { uploadDocument } from '../api'
import { UploadIcon } from '../components/Icons'
import PreciousMetalsForm from './PreciousMetalsForm'
import RealEstateForm from './RealEstateForm'

// Demo assets from mock statement blueprints — all converted to SGD for clean pie chart display
const DEMO_ASSETS = [
  // Private Bank — Meridian Private Bank (SG)
  { asset_type: 'SAVINGS',       institution: 'Meridian Private Bank',  description: 'SGD Current Account',           amount: 320000,  currency: 'SGD' },
  { asset_type: 'FIXED_DEPOSIT', institution: 'Meridian Private Bank',  description: 'SGD Fixed Deposit (6M)',        amount: 500000,  currency: 'SGD' },
  { asset_type: 'FUNDS',         institution: 'Meridian Private Bank',  description: 'Meridian Asian Growth Fund',    amount: 507360,  currency: 'SGD' },
  { asset_type: 'FUNDS',         institution: 'Meridian Private Bank',  description: 'Global Balanced Income Fund',   amount: 252340,  currency: 'SGD' },
  { asset_type: 'BONDS',         institution: 'Meridian Private Bank',  description: 'MPB Capital Growth Note',       amount: 450000,  currency: 'SGD' },
  // Private Bank — Harbour Capital (HK) — amounts in SGD equivalent
  { asset_type: 'SAVINGS',       institution: 'Harbour Capital HK',     description: 'HKD Time Deposit (3M)',         amount: 344000,  currency: 'SGD' },
  { asset_type: 'SAVINGS',       institution: 'Harbour Capital HK',     description: 'USD Cash Account',              amount: 600450,  currency: 'SGD' },
  // Broker Account — GlobalEdge Securities (IBKR-style)
  { asset_type: 'STOCKS',        institution: 'GlobalEdge Securities',  description: 'Portfolio Net Asset Value',     amount: 312480,  currency: 'SGD' },
  // Broker Account — Valore Privée Discretionary (USD → SGD at 1.334)
  { asset_type: 'STOCKS',        institution: 'Valore Privée',          description: 'Discretionary Portfolio (DPM)', amount: 4268800, currency: 'SGD' },
  // Crypto — CipherVault Exchange
  { asset_type: 'CRYPTO',        institution: 'CipherVault Exchange',   description: 'Bitcoin (BTC)',                 amount: 44002,   currency: 'SGD' },
  { asset_type: 'CRYPTO',        institution: 'CipherVault Exchange',   description: 'Ethereum (ETH)',                amount: 17381,   currency: 'SGD' },
  { asset_type: 'CRYPTO',        institution: 'CipherVault Exchange',   description: 'USD Coin (USDC)',               amount: 2935,    currency: 'SGD' },
  // Real Estate
  { asset_type: 'PROPERTY',      institution: 'Personal',               description: 'Singapore Residential Property', amount: 1850000, currency: 'SGD' },
  // Precious Metals
  { asset_type: 'GOLD',          institution: 'Meridian Private Bank',  description: 'Physical Gold Holdings',        amount: 180000,  currency: 'SGD' },
]

const DOC_TYPES = [
  'Private Bank Statement',
  'Broker Statement',
  'Crypto Wallet Statement',
  'Real Estate Details',
  'Precious Metal Holdings',
  'Manual Asset Tracker',
]

function DebugSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-[#132040] border border-[#1E3055] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center px-4 py-3 text-left"
      >
        <p className="text-[#8B9AB5] text-xs uppercase tracking-wider">{title}</p>
        <span className="text-[#8B9AB5] text-xs">{open ? '▲ hide' : '▼ show'}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export default function DocumentsScreen({ onAssetsExtracted }) {
  const [docType, setDocType]     = useState(DOC_TYPES[0])
  const [status, setStatus]       = useState('idle')   // idle | uploading | done | error
  const [error, setError]         = useState(null)
  const [lastResult, setLastResult] = useState(null)
  const [dragging, setDragging]   = useState(false)
  const [showPreciousMetals, setShowPreciousMetals] = useState(false)
  const [showRealEstate,     setShowRealEstate]     = useState(false)
  const inputRef = useRef()

  function handleDocTypeClick(t) {
    if (t === 'Precious Metal Holdings') { setShowPreciousMetals(true); return }
    if (t === 'Real Estate Details')     { setShowRealEstate(true);     return }
    setDocType(t)
  }

  const handleFile = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.')
      return
    }
    setError(null)
    setStatus('uploading')

    try {
      const result = await uploadDocument(file)
      setLastResult(result)
      setStatus('done')
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }

  const handleInputChange = (e) => handleFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="min-h-full bg-[#0B1426] px-4 py-6 max-w-sm mx-auto">

      {/* Header */}
      <div className="mb-6">
        <p className="text-[#8B9AB5] text-xs uppercase tracking-widest mb-1">Step 1</p>
        <h2 className="text-white font-bold text-xl">Upload Statement</h2>
        <p className="text-[#8B9AB5] text-sm mt-1">
          Upload a PDF from your bank, broker, or exchange.
        </p>
      </div>

      {/* Document type selector */}
      <div className="mb-5">
        <p className="text-[#8B9AB5] text-xs uppercase tracking-wider mb-2">Document Type</p>
        <div className="grid grid-cols-2 gap-2">
          {DOC_TYPES.map(t => {
            const isFormType = t === 'Precious Metal Holdings' || t === 'Real Estate Details'
            return (
              <button
                key={t}
                onClick={() => handleDocTypeClick(t)}
                className={`text-xs py-2.5 px-3 rounded-xl border text-left transition-colors duration-150 leading-snug ${
                  isFormType
                    ? 'bg-[#132040] border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10'
                    : docType === t
                      ? 'bg-[#C9A84C]/10 border-[#C9A84C]/60 text-[#C9A84C]'
                      : 'bg-[#132040] border-[#1E3055] text-[#8B9AB5] hover:text-white'
                }`}
              >
                {t}{isFormType ? ' ↗' : ''}
              </button>
            )
          })}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors duration-150 ${
          dragging
            ? 'border-[#C9A84C] bg-[#C9A84C]/5'
            : 'border-[#1E3055] bg-[#132040] hover:border-[#C9A84C]/40'
        }`}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          dragging ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-[#1E3055] text-[#8B9AB5]'
        }`}>
          <UploadIcon size={22} />
        </div>
        <div className="text-center">
          <p className="text-white text-sm font-medium">Tap to select PDF</p>
          <p className="text-[#8B9AB5] text-xs mt-0.5">or drag and drop here</p>
        </div>
        <p className="text-[#8B9AB5] text-xs">PDF only · Max 20 MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Demo mode */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-px bg-[#1E3055]" />
        <p className="text-[#8B9AB5] text-xs">or</p>
        <div className="flex-1 h-px bg-[#1E3055]" />
      </div>
      <button
        onClick={() => onAssetsExtracted(DEMO_ASSETS, true)}
        className="mt-3 w-full bg-[#1E3055] border border-[#C9A84C]/30 text-[#C9A84C] font-semibold text-sm py-3 rounded-xl hover:bg-[#C9A84C]/10 transition-colors"
      >
        Load Demo Portfolio
      </button>

      {/* Status */}
      {status === 'uploading' && (
        <div className="mt-4 bg-[#132040] border border-[#1E3055] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Reading document...</p>
            <p className="text-[#8B9AB5] text-xs mt-0.5">Extracting and analysing</p>
          </div>
        </div>
      )}

      {status === 'done' && lastResult && (
        <div className="mt-4 space-y-3">
          {/* Summary card */}
          <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[#C9A84C] text-sm font-semibold">Complete</p>
              {!lastResult.llm_used && (
                <span className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full">
                  Preview mode
                </span>
              )}
            </div>
            <p className="text-white text-xs">{lastResult.filename}</p>
            <p className="text-[#8B9AB5] text-xs mt-1">
              {lastResult.page_count} page{lastResult.page_count !== 1 ? 's' : ''} · {lastResult.total_assets} assets found
            </p>
            {!lastResult.llm_used && (
              <p className="text-amber-400/70 text-xs mt-2 leading-relaxed">
                Ollama not running — showing sample data. Start Ollama for real extraction.
              </p>
            )}
            <button
              onClick={() => onAssetsExtracted(lastResult.assets, lastResult.llm_used)}
              className="mt-3 w-full bg-[#C9A84C] text-[#0B1426] font-semibold text-sm py-2.5 rounded-xl"
            >
              View Portfolio
            </button>
          </div>

          {/* Extracted assets — verify LLM output */}
          <DebugSection title={`Assets extracted (${lastResult.assets.length})`} defaultOpen>
            <div className="space-y-1.5">
              {lastResult.assets.map((a, i) => (
                <div key={i} className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{a.institution}</p>
                    <p className="text-[#8B9AB5] text-xs truncate">{a.description} · {a.asset_type}</p>
                  </div>
                  <p className="text-[#C9A84C] text-xs font-semibold flex-shrink-0">
                    {a.currency} {a.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </DebugSection>

          {/* Raw extracted text — verify pdfplumber read correctly */}
          <DebugSection title="Raw extracted text (full)">
            <pre className="text-[#8B9AB5] text-xs whitespace-pre-wrap break-words leading-relaxed font-mono">
              {lastResult.text_preview || '(no text extracted)'}
            </pre>
          </DebugSection>
        </div>
      )}

      {(status === 'error' || error) && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <p className="text-red-400 text-sm font-medium">Upload failed</p>
          <p className="text-red-400/70 text-xs mt-1">{error}</p>
          <p className="text-[#8B9AB5] text-xs mt-2">
            Make sure the Python server is running: <span className="text-white font-mono">uvicorn main:app --port 8000</span>
          </p>
        </div>
      )}

      {/* Privacy note */}
      <p className="text-[#8B9AB5] text-xs text-center mt-6 leading-relaxed opacity-60">
        Documents are processed locally and never uploaded to any server.
      </p>

      {showPreciousMetals && (
        <PreciousMetalsForm onClose={() => setShowPreciousMetals(false)} />
      )}
      {showRealEstate && (
        <RealEstateForm onClose={() => setShowRealEstate(false)} />
      )}
    </div>
  )
}
