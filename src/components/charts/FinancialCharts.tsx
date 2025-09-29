'use client'

import { ParsedCSVData } from '@/types'

interface FinancialChartsProps {
  checkingData?: ParsedCSVData | null
  creditData?: ParsedCSVData | null
}

export default function FinancialCharts({ checkingData, creditData }: FinancialChartsProps) {
  if (!checkingData && !creditData) {
    return (
      <div className="text-center text-gray-500 py-8">
        Upload CSV files to see financial analysis
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Account Summaries */}
      <div className="grid md:grid-cols-2 gap-6">
        {checkingData && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Business Checking (Chase 5939)</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Transactions:</span>
                <span className="font-medium">{checkingData.summary.totalTransactions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Credits:</span>
                <span className="font-medium text-green-600">
                  ${checkingData.summary.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Debits:</span>
                <span className="font-medium text-red-600">
                  ${checkingData.summary.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-900 font-medium">Net Flow:</span>
                <span className={`font-semibold ${checkingData.summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${checkingData.summary.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {checkingData.summary.balance && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Balance:</span>
                  <span className="font-medium">
                    ${checkingData.summary.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {creditData && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Business Credit Card (Chase 8008)</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Transactions:</span>
                <span className="font-medium">{creditData.summary.totalTransactions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Spending:</span>
                <span className="font-medium text-red-600">
                  ${creditData.summary.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Payments:</span>
                <span className="font-medium text-green-600">
                  ${creditData.summary.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-900 font-medium">Net Amount:</span>
                <span className={`font-semibold ${creditData.summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(creditData.summary.netAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {checkingData && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Checking Account Categories</h3>
          <div className="space-y-4">
            {checkingData.categories.slice(0, 8).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: `hsl(${(index * 45) % 360}, 65%, 55%)`
                    }}
                  />
                  <span className="font-medium">{category.category}</span>
                  <span className="text-sm text-gray-500">({category.count} transactions)</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${category.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {category.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {creditData && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Credit Card Spending by Category</h3>
          <div className="space-y-4">
            {creditData.categories.slice(0, 10).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: `hsl(${(index * 36) % 360}, 70%, 60%)`
                    }}
                  />
                  <span className="font-medium">{category.category}</span>
                  <span className="text-sm text-gray-500">({category.count} transactions)</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${category.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {category.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      {(checkingData || creditData) && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Monthly Cash Flow Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Month</th>
                  {checkingData && <th className="text-right py-3 px-4">Checking Net</th>}
                  {creditData && <th className="text-right py-3 px-4">Credit Spending</th>}
                  <th className="text-right py-3 px-4">Combined Flow</th>
                </tr>
              </thead>
              <tbody>
                {(checkingData?.monthlyData || creditData?.monthlyData || []).slice(-12).map(month => {
                  const checkingMonth = checkingData?.monthlyData.find(m => m.month === month.month)
                  const creditMonth = creditData?.monthlyData.find(m => m.month === month.month)
                  const combinedFlow = (checkingMonth?.netFlow || 0) + (creditMonth?.netFlow || 0)

                  return (
                    <tr key={month.month} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">
                        {new Date(month.month + '-01').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short'
                        })}
                      </td>
                      {checkingData && (
                        <td className={`py-3 px-4 text-right font-medium ${
                          (checkingMonth?.netFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${(checkingMonth?.netFlow || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </td>
                      )}
                      {creditData && (
                        <td className="py-3 px-4 text-right font-medium text-red-600">
                          -${(creditMonth?.totalDebits || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </td>
                      )}
                      <td className={`py-3 px-4 text-right font-semibold ${
                        combinedFlow >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${combinedFlow.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}