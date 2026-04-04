'use client'

import { useState } from 'react'
import { AnalysisResult, LeaseFields, VerdictBand } from '../types/lease'

interface Props {
  result: AnalysisResult
  fields: LeaseFields
  onReset: () => void
}

const VERDICT_COLORS: Record<VerdictBand, string> = {
  great: '#6ee7a0',
  fair: '#93c5fd',
  negotiate: '#fcd34d',
  walkaway: '#fca5a5',
}

const BAR_COLORS = {
  green: 'var(--green)',
  amber: 'var(--amber)',
  red: 'var(--red)',
}

// Score ring: circumference of r=46 circle ≈ 289px
const CIRCUMFERENCE = 289

export default function ReportScreen({ result, fields, onReset }: Props) {
  const [contributed, setContributed] = useState(false)
  const [copied, setCopied] = useState(false)

  const offset = CIRCUMFERENCE - (result.score / 100) * CIRCUMFERENCE

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 2rem' }}>

      {/* Score card */}
      <div style={{
        background: 'var(--ink)', borderRadius: 16,
        padding: '2rem', marginBottom: '1.5rem',
        display: 'flex', gap: '2rem', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <button
          onClick={copyLink}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.7)',
            borderRadius: 6, padding: '0.3rem 0.7rem',
            fontSize: '0.8rem', cursor: 'pointer',
          }}
        >
          {copied ? '✓ Copied' : '⎘ Share report'}
        </button>

        {/* Score ring */}
        <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
          <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
            <circle
              cx="55" cy="55" r="46" fill="none"
              stroke="var(--accent)" strokeWidth="10"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
              {result.score}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>/100</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '1.1rem', fontWeight: 700,
            color: VERDICT_COLORS[result.verdict],
            marginBottom: '0.4rem',
          }}>
            {result.verdictLabel}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            {result.scoreSub}
          </div>
          {result.partialScore && (
            <div style={{
              marginTop: '0.75rem', fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.4)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '0.5rem',
            }}>
              ⚠ Partial score — ~no benchmark found for this model. Scored fees &amp; price only.
            </div>
          )}
        </div>
      </div>

      {/* Score breakdown */}
      <div style={{
        background: 'white', borderRadius: 'var(--r(',
        border: '1px solid var(--border)',
        padding: '1.5rem', marginBottom: '1.5rem',
      }}>
        <h3 style={{ fontWeight: 600, marginBottom: '1.2rem' }}>Score breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {result.components.map(comp => (
            <div key={comp.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ width: 120, fontSize: '0.875rem', color: 'var(--ink-2)', flexShrink: 0 }}>
                {comp.label}
              </span>
              <div style={{
                flex: 1, height: 8, background: 'var(--paper-3)', borderRadius: 100, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 100,
                  background: BAR_COLORS[comp.barColor],
                  // Cap bar width at 100% visually even if earned > max (shouldn't happen post-fix)
                  width: `${Math.min(100, (comp.earned / comp.max) * 100)}%`,
                }} />
              </div>
              <span style={{
                fontSize: '0.875rem', fontWeight: 600, width: 50, textAlign: 'right', flexShrink: 0,
                color: BAR_COLORS[comp.barColor],
              }}>
                {comp.earned}/{comp.max}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ad unit */}
      <div className="ad-unit">
        <span>Advertisement</span>
        {/* Replace with actual AdSense tag after approval */}
        {/* <ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" /> */}
        AdSense 728Ô90 — add unit after site is approved
      </div>

      {/* Red flags */}
      {result.redFlags.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '0.75rem' }}>
            🚩 Red flags
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.redFlags.map((flag, i) => (
              <div key={i} style={{
                display: 'flex', gap: '0.75rem',
                background: 'var(--red-light)', border: '1px solid rgba(160,21,21,0.12)',
                borderRadius: 'var(--r)', padding: '1rem',
              }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{flag.icon}</span>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                  <strong>{flag.headline}</strong>{' '}
                  {flag.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '0.75rem' }}>
            💡 Negotiation talking points
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.recommendations.map((rec, i) => (
              <div key={i} style={{
                display: 'flex', gap: '0.75rem',
                background: rec.type === 'positive' ? 'var(--green-light)' : 'white',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)', padding: '1rem',
              }}>
                <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '0.1rem' }}>
                  {rec.type === 'positive' ? '✓' : '→'}
                </span>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                  <strong>{rec.headline}</strong>
                  {rec.script && (
                    <span style={{ display: 'block', marginTop: '0.35rem', fontStyle: 'italic', color: 'var(--ink-2)' }}>
                      "{rec.script}"
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contribute prompt */}
      {fields.contributeData && !contributed && (
        <div style={{
          background: 'var(--blue-light)', border: '1px solid rgba(26,74,138,0.15)',
          borderRadius: 'var(--r(', padding: '1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1rem', marginBottom: '1.5rem',
        }}>
          <p style={{ fontSize: '0.875rem' }}>
            <strong>Help other {fields.make} shoppers.</strong> Your confirmed numbers will be
            contributed anonymously to improve our benchmark data.
          </p>
          <button
            onClick={() => setContributed(true)}
            style={{
              background: 'var(--blue)', color: 'white',
              border: 'none', borderRadius: 6,
              padding: '0.5rem 1.1rem', fontWeight: 600,
              fontSize: '0.875rem', cursor: 'pointer', flexShrink: 0,
            }}
          >
            Confirm &amp; contribute
          </button>
        </div>
      )}

      {contributed && (
        <div style={{
          background: 'var(--green-light)', borderRadius: 'var(--r)',
          padding: '1rem', marginBottom: '1.5rem',
          fontSize: '0.875rem', color: 'var(--green)',
        }}>
          ✓ Contributed — thank you! Your data will help future shoppers.
        </div>
      )}

      {/* Referral card */}
      <div style={{
        background: 'var(--paper-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--r(', padding: '1.25rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: '1rem', marginBottom: '1.5rem',
      }}>
        <div>
          <div style={{
            display: 'inline-block', fontSize: '0.7rem', fontWeight: 600,
            background: 'var(--paper-3)', color: 'var(--ink-3)',
            padding: '0.1rem 0.5rem', borderRadius: 4, marginBottom: '0.5rem',
          }}>
            Sponsored
          </div>
          <h4 style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Get a competing quote in minutes</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>
            See if another {fields.make} dealer in your area can beat these numbers. No obligation.
          </p>
        </div>
        <button style={{
          background: 'var(--accent)', color: 'white',
          border: 'none', borderRadius: 8, padding: '0.65rem 1.25rem',
          fontWeight: 600, cursor: 'pointer', flexShrink: 0,
        }}>
          Get quote →
        </button>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        This analysis is for informational purposes only and does not constitute financial or
        legal advice. Lease terms vary by region, dealer, and credit tier. Money factor
        benchmarks are sourced from Edmunds forums and dealer bulletins — they represent
        typical buy rates and may not reflect your specific market or credit tier. Dealers
        set their own MF markups and are under no legal obligation to lease at the buy rate,
        though many will if you demonstrate awareness of published rates. Always verify
        numbers with your dealer before signing.
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button className="btn btn-ghost" onClick={onReset}>← Analyze another quote</button>
      </div>
    </div>
  )
}
