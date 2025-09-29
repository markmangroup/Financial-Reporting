'use client'

import { ParsedCSVData } from '@/types'
import FileUpload from '@/components/ui/FileUpload'

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
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 min-h-screen">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Operating Dashboard
        </h2>

        {/* Upload Section */}
        <div className="space-y-4 mb-6">
          <div className="text-sm font-medium text-gray-700">Data Upload</div>
          <FileUpload
            onFileUpload={onFileUpload}
            label="Checking CSV"
          />
          <FileUpload
            onFileUpload={onFileUpload}
            label="Credit CSV"
          />

          {uploadStatus && (
            <div className="text-xs text-gray-600 mt-2">
              {uploadStatus}
              {(checkingData || creditData) && (
                <button
                  onClick={onResetData}
                  className="block text-red-600 hover:text-red-700 underline mt-1"
                >
                  Reset Data
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {checkingData && (
          <div className="space-y-4 border-t pt-4">
            <div className="text-sm font-medium text-gray-700">Account Info</div>
            <div className="text-xs space-y-2">
              <div>
                <div className="text-gray-500">Account</div>
                <div className="font-medium">Chase 5939</div>
              </div>
              <div>
                <div className="text-gray-500">Date Range</div>
                <div className="font-medium">
                  {checkingData.summary.dateRange.start} to<br/>
                  {checkingData.summary.dateRange.end}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Transactions</div>
                <div className="font-medium">{checkingData.summary.totalTransactions}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {checkingData ? (
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
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded border border-gray-200 p-4 text-center">
                <div className="text-xs font-medium text-gray-500">TOTAL INCOME</div>
                <div className="text-xl font-bold text-green-600 mt-1">
                  ${(checkingData.summary.totalCredits / 1000).toFixed(0)}K
                </div>
              </div>
              <div className="bg-white rounded border border-gray-200 p-4 text-center">
                <div className="text-xs font-medium text-gray-500">TOTAL EXPENSES</div>
                <div className="text-xl font-bold text-red-600 mt-1">
                  ${(checkingData.summary.totalDebits / 1000).toFixed(0)}K
                </div>
              </div>
              <div className="bg-white rounded border border-gray-200 p-4 text-center">
                <div className="text-xs font-medium text-gray-500">NET FLOW</div>
                <div className={`text-xl font-bold mt-1 ${
                  checkingData.summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${(checkingData.summary.netAmount / 1000).toFixed(0)}K
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

              {/* Consultant Payments Visual */}
              <div className="col-span-6 bg-white rounded border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">International Consultants</h3>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  {checkingData.categories
                    .filter(c => c.category.includes('Consultant -'))
                    .slice(0, 4)
                    .map((consultant, idx) => (
                      <div key={consultant.category} className="flex justify-between items-center">
                        <div className="text-xs text-gray-600">
                          {consultant.category.replace('Consultant - ', '')}
                        </div>
                        <div className="text-sm font-semibold text-blue-600">
                          ${(consultant.amount / 1000).toFixed(1)}K
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* CFO Insights - Consultants */}
              <div className="col-span-6 bg-blue-50 border border-blue-200 rounded p-4">
                <div className="text-xs font-semibold text-blue-800 mb-2">🌍 GLOBAL TEAM INSIGHTS</div>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Multi-country consultant network</li>
                  <li>• Wire transfer costs: Monitor fees</li>
                  <li>• Currency exposure: Consider hedging</li>
                  <li>• Tax implications: Multiple jurisdictions</li>
                </ul>
              </div>

              {/* Monthly Trends Visual */}
              <div className="col-span-6 bg-white rounded border border-gray-200 p-4">
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
                      <div className={`text-sm font-semibold ${
                        month.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {month.netFlow >= 0 ? '+' : ''}{(month.netFlow / 1000).toFixed(0)}K
                      </div>
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${month.netFlow >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(Math.abs(month.netFlow) / Math.max(...checkingData.monthlyData.map(m => Math.abs(m.netFlow))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CFO Insights - Cash Flow */}
              <div className="col-span-6 bg-purple-50 border border-purple-200 rounded p-4">
                <div className="text-xs font-semibold text-purple-800 mb-2">📊 CASH FLOW INSIGHTS</div>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>• Positive trend: Strong business fundamentals</li>
                  <li>• Seasonal patterns: Plan for fluctuations</li>
                  <li>• Working capital: Maintain 3-month buffer</li>
                  <li>• Growth opportunities: Excess cash deployment</li>
                </ul>
              </div>

              {/* Business Services Visual */}
              <div className="col-span-6 bg-white rounded border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">Business Operations</h3>
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  {checkingData.categories
                    .filter(c => c.category.includes('Credit Card Autopay') || c.category.includes('Auto Loan') || c.category.includes('Monthly Bank'))
                    .slice(0, 3)
                    .map((service, idx) => (
                      <div key={service.category} className="flex justify-between items-center">
                        <div className="text-xs text-gray-600">
                          {service.category.replace('Payment', '').replace('Monthly Bank ', 'Bank ')}
                        </div>
                        <div className="text-sm font-semibold text-orange-600">
                          ${(service.amount / 1000).toFixed(1)}K
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* CFO Insights - Operations */}
              <div className="col-span-6 bg-orange-50 border border-orange-200 rounded p-4">
                <div className="text-xs font-semibold text-orange-800 mb-2">⚡ OPERATIONAL INSIGHTS</div>
                <ul className="text-xs text-orange-700 space-y-1">
                  <li>• Automated payments: Good cash management</li>
                  <li>• Fixed costs predictable: Easy budgeting</li>
                  <li>• Credit utilization: Monitor for optimization</li>
                  <li>• Service fees: Consider negotiation</li>
                </ul>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-4">Upload your Chase checking account CSV to view operating dashboard</div>
          </div>
        )}
      </div>
    </div>
  )
}