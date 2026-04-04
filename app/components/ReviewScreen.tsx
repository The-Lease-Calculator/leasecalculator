'use client'

import { useState } from 'react'
import { LeaseFields, ExtractedFieldMap } from '../types/lease'

interface Props {
  fields: Partial<LeaseFields>
  confidence: ExtractedFieldMap
  onSubmit: (fields: LeaseFields) => void
  onBack: () => void
}

const FIELD_DEFS: Array<{
  key: keyof LeaseFields
  label: string
  type: 'text' | 'number' | 'mf'
  half?: boolean
  required?: boolean
}> = [
  { key: 'make',           label: 'Make',                  type: 'text',   half: true,  required: true },
  { key: 'model',          label: 'Model',                 type: 'text',   half: true,  required: true },
  { key: 'trim',           label: 'Trim',                  type: 'text',   half: true },
  { key: 'zipCode',        label: 'ZIP Code',              type: 'text',   half: true },
  { key: 'msrp',           label: 'MSRP ($)',              type: 'number', half: true },
  { key: 'sellingPrice',   label: 'Selling Price ($)',      type: 'number', half: true },
  { key: 'moneyFactor',    label: 'Money Factor',          type: 'mf',     half: true,  required: true },
  { key: 'residualPct',    label: 'Residual (%)',          type: 'number', half: true,  required: true },
  { key: 'termMonths',     label: 'Term (months)',         type: 'number', half: true },
  { key: 'milesPerYear',   label: 'Miles/year',            type: 'number', half: true },
  { key: 'monthlyPayment', label: 'Monthly Payment ($)',   type: 'number', half: true },
  { key: 'dueAtSigning',   label: 'Due at Signing ($)',    type: 'number', half: true },
  { key: 'acquisitionFee', label: 'Acquisition Fee ($)',   type: 'number', half: true },
  { key: 'docFee',         label: 'Doc Fee ($)',           type: 'number', half: true },
  { key: 'dispositionFee', label: 'Disposition Fee ($)',   type: 'number', half: true },
]

export default function ReviewScreen({ fields: initialFields, confidence, onSubmit, onBack }: Props) {
  const [values, setValues] = useState<Partial<LeaseFields>>({ ...initialFields })
  const [contribute, setContribute] = useState(false)

  const hasLowConfidence = Object.values(confidence).some(c => c === 'low')

  function handleChange(key: keyof LeaseFields, raw: string) {
    const def = FIELD_DEFS.find(f => f.key === key)
    if (!def) return
    if (def.type === 'number' || def.type === 'mf') {
      const n = parseFloat(raw)
      setValues(v => ({ ...v, [key]: isNaN(n) ? null : n }))
    } else {
      setValues(v => ({ ...v, [key]: raw }))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      make: '',
      model: '',
      trim: '',
      msrp: null,
      sellingPrice: null,
      moneyFactor: null,
      residualPct: null,
      termMonths: null,
      milesPerYear: null,
      acquisitionFee: null,
      docFee: null,
      dispositionFee: null,
      monthlyPayment: null,
      dueAtSigning: null,
      zipCode: '',
      contributeData: contribute,
      ...values,
    } as LeaseFields)
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          Confirm your lease details
        </h2>
        <p style={{ color: 'var(--ink-3)', fontSize: '0.9rem' }}>
          {Object.keys(confidence).length > 0
            ? 'We extracted these values from your quote — review and correct anything before we score it.'
            : 'Enter your lease details below.'}
        </p>
      </div>

      {hasLowConfidence && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'var(--amber-light)', border: '1px solid rgba(154,90,0,0.2)',
          borderRadius: 'var(--r)', padding: '0.75rem 1rem',
          marginBottom: '1.5rem', fontSize: '0.875rem',
        }}>
          <span>⚠️</span>
          <span>
            <strong style={{ color: 'var(--amber)' }}>Low confidence on some fields.</strong>{' '}
            Fields marked with a yellow badge may have been misread — please review carefully.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {FIELD_DEFS.map(def => {
            const conf = confidence[def.key]
            const isLow = conf === 'low'
            return (
              <div key={def.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-2)', letterSpacing: '0.02em' }}>
                  {def.label}
                  {def.required && <span style={{ color: 'var(--accent)' }}> *</span>}
                  {isLow && (
                    <span style={{
                      display: 'inline-block', fontSize: '0.7rem', fontWeight: 600,
                      background: 'var(--amber-light)', color: 'var(--amber)',
                      padding: '0.1rem 0.4rem', borderRadius: 4, marginLeft: '0.4rem',
                    }}>
                      CHECK
                    </span>
                  )}
                </label>
                <input
                  className={`field-input${isLow ? ' flagged' : ''}`}
                  type={def.type === 'text' ? 'text' : 'number'}
                  step={def.type === 'mf' ? '0.00001' : def.type === 'number' ? '0.01' : undefined}
                  value={values[def.key] !== null && values[def.key] !== undefined ? String(values[def.key]) : ''}
                  onChange={e => handleChange(def.key, e.target.value)}
                  placeholder={def.type === 'mf' ? 'e.g. 0.00180' : ''}
                />
              </div>
            )
          })}
        </div>

        {/* Contribute toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', background: 'var(--blue-light)',
          borderRadius: 'var(--r)', marginBottom: '1.5rem',
          border: '1px solid rgba(26,74,138,0.12)',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
              Contribute anonymously to improve benchmarks
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }}>
              Confirmed numbers (no personal info) help other shoppers
            </div>
          </div>
          <button
            type="button"
            onClick={() => setContribute(c => !c)}
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: contribute ? 'var(--accent)' : 'var(--paper-3)',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.2s', flexShrink: 0,
            }}
            aria-checked={contribute}
            role="switch"
          >
            <span style={{
              position: 'absolute', top: 3,
              left: contribute ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%',
              background: 'white', transition: 'left 0.2s',
            }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" className="btn btn-ghost" onClick={onBack}>← Back</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            Analyze this quote →
          </button>
        </div>
      </form>
    </div>
  )
}
