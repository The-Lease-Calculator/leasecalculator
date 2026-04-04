/**
 * POST /api/contribute
 * Stores a user-contributed lease data point in crowdsourced_staging.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { LeaseFields } from '../../types/lease'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function gate1(fields: LeaseFields): { ok: boolean; reason?: string } {
  const { moneyFactor, residualPct, msrp, sellingPrice } = fields
  if (moneyFactor !== null && (moneyFactor < 0.0005 || moneyFactor > 0.006)) return { ok: false, reason: 'money_factor_out_of_range' }
  if (residualPct !== null && (residualPct < 30 || residualPct > 85)) return { ok: false, reason: 'residual_out_of_range' }
  if (msrp && sellingPrice && sellingPrice > msrp * 1.3) return { ok: false, reason: 'selling_price_implausible' }
  return { ok: true }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const fields = body.fields as LeaseFields
    if (!fields || !fields.make || !fields.model) return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    const check = gate1(fields)
    if (!check.ok) return NextResponse.json({ error: 'Validation failed', reason: check.reason }, { status: 422 })
    const now = new Date()
    const { error } = await supabase.from('crowdsourced_staging').insert({ make: fields.make, model: fields.model, trim: fields.trim || null, zip_code: fields.zipCode || null, money_factor: fields.moneyFactor, residual_pct: fields.residualPct, term_months: fields.termMonths, miles_per_year: fields.milesPerYear, monthly_payment: fields.monthlyPayment, msrp: fields.msrp, selling_price: fields.sellingPrice, acquisition_fee: fields.acquisitionFee, doc_fee: fields.docFee, year: now.getFullYear(), month: now.getMonth() + 1, status: 'pending' })
    if (error) return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
