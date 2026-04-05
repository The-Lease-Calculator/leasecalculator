/**
 * POST /api/analyze
 * Accepts a multipart form upload (PDF, JPG, PNG) and returns
 * extracted lease fields using Claude's vision API.
 */

import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { OcrResult, LeaseFields, ExtractedFieldMap, FieldConfidence } from '../../types/lease'

export const maxDuration = 30

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const EXTRACTION_PROMPT = `You are an expert at reading car lease quotes.
Analyze this lease document and extract the following values.

Return a valid JSON object with EXACTLY these keys (use null if not found):
{
  "make": string,
  "model": string,
  "trim": string,
  "msrp": number,
  "sellingPrice": number,
  "moneyFactor": number,
  "residualPct": number,
  "termMonths": number,
  "milesPerYear": number,
  "acquisitionFee": number,
  "docFee": number,
  "dispositionFee": number,
  "monthlyPayment": number,
  "dueAtSigning": number,
  "zipCode": string
}

Also return a "confidence" object with the same keys, each "high", "medium", or "low".

IMPORTANT:
- Money factor may appear as "MF", "rent charge", or a small decimal like .00225
- If you see an interest rate (e.g. 5.4%) convert to MF by dividing by 2400
-- Residual may appear as a dollar amount; if so, divide by MSRP x 100 to get %
- Return ONLY the JSON, no other text

JSON:`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large -- max 10MB' }, { status: 413 })

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    const mediaType = (() => {
      if (file.type === 'application/pdf') return 'application/pdf'
      if (file.type === 'image/jpeg') return 'image/jpeg'
      if (file.type === 'image/png') return 'image/png'
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext === 'pdf') return 'application/pdf'
      if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
      if (ext === 'png') return 'image/png'
      return 'image/jpeg'
    })() as 'application/pdf' | 'image/jpeg' | 'image/png'

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: EXTRACTION_PROMPT },
        ],
      }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
    let parsed: { [key: string]: unknown; confidence?: { [key: string]: string } }
    try {
      const jsonStr = rawText.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      parsed = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({ error: 'Could not parse lease data -- please enter manually.' }, { status: 422 })
    }

    const confidenceRaw = (parsed.confidence ?? {}) as Record<string, string>
    delete parsed.confidence
    const confidence: ExtractedFieldMap = {}
    for (const [k, v] of Object.entries(confidenceRaw)) {
      if (['high', 'medium', 'low', 'manual'].includes(v)) confidence[k as keyof LeaseFields] = v as FieldConfidence
    }

    return NextResponse.json({ fields: parsed as Partial<LeaseFields>, confidence } as OcrResult)
  } catch (err) {
    console.error('Analyze error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
