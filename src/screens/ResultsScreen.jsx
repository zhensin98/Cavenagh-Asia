import { BackIcon, ChevronIcon } from '../components/Icons'

const SEVERITY = {
  HIGH:   { bar: 'bg-red-500',   badge: 'bg-red-500/10 text-red-400 border-red-500/30' },
  MEDIUM: { bar: 'bg-amber-400', badge: 'bg-amber-400/10 text-amber-400 border-amber-400/30' },
  LOW:    { bar: 'bg-blue-500',  badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
}

export default function ResultsScreen({ statement, findings, onSelectFinding, onBack }) {
  const totalLeakage = findings.reduce((sum, f) => sum + (f.estimated_leakage ?? 0), 0)
  const highCount    = findings.filter(f => f.severity === 'HIGH').length

  return (
    <div className="min-h-screen bg-[#0B1426]">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#0B1426]/95 backdrop-blur border-b border-[#1E3055] px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-[#8B9AB5] hover:text-white transition-colors">
          <BackIcon />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-semibold text-sm">Audit Results</h1>
          <p className="text-[#8B9AB5] text-xs">{statement.statement_date}</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
      </div>

      <div className="px-4 py-5 max-w-sm mx-auto space-y-4">

        {/* Portfolio card */}
        <div className="bg-[#132040] border border-[#1E3055] rounded-2xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[#8B9AB5] text-xs mb-0.5">Client</p>
              <p className="text-white font-semibold text-sm">{statement.client_name}</p>
            </div>
            <div className="text-right">
              <p className="text-[#8B9AB5] text-xs mb-0.5">Bank</p>
              <p className="text-white text-sm">{statement.bank}</p>
            </div>
          </div>
          <div className="h-px bg-[#1E3055] mb-4" />
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[#8B9AB5] text-xs mb-0.5">Currency</p>
              <p className="text-white text-sm">{statement.currency}</p>
            </div>
            <div className="text-right">
              <p className="text-[#8B9AB5] text-xs mb-0.5">Portfolio Value</p>
              <p className="text-[#C9A84C] font-bold text-xl">
                {statement.currency} {Number(statement.portfolio_value).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Findings" value={findings.length} />
          <StatCard label="High Severity" value={highCount} danger={highCount > 0} />
          <StatCard
            label="Est. Leakage"
            value={totalLeakage > 0
              ? `${statement.currency} ${Number(totalLeakage).toLocaleString()}`
              : 'See findings'
            }
          />
        </div>

        {/* Findings list */}
        <div>
          <p className="text-[#8B9AB5] text-xs uppercase tracking-widest mb-3 px-1">
            Findings — {findings.length} detected
          </p>
          <div className="space-y-2.5">
            {findings.map(f => (
              <FindingCard key={f.id} finding={f} onClick={() => onSelectFinding(f)} />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-[#132040] border border-[#1E3055] rounded-2xl px-4 py-4">
          <p className="text-[#8B9AB5] text-xs leading-relaxed text-center">
            Audit observations based on the data provided.<br />
            Not investment, financial, legal, or tax advice.
          </p>
        </div>

        <div className="pb-6" />
      </div>
    </div>
  )
}

function StatCard({ label, value, danger }) {
  return (
    <div className="bg-[#132040] border border-[#1E3055] rounded-xl p-3">
      <p className="text-[#8B9AB5] text-xs mb-1.5 leading-tight">{label}</p>
      <p className={`font-bold text-sm leading-tight ${danger ? 'text-red-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}

function FindingCard({ finding, onClick }) {
  const sev = SEVERITY[finding.severity] ?? SEVERITY.LOW
  const preview = finding.summary.length > 90
    ? finding.summary.substring(0, 90) + '…'
    : finding.summary

  return (
    <button
      onClick={onClick}
      className="w-full bg-[#132040] border border-[#1E3055] hover:border-[#C9A84C]/50 active:border-[#C9A84C] rounded-2xl p-4 text-left transition-colors duration-150 flex gap-3 items-start"
    >
      {/* Severity bar */}
      <div className={`w-1 self-stretch rounded-full ${sev.bar} flex-shrink-0`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sev.badge}`}>
            {finding.severity}
          </span>
          <span className="text-[#8B9AB5] text-xs truncate">{finding.category}</span>
        </div>
        <p className="text-white text-sm font-medium mb-1 leading-snug">{finding.title}</p>
        <p className="text-[#8B9AB5] text-xs leading-relaxed">{preview}</p>
        {finding.estimated_leakage && (
          <p className="text-red-400 text-xs font-medium mt-2">
            Est. leakage: {finding.estimated_leakage.toLocaleString('en-SG', { minimumFractionDigits: 0 })} SGD
          </p>
        )}
      </div>

      <ChevronIcon />
    </button>
  )
}
