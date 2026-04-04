// ─── Extracted lease fields from OCR ───────────────────────────────────────

export interface LeaseFields {
  make: string
  model: string
  trim: string
  msrp: number | null
  sellingPrice: number | null
  moneyFactor: number | null       // raw MF, e.g. 0.00310
  residualPct: number | null       // as a percentage, e.g. 56
  termMonths: number | null
  milesPerYear: number | null
  acquisitionFee: number | null
  docFee: number | null
  dispositionFee: number | null
  monthlyPayment: number | null
  dueAtSigning: number | null
  zipCode: string
  contributeData: boolean
}

// Confidence level for each extracted field
export type FieldConfidence = 'high' | 'medium' | 'low' | 'manual'

export type ExtractedFieldMap = {
  [K in keyof LeaseFields]?: FieldConfidence
}

export interface OcrResult {
  fields: Partial<LeaseFields>
  confidence: ExtractedFieldMap
  rawText?: string               // for debugging; not stored
}

// ─── Scoring ────────────────────────────────────────────────────────────────

export interface ScoreComponent {
  label: string
  earned: number
  max: number
  barColor: 'green' | 'amber' | 'red'
  note?: string
}

export interface RedFlag {
  icon: string
  headline: string
  detail: string
}

export interface Recommendation {
  type: 'action' | 'positive'
  headline: string
  script?: string           // exact words user can say to dealer
}

export type VerdictBand = 'great' | 'fair' | 'negotiate' | 'walkaway'

export interface AnalysisResult {
  score: number             // 0–100
  verdict: VerdictBand
  verdictLabel: string
  scoreSub: string          // one-liner shown under verdict
  components: ScoreComponent[]
  redFlags: RedFlag[]
  recommendations: Recommendation[]
  benchmarkFound: boolean
  partialScore: boolean     // true if we scored fees+price only
}

// ─── Benchmark rate (from Supabase) ─────────────────────────────────────────

export interface BenchmarkRate {
  id: string
  make: string
  model: string
  trim: string | null
  region: string
  term_months: number
  miles_per_year: number
  mf_buy_rate: number
  residual_pct: number
  incentives: string | null
  year: number
  month: number
  source: 'edmunds-forum' | 'carsdirect-bulletin' | 'autoblog' | 'crowdsourced'
  confidence: 'editorial' | 'crowdsourced'
  notes: string | null
}

// ─── App state ───────────────────────────────────────────────────────────────

export type AppScreen = 'home' | 'review' | 'loading' | 'report'
