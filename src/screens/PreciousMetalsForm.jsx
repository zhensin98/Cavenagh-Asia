import { useState } from 'react'

function Label({ children }) {
  return (
    <p className="text-[#8B9AB5] text-[10px] uppercase tracking-widest mb-2">
      {children}
    </p>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#0B1426] border border-[#1E3055] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#3B4F6B] focus:border-[#C9A84C] focus:outline-none"
    />
  )
}

function CurrencySelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-[#0B1426] border border-[#1E3055] rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none flex-shrink-0"
    >
      {['SGD', 'USD', 'GBP', 'EUR', 'HKD'].map(c => <option key={c}>{c}</option>)}
    </select>
  )
}

function Pills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            value === opt
              ? 'bg-[#C9A84C]/15 border-[#C9A84C] text-[#C9A84C]'
              : 'bg-[#0B1426] border-[#1E3055] text-[#8B9AB5]'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function RadioList({ options, value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm border transition-colors ${
            value === opt
              ? 'bg-[#C9A84C]/10 border-[#C9A84C] text-white'
              : 'bg-[#0B1426] border-[#1E3055] text-[#8B9AB5]'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function AlertBox({ color, children }) {
  const styles = {
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    red:   'bg-red-500/10 border-red-500/30 text-red-400',
  }
  return (
    <div className={`mt-2 border rounded-xl px-3 py-2 ${styles[color]}`}>
      <p className="text-[10px] leading-relaxed">{children}</p>
    </div>
  )
}

function SectionCard({ number, title, children }) {
  return (
    <div className="bg-[#132040] border border-[#1E3055] rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center flex-shrink-0">
          <span className="text-[#C9A84C] text-[10px] font-bold">{number}</span>
        </div>
        <p className="text-white text-sm font-semibold">{title}</p>
      </div>
      {children}
    </div>
  )
}

export default function PreciousMetalsForm({ onClose }) {
  const [form, setForm] = useState({
    metalType: '',
    formFactor: '',
    quantity: '',
    unit: 'troy oz',
    storageType: '',
    feeMode: 'pct',
    feeAmount: '',
    feeCurrency: 'SGD',
    feePct: '',
    custodian: '',
    custodianLocation: '',
    purchasePriceCurrency: 'SGD',
    purchasePrice: '',
    purchaseDate: '',
    buybackSpread: '',
  })

  const set = key => val => setForm(f => ({ ...f, [key]: val }))

  const feePct       = parseFloat(form.feePct)
  const feeAlert     = form.feeMode === 'pct' && !isNaN(feePct) && feePct > 0.75
  const poolAlert    = form.storageType.includes('unallocated') || form.storageType.includes('pool')

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B1426] rounded-t-3xl flex flex-col max-h-[92vh]">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-[#1E3055] rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4 border-b border-[#1E3055] flex-shrink-0 flex items-start justify-between">
          <div>
            <p className="text-white font-bold text-base">Precious Metals</p>
            <p className="text-[#C9A84C] text-xs mt-0.5 tracking-wide">Vault Audit Details</p>
          </div>
          <button onClick={onClose} className="text-[#8B9AB5] hover:text-white text-2xl leading-none mt-0.5">×</button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3">

          {/* 1 — Metal type & purity */}
          <SectionCard number="1" title="Metal Type & Purity">
            <Pills
              options={['Gold (999.9)', 'Silver (999)', 'Platinum', 'Palladium']}
              value={form.metalType}
              onChange={set('metalType')}
            />
          </SectionCard>

          {/* 2 — Form factor */}
          <SectionCard number="2" title="Form Factor">
            <Pills
              options={['Minted bars', 'Cast bars', 'Bullion coins', 'Jewelry / scrap']}
              value={form.formFactor}
              onChange={set('formFactor')}
            />
            {form.formFactor === 'Jewelry / scrap' && (
              <AlertBox color="amber">
                ⚠ Jewelry carries higher buy-sell spreads and is harder to value precisely. Bar form is preferred for audit clarity.
              </AlertBox>
            )}
          </SectionCard>

          {/* 3 — Quantity */}
          <SectionCard number="3" title="Total Quantity / Weight">
            <div className="flex gap-2">
              <input
                type="number"
                value={form.quantity}
                onChange={e => set('quantity')(e.target.value)}
                placeholder="0.000"
                className="flex-1 bg-[#0B1426] border border-[#1E3055] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#3B4F6B] focus:border-[#C9A84C] focus:outline-none"
              />
              <select
                value={form.unit}
                onChange={e => set('unit')(e.target.value)}
                className="bg-[#0B1426] border border-[#1E3055] rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none"
              >
                {['grams', 'kilograms', 'troy oz', 'taels'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </SectionCard>

          {/* 4 — Storage type */}
          <SectionCard number="4" title="Storage Type">
            <RadioList
              options={[
                'Professional vault — allocated / segregated',
                'Professional vault — unallocated / pool',
                'Bank safety deposit box',
                'Private home safe',
              ]}
              value={form.storageType}
              onChange={set('storageType')}
            />
            {poolAlert && (
              <AlertBox color="amber">
                ⚠ Unallocated / pool storage means you may not own specific serial-numbered bars directly. You could be an unsecured creditor in a crisis.
              </AlertBox>
            )}
          </SectionCard>

          {/* 5 — Annual fee */}
          <SectionCard number="5" title="Annual Storage & Insurance Fee">
            <div className="flex gap-2 mb-3">
              {[['pct', '% of Value'], ['amount', 'Fixed Amount']].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => set('feeMode')(mode)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    form.feeMode === mode
                      ? 'bg-[#C9A84C]/15 border-[#C9A84C] text-[#C9A84C]'
                      : 'bg-[#0B1426] border-[#1E3055] text-[#8B9AB5]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {form.feeMode === 'pct' ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={form.feePct}
                  onChange={e => set('feePct')(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-[#0B1426] border border-[#1E3055] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#3B4F6B] focus:border-[#C9A84C] focus:outline-none"
                />
                <span className="text-[#8B9AB5] text-sm flex-shrink-0">% / year</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <CurrencySelect value={form.feeCurrency} onChange={set('feeCurrency')} />
                <input
                  type="number"
                  value={form.feeAmount}
                  onChange={e => set('feeAmount')(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-[#0B1426] border border-[#1E3055] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#3B4F6B] focus:border-[#C9A84C] focus:outline-none"
                />
              </div>
            )}

            {feeAlert && (
              <AlertBox color="red">
                ⚠ Fee trap: {form.feePct}% exceeds the 0.75% institutional benchmark for Singapore / Hong Kong vaulting. You are likely overpaying.
              </AlertBox>
            )}
          </SectionCard>

          {/* 6 — Custodian */}
          <SectionCard number="6" title="Custodian & Location">
            <div className="space-y-3">
              <div>
                <Label>Custodian Name</Label>
                <TextInput
                  value={form.custodian}
                  onChange={set('custodian')}
                  placeholder="e.g. Le Freeport Singapore, Malca-Amit, Brink's"
                />
              </div>
              <div>
                <Label>Jurisdiction / Location</Label>
                <TextInput
                  value={form.custodianLocation}
                  onChange={set('custodianLocation')}
                  placeholder="e.g. Singapore, Hong Kong, Zurich"
                />
              </div>
            </div>
          </SectionCard>

          {/* 7 — Purchase price & date */}
          <SectionCard number="7" title="Purchase Price & Date">
            <div className="space-y-3">
              <div>
                <Label>Price Paid per Unit</Label>
                <div className="flex gap-2">
                  <CurrencySelect value={form.purchasePriceCurrency} onChange={set('purchasePriceCurrency')} />
                  <input
                    type="number"
                    value={form.purchasePrice}
                    onChange={e => set('purchasePrice')(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-[#0B1426] border border-[#1E3055] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#3B4F6B] focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <Label>Purchase Date</Label>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={e => set('purchaseDate')(e.target.value)}
                  className="w-full bg-[#0B1426] border border-[#1E3055] rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>
            </div>
          </SectionCard>

          {/* 8 — Buy-back spread */}
          <SectionCard number="8" title="Estimated Buy-back Spread">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.buybackSpread}
                onChange={e => set('buybackSpread')(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-[#0B1426] border border-[#1E3055] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#3B4F6B] focus:border-[#C9A84C] focus:outline-none"
              />
              <span className="text-[#8B9AB5] text-sm flex-shrink-0">%</span>
            </div>
            <p className="text-[#8B9AB5] text-[10px] leading-relaxed opacity-70">
              The dealer's haircut when selling back. If high, the metal price must rise just to break even on exit.
            </p>
          </SectionCard>

          {/* Save */}
          <button
            type="button"
            className="w-full bg-[#C9A84C] hover:bg-[#DDB95E] active:bg-[#B8943E] text-[#0B1426] font-semibold py-4 rounded-2xl text-sm tracking-wide transition-colors"
          >
            Save Vault Details
          </button>

          <div className="h-6" />
        </div>
      </div>
    </>
  )
}
