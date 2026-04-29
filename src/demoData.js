// Hardcoded demo audit output — mirrors what the Python backend returns
// for mock_statement.json. Used when the backend is not running.

export const DEMO_STATEMENT = {
  client_name:     'Mr. Alexander Koh',
  bank:            'Global Wealth Management',
  statement_date:  '2026-03-31',
  currency:        'SGD',
  portfolio_value: 5200000,
}

const DISCLAIMER =
  'This is an audit observation based on the data provided. ' +
  'It is not investment advice, financial advice, legal advice, or tax advice.'

export const DEMO_FINDINGS = [
  // ── HIGH: FX Spread ────────────────────────────────────────────────────────
  {
    id: 'demo-fx-001',
    title: 'FX Spread Markup',
    category: 'FX_SPREAD',
    severity: 'HIGH',
    summary:
      'The USD/SGD conversion of USD 500,000 was executed at 1.3650 against a ' +
      'live mid-rate of 1.3400. The implied spread of 1.87% appears materially ' +
      'above the private banking benchmark threshold of 0.5%. ' +
      'This may warrant clarification.',
    estimated_leakage: 12500,
    evidence: {
      from_currency:    'USD',
      to_currency:      'SGD',
      amount:           'USD 500,000',
      execution_rate:   1.365,
      mid_rate:         1.340,
      mid_rate_source:  'open.er-api.com (live)',
      spread_pct:       '1.87%',
      threshold:        '0.5%',
    },
    suggested_question:
      'Could you please clarify the spread applied to this FX conversion ' +
      'and whether this was priced under my best available private banking tier?',
    disclaimer: DISCLAIMER,
    benchmark: {
      source:      'Open Exchange Rates (open.er-api.com)',
      value_label: '1 SGD = 0.7463 USD',
      as_of:       '2026-03-31',
      url:         'https://open.er-api.com',
      note:        'Live mid-market rate — free tier, updates daily',
    },
  },

  // ── HIGH: Negative Carry ───────────────────────────────────────────────────
  {
    id: 'demo-re-001',
    title: 'Negative Carry Real Estate',
    category: 'REAL_ESTATE_CARRY',
    severity: 'HIGH',
    summary:
      'UK Buy-to-Let Property appears to generate a net carry of -3.0% based on ' +
      'the figures provided. The rental yield of 3.5% appears insufficient to cover ' +
      'the mortgage rate of 5.5% plus estimated maintenance and tax of 1.0% ' +
      '(total carrying cost: 6.5%). Based on MAS SORA at 3.21%, the benchmark ' +
      'mortgage rate (SORA + 1.20% typical spread) is approximately 4.41%. ' +
      "The client's rate of 5.5% appears 1.09% above this benchmark, " +
      'which may also warrant review.',
    estimated_leakage: null,
    evidence: {
      asset_name:          'UK Buy-to-Let Property',
      estimated_value:     'SGD 2,000,000',
      rental_yield:        '3.5%',
      mortgage_rate:       '5.5%',
      maintenance_and_tax: '1.0%',
      total_carrying_cost: '6.5%',
      net_carry:           '-3.0%',
      sora_overnight:      '3.21%',
      benchmark_mortgage:  '4.41% (SORA + 1.20% spread)',
      client_vs_benchmark: '+1.09%',
    },
    suggested_question:
      'Can we review whether this property is still efficient from a cashflow ' +
      'perspective, considering the rental yield appears below the total ' +
      'financing and maintenance cost?',
    disclaimer: DISCLAIMER,
    benchmark: {
      source:      'MAS SORA Dashboard',
      value_label: '3.21% p.a. (overnight)',
      as_of:       '2026-03-31',
      url:         'https://eservices.mas.gov.sg/statistics/dir/DMChart.aspx',
      note:        'Singapore Overnight Rate Average — MAS published rate',
    },
  },

  // ── MEDIUM: Closet Indexing ────────────────────────────────────────────────
  {
    id: 'demo-fund-001',
    title: 'Closet Indexing / High Active Fund Fee',
    category: 'FUND_FEE',
    severity: 'MEDIUM',
    summary:
      'Global Tech Alpha Fund charges a management fee of 1.50% per annum, ' +
      'which is consistent with an actively managed strategy. However, the ' +
      "fund's observed correlation to its stated benchmark (Nasdaq-100) is 92%, " +
      'which appears high for an active mandate. This may warrant clarification ' +
      'as to the active management value being delivered relative to the fee level.',
    estimated_leakage: null,
    evidence: {
      fund_name:            'Global Tech Alpha Fund',
      holding_value:        'SGD 1,200,000',
      management_fee:       '1.50%',
      benchmark:            'Nasdaq-100',
      benchmark_correlation:'92%',
      active_fee_threshold: '1.0%',
      correlation_threshold:'90%',
    },
    suggested_question:
      'Could you explain what active management value this fund is providing ' +
      'relative to its benchmark, given the fee level and observed benchmark correlation?',
    disclaimer: DISCLAIMER,
    benchmark: null,
  },

  // ── MEDIUM: Gold Premium ───────────────────────────────────────────────────
  {
    id: 'demo-gold-001',
    title: 'Gold Pricing Premium',
    category: 'GOLD_PREMIUM',
    severity: 'MEDIUM',
    summary:
      'Physical Gold — 1 kg bar (PAMP Suisse) was purchased at SGD 4,650.00/troy oz. ' +
      'The LBMA spot price converted to SGD is approximately SGD 4,382.00/troy oz ' +
      '(LBMA USD 3,270.00 ÷ USD/SGD 0.7463). The implied premium of 6.1% appears ' +
      'above the 2% private banking benchmark for bullion pricing. ' +
      'This may warrant clarification on the pricing basis applied.',
    estimated_leakage: 8614,
    evidence: {
      description:              'Physical Gold — 1 kg bar (PAMP Suisse)',
      custodian:                'Global Wealth Management Vault, Singapore',
      quantity:                 '32.150 troy oz',
      client_price_sgd_per_oz:  'SGD 4,650.00',
      lbma_spot_usd_per_oz:     'USD 3,270.00',
      lbma_spot_sgd_per_oz:     'SGD 4,382.00',
      premium:                  '6.1%',
      threshold:                '2%',
    },
    suggested_question:
      'Could you clarify the pricing basis applied to this gold purchase — ' +
      'specifically, what spread above LBMA spot was charged, and whether the ' +
      'best available institutional rate was applied?',
    disclaimer: DISCLAIMER,
    benchmark: {
      source:      'LBMA Gold Price (metals.live)',
      value_label: 'USD 3,270.00/troy oz',
      as_of:       '2026-03-31',
      url:         'https://www.lbma.org.uk/prices-and-data/precious-metal-prices',
      note:        'London Bullion Market Association spot benchmark',
    },
  },
]

export const DEMO_SCRIPTS = {
  FX_SPREAD: {
    explanation:
      'Your bank applied a 1.87% spread when converting USD 500,000 to SGD. ' +
      'The private banking industry benchmark is 0.5% or less for a client at this portfolio size. ' +
      'The excess spread of approximately 1.37% cost you an estimated SGD 12,500 on this single transaction. ' +
      'This is a recurring cost pattern — every FX conversion at this spread erodes your returns.',
    questions: [
      'What is the exact spread policy applied to my FX conversions at my current relationship tier?',
      'What spread would apply if I gave prior notice or batched conversions above SGD 500,000?',
      'Can you show me the interbank mid-rate at the time of execution versus the rate I received?',
      'Is there a preferred FX execution window or pre-agreed rate arrangement available to me?',
    ],
    meeting_script:
      'Good morning. I have been reviewing my Q1 statement and noticed that the USD/SGD conversion ' +
      'of USD 500,000 on [date] was executed at 1.3650, against a market mid-rate of 1.3400 at that time.\n\n' +
      'That represents a spread of 1.87%, which appears above the 0.5% benchmark I would expect ' +
      'at my portfolio size. The estimated cost on this transaction alone is SGD 12,500.\n\n' +
      'I would like to understand your FX pricing policy for clients at my tier, and whether ' +
      'there is a more competitive arrangement available for future conversions.',
    email_draft:
      'Dear [Relationship Manager],\n\n' +
      'I am writing to seek clarification on the FX conversion recorded in my Q1 2026 statement.\n\n' +
      'Transaction: USD 500,000 converted to SGD\n' +
      'Execution rate applied: 1.3650\n' +
      'Market mid-rate (open.er-api.com): 1.3400\n' +
      'Implied spread: 1.87%\n' +
      'Estimated excess cost: SGD 12,500\n\n' +
      'Based on my understanding of private banking FX benchmarks, a spread of 0.5% or less ' +
      'would be appropriate for a client at my portfolio level. Could you please confirm the ' +
      'pricing basis applied and advise whether a preferred rate arrangement is available?\n\n' +
      'Kind regards,\n[Client Name]',
  },
  REAL_ESTATE_CARRY: {
    explanation:
      'The UK buy-to-let property is in negative carry: you are paying more in financing and ' +
      'maintenance costs (6.5% total) than the property generates in rental income (3.5%). ' +
      'The shortfall of 3.0% per year means this property costs you money to hold. ' +
      'Additionally, MAS SORA is currently 3.21%, making the benchmark mortgage rate approximately ' +
      '4.41%. Your rate of 5.5% is 1.09% above what the benchmark would suggest.',
    questions: [
      'Can we review the full cashflow position of this property including all costs?',
      'What is the current mortgage rate benchmark for this facility, and how does my rate compare?',
      'Is there an option to refinance at a rate closer to the SORA-linked benchmark?',
      'Has the rental yield been independently verified against current market data?',
    ],
    meeting_script:
      'I have reviewed the property figures in my statement. The rental yield of 3.5% is below ' +
      'the total carrying cost of 6.5% (5.5% mortgage + 1.0% maintenance and tax), leaving a ' +
      'net negative carry of -3.0% per year.\n\n' +
      'I also note that the current MAS SORA rate is 3.21%, which implies a benchmark mortgage ' +
      'rate of approximately 4.41% including a typical 1.2% spread. My current rate of 5.5% ' +
      'is materially above this benchmark.\n\n' +
      'I would like to discuss whether there is scope to refinance, and whether the current ' +
      'holding strategy remains appropriate given the cashflow position.',
    email_draft:
      'Dear [Relationship Manager],\n\n' +
      'I would like to discuss the cashflow position of the UK buy-to-let property in my portfolio.\n\n' +
      'Rental yield: 3.5%\n' +
      'Mortgage rate: 5.5%\n' +
      'Maintenance and tax: 1.0%\n' +
      'Net carry: -3.0% per annum\n\n' +
      'For context, MAS SORA is currently 3.21%, suggesting a benchmark mortgage rate of ~4.41%. ' +
      'My current rate of 5.5% appears 1.09% above this benchmark.\n\n' +
      'I would appreciate a meeting to review refinancing options and the overall holding strategy ' +
      'for this asset.\n\n' +
      'Kind regards,\n[Client Name]',
  },
  FUND_FEE: {
    explanation:
      'Global Tech Alpha Fund charges 1.5% per year as an active management fee, which implies ' +
      'the manager is actively selecting stocks to outperform the Nasdaq-100 index. ' +
      'However, the fund has a 92% correlation to the Nasdaq-100 — meaning it moves almost ' +
      'identically to the index. You could hold a Nasdaq-100 ETF for around 0.07% per year. ' +
      'The excess fee of approximately 1.43% on SGD 1,200,000 is around SGD 17,160 per year.',
    questions: [
      'What is the active share of this fund versus the Nasdaq-100 benchmark?',
      'Can you provide the 3-year performance attribution showing alpha generated net of fees?',
      'What positions does the fund hold that differ meaningfully from the Nasdaq-100 index?',
      'Is there a lower-cost alternative that provides similar exposure?',
    ],
    meeting_script:
      'I have been reviewing the Global Tech Alpha Fund position. The fund charges 1.5% per annum, ' +
      'which is an active management fee. However, I note that its performance over the past year ' +
      'has correlated at 92% with the Nasdaq-100.\n\n' +
      'I would like to understand what active management value justifies the 1.5% fee, ' +
      'and whether a lower-cost index alternative has been considered for this allocation.',
    email_draft:
      'Dear [Relationship Manager],\n\n' +
      'I would like to request further information on the Global Tech Alpha Fund held in my portfolio.\n\n' +
      'Management fee: 1.50% p.a.\n' +
      'Benchmark: Nasdaq-100\n' +
      'Observed correlation: 92%\n' +
      'Holding value: SGD 1,200,000\n\n' +
      'Given the high correlation to the benchmark index, I would like to understand the active ' +
      'management value delivered relative to the fee charged. Could you provide performance ' +
      'attribution and active share data for this fund?\n\n' +
      'Kind regards,\n[Client Name]',
  },
  GOLD_PREMIUM: {
    explanation:
      'The 1 kg gold bar was purchased at SGD 4,650 per troy ounce. The LBMA spot price at the ' +
      'time was approximately USD 3,270 per troy ounce, which converts to roughly SGD 4,382. ' +
      'The implied premium of 6.1% is above the 2% benchmark for institutional bullion pricing. ' +
      'Across 32.15 troy ounces, the estimated excess cost is SGD 8,614.',
    questions: [
      'What pricing basis was applied to this gold purchase — spot plus what spread?',
      'Is the vault storage fee included in the purchase price, or charged separately?',
      'What is the buy-back spread should I wish to liquidate this position?',
      'Can you confirm the LBMA spot rate at the time of execution?',
    ],
    meeting_script:
      'I would like to discuss the gold purchase recorded in my statement. ' +
      'The purchase price was SGD 4,650 per troy ounce. Based on the LBMA spot price at the time ' +
      'of approximately USD 3,270, converted at the prevailing SGD rate, the spot equivalent ' +
      'was approximately SGD 4,382 per troy ounce.\n\n' +
      'That represents a premium of around 6.1%, which appears above the 2% institutional benchmark. ' +
      'I would like to understand the full pricing breakdown applied to this transaction.',
    email_draft:
      'Dear [Relationship Manager],\n\n' +
      'I am seeking clarification on the pricing applied to the gold purchase in my Q1 statement.\n\n' +
      'Description: Physical Gold — 1 kg bar (PAMP Suisse)\n' +
      'Quantity: 32.15 troy oz\n' +
      'Price paid: SGD 4,650.00/troy oz\n' +
      'LBMA spot (approximate): SGD 4,382.00/troy oz\n' +
      'Implied premium: ~6.1%\n\n' +
      'Could you provide the full pricing breakdown, including the spread above LBMA spot, ' +
      'and confirm whether the best available institutional rate was applied?\n\n' +
      'Kind regards,\n[Client Name]',
  },
}
