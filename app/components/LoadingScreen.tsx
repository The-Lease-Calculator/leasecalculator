'use client'

import { useEffect, useState } from 'react'

const STEPS = [
  { id: 'step1', label: 'Reading your lease document…' },
  { id: 'step2', label: 'Extracting key figures…' },
  { id: 'step3', label: 'Matching to benchmark database…' },
  { id: 'step4', label: 'Generating your report…' },
]

export default function LoadingScreen() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(s => Math.min(s + 1, STEPS.length - 1))
    }, 700)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto',
      padding: '6rem 2rem', textAlign: 'center',
    }}>
      {/* Spinner */}
      <div style={{
        width: 56, height: 56, margin: '0 auto 2rem',
        borderRadius: '50%',
        border: '3px solid var(--paper-3)',
        borderTop: '3px solid var(--accent)',
        animation: 'spin 0.8s linear infinite',
      }} />

      <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        Analyzing your quote
      </h2>
      <p style={{ color: 'var(--ink-3)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Usually takes under 10 seconds
      </p>

      <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {STEPS.map((step, i) => {
          const done = i < activeStep
          const active = i === activeStep
          return (
            <div key={step.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              fontSize: '0.9rem',
              color: done ? 'var(--green)' : active ? 'var(--ink)' : 'var(--ink-3)',
              fontWeight: active ? 500 : 400,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--paper-3)',
                animation: active ? 'pulse 1s ease-in-out infinite' : 'none',
              }} />
              {step.label}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}
