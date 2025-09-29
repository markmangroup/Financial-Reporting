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
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="text-sm font-medium text-gray-500 mb-2">CURRENT BALANCE</div>
              <div className="text-5xl font-bold text-gray-900 mb-4">
                ${(checkingData.summary.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">
                As of {checkingData.summary.dateRange.end}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500">TOTAL INCOME</div>
                <div className="text-2xl font-bold text-green-600 mt-2">
                  ${checkingData.summary.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500">TOTAL EXPENSES</div>
                <div className="text-2xl font-bold text-red-600 mt-2">
                  ${checkingData.summary.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500">NET FLOW</div>
                <div className={`text-2xl font-bold mt-2 ${
                  checkingData.summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${checkingData.summary.netAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Transaction Categories</h3>
              <div className="grid grid-cols-2 gap-4">
                {checkingData.categories.slice(0, 10).map((category, index) => (
                  <div key={category.category} className="flex justify-between items-center py-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: `hsl(${(index * 45) % 360}, 65%, 55%)` }}
                      />
                      <span className="text-sm font-medium">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        ${category.amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Month</th>
                      <th className="text-right py-2">Income</th>
                      <th className="text-right py-2">Expenses</th>
                      <th className="text-right py-2">Net Flow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkingData.monthlyData.slice(-12).map(month => (
                      <tr key={month.month} className="border-b border-gray-100">
                        <td className="py-2 font-medium">
                          {new Date(month.month + '-01').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })}
                        </td>
                        <td className="py-2 text-right text-green-600 font-medium">
                          ${month.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </td>
                        <td className="py-2 text-right text-red-600 font-medium">
                          ${month.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </td>
                        <td className={`py-2 text-right font-semibold ${
                          month.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${month.netFlow.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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