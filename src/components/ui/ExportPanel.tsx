'use client'

import { ParsedCSVData } from '@/types'
import { exportToCSV, exportToPDF, exportDashboardAsImage, ExportData } from '@/lib/exportUtils'
import { useState } from 'react'

interface ExportPanelProps {
  checkingData?: ParsedCSVData | null
  creditData?: ParsedCSVData | null
  dashboardElementId?: string
}

export default function ExportPanel({ checkingData, creditData, dashboardElementId = 'dashboard-content' }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'csv' | 'pdf' | 'image'>('csv')

  const handleExport = async () => {
    if (!checkingData && !creditData) {
      alert('No data available to export')
      return
    }

    setIsExporting(true)

    try {
      const exportData: ExportData = {
        checkingData,
        creditData,
        companyName: 'Markman Group',
        reportDate: new Date().toLocaleDateString()
      }

      switch (exportType) {
        case 'csv':
          exportToCSV(exportData)
          break
        case 'pdf':
          exportToPDF(exportData)
          break
        case 'image':
          await exportDashboardAsImage(dashboardElementId, `markman-dashboard-${new Date().toISOString().split('T')[0]}.png`)
          break
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Error generating export. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Export Reports</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Ready to export</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Export Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setExportType('csv')}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                exportType === 'csv'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              📊 CSV Data
            </button>
            <button
              onClick={() => setExportType('pdf')}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                exportType === 'pdf'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              📄 PDF Report
            </button>
            <button
              onClick={() => setExportType('image')}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                exportType === 'image'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              🖼️ Screenshot
            </button>
          </div>
        </div>

        {/* Export Description */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-700">
            {exportType === 'csv' && (
              <div>
                <div className="font-medium mb-1">CSV Export includes:</div>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• All transaction data with categories</li>
                  <li>• Financial summary totals</li>
                  <li>• Account comparison data</li>
                  <li>• Ready for Excel/Google Sheets</li>
                </ul>
              </div>
            )}
            {exportType === 'pdf' && (
              <div>
                <div className="font-medium mb-1">PDF Report includes:</div>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• Executive summary with key metrics</li>
                  <li>• Category breakdown analysis</li>
                  <li>• Monthly cash flow trends</li>
                  <li>• Professional formatting for presentations</li>
                </ul>
              </div>
            )}
            {exportType === 'image' && (
              <div>
                <div className="font-medium mb-1">Screenshot includes:</div>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• Complete dashboard visual</li>
                  <li>• All charts and metrics</li>
                  <li>• High-resolution PNG format</li>
                  <li>• Perfect for presentations</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting || (!checkingData && !creditData)}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
            isExporting || (!checkingData && !creditData)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isExporting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating {exportType.toUpperCase()}...</span>
            </div>
          ) : (
            `Export ${exportType.toUpperCase()} Report`
          )}
        </button>

        {/* Data Summary */}
        {(checkingData || creditData) && (
          <div className="text-xs text-gray-500 border-t pt-3">
            <div className="flex justify-between">
              <span>Data available:</span>
              <span>
                {checkingData && `Checking: ${checkingData.summary.totalTransactions} transactions`}
                {checkingData && creditData && ' | '}
                {creditData && `Credit: ${creditData.summary.totalTransactions} transactions`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}