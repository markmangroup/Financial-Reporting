'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/layout/Navigation'
import OperatingDashboard from '@/components/operating/OperatingDashboard'
import IncomeStatement from '@/components/financial/IncomeStatement'
import BalanceSheet from '@/components/financial/BalanceSheet'
import CashFlowStatement from '@/components/financial/CashFlowStatement'
import AnalyticsDashboard from '@/components/financial/AnalyticsDashboard'
import BTCDashboard from '@/components/currencies/BTCDashboard'
import InsightsInterface from '@/components/insights/InsightsInterface'
import ContractorCostsPage from '@/components/financial/ContractorCostsPage'
import ProjectsExplorer from '@/components/projects/ProjectsExplorer'
import { parseChaseCheckingCSV, parseChaseCreditCSV } from '@/lib/csvParser'
import { ParsedCSVData } from '@/types'
import { loadRealCheckingData, loadRealCreditData } from '@/lib/loadRealData'
import { loadCreditCardData } from '@/lib/creditCardDataLoader'
import { CreditCardData } from '@/lib/creditCardParser'
import type { ProjectMetadata } from '@/types/project'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'insights' | 'projects' | 'operating' | 'income-statement' | 'balance-sheet' | 'cash-flow' | 'analytics' | 'currencies'>('insights')
  const [projects, setProjects] = useState<ProjectMetadata[]>([])
  const [checkingData, setCheckingData] = useState<ParsedCSVData | null>(null)
  const [creditData, setCreditData] = useState<ParsedCSVData | null>(null)
  const [fullCreditCardData, setFullCreditCardData] = useState<CreditCardData | null>(null)
  const [rawCheckingCSV, setRawCheckingCSV] = useState<string>('')
  const [rawCreditCSV, setRawCreditCSV] = useState<string>('')
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true)

  // Auto-load the REAL data on component mount
  useEffect(() => {
    try {
      const realCheckingData = loadRealCheckingData()
      const realCreditData = loadRealCreditData()
      setCheckingData(realCheckingData)
      setCreditData(realCreditData)
      setUploadStatus('✅ Real Chase data loaded from codebase')
    } catch (error) {
      console.error('Error loading real data:', error)
      setUploadStatus('❌ Error loading real data')
    }

    // Load full credit card data with majorCategory fields
    loadCreditCardData().then(data => {
      setFullCreditCardData(data)
    })

    // Load project data from API
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(error => console.error('Error loading projects:', error))
  }, [])

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Collapsible Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-12' : 'w-80'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
        {/* Sidebar Toggle */}
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded"
          >
            {sidebarCollapsed ? '☰' : '✕'}
          </button>
        </div>

        {/* Sidebar Content */}
        {!sidebarCollapsed && (
          <div className="flex-1 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Data Management</h3>

            {/* Status */}
            <div className="mb-6">
              <div className="text-xs text-gray-600">
                {uploadStatus}
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Upload New Data</h4>
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        const content = event.target?.result as string
                        handleFileUpload(file, content, file.name)
                      }
                      reader.readAsText(file)
                    }
                  }}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                />
                <div className="text-xs text-gray-500">
                  Upload checking or credit card CSV
                </div>
              </div>

              {(checkingData || creditData) && (
                <button
                  onClick={resetData}
                  className="w-full text-xs text-red-600 hover:text-red-700 underline mt-2"
                >
                  Reset to Real Data
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Global Navigation */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'insights' && (
            <InsightsInterface
              checkingData={checkingData}
              creditData={creditData}
            />
          )}
          {activeTab === 'projects' && (
            <ProjectsExplorer projects={projects} />
          )}
          {activeTab === 'operating' && (
            <OperatingDashboard
              checkingData={checkingData}
              creditData={creditData}
              uploadStatus=""
              onFileUpload={handleFileUpload}
              onResetData={resetData}
            />
          )}
          {activeTab === 'income-statement' && (
            <IncomeStatement
              checkingData={checkingData}
              creditData={creditData}
              fullCreditCardData={fullCreditCardData}
            />
          )}
          {activeTab === 'balance-sheet' && (
            <BalanceSheet
              checkingData={checkingData}
              creditData={creditData}
            />
          )}
          {activeTab === 'cash-flow' && (
            <CashFlowStatement
              checkingData={checkingData}
              creditData={creditData}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              checkingData={checkingData}
              creditData={creditData}
            />
          )}
          {activeTab === 'currencies' && (
            <div className="p-6">
              <BTCDashboard />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}