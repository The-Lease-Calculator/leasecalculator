'use client'

import { useRef } from 'react'
import { AppScreen } from '../types/lease'

interface Props {
  onFileSelected: (file: File) => void
  onManualEntry: () => void
  setScreen: (s: AppScreen) => void
}

export default function HomeScreen({ onFileSelected, onManualEntry }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) onFileSelected(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) onFileSelected(f)
  }

  return (
    <>
      {/* Hero */}
      <div style={{
        maxWidth: 720, margin: '0 auto',
        padding: '5rem 2rem 3rem',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--accent-light)', color: 'var(--accent)',
          fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.06em',
          textTransform: 'uppercase', padding: '0.3rem 0.8rem',
          borderRadius: 100, marginBottom: '1.5rem',
        }}>
          <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} />
          Free lease analysis · Beta
        </div>

        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          marginBottom: '1.2rem',
        }}>
          Is your lease quote<br />
          <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>actually</em> a good deal?
        </h1>

        <p style={{
          fontSize: '1.1rem', color: 'var(--ink-2)',
          maxWidth: 520, margin: '0 auto 2.5rem',
          fontWeight: 300, lineHeight: 1.7,
        }}>
          Upload your quote, confirm the numbers, get an instant verdict — with real
          benchmark data and negotiation scripts.
        </p>

        {/* Upload zone */}
        <div
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)' }}
          onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--paper-3)' }}
          onDrop={handleDrop}
          style={{
            border: '2px dashed var(--paper-3)',
            borderRadius: 16, background: 'var(--paper-2)',
            padding: '3rem 2rem', cursor: 'pointer',
            marginBottom: '1.2rem', position: 'relative',
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
          />
          <div style={{
            width: 52, height: 52, margin: '0 auto 1rem',
            background: 'white', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow)', fontSize: '1.5rem',
          }}>
            📄
          </div>
          <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.3rem' }}>
            Drop your lease quote here
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>
            Supports PDF, JPG, PNG up to 10MB ·{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Click to browse</span>
          </div>
        </div>

        <div className="divider">or enter manually</div>

        <button
          className="btn btn-outline"
          style={{ width: '100%', marginBottom: '2rem' }}
          onClick={onManualEntry}
        >
          Enter lease details manually →
        </button>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{
          fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '2rem',
        }}>
          How it works
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            {
              n: '1',
              title: 'Upload your quote',
              desc: 'PDF, photo, or manual entry. We extract the numbers using AI.',
            },
            {
              n: '2',
              title: 'Confirm the values',
              desc: 'Review the extracted data. Edit anything that looks off before we score.',
            },
            {
              n: '3',
              title: 'Get your verdict',
              desc: 'Instant score, red flags, and negotiation talking points.',
            },
          ].map(step => (
            <div key={step.n} style={{
              background: 'white', borderRadius: 'var(--r)',
              border: '1px solid var(--border)', padding: '1.5rem',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent)', color: 'white',
                fontSize: '0.8rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.9rem',
              }}>
                {step.n}
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.4rem' }}>{step.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-3)', lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data notice */}
      <div style={{
        maxWidth: 720, margin: '0 auto', padding: '0 2rem 4rem',
        fontSize: '0.82rem', color: 'var(--ink-3)', textAlign: 'center',
      }}>
        No account required. We do not store personally identifiable information.
        Reports are accessible via a private link for 90 days.
      </div>
    </>
  )
}
