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
      {['SGD', 'USD', 'GBP', 'EUR', 'HKD', 'AUD', 'MYR'].map(c => <option key={c}>{c}</option>)}
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

function AlertBox({ color, children }) {
  const styles = {
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    red:   'bg-red-500/10 border-red-500/30 text-red-400',
    blue:  'bg-blue-500/10 border-blue-500/30 text-blue-400',
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

function NumericInput({ value, onChange, placeholder }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 bg-[#0B1426] border border-[#1E3055] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#3B4F6B] focus:border-[#C9A84C] focus:outline-none"
    />
  )
}

export default function RealEstateForm({ onClose }) {
  const [form, setForm] = useState({
    assetType: '',
    city: '',
    country: '',
    acquisitionCurrency: 'SGD',
    acquisitionValue: '',
    acquisitionDate: '',
    currentValueCurrency: 'SGD',
    currentValue: '',
    rentalCurrency: 'SGD',
    monthlyRental: '',
    holdingCostCurrency: 'SGD',
    annualHoldingCost: '',
    debtCurrency: 'SGD',
    outstandingDebt: '',
    interestRate: '',
    financingStructure: '',
    occupancy: '',
    agentCommission: '',
    legalCost: '',
    stampDuty: '',
  })

  const set = key => val => setForm(f => ({ ...f, [key]: val }))

  // Negative carry check: annual financing cost vs net annual yield
  const debt        = parseFloat(form.outstandingDebt)
  const rate        = parseFloat(form.interestRate)
  const rental      = parseFloat(form.monthlyRental)
  const holding     = parseFloat(form.annualHoldingCost)
  const curVal      = parseFloat(form.currentValue)
  const annualFinancing = (!isNaN(debt) && !isNaN(rate)) ? debt * (rate / 100) : NaN
  const annualRental    = (!isNaN(rental)) ? rental * 12 : NaN
  const netYield        = (!isNaN(annualRental) && !isNaN(holding)) ? annualRental - holding : NaN
  const negativeCarry   = !isNaN(annualFinancing) && !isNaN(netYield) && annualFinancing > netYield && annualFinancing > 0

  // Yield on value
  const grossYieldPct = (!isNaN(annualRental) && !isNaN(curVal) && curVal > 0)
    ? ((annualRental / curVal) * 100).toFixed(2)
    : null

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
            <p className="text-white font-bold text-base">Real Estate</p>
            <p className="text-[#C9A84C] text-xs mt-0.5 tracking-wide">Property Audit Details</p>
          </div>
          <button onClick={onClose} className="text-[#8B9AB5] hover:text-white text-2xl leading-none mt-0.5">×</button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3">

          {/* Card 1 — What is it and where? */}
          <SectionCard number="1" title="What Is It & Where?">
            <div className="space-y-3">
              <div>
                <Label>Asset Type</Label>
                <Pills
                  options={['Residential', 'Commercial', 'Industrial', 'Land', 'REIT', 'Fractional']}
                  value={form.assetType}
                  onChange={set('assetType')}
                />
                {form.assetType === 'REIT' && (
                  <AlertBox color="blue">
                    ℹ REITs are liquid listed instruments — consider classifying under equities for a cleaner audit.
                  </AlertBox>
                )}
                {form.assetType === 'Land' && (
                  <AlertBox color="amber">
                    ⚠ Undeveloped land generates no yield and may carry significant carry costs. Valuation is highly illiquid.
                  </AlertBox>
                )}
              </div>
              <div>
                <Label>City</Label>
                <TextInput
                  value={form.city}
                  onChange={set('city')}
                  placeholder="e.g. Singapore, London, Sydney"
                />
              </div>
              <div>
                <Label>Country / Jurisdiction</Label>
                <TextInput
                  value={form.country}
                  onChange={set('country')}
                  placeholder="e.g. Singapore, United Kingdom, Australia"
                />
              </div>
            </div>
          </SectionCard>

          {/* Card 2 — What did it cost & what is it worth? */}
          <SectionCard number="2" title="Cost & Current Value">
            <div className="space-y-3">
              <div>
                <Label>Acquisition Value</Label>
                <div className="flex gap-2">
                  <CurrencySelect value={form.acquisitionCurrency} onChange={set('acquisitionCurrency')} />
                  <NumericInput value={form.acquisitionValue} onChange={set('acquisitionValue')} placeholder="0.00" />
                </div>
              </div>
              <div>
                <Label>Acquisition Date</Label>
                <input
                  type="date"
                  value={form.acquisitionDate}
                  onChange={e => set('acquisitionDate')(e.target.value)}
                  className="w-full bg-[#0B1426] border border-[#1E3055] rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>
              <div>
                <Label>Current Estimated Market Value</Label>
                <div className="flex gap-2">
                  <CurrencySelect value={form.currentValueCurrency} onChange={set('currentValueCurrency')} />
                  <NumericInput value={form.currentValue} onChange={set('currentValue')} placeholder="0.00" />
                </div>
              </div>
              <div>
                <Label>Gross Monthly Rental Income</Label>
                <div className="flex gap-2">
                  <CurrencySelect value={form.rentalCurrency} onChange={set('rentalCurrency')} />
                  <NumericInput value={form.monthlyRental} onChange={set('monthlyRental')} placeholder="0.00" />
                </div>
                {grossYieldPct && (
                  <p className="mt-1.5 text-[10px] text-[#C9A84C]">
                    Gross yield: {grossYieldPct}% p.a. on current value
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Card 3 — The drag: debt & expenses */}
          <SectionCard number="3" title="The Drag: Debt & Expenses">
            <div className="space-y-3">
              <div>
                <Label>Annual Holding Costs (tax, maintenance, mgmt)</Label>
                <div className="flex gap-2">
                  <CurrencySelect value={form.holdingCostCurrency} onChange={set('holdingCostCurrency')} />
                  <NumericInput value={form.annualHoldingCost} onChange={set('annualHoldingCost')} placeholder="0.00" />
                </div>
              </div>

              <div>
                <Label>Outstanding Mortgage / Debt</Label>
                <div className="flex gap-2">
                  <CurrencySelect value={form.debtCurrency} onChange={set('debtCurrency')} />
                  <NumericInput value={form.outstandingDebt} onChange={set('outstandingDebt')} placeholder="0.00" />
                </div>
              </div>

              <div>
                <Label>Interest Rate (% p.a.)</Label>
                <div className="flex items-center gap-2">
                  <NumericInput value={form.interestRate} onChange={set('interestRate')} placeholder="0.00" />
                  <span className="text-[#8B9AB5] text-sm flex-shrink-0">% / year</span>
                </div>
              </div>

              {negativeCarry && (
                <AlertBox color="red">
                  ⚠ Negative carry detected: annual financing cost exceeds net rental income. You are subsidising this asset from other income or capital.
                </AlertBox>
              )}

              <div>
                <Label>Financing Structure</Label>
                <Pills
                  options={['Fixed rate', 'Floating rate', 'Interest-only', 'Unencumbered']}
                  value={form.financingStructure}
                  onChange={set('financingStructure')}
                />
                {form.financingStructure === 'Floating rate' && (
                  <AlertBox color="amber">
                    ⚠ Floating rate debt exposes you to rate rises. Stress-test at +2–3% to assess payment capacity.
                  </AlertBox>
                )}
              </div>

              <div>
                <Label>Occupancy Status</Label>
                <Pills
                  options={['Tenanted', 'Vacant', 'Self-occupied']}
                  value={form.occupancy}
                  onChange={set('occupancy')}
                />
                {form.occupancy === 'Vacant' && (
                  <AlertBox color="amber">
                    ⚠ Vacant property earns no yield and still incurs holding costs. Vacancy drag compounds quickly.
                  </AlertBox>
                )}
              </div>

              <div>
                <Label>Hidden Exit Costs</Label>
                <div className="space-y-2">
                  <div>
                    <p className="text-[#8B9AB5] text-[10px] mb-1">Agent Commission (%)</p>
                    <div className="flex items-center gap-2">
                      <NumericInput value={form.agentCommission} onChange={set('agentCommission')} placeholder="e.g. 2.0" />
                      <span className="text-[#8B9AB5] text-sm flex-shrink-0">%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[#8B9AB5] text-[10px] mb-1">Legal & Conveyancing (%)</p>
                    <div className="flex items-center gap-2">
                      <NumericInput value={form.legalCost} onChange={set('legalCost')} placeholder="e.g. 0.5" />
                      <span className="text-[#8B9AB5] text-sm flex-shrink-0">%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[#8B9AB5] text-[10px] mb-1">Stamp Duty / Exit Tax (%)</p>
                    <div className="flex items-center gap-2">
                      <NumericInput value={form.stampDuty} onChange={set('stampDuty')} placeholder="e.g. 4.0" />
                      <span className="text-[#8B9AB5] text-sm flex-shrink-0">%</span>
                    </div>
                  </div>
                  {(() => {
                    const a = parseFloat(form.agentCommission) || 0
                    const l = parseFloat(form.legalCost) || 0
                    const s = parseFloat(form.stampDuty) || 0
                    const total = a + l + s
                    if (total > 0) return (
                      <p className="text-[10px] text-[#C9A84C]">
                        Total exit friction: ~{total.toFixed(1)}% — property must appreciate by at least this to break even on exit.
                      </p>
                    )
                    return null
                  })()}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Save */}
          <button
            type="button"
            className="w-full bg-[#C9A84C] hover:bg-[#DDB95E] active:bg-[#B8943E] text-[#0B1426] font-semibold py-4 rounded-2xl text-sm tracking-wide transition-colors"
          >
            Save Property Details
          </button>

          <div className="h-6" />
        </div>
      </div>
    </>
  )
}
