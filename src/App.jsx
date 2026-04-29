import { useState } from 'react'
import { runAudit } from './api'
import BottomNav from './components/BottomNav'
import HomeScreen from './screens/HomeScreen'
import ResultsScreen from './screens/ResultsScreen'
import DetailScreen from './screens/DetailScreen'
import DocumentsScreen from './screens/DocumentsScreen'
import PortfolioScreen from './screens/PortfolioScreen'

function LoadingScreen({ message = 'Running audit engine...' }) {
  return (
    <div className="flex-1 bg-[#0B1426] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      <p className="text-[#8B9AB5] text-sm">{message}</p>
    </div>
  )
}

export default function App() {
  // Tab navigation
  const [activeTab, setActiveTab] = useState('audit')

  // Portfolio state (Documents → Portfolio flow)
  const [portfolioAssets, setPortfolioAssets] = useState([])
  const [llmUsed, setLlmUsed]                 = useState(false)

  // Audit tab state
  const [auditScreen, setAuditScreen]     = useState('home')   // home | loading | results | detail
  const [statement, setStatement]         = useState(null)
  const [findings, setFindings]           = useState([])
  const [selectedFinding, setSelectedFinding] = useState(null)
  const [auditError, setAuditError]       = useState(null)

  // ---- Audit handlers ----
  const handleRunAudit = async () => {
    setAuditError(null)
    setAuditScreen('loading')
    try {
      const { runAudit: run } = await import('./api')
      const data = await run()
      setStatement(data.statement)
      setFindings(data.findings)
      setAuditScreen('results')
    } catch (e) {
      setAuditError(e.message)
      setAuditScreen('home')
    }
  }

  // ---- Documents → Portfolio handler ----
  const handleAssetsExtracted = (assets, wasLlm) => {
    setPortfolioAssets(assets)
    setLlmUsed(wasLlm)
    setActiveTab('portfolio')
  }

  // ---- Render ----
  return (
    <div className="h-screen flex flex-col bg-[#0B1426] overflow-hidden">

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">

        {/* Documents tab */}
        {activeTab === 'documents' && (
          <DocumentsScreen onAssetsExtracted={handleAssetsExtracted} />
        )}

        {/* Portfolio tab */}
        {activeTab === 'portfolio' && (
          <PortfolioScreen assets={portfolioAssets} llmUsed={llmUsed} />
        )}

        {/* Audit tab — sub-screen stack */}
        {activeTab === 'audit' && (
          <>
            {auditScreen === 'loading' && <LoadingScreen />}

            {auditScreen === 'home' && (
              <HomeScreen
                onRunAudit={handleRunAudit}
                error={auditError}
              />
            )}

            {auditScreen === 'results' && (
              <ResultsScreen
                statement={statement}
                findings={findings}
                onSelectFinding={(f) => { setSelectedFinding(f); setAuditScreen('detail') }}
                onBack={() => setAuditScreen('home')}
              />
            )}

            {auditScreen === 'detail' && (
              <DetailScreen
                finding={selectedFinding}
                currency={statement?.currency}
                onBack={() => setAuditScreen('results')}
              />
            )}
          </>
        )}
      </div>

      {/* Bottom nav — hidden on detail screens to reduce clutter */}
      {!(activeTab === 'audit' && auditScreen === 'detail') && (
        <BottomNav active={activeTab} onChange={setActiveTab} />
      )}
    </div>
  )
}
