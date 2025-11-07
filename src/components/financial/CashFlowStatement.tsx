'use client'

import { ParsedCSVData } from '@/types'
import { calculateFinancialTotals } from '@/lib/financialCalculations'

interface CashFlowStatementProps {
  checkingData: ParsedCSVData | null
  creditData: ParsedCSVData | null
}

export default function CashFlowStatement({ checkingData, creditData }: CashFlowStatementProps) {
  if (!checkingData) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <div className="text-gray-400 text-lg mb-4">Upload your Chase checking account CSV to view Cash Flow Statement</div>
        </div>
      </div>
    )
  }

  // USE GOLDEN RECORD CALCULATIONS
  const financials = calculateFinancialTotals(checkingData)

  // Use consistent data sources from golden record
  const businessRevenue = financials.businessRevenue
  const totalExpenses = financials.totalBusinessExpenses
  const netIncome = financials.netIncome

  // Operating Activities (actual cash flows from operations)
  const operatingInflows = businessRevenue

  // Calculate all operating outflows (expenses)
  const operatingOutflows = totalExpenses

  const netCashFromOperating = operatingInflows - operatingOutflows

  // Investing Activities (typically none for service business, but could include equipment)
  const investingActivities = checkingData.categories
    .filter(c =>
      c.category.includes('Equipment') ||
      c.category.includes('Technology') ||
      c.category.includes('Investment')
    )
    .reduce((sum, c) => sum + c.amount, 0)

  // Financing Activities (owner contributions, withdrawals, loan payments)
  const ownerEquity = financials.ownerCapitalContributions // Net owner contributions
  const netCashFromFinancing = ownerEquity

  // Net Change in Cash
  const netChangeInCash = netCashFromOperating + investingActivities + netCashFromFinancing

  // Calculate beginning cash (current balance minus net change)
  const endingCash = financials.currentCashBalance
  const beginningCash = endingCash - netChangeInCash

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">MARKMAN GROUP</h1>
          <h2 className="text-xl font-semibold text-gray-700 mt-2">STATEMENT OF CASH FLOWS</h2>
          <div className="text-sm text-gray-500 mt-1">
            For the Period {checkingData.summary.dateRange.start} to {checkingData.summary.dateRange.end}
          </div>
        </div>

        <div className="space-y-8">
          {/* Operating Activities */}
          <div className="border-b border-gray-300 pb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">CASH FLOWS FROM OPERATING ACTIVITIES</h3>

            {/* Direct Method - showing actual cash receipts and payments */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 ml-4">Cash Receipts from Customers</h4>
              <div className="space-y-2 ml-8">
                {checkingData.categories
                  .filter(c => c.category.includes('Client Payment') || c.category.includes('Laurel') || c.category.includes('Metropolitan'))
                  .map(client => (
                    <div key={client.category} className="flex justify-between text-sm">
                      <span className="text-gray-700">{client.category.replace('Client Payment - ', '').replace('Laurel Management', 'Laurel Management').replace('Metropolitan Partners', 'Metropolitan Partners')}</span>
                      <span className="text-green-600">${client.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))
                }
              </div>
              <div className="flex justify-between ml-4 pt-2 border-t border-gray-200 font-medium">
                <span>Total Cash Receipts</span>
                <span className="text-green-600">${operatingInflows.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>

              <h4 className="font-semibold text-gray-800 ml-4 mt-4">Cash Payments for Operating Expenses</h4>
              <div className="space-y-1 ml-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Consultant Services</span>
                  <span className="text-red-600">
                    (${Math.abs(checkingData.categories
                      .filter(c => c.category.includes('Consultant'))
                      .reduce((sum, c) => sum + c.amount, 0))
                      .toLocaleString('en-US', { minimumFractionDigits: 2 })})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Credit Card Payments</span>
                  <span className="text-red-600">
                    (${Math.abs(checkingData.categories
                      .filter(c => c.category.includes('Credit Card Autopay'))
                      .reduce((sum, c) => sum + c.amount, 0))
                      .toLocaleString('en-US', { minimumFractionDigits: 2 })})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Development Services</span>
                  <span className="text-red-600">
                    (${Math.abs(checkingData.categories
                      .filter(c => c.category.includes('Development Services'))
                      .reduce((sum, c) => sum + c.amount, 0))
                      .toLocaleString('en-US', { minimumFractionDigits: 2 })})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Other Operating Expenses</span>
                  <span className="text-red-600">
                    (${Math.abs(checkingData.categories
                      .filter(c =>
                        c.category.includes('Auto Loan') ||
                        c.category.includes('Monthly Bank') ||
                        c.category.includes('Business Service')
                      )
                      .reduce((sum, c) => sum + c.amount, 0))
                      .toLocaleString('en-US', { minimumFractionDigits: 2 })})
                  </span>
                </div>
              </div>
              <div className="flex justify-between ml-4 pt-2 border-t border-gray-200 font-medium">
                <span>Total Cash Payments</span>
                <span className="text-red-600">(${operatingOutflows.toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
              </div>

              <div className={`flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-400 ${
                netCashFromOperating >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>Net Cash Provided by Operating Activities</span>
                <span>${netCashFromOperating.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Investing Activities */}
          <div className="border-b border-gray-300 pb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">CASH FLOWS FROM INVESTING ACTIVITIES</h3>

            {investingActivities !== 0 ? (
              <div className="space-y-2 ml-4">
                <div className="flex justify-between">
                  <span className="text-gray-700">Investment/Equipment Purchases</span>
                  <span className={investingActivities >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${investingActivities.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="ml-4 text-gray-500 italic">No investing activities during this period</div>
            )}

            <div className={`flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-400 ${
              investingActivities >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>Net Cash Used in Investing Activities</span>
              <span>${investingActivities.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Financing Activities */}
          <div className="border-b border-gray-300 pb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">CASH FLOWS FROM FINANCING ACTIVITIES</h3>

            <div className="space-y-2 ml-4">
              <div className="flex justify-between">
                <span className="text-gray-700">Owner Capital Contributions</span>
                <span className="text-blue-600">${ownerEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className={`flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-400 ${
              netCashFromFinancing >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>Net Cash Provided by Financing Activities</span>
              <span>${netCashFromFinancing.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Net Change in Cash */}
          <div className="pt-4">
            <div className={`flex justify-between text-xl font-bold mb-4 ${
              netChangeInCash >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>NET INCREASE (DECREASE) IN CASH</span>
              <span>${netChangeInCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="space-y-2 text-lg">
              <div className="flex justify-between">
                <span className="text-gray-800">Cash at Beginning of Period</span>
                <span className="font-medium">${beginningCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-300 pt-2 font-bold">
                <span>Cash at End of Period</span>
                <span>${endingCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Flow Analysis */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <h4 className="font-semibold text-gray-800 mb-4">CASH FLOW ANALYSIS</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="font-medium text-green-800">Operating Cash Flow</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                ${(netCashFromOperating / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-green-700 mt-1">Core business strength</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="font-medium text-blue-800">Free Cash Flow</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                ${((netCashFromOperating + investingActivities) / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-blue-700 mt-1">Available for growth</div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="font-medium text-purple-800">Cash Conversion</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">
                {netIncome > 0 ? ((netCashFromOperating / netIncome) * 100).toFixed(0) + '%' : 'N/A'}
              </div>
              <div className="text-sm text-purple-700 mt-1">Earnings to cash</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}