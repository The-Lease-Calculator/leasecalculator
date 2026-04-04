/**
 * GET /api/benchmark?make=BMW&model=X3&term=36&miles=10000
 *
 * Returns the best-matching benchmark rate from Supabase.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { BenchmarkRate } from '../../types/lease'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const make  = searchParams.get('make')?.trim()
  const model = searchParams.get('model')?.trim()
  const term  = parseInt(searchParams.get('term') ?? '36')
  const miles = parseInt(searchParams.get('miles') ?? '12000')

  if (!make || !model) {
    return NextResponse.json({ error: 'make and model are required' }, { status: 400 })
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const { data, error } = await supabase
    .from('benchmark_rates')
    .select('*')
    .ilike('make', make)
    .ilike('model', `%${model}%`)
    .eq('term_months', term)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json(null, { status: 200 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json(null, { status: 200 })
  }

  const sorted = (data as BenchmarkRate[]).sort((a, b) => {
    const aFresh = a.year === year && a.month === month ? 0 : 1
    const bFresh = b.year === year && b.month === month ? 0 : 1
    if (aFresh !== bFresh) return aFresh - bFresh
    return Math.abs(a.miles_per_year - miles) - Math.abs(b.miles_per_year - miles)
  })

  const best = sorted[0]
  return NextResponse.json({ mf_buy_rate: best.mf_buy_rate, residual_pct: best.residual_pct, incentives: best.incentives, make: best.make, model: best.model, source: best.source, confidence: best.confidence, month: best.month, year: best.year })
}
