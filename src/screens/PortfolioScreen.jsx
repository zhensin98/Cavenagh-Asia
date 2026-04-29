import { useMemo, useState, useEffect, useRef, useCallback, Fragment } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Customized } from 'recharts'
import PreciousMetalsForm from './PreciousMetalsForm'
import RealEstateForm from './RealEstateForm'

const STRIP_CURRENCIES = ['USD', 'GBP', 'EUR', 'JPY', 'HKD', 'AUD', 'CNY', 'MYR']

// rates[X]     = how many X per 1 SGD  (raw API)
// 1 / rates[X] = how many SGD per 1 X  (display / conversion)
//
// prevRates is loaded from localStorage on mount so arrows reflect the
// actual daily change even after closing and reopening the app.
const FX_PREV_KEY = 'cavenagh_fx_prev'

function useFxRates() {
  const [rates,     setRates]     = useState(null)
  const [prevRates, setPrevRates] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FX_PREV_KEY)) } catch { return null }
  })
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [updated,   setUpdated]   = useState(null)
  const prevRef = useRef(null)

  const fetchRates = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch('https://open.er-api.com/v6/latest/SGD')
      .then(r => r.json())
      .then(data => {
        if (data.result === 'success') {
          // Snapshot whatever we had before as the "previous" baseline
          const snapshot = prevRef.current
          if (snapshot) {
            setPrevRates(snapshot)
            try { localStorage.setItem(FX_PREV_KEY, JSON.stringify(snapshot)) } catch {}
          }
          prevRef.current = data.rates
          setRates(data.rates)
          setUpdated(data.time_last_update_utc ?? null)
        } else {
          setError('Rate fetch failed')
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchRates() }, [fetchRates])

  return { rates, prevRates, loading, error, updated, refresh: fetchRates }
}

const GROUP_MAP = {
  SAVINGS:       'PRIVATE_BANK',
  FIXED_DEPOSIT: 'PRIVATE_BANK',
  BONDS:         'PRIVATE_BANK',
  CASH:          'PRIVATE_BANK',
  STOCKS:        'BROKER',
  FUNDS:         'PRIVATE_BANK',
  CRYPTO:        'CRYPTO',
  PROPERTY:      'REAL_ESTATE',
  GOLD:          'PHYSICAL_ASSET',
  OTHER:         'PHYSICAL_ASSET',
}

const TYPE_MAP = {
  CASH:          'CASH',
  SAVINGS:       'CASH',
  FIXED_DEPOSIT: 'FIXED_INCOME',
  BONDS:         'FIXED_INCOME',
  STOCKS:        'EQUITIES',
  FUNDS:         'FUNDS',
  CRYPTO:        'CRYPTO',
  PROPERTY:      'PROPERTY',
  GOLD:          'COMMODITIES',
  OTHER:         'OTHER',
}

const GROUP_META = {
  PRIVATE_BANK:   { label: 'Priv. Bank',      color: '#3B82F6' },
  BROKER:         { label: 'Broker',           color: '#10B981' },
  CRYPTO:         { label: 'Crypto',           color: '#F97316' },
  REAL_ESTATE:    { label: 'Real Estate',      color: '#EF4444' },
  PHYSICAL_ASSET: { label: 'Prec. Metals',     color: '#C9A84C' },
  MANUAL:         { label: 'Manual',           color: '#6B7280' },
}

const TYPE_META = {
  CASH:         { label: 'Cash',         color: '#3B82F6' },
  FIXED_INCOME: { label: 'Fixed Inc.',   color: '#10B981' },
  EQUITIES:     { label: 'Equities',     color: '#8B5CF6' },
  FUNDS:        { label: 'Funds',        color: '#06B6D4' },
  CRYPTO:       { label: 'Crypto',       color: '#F97316' },
  PROPERTY:     { label: 'Property',     color: '#EF4444' },
  COMMODITIES:  { label: 'Commodities',  color: '#C9A84C' },
  OTHER:        { label: 'Other',        color: '#6B7280' },
}

// Full labels used in breakdown cards (unabbreviated)
const GROUP_META_FULL = {
  PRIVATE_BANK:   { label: 'Private Bank',    color: '#3B82F6' },
  BROKER:         { label: 'Broker Account',  color: '#10B981' },
  CRYPTO:         { label: 'Crypto',          color: '#F97316' },
  REAL_ESTATE:    { label: 'Real Estate',     color: '#EF4444' },
  PHYSICAL_ASSET: { label: 'Precious Metals', color: '#C9A84C' },
  MANUAL:         { label: 'Manual Assets',   color: '#6B7280' },
}

const LABEL_THRESHOLD = 0.08
const RADIAN = Math.PI / 180

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 100_000)   return (n / 1_000).toFixed(0) + 'K'
  return n.toLocaleString()
}

function deconflict(labels, minGap) {
  if (labels.length <= 1) return labels
  const s = [...labels].sort((a, b) => a.y - b.y)
  for (let i = 1; i < s.length; i++) {
    if (s[i].y - s[i - 1].y < minGap) s[i] = { ...s[i], y: s[i - 1].y + minGap }
  }
  for (let i = s.length - 2; i >= 0; i--) {
    if (s[i + 1].y - s[i].y < minGap) s[i] = { ...s[i], y: s[i + 1].y - minGap }
  }
  return s
}

function groupBy(assets, mapObj) {
  const map = {}
  for (const a of assets) {
    const key = mapObj[a.asset_type] ?? 'MANUAL'
    if (!map[key]) map[key] = { group: key, total: 0, items: [] }
    map[key].total += a.amount
    map[key].items.push(a)
  }
  return Object.values(map).sort((a, b) => b.total - a.total)
}

function CustomTooltip({ active, payload, meta }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  const m = meta?.[name] ?? GROUP_META_FULL.MANUAL
  return (
    <div className="bg-[#132040] border border-[#1E3055] rounded-xl px-3 py-2 z-50">
      <p className="text-white text-xs font-medium">{m.label}</p>
      <p className="text-[#C9A84C] text-sm font-bold">SGD {fmt(value)}</p>
    </div>
  )
}

function MiniDonut({ title, groups, meta, total, onSegmentClick }) {
  const pieData = groups.map(g => ({ name: g.group, value: g.total }))

  // Customized label layer — closes over `total` and `meta` via useMemo
  const Labels = useMemo(() => {
    return function LabelsLayer({ formattedGraphicalItems }) {
      const pieProps = formattedGraphicalItems?.[0]?.props
      if (!pieProps) return null
      const { sectors, cx, cy, outerRadius } = pieProps
      if (!sectors?.length || cx == null || cy == null) return null

      const ER    = outerRadius + 6
      const SPINE = outerRadius + 18
      const LX    = outerRadius + 32

      // Place each label at the y-position matching its segment's midAngle
      // so labels visually follow the pie, then deconflict to prevent overlap.
      // Connect with an L-shaped polyline: arc → spine (horizontal) →
      // spine (vertical) → text (horizontal).
      function buildSide(list, isRight) {
        if (!list.length) return []
        const spineX = isRight ? cx + SPINE : cx - SPINE
        const labelX = isRight ? cx + LX    : cx - LX
        const items = list.map(s => {
          const ex = cx + ER    * Math.cos(-s.midAngle * RADIAN)
          const ey = cy + ER    * Math.sin(-s.midAngle * RADIAN)
          const y  = cy + SPINE * Math.sin(-s.midAngle * RADIAN)
          return { key: s.name, midAngle: s.midAngle, value: s.value,
                   ex, ey, spineX, labelX, y, isRight }
        })
        return deconflict(items, 34)
      }

      const rightSectors = sectors.filter(s => Math.cos(-s.midAngle * RADIAN) >= 0)
      const leftSectors  = sectors.filter(s => Math.cos(-s.midAngle * RADIAN) <  0)
      const all = [
        ...buildSide(rightSectors, true),
        ...buildSide(leftSectors,  false),
      ]

      return (
        <g pointerEvents="none">
          {/* Center label */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill="#8B9AB5"
            fontSize={9} fontWeight="600" letterSpacing="0.09em">
            TOTAL
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="#C9A84C"
            fontSize={17} fontWeight="700">
            {fmt(total)}
          </text>

          {/* L-shaped connector + label per segment */}
          {all.map(l => {
            const m      = meta[l.key] ?? GROUP_META.MANUAL
            const anchor = l.isRight ? 'start' : 'end'
            return (
              <g key={l.key}>
                <polyline
                  points={`${l.ex},${l.ey} ${l.spineX},${l.ey} ${l.spineX},${l.y} ${l.labelX},${l.y}`}
                  fill="none" stroke="#3B4F6B" strokeWidth={0.8}
                />
                <text x={l.labelX} y={l.y - 5} fill={m.color}
                  textAnchor={anchor} fontSize={10} fontWeight="700">
                  {m.label}
                </text>
                <text x={l.labelX} y={l.y + 8} fill="#ffffff"
                  textAnchor={anchor} fontSize={10} fontWeight="500">
                  {fmt(l.value)}
                </text>
              </g>
            )
          })}
        </g>
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total])

  return (
    <div className="bg-[#132040] border border-[#1E3055] rounded-2xl p-3 flex flex-col">
      <p className="text-white text-xs font-semibold mb-1 text-center tracking-wide">
        {title}
      </p>
      {/* [&_svg]:overflow-visible lets labels extend beyond SVG bounds */}
      <div className="relative h-64 [&_svg]:overflow-visible">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              label={false}
              labelLine={false}
              onClick={(data) => onSegmentClick?.(data.name)}
              style={{ cursor: 'pointer' }}
            >
              {pieData.map(entry => (
                <Cell
                  key={entry.name}
                  fill={(meta[entry.name] ?? GROUP_META.MANUAL).color}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip meta={meta} />} />
            <Customized component={Labels} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function PortfolioScreen({ assets, llmUsed }) {
  // All hooks must be called before any early return (Rules of Hooks)
  const { rates, prevRates, loading: ratesLoading, error: ratesError, updated, refresh } = useFxRates()

  // All state hooks must live before any early return (Rules of Hooks)
  const [selectedGroup,      setSelectedGroup]      = useState(null)
  const [showPreciousMetals, setShowPreciousMetals] = useState(false)
  const [showRealEstate,     setShowRealEstate]     = useState(false)

  const convertedAssets = useMemo(() => (assets ?? []).map(a => {
    if (a.currency === 'SGD' || !rates) return a
    const r = rates[a.currency]
    return r ? { ...a, amount: a.amount / r, currency: 'SGD' } : a
  }), [assets, rates])

  const stripData = useMemo(() => {
    if (!rates) return []
    return STRIP_CURRENCIES
      .filter(c => rates[c])
      .map(c => ({ from: c, sgdPer1: 1 / rates[c] }))
  }, [rates])

  if (!assets || assets.length === 0) {
    return (
      <div className="min-h-full bg-[#0B1426] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#132040] border border-[#1E3055] flex items-center justify-center mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-white font-semibold mb-2">No portfolio data yet</p>
        <p className="text-[#8B9AB5] text-sm">
          Upload a statement in the Documents tab to see your net worth breakdown.
        </p>
      </div>
    )
  }

  const sourceGroups = groupBy(convertedAssets, GROUP_MAP)
  const typeGroups   = groupBy(convertedAssets, TYPE_MAP)
  const total        = convertedAssets.reduce((s, a) => s + a.amount, 0)
  const hasMixed     = assets.some(a => a.currency !== 'SGD')

  // Keys that open the specialised input forms instead of the generic breakdown sheet
  const PRECIOUS_METALS_KEYS = new Set(['PHYSICAL_ASSET', 'COMMODITIES'])
  const REAL_ESTATE_KEYS     = new Set(['REAL_ESTATE', 'PROPERTY'])

  function openGroup(key, groups, metaMap) {
    if (PRECIOUS_METALS_KEYS.has(key)) { setShowPreciousMetals(true); return }
    if (REAL_ESTATE_KEYS.has(key))     { setShowRealEstate(true);     return }
    const group = groups.find(g => g.group === key)
    if (group) setSelectedGroup({ group, meta: metaMap[key] ?? GROUP_META_FULL.MANUAL, total })
  }

  return (
    <div className="min-h-full bg-[#0B1426] pb-6">

      {/* ── Page header ── */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#8B9AB5] text-xs uppercase tracking-widest mb-1">Net Worth</p>
            <p className="text-[#C9A84C] font-bold text-3xl leading-tight">SGD {fmt(total)}</p>
            {hasMixed && (
              <p className="text-[#8B9AB5] text-xs mt-1">
                {ratesLoading ? 'Converting currencies…' : ratesError ? 'Rate fetch failed · SGD assets only' : 'All currencies converted to SGD'}
              </p>
            )}
          </div>
          {!llmUsed && (
            <span className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-1 rounded-full flex-shrink-0">
              Preview
            </span>
          )}
        </div>
      </div>

      {/* ── FX Rate strip ── */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[#8B9AB5] text-[10px] uppercase tracking-widest">FX Rates → SGD</p>
          <div className="flex items-center gap-2">
            {updated && !ratesLoading && (
              <p className="text-[#8B9AB5] text-[9px] opacity-50">
                {new Date(updated).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
              </p>
            )}
            <button
              onClick={refresh}
              disabled={ratesLoading}
              title="Refresh rates"
              className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#132040] border border-[#1E3055] text-[#8B9AB5] hover:text-white hover:border-[#3B4F6B] transition-colors disabled:opacity-40"
            >
              <span
                className={ratesLoading ? 'animate-spin inline-block' : ''}
                style={{ fontSize: 11 }}
              >↺</span>
            </button>
          </div>
        </div>
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {ratesLoading && !rates && (
            <p className="text-[#8B9AB5] text-xs py-2">Loading rates…</p>
          )}
          {ratesError && !ratesLoading && (
            <p className="text-red-400 text-xs py-2">Could not load rates</p>
          )}
          {stripData.map(fx => {
            const prev      = prevRates?.[fx.from] ? 1 / prevRates[fx.from] : null
            const diff      = prev !== null ? fx.sgdPer1 - prev : null
            const up        = diff !== null && diff > 0
            const down      = diff !== null && diff < 0
            const changePct = diff !== null && prev ? (diff / prev) * 100 : null
            return (
              <div
                key={fx.from}
                className="flex-shrink-0 bg-[#132040] border border-[#1E3055] rounded-xl px-3 py-2 min-w-[72px]"
              >
                <p className="text-[#8B9AB5] text-[10px] font-semibold tracking-wide">{fx.from}</p>
                <p className="text-white text-xs font-bold mt-0.5">{fx.sgdPer1.toFixed(4)}</p>
                {changePct !== null ? (
                  <p className={`text-[9px] font-medium mt-0.5 ${up ? 'text-emerald-400' : down ? 'text-red-400' : 'text-[#8B9AB5]'}`}>
                    {up ? '▲' : down ? '▼' : '–'} {Math.abs(changePct).toFixed(2)}%
                  </p>
                ) : (
                  <p className="text-[#8B9AB5] text-[9px] mt-0.5 opacity-60">per SGD</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Stacked donuts ── */}
      <div className="px-4 space-y-3 mb-5">
        <MiniDonut
          title="By Source"
          groups={sourceGroups}
          meta={GROUP_META}
          total={total}
          onSegmentClick={key => openGroup(key, sourceGroups, GROUP_META_FULL)}
        />
        <MiniDonut
          title="By Asset Type"
          groups={typeGroups}
          meta={TYPE_META}
          total={total}
          onSegmentClick={key => openGroup(key, typeGroups, TYPE_META)}
        />
      </div>

      {/* ── Analysis placeholders ── */}
      <div className="px-4 space-y-3 mb-5">

        {/* Risk Concentration / Asset Correlation */}
        <div className="bg-[#132040] border border-[#1E3055] rounded-2xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white text-sm font-semibold">Risk Concentration</p>
              <p className="text-[#8B9AB5] text-xs mt-0.5">Asset Correlation</p>
            </div>
            <span className="text-[10px] bg-[#1E3055] text-[#8B9AB5] border border-[#2A4068] px-2 py-0.5 rounded-full flex-shrink-0">
              Coming soon
            </span>
          </div>
          <p className="text-[#8B9AB5] text-xs leading-relaxed mb-4 opacity-70">
            Concentration risk score, cross-asset correlation matrix, and diversification gaps across sources and asset classes.
          </p>
          {/* Placeholder skeleton */}
          <div className="space-y-2">
            {['Equity / Fixed Income', 'Real Estate / Cash', 'Crypto / Equities'].map(label => (
              <div key={label} className="flex items-center gap-3">
                <p className="text-[#8B9AB5] text-[10px] w-32 flex-shrink-0">{label}</p>
                <div className="flex-1 h-1.5 bg-[#1E3055] rounded-full" />
                <p className="text-[#2A4068] text-[10px] w-6 text-right">—</p>
              </div>
            ))}
          </div>
        </div>

        {/* Preparedness for Black Swan Events */}
        <div className="bg-[#132040] border border-[#1E3055] rounded-2xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white text-sm font-semibold">Black Swan Preparedness</p>
              <p className="text-[#8B9AB5] text-xs mt-0.5">Stress Test · Liquidity Buffer</p>
            </div>
            <span className="text-[10px] bg-[#1E3055] text-[#8B9AB5] border border-[#2A4068] px-2 py-0.5 rounded-full flex-shrink-0">
              Coming soon
            </span>
          </div>
          <p className="text-[#8B9AB5] text-xs leading-relaxed mb-4 opacity-70">
            Liquidity ratio, estimated drawdown under market crash scenarios, and exposure to highly correlated systemic risks.
          </p>
          {/* Placeholder skeleton */}
          <div className="grid grid-cols-3 gap-2">
            {['Liquidity Ratio', 'Crash Drawdown', 'Safe Haven %'].map(label => (
              <div key={label} className="bg-[#0B1426] border border-[#1E3055] rounded-xl p-3 text-center">
                <p className="text-[#2A4068] text-lg font-bold">—</p>
                <p className="text-[#8B9AB5] text-[9px] mt-1 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Disclaimer ── */}
      <div className="px-4 mt-2">
        <p className="text-[#8B9AB5] text-xs text-center leading-relaxed opacity-60">
          Tap any chart segment to view breakdown. Not financial advice.
        </p>
      </div>

      {/* ── Precious Metals form ── */}
      {showPreciousMetals && (
        <PreciousMetalsForm onClose={() => setShowPreciousMetals(false)} />
      )}

      {/* ── Real Estate form ── */}
      {showRealEstate && (
        <RealEstateForm onClose={() => setShowRealEstate(false)} />
      )}

      {/* ── Segment detail bottom sheet ── */}
      {selectedGroup && (
        <Fragment>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setSelectedGroup(null)}
          />
          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#132040] rounded-t-3xl max-h-[70vh] flex flex-col">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-[#1E3055] rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pt-2 pb-4 border-b border-[#1E3055] flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedGroup.meta.color }} />
                  <p className="text-white font-semibold text-base">{selectedGroup.meta.label}</p>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="text-[#8B9AB5] hover:text-white text-xl leading-none"
                >×</button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[#C9A84C] font-bold text-xl">
                  SGD {fmt(selectedGroup.group.total)}
                </p>
                <p className="text-[#8B9AB5] text-sm">
                  {selectedGroup.total > 0
                    ? ((selectedGroup.group.total / selectedGroup.total) * 100).toFixed(1)
                    : '0.0'}%
                </p>
              </div>
              <div className="mt-2 h-1.5 bg-[#1E3055] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${selectedGroup.total > 0 ? (selectedGroup.group.total / selectedGroup.total) * 100 : 0}%`,
                    backgroundColor: selectedGroup.meta.color,
                  }}
                />
              </div>
            </div>

            {/* Items list */}
            <div className="overflow-y-auto flex-1 px-5 py-3 space-y-3">
              {selectedGroup.group.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start py-2 border-b border-[#1E3055]/50 last:border-0">
                  <p className="text-[#8B9AB5] text-sm leading-relaxed flex-1 pr-4">
                    {item.description || item.institution}
                  </p>
                  <p className="text-white text-sm font-semibold flex-shrink-0">
                    SGD {fmt(item.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Fragment>
      )}
    </div>
  )
}
