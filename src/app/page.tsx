'use client'

import { useState } from 'react'
import FileUpload from '@/components/ui/FileUpload'
import FinancialCharts from '@/components/charts/FinancialCharts'
import { parseChaseCheckingCSV, parseChaseCreditCSV } from '@/lib/csvParser'
import { ParsedCSVData } from '@/types'

export default function HomePage() {
  const [checkingData, setCheckingData] = useState<ParsedCSVData | null>(null)
  const [creditData, setCreditData] = useState<ParsedCSVData | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const handleFileUpload = (file: File, content: string, filename: string) => {
    setUploadStatus(`Processing ${filename}...`)

    try {
      // Detect file type based on content structure
      if (content.includes('Card,Transaction Date,Post Date,Description,Category,Type,Amount')) {
        // Credit card CSV
        const parsed = parseChaseCreditCSV(content)
        setCreditData(parsed)
        setUploadStatus(`✅ Credit card data loaded: ${parsed.transactions.length} transactions`)
      } else if (content.includes('Details,Posting Date,Description,Amount,Type,Balance')) {
        // Checking account CSV
        const parsed = parseChaseCheckingCSV(content)
        setCheckingData(parsed)
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
    setUploadStatus('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Markman Group Financial Reporting
          </h1>
          <p className="text-xl text-gray-600">
            CFO-level financial analysis and reporting dashboard
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <FileUpload
                onFileUpload={handleFileUpload}
                label="Chase Checking Account CSV"
              />
              <FileUpload
                onFileUpload={handleFileUpload}
                label="Chase Credit Card CSV"
              />
            </div>

            {/* Upload Status */}
            {uploadStatus && (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">{uploadStatus}</p>
                {(checkingData || creditData) && (
                  <button
                    onClick={resetData}
                    className="text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Reset Data
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Financial Analysis */}
        <FinancialCharts
          checkingData={checkingData}
          creditData={creditData}
        />

        {/* Instructions */}
        {!checkingData && !creditData && (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Getting Started
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Upload your Chase bank CSV files to generate comprehensive financial analysis:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• <strong>Checking Account:</strong> Business transactions, client payments, expenses</li>
                  <li>• <strong>Credit Card:</strong> Categorized spending analysis and trends</li>
                </ul>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-6">
                  <h3 className="font-medium text-blue-900 mb-2">Reports Include:</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Monthly cash flow analysis</li>
                    <li>• Category breakdowns and spending patterns</li>
                    <li>• Client payment tracking</li>
                    <li>• Consultant and vendor analysis</li>
                    <li>• Executive-level financial summaries</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}