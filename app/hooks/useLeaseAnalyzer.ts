import { LeaseFields, AnalysisResult, ScoreComponent, RedFlag, Recommendation, VerdictBand } from '../types/lease'

const VERDICT_BANDS: Array<{ min: number; band: VerdictBand; label: string }> = [
  { min: 80, band: 'great',     label: 'Great deal' },
  { min: 60, band: 'fair',      label: 'Fair deal' },
  { min: 40, band: 'negotiate', label: 'Room to negotiate' },
  { min: 0,  band: 'walkaway',  label: 'Walk away' },
]

function verdictFromScore(score: number) {
  return VERDICT_BANDS.find(b => score >= b.min)!
}

const mfToApr = (mf: number) => (mf * 2400).toFixed(2)

export interface BenchmarkLookup {
  mf_buy_rate: number
  residual_pct: number
  incentives?: string | null
  make: string
  model: string
}

export function scoreLeaseQuote(
  fields: LeaseFields,
  benchmark: BenchmarkLookup | null
): AnalysisResult {
  const flags: RedFlag[] = []
  const recs: Recommendation[] = []
  const components: ScoreComponent[] = []
  let totalScore = 0
  const partialScore = !benchmark

  if (benchmark && fields.moneyFactor !== null) {
    const mf = fields.moneyFactor
    const buyRate = benchmark.mf_buy_rate
    const diff = mf - buyRate
    let mfPts: number

    if (diff <= 0) mfPts = 35
    else if (diff <= 0.0002) mfPts = 28
    else if (diff <= 0.0005) mfPts = 20
    else if (diff <= 0.001) mfPts = 10
    else mfPts = 0

    totalScore += mfPts
    components.push({ label: 'Money factor', earned: mfPts, max: 35, barColor: mfPts >= 28 ? 'green' : mfPts >= 10 ? 'amber' : 'red' })

    if (diff > 0.0002) {
      const approxMonthly = Math.round(diff * 2400 * ((fields.msrp ?? 40000) / 50))
      flags.push({ icon: '⚡', headline: 'Money factor markup detected.', detail: `The quoted MF of ${mf.toFixed(5)} is ${mfToApr(mf)}% APR. Published buy rate: ${buyRate.toFixed(5)} (${mfToApr(buyRate)}% APR). Estimated overcharge: ~$${approxMonthly}/mo.` })
      recs.push({ type: 'action', headline: 'Ask for the buy rate.', script: `I understand the published buy rate on the ${fields.make} ${fields.model} is ${buyRate.toFixed(5)}. I'd like to proceed at that rate.` })
    } else {
      recs.push({ type: 'positive', headline: 'Money factor is at or near the buy rate.' })
    }
  }

  if (benchmark && fields.residualPct !== null) {
    const res = fields.residualPct
    const benchRes = benchmark.residual_pct
    const diff = benchRes - res
    let resPts: number

    if (diff <= 0) resPts = 25
    else if (diff <= 2) resPts = 18
    else if (diff <= 5) resPts = 10
    else resPts = 0

    totalScore += resPts
    components.push({ label: 'Residual', earned: resPts, max: 25, barColor: resPts >= 18 ? 'green' : resPts >= 10 ? 'amber' : 'red' })

    if (diff > 2) flags.push({ icon: '�'', headline: 'Residual below published rate.', detail: `Your quote shows ${res}% residual, but published rate is ${benchRes}%. A lower residual increases your monthly payment.` })
  }

  let feePts = 25
  if (fields.acquisitionFee !== null && fields.acquisitionFee > 1000) {
    feePts -= 8
    flags.push({ icon: '💸', headline: 'Acquisition fee above $1,000.', detail: `$${fields.acquisitionFee.toLocaleString()} acquisition fee exceeds $1,000 reference threshold.` })
    recs.push({ type: 'action', headline: 'Verify the acquisition fee.', script: `What is the standard acquisition fee from ${fields.make} Financial?` })
  }
  if (fields.docFee !== null && fields.docFee > 500) {
    feePts -= 8
    flags.push({ icon: '📄', headline: `Doc fee $${fields.docFee.toLocaleString()} above average.`, detail: 'Doc fees are capped by state law in some states. Check your state\'s maximum.' })
  }
  if (fields.dispositionFee !== null && fields.dispositionFee > 400) {
    feePts -= 5
    flags.push({ icon: '🔄', headline: 'Disposition fee above $400.', detail: `At $${fields.dispositionFee}, this fee is waived if you lease or buy another vehicle from the same brand.` })
  }
  feePts = Math.max(0, feePts)
  totalScore += feePts
  components.push({ label: 'Fees', earned: feePts, max: 25, barColor: feePts >= 20 ? 'green' : feePts >= 12 ? 'amber' : 'red' })

  let pricePts = 8
  if (fields.msrp !== null && fields.sellingPrice !== null) {
    const pctOff = (fields.msrp - fields.sellingPrice) / fields.msrp
    if (pctOff >= 0.05) { pricePts = 15; recs.push({ type: 'positive', headline: 'Selling price is solid.' }) }
    else if (pctOff >= 0.02) pricePts = 11
    else if (pctOff >= 0) pricePts = 8
    else {
      pricePts = 0
      flags.push({ icon: '🏯️', headline: 'Selling price is above MSRP.', detail: `Quoted price ($${fields.sellingPrice.toLocaleString()}) exceeds MSRP ($${fields.msrp.toLocaleString()}).` })
      recs.push({ type: 'action', headline: 'Negotiate to MSRP or below.', script: `I\'d like to proceed at MSRP ($${fields.msrp.toLocaleString()}) or below.` })
    }
  }
  pricePts = Math.min(15, pricePts)
  totalScore += pricePts
  components.push({ label: 'Selling price', earned: pricePts, max: 15, barColor: pricePts >= 12 ? 'green' : pricePts >= 8 ? 'amber' : 'red' })

  const finalScore = Math.round(Math.min(100, totalScore))
  const { band, label } = verdictFromScore(finalScore)
  const scoreSub = band === 'great' ? 'This is a competitive lease. The key terms match or beat published benchmarks.' : band === 'fair' ? 'A reasonable deal with some room to improve.' : band === 'negotiate' ? 'There\'s real money on the table. Push back on the items flagged below.' : 'Multiple terms are significantly above market. Get competing quotes.'

  return { score: finalScore, verdict: band, verdictLabel: label, scoreSub, components, redFlags: flags, recommendations: recs, benchmarkFound: !!benchmark, partialScore }
}
