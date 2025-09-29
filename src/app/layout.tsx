import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Markman Group Financial Reporting',
  description: 'CFO-level financial analysis and reporting dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}