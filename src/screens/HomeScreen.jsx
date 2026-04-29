import { LockIcon, InfoIcon } from '../components/Icons'
import logoSrc from '../assets/logo.png'

export default function HomeScreen({ onRunAudit, error }) {
  return (
    <div className="min-h-screen bg-[#0B1426] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">

        {/* Logo mark */}
        <div className="flex justify-center mb-4">
          <img
            src={logoSrc}
            alt="Cavenagh Asia"
            className="w-40 h-40 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <p className="text-[#8B9AB5] text-xs tracking-[0.2em] uppercase mb-2">Private Wealth</p>
          <h1 className="text-[26px] font-bold text-white leading-tight">
            Cavenagh Asia
          </h1>
          <h1 className="text-[26px] font-bold text-[#C9A84C] leading-tight mb-4">
            Sovereign Auditor
          </h1>
          <div className="flex items-center gap-3 justify-center mb-4">
            <div className="h-px flex-1 bg-[#1E3055]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
            <div className="h-px flex-1 bg-[#1E3055]" />
          </div>
          <p className="text-[#8B9AB5] text-sm leading-relaxed">
            Trust, but verify your wealth relationship.
          </p>
        </div>

        {/* Info pills */}
        <div className="space-y-2.5 mb-8">
          <div className="flex items-start gap-3 bg-[#132040] border border-[#1E3055] rounded-2xl px-4 py-3.5">
            <LockIcon />
            <p className="text-[#8B9AB5] text-xs leading-relaxed">
              Runs locally on your device. No client data is uploaded or transmitted.
            </p>
          </div>
          <div className="flex items-start gap-3 bg-[#132040] border border-[#1E3055] rounded-2xl px-4 py-3.5">
            <InfoIcon />
            <p className="text-[#8B9AB5] text-xs leading-relaxed">
              Provides audit observations only. Not investment, financial, legal, or tax advice.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onRunAudit}
          className="w-full bg-[#C9A84C] hover:bg-[#DDB95E] active:bg-[#B8943E] text-[#0B1426] font-semibold py-4 rounded-2xl transition-colors duration-150 text-sm tracking-wide shadow-lg"
        >
          Run Local Audit
        </button>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-red-400 text-xs leading-relaxed">{error}</p>
            <p className="text-red-400/60 text-xs mt-1">
              Make sure the Python server is running on port 8000.
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-[#8B9AB5] text-xs text-center mt-8 leading-relaxed opacity-60">
          Audit observations based on data provided.<br />
          Consult a licensed adviser before making financial decisions.
        </p>
      </div>
    </div>
  )
}
