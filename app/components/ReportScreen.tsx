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

      {/* What would improve this analysis */}
      {(() => {
        const missing: Array<{ label: string; tip: string }> = []
        if (fields.moneyFactor == null) missing.push({ label: "Money Factor", tip: "Ask the dealer: what is the money factor on this lease? Multiply by 2,400 to convert to an APR." })
        if (fields.residualPct == null) missing.push({ label: "Residual %", tip: "Ask: what is the residual value as a percentage of MSRP? Typically 40-60% depending on the vehicle." })
        if (fields.msrp == null) missing.push({ label: "MSRP", tip: "Find the sticker price on the window or at edmunds.com. Residual value is calculated from this figure." })
        if (fields.sellingPrice == null) missing.push({ label: "Selling Price / Cap Cost", tip: "Ask: what is the capitalized cost? This is the negotiated price before any deductions or fees." })
        if (fields.acquisitionFee == null) missing.push({ label: "Acquisition Fee", tip: "Ask: what is the acquisition fee? Usually $500-$1,000 charged by the bank and typically non-negotiable." })
        if (fields.dispositionFee == null) missing.push({ label: "Disposition Fee", tip: "Ask: is there a disposition fee at lease end? Usually $300-$400. May be waived if you re-lease." })
        if (fields.dueAtSigning == null) missing.push({ label: "Due at Signing", tip: "Request a full breakdown: first-month payment, acquisition fee, taxes, and any cap cost reduction." })
        if (missing.length === 0) return null
        return (
          <div className="info-need-section" style={{ background: 'var(--paper-2)', border: '1px solid var(--border)', padding: '1.5rem', margin: '1.5rem 0' }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--ink)' }}>What would improve this analysis?</h3>
            <p style={{ color: 'var(--ink-2)', fontSize: '0.9rem', marginBottom: '1rem' }}>Add these details for a more precise score:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {missing.map(({ label, tip }) => (
                <div key={label} style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>{label}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--ink-2)' }}>{tip}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Dealer talking points */}
      {(() => {
        const scripts: Array<{ heading: string; body: string }> = []
        if (result.verdict === 'great') {
          scripts.push({ heading: "Confirm and lock it in", body: "I have done my research and this deal looks competitive. I am ready to move forward today. Can you confirm the money factor and residual have not changed and get the paperwork started?" })
          scripts.push({ heading: "Ask about additional incentives", body: "Before I sign — are there any loyalty, conquest, or manufacturer incentives I might qualify for? I want to make sure I am capturing everything available." })
        } else if (result.verdict === 'fair') {
          scripts.push({ heading: "Negotiate the selling price", body: "The monthly is close to what I am targeting, but I would like to see the cap cost come down. I have benchmarked similar deals. Can you get to [your target price]?" })
          scripts.push({ heading: "Check for money factor markup", body: "Can you show me the base buy rate from the bank? I want to confirm the money factor has not been marked up from what the lender offers." })
        } else if (result.verdict === 'negotiate') {
          scripts.push({ heading: "Push back on the payment", body: "This payment is higher than what I am targeting. To make this work today I need it lower. What levers do we have — selling price, money factor, or additional incentives?" })
          scripts.push({ heading: "Audit every fee", body: "Walk me through every fee in this deal. I want to know what is mandatory and what is optional, including any dealer add-ons. Let us get back to the core numbers." })
          scripts.push({ heading: "Leverage competing offers", body: "I have quotes from other dealers I am comparing right now. This is your chance to earn my business today. What is the absolute best payment you can offer?" })
        } else {
          scripts.push({ heading: "Walk away cleanly", body: "I appreciate your time, but the numbers do not work for me. I am going to continue my search. Please do not follow up — I will reach out if anything changes." })
          scripts.push({ heading: "State your terms clearly", body: "The only scenario where this works is [monthly target] per month with [amount] due at signing. If manufacturer incentives improve or you find new flexibility, feel free to reach out." })
        }
        return (
          <div className="dealer-script-section" style={{ background: 'var(--paper-2)', border: '1px solid var(--border)', padding: '1.5rem', margin: '1.5rem 0' }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--ink)' }}>How to talk to your dealer</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {scripts.map(({ heading, body }) => (
                <div key={heading} style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '0.5rem' }}>{heading}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--ink-2)', fontStyle: 'italic', lineHeight: 1.5 }}>{body}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

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
