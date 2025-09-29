'use client'

import { useState } from 'react'
import Navigation from '@/components/layout/Navigation'
import OperatingDashboard from '@/components/operating/OperatingDashboard'
import BTCDashboard from '@/components/currencies/BTCDashboard'
import { parseChaseCheckingCSV, parseChaseCreditCSV } from '@/lib/csvParser'
import { ParsedCSVData } from '@/types'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'operating' | 'currencies'>('operating')
  const [checkingData, setCheckingData] = useState<ParsedCSVData | null>(null)
  const [creditData, setCreditData] = useState<ParsedCSVData | null>(null)
  const [rawCheckingCSV, setRawCheckingCSV] = useState<string>('')
  const [rawCreditCSV, setRawCreditCSV] = useState<string>('')
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const handleFileUpload = (file: File, content: string, filename: string) => {
    setUploadStatus(`Processing ${filename}...`)

    try {
      // Detect file type based on content structure
      if (content.includes('Card,Transaction Date,Post Date,Description,Category,Type,Amount')) {
        // Credit card CSV
        const parsed = parseChaseCreditCSV(content)
        setCreditData(parsed)
        setRawCreditCSV(content)
        setUploadStatus(`✅ Credit card data loaded: ${parsed.transactions.length} transactions`)
      } else if (content.includes('Details,Posting Date,Description,Amount,Type,Balance')) {
        // Checking account CSV
        const parsed = parseChaseCheckingCSV(content)
        setCheckingData(parsed)
        setRawCheckingCSV(content)
        setUploadStatus(`✅ Checking account data loaded: ${parsed.transactions.length} transactions`)
      } else {
        setUploadStatus(`❌ Unrecognized CSV format in ${filename}`)
      }
    } catch (error) {
      console.error('Error parsing CSV:', error)
      setUploadStatus(`❌ Error parsing ${filename}`)
    }
  }

  const resetData = () => {
    setCheckingData(null)
    setCreditData(null)
    setRawCheckingCSV('')
    setRawCreditCSV('')
    setUploadStatus('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'operating' ? (
        <OperatingDashboard
          checkingData={checkingData}
          creditData={creditData}
          uploadStatus={uploadStatus}
          onFileUpload={handleFileUpload}
          onResetData={resetData}
        />
      ) : (
        <div className="p-6">
          <BTCDashboard />
        </div>
      )}
    </div>
  )
}