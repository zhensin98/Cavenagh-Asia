import { UploadIcon, PieChartIcon, AuditIcon } from './Icons'

const TABS = [
  { id: 'documents', label: 'Documents', Icon: UploadIcon },
  { id: 'portfolio', label: 'Portfolio',  Icon: PieChartIcon },
  { id: 'audit',     label: 'Audit',      Icon: AuditIcon },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="flex-shrink-0 bg-[#0F1D35] border-t border-[#1E3055] flex items-stretch safe-area-pb">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-150 ${
              isActive ? 'text-[#C9A84C]' : 'text-[#8B9AB5] hover:text-white'
            }`}
          >
            <Icon size={20} />
            <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-[#C9A84C]' : ''}`}>
              {label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-[#C9A84C] rounded-t-full" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
