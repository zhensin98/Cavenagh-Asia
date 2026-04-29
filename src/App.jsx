import { useState, useEffect } from 'react'
import { DEMO_ASSETS } from './screens/DocumentsScreen'
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
  const [showSplash, setShowSplash] = useState(true)
  const [activeTab, setActiveTab]   = useState('audit')

  // Portfolio state — pre-loaded with demo data
  const [portfolioAssets, setPortfolioAssets] = useState(DEMO_ASSETS)
  const [llmUsed, setLlmUsed]                 = useState(true)

  // Audit state
  const [auditScreen, setAuditScreen]         = useState('loading')
  const [statement, setStatement]             = useState(null)
  const [findings, setFindings]               = useState([])
  const [selectedFinding, setSelectedFinding] = useState(null)

  // Pre-load audit in the background while splash is showing
  useEffect(() => {
    import('./api').then(({ runAudit }) => runAudit()).then(data => {
      setStatement(data.statement)
      setFindings(data.findings)
      setAuditScreen('results')
    })
  }, [])

  const handleAssetsExtracted = (assets, wasLlm) => {
    setPortfolioAssets(assets)
    setLlmUsed(wasLlm)
    setActiveTab('portfolio')
  }

  // Show splash screen until user taps
  if (showSplash) {
    return <HomeScreen onEnter={() => setShowSplash(false)} />
  }

  return (
    <div className="h-screen flex flex-col bg-[#0B1426] overflow-hidden">
      <div className="flex-1 overflow-y-auto">

        {activeTab === 'documents' && (
          <DocumentsScreen onAssetsExtracted={handleAssetsExtracted} />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioScreen assets={portfolioAssets} llmUsed={llmUsed} />
        )}

        {activeTab === 'audit' && (
          <>
            {auditScreen === 'loading' && <LoadingScreen />}

            {auditScreen === 'results' && (
              <ResultsScreen
                statement={statement}
                findings={findings}
                onSelectFinding={(f) => { setSelectedFinding(f); setAuditScreen('detail') }}
                onBack={() => setAuditScreen('results')}
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

      {!(activeTab === 'audit' && auditScreen === 'detail') && (
        <BottomNav active={activeTab} onChange={setActiveTab} />
      )}
    </div>
  )
}
