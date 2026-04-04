import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeaseIQ — Is Your Lease Quote Actually a Good Deal?',
  description:
    'Upload your car lease quote and get an instant score, red flags, and negotiation talking points backed by real benchmark data.',
  metadataBase: new URL('https://leasecalculator.com'),
  openGraph: {
    title: 'LeaseIQ — Lease Quote Analyzer',
    description: 'Find out if your lease quote is a good deal in seconds.',
    url: 'https://leasecalculator.com',
    siteName: 'LeaseIQ',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
