'use client'

import { ParsedCSVData } from '@/types'

interface OperatingDashboardProps {
  checkingData: ParsedCSVData | null
  creditData: ParsedCSVData | null
  uploadStatus: string
  onFileUpload: (file: File, content: string, filename: string) => void
  onResetData: () => void
}

export default function OperatingDashboard({
  checkingData,
  creditData,
  uploadStatus,
  onFileUpload,
  onResetData
}: OperatingDashboardProps) {
  if (!checkingData) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <div className="text-gray-400 text-lg mb-4">
            Upload your Chase checking account CSV to view operating dashboard
          </div>
        </div>
      </div>
    )
  }

  const maxNetFlow = Math.max(...checkingData.monthlyData.map(m => Math.abs(m.netFlow)))

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Hero KPI - Current Balance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-sm font-medium text-gray-500 mb-2">CURRENT BALANCE</div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            ${(checkingData.summary.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-500">As of {checkingData.summary.dateRange.end}</div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-white rounded border border-gray-200 p-4 text-center">
            <div className="text-xs font-medium text-gray-500">BUSINESS REVENUE</div>
            <div className="text-xl font-bold text-green-600 mt-1">
              ${((checkingData.summary.businessRevenue || 0) / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="bg-white rounded border border-gray-200 p-4 text-center">
            <div className="text-xs font-medium text-gray-500">OWNER EQUITY</div>
            <div className="text-xl font-bold text-blue-600 mt-1">
              ${((checkingData.summary.ownerEquity || 0) / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="bg-white rounded border border-gray-200 p-4 text-center">
            <div className="text-xs font-medium text-gray-500">TOTAL EXPENSES</div>
            <div className="text-xl font-bold text-red-600 mt-1">
              ${(checkingData.summary.totalDebits / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="bg-white rounded border border-gray-200 p-4 text-center">
            <div className="text-xs font-medium text-gray-500">BUSINESS NET</div>
            <div className={`text-xl font-bold mt-1 ${checkingData.summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(checkingData.summary.netAmount / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="bg-white rounded border border-gray-200 p-4 text-center">
            <div className="text-xs font-medium text-gray-500">OTHER INCOME</div>
            <div className="text-xl font-bold text-purple-600 mt-1">
              ${((checkingData.summary.otherCredits || 0) / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="bg-white rounded border border-gray-200 p-4 text-center">
            <div className="text-xs font-medium text-gray-500">TRANSACTIONS</div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {checkingData.summary.totalTransactions}
            </div>
          </div>
        </div>

        {/* Visual Grid Layout */}
        <div className="grid grid-cols-12 gap-4">
          {/* Client Payments Visual */}
          <div className="col-span-6 bg-white rounded border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Client Payments</h3>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="space-y-2">
              {checkingData.categories
                .filter(c => c.category.includes('Client Payment'))
                .slice(0, 3)
                .map((client, idx) => (
                  <div key={client.category} className="flex justify-between items-center">
                    <div className="text-xs text-gray-600">{client.category.replace('Client Payment - ', '')}</div>
                    <div className="text-sm font-semibold text-green-600">
                      ${(client.amount / 1000).toFixed(0)}K
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* CFO Insights - Client Payments */}
          <div className="col-span-6 bg-green-50 border border-green-200 rounded p-4">
            <div className="text-xs font-semibold text-green-800 mb-2">💡 CLIENT REVENUE INSIGHTS</div>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Laurel Management: Primary revenue source</li>
              <li>• Metropolitan Partners: Secondary income stream</li>
              <li>• Payment consistency indicates strong client relationships</li>
              <li>• Consider diversification opportunities</li>
            </ul>
          </div>

          {/* Monthly Trends Visual */}
          <div className="col-span-12 bg-white rounded border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Monthly Cash Flow</h3>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            <div className="space-y-1">
              {checkingData.monthlyData.slice(-6).map((month, idx) => (
                <div key={month.month} className="flex justify-between items-center">
                  <div className="text-xs text-gray-600">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </div>
                  <div className={`text-sm font-semibold ${month.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {month.netFlow >= 0 ? '+' : ''}{(month.netFlow / 1000).toFixed(0)}K
                  </div>
                  <div className="w-12 bg-gray-200 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${month.netFlow >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: (Math.min(Math.abs(month.netFlow) / maxNetFlow * 100, 100)) + '%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}