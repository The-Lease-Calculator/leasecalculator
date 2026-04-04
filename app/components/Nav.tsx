'use client'

import Link from 'next/link'

export default function Nav() {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: 60,
      borderBottom: '1px solid var(--border)',
      background: 'var(--paper)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link href="/" style={{
        fontFamily: 'var(--serif)', fontSize: '1.4rem',
        color: 'var(--ink)', textDecoration: 'none', letterSpacing: '-0.02em',
      }}>
        Lease<span style={{ color: 'var(--accent)' }}>IQ</span>
      </Link>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link href="/how-it-works" style={{
          color: 'var(--ink-2)', textDecoration: 'none',
          fontSize: '0.9rem', fontWeight: 500,
        }}>
          How it works
        </Link>
        <Link href="/about" style={{
          color: 'var(--ink-2)', textDecoration: 'none',
          fontSize: '0.9rem', fontWeight: 500,
        }}>
          About
        </Link>
        <Link href="/" style={{
          background: 'var(--accent)', color: 'white',
          padding: '0.45rem 1.1rem', borderRadius: 6,
          fontWeight: 600, fontSize: '0.9rem',
          textDecoration: 'none',
        }}>
          Analyze quote
        </Link>
      </div>
    </nav>
  )
}
