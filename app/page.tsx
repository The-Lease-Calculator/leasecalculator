'use client'

import { useState } from 'react'
import Nav from './components/Nav'
import HomeScreen from './components/HomeScreen'
import ReviewScreen from './components/ReviewScreen'
import LoadingScreen from './components/LoadingScreen'
import ReportScreen from './components/ReportScreen'
import {
  AppScreen, LeaseFields, OcrResult, AnalysisResult,
  ExtractedFieldMap,
} from './types/lease'
import { scoreLeaseQuote } from './hooks/useLeaseAnalyzer'

const EMPTY_FIELDS: Partial<LeaseFields> = {
  make: '', model: '', trim: '', zipCode: '',
  contributeData: false,
}

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>('home')
  const [ocrResult, setOcrResult] = useState<OcrResult>({ fields: EMPTY_FIELDS, confidence: {} })
  const [confirmedFields, setConfirmedFields] = useState<LeaseFields | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ── Step 1: User drops/selects a file → call OCR API ──────────────────
  async function handleFileSelected(file: File) {
    setScreen('loading')
    setError(null)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/analyze', { method: 'POST', body: form })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'OCR extraction failed')
      }

      const result: OcrResult = await res.json()
      setOcrResult(result)
      setScreen('review')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      // Fall back to manual entry so user isn't stuck
      setOcrResult({ fields: EMPTY_FIELDS, confidence: {} })
      setScreen('review')
    }
  }

  // ── Step 2: User manually enters → skip OCR ──────────────────────────
  function handleManualEntry() {
    setOcrResult({ fields: EMPTY_FIELDS, confidence: {} })
    setScreen('review')
  }

  // ── Step 3: User confirms fields → fetch benchmark + score ────────────
  async function handleSubmitFields(fields: LeaseFields) {
    setConfirmedFields(fields)
    setScreen('loading')

    try {
      // Fetch best-matching benchmark from Supabase via API route
      const params = new URLSearchParams({
        make: fields.make,
        model: fields.model,
        term: String(fields.termMonths ?? 36),
        miles: String(fields.milesPerYear ?? 12000),
      })
      const bmRes = await fetch(`/api/benchmark?${params}`)
      const benchmark = bmRes.ok ? await bmRes.json() : null

      // Run scoring (client-side, pure function)
      const result = scoreLeaseQuote(fields, benchmark)
      setAnalysisResult(result)

      // Persist to Supabase if user opted in
      if (fields.contributeData) {
        await fetch('/api/contribute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields }),
        }).catch(() => {}) // non-blocking
      }

      setScreen('report')
    } catch (err) {
      console.error(err)
      // Score without benchmark on error
      const result = scoreLeaseQuote(fields, null)
      setAnalysisResult(result)
      setScreen('report')
    }
  }

  function handleReset() {
    setScreen('home')
    setOcrResult({ fields: EMPTY_FIELDS, confidence: {} })
    setConfirmedFields(null)
    setAnalysisResult(null)
    setError(null)
  }

  return (
    <>
      <Nav />

      {error && screen === 'review' && (
        <div style={{
          maxWidth: 780, margin: '1rem auto 0', padding: '0 2rem',
          background: 'var(--amber-light)', border: '1px solid rgba(154,90,0,0.2)',
          borderRadius: 'var(--r)',
          fontSize: '0.875rem', color: 'var(--amber)',
        }}>
          ⚠ Could not extract from your file — please enter the values manually below.
        </div>
      )}

      {screen === 'home' && (
        <HomeScreen
          onFileSelected={handleFileSelected}
          onManualEntry={handleManualEntry}
          setScreen={setScreen}
        />
      )}

      {screen === 'review' && (
        <ReviewScreen
          fields={ocrResult.fields}
          confidence={ocrResult.confidence as ExtractedFieldMap}
          onSubmit={handleSubmitFields}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'loading' && <LoadingScreen />}

      {screen === 'report' && analysisResult && confirmedFields && (
        <ReportScreen
          result={analysisResult}
          fields={confirmedFields}
          onReset={handleReset}
        />
      )}
    </>
  )
}
