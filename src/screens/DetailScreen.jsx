import { useState, useEffect } from 'react'
import { fetchScript } from '../api'
import { BackIcon, CopyIcon } from '../components/Icons'

const SEVERITY = {
  HIGH:   { badge: 'bg-red-500/10 text-red-400 border-red-500/30' },
  MEDIUM: { badge: 'bg-amber-400/10 text-amber-400 border-amber-400/30' },
  LOW:    { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
}

const TONES = ['Warm', 'Professional', 'Firm', 'Aggressive']
const TABS  = ['Explanation', 'Questions', 'Meeting', 'Email']

export default function DetailScreen({ finding, currency, onBack }) {
  const [tone, setTone]           = useState('Professional')
  const [activeTab, setActiveTab] = useState('Explanation')
  const [script, setScript]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [copied, setCopied]       = useState(false)

  const sev = SEVERITY[finding.severity] ?? SEVERITY.LOW

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchScript(finding, tone)
      .then(data => { if (!cancelled) setScript(data) })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tone])

  const handleCopy = () => {
    const content = getTabContent()
    if (!content) return
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const getTabContent = () => {
    if (!script) return ''
    if (activeTab === 'Explanation') return script.explanation
    if (activeTab === 'Questions')   return script.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    if (activeTab === 'Meeting')     return script.meeting_script
    if (activeTab === 'Email')       return script.email_draft
    return ''
  }

  return (
    <div className="min-h-screen bg-[#0B1426]">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#0B1426]/95 backdrop-blur border-b border-[#1E3055] px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-[#8B9AB5] hover:text-white transition-colors">
          <BackIcon />
        </button>
        <p className="flex-1 text-white font-semibold text-sm truncate">{finding.title}</p>
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${sev.badge}`}>
          {finding.severity}
        </span>
      </div>

      <div className="px-4 py-5 max-w-sm mx-auto space-y-4 pb-10">

        {/* Summary */}
        <div className="bg-[#132040] border border-[#1E3055] rounded-2xl p-4">
          <p className="text-[#C9A84C] text-xs uppercase tracking-wider mb-2.5">Audit Summary</p>
          <p className="text-[#CBD5E1] text-sm leading-relaxed">{finding.summary}</p>
        </div>

        {/* Evidence */}
        <div className="bg-[#132040] border border-[#1E3055] rounded-2xl p-4">
          <p className="text-[#C9A84C] text-xs uppercase tracking-wider mb-3">Evidence</p>
          <div className="space-y-2.5">
            {Object.entries(finding.evidence).map(([k, v]) => (
              <div key={k} className="flex justify-between items-start gap-4">
                <p className="text-[#8B9AB5] text-xs capitalize leading-relaxed">
                  {k.replace(/_/g, ' ')}
                </p>
                <p className="text-white text-xs text-right font-medium leading-relaxed">
                  {String(v)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Benchmark Intelligence — shown when a live benchmark was used */}
        {finding.benchmark && (
          <div className="bg-[#0B1426] border border-[#1E3055] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-emerald-400 text-xs uppercase tracking-wider font-semibold">
                Benchmark Intelligence
              </p>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-start gap-4">
                <p className="text-[#8B9AB5] text-xs">Source</p>
                <p className="text-white text-xs text-right font-medium">{finding.benchmark.source}</p>
              </div>
              <div className="flex justify-between items-start gap-4">
                <p className="text-[#8B9AB5] text-xs">Benchmark Value</p>
                <p className="text-emerald-400 text-xs text-right font-bold">{finding.benchmark.value_label}</p>
              </div>
              <div className="flex justify-between items-start gap-4">
                <p className="text-[#8B9AB5] text-xs">As Of</p>
                <p className="text-white text-xs text-right">{finding.benchmark.as_of}</p>
              </div>
              {finding.benchmark.note && (
                <p className="text-[#8B9AB5] text-[10px] leading-relaxed pt-1 border-t border-[#1E3055]">
                  {finding.benchmark.note}
                </p>
              )}
              <a
                href={finding.benchmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[#C9A84C] text-[10px] mt-1 underline underline-offset-2 opacity-70 hover:opacity-100"
              >
                View source ↗
              </a>
            </div>
          </div>
        )}

        {/* Estimated leakage — only shown when quantified */}
        {finding.estimated_leakage != null && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <p className="text-red-400 text-xs uppercase tracking-wider mb-2">
              Estimated Potential Leakage
            </p>
            <p className="text-white font-bold text-2xl">
              {currency}{' '}
              {Number(finding.estimated_leakage).toLocaleString('en-SG', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-red-400/60 text-xs mt-1.5 leading-relaxed">
              Approximation based on data provided. Audit observation only.
            </p>
          </div>
        )}

        {/* Suggested RM question */}
        <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-4">
          <p className="text-[#C9A84C] text-xs uppercase tracking-wider mb-2.5">
            Suggested Question for Your RM
          </p>
          <p className="text-white text-sm leading-relaxed italic">
            "{finding.suggested_question}"
          </p>
        </div>

        {/* Conversation scripts */}
        <div className="bg-[#132040] border border-[#1E3055] rounded-2xl overflow-hidden">

          {/* Tone selector */}
          <div className="p-4 border-b border-[#1E3055]">
            <p className="text-[#C9A84C] text-xs uppercase tracking-wider mb-3">Script Tone</p>
            <div className="grid grid-cols-4 gap-1 bg-[#0B1426] rounded-xl p-1">
              {TONES.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`text-xs py-2 rounded-lg font-medium transition-colors duration-150 ${
                    tone === t
                      ? 'bg-[#C9A84C] text-[#0B1426]'
                      : 'text-[#8B9AB5] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#1E3055] flex overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors duration-150 ${
                  activeTab === tab
                    ? 'border-[#C9A84C] text-[#C9A84C]'
                    : 'border-transparent text-[#8B9AB5] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 min-h-[180px] relative">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-5 h-5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : script ? (
              <>
                <ScriptContent tab={activeTab} script={script} />
                <button
                  onClick={handleCopy}
                  className="mt-4 flex items-center gap-1.5 text-[#8B9AB5] hover:text-[#C9A84C] text-xs transition-colors duration-150"
                >
                  <CopyIcon />
                  {copied ? 'Copied' : 'Copy to clipboard'}
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-[#132040] border border-[#1E3055] rounded-2xl px-4 py-4">
          <p className="text-[#8B9AB5] text-xs leading-relaxed">{finding.disclaimer}</p>
        </div>

      </div>
    </div>
  )
}

function ScriptContent({ tab, script }) {
  if (tab === 'Explanation') {
    return <p className="text-[#CBD5E1] text-sm leading-relaxed">{script.explanation}</p>
  }
  if (tab === 'Questions') {
    return (
      <ol className="space-y-3">
        {script.questions.map((q, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#C9A84C] font-bold text-sm flex-shrink-0">{i + 1}.</span>
            <p className="text-[#CBD5E1] text-sm leading-relaxed">{q}</p>
          </li>
        ))}
      </ol>
    )
  }
  if (tab === 'Meeting' || tab === 'Email') {
    const content = tab === 'Meeting' ? script.meeting_script : script.email_draft
    return (
      <pre className="text-[#CBD5E1] text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#0B1426] rounded-xl p-3 overflow-x-auto">
        {content}
      </pre>
    )
  }
  return null
}
