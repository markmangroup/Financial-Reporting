'use client'

import { Consultant, ConsultantSummary } from '@/lib/consultantDataLoader'

interface ContractorCostsProps {
  consultants: Consultant[]
  summary: ConsultantSummary
}

export default function ContractorCosts({ consultants, summary }: ContractorCostsProps) {
  // Get top consultants by spend
  const topConsultants = consultants
    .filter(c => c.totalPaid > 0)
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 5)

  // Get active consultants
  const activeConsultants = consultants.filter(c => c.status === 'Active')

  // Get outstanding invoices
  const outstandingInvoices = consultants
    .filter(c => c.notes?.includes('OUTSTANDING'))
    .map(c => {
      const match = c.notes?.match(/\$(\d+(?:,\d+)?)/g)
      const amount = match ? parseFloat(match[0].replace(/[$,]/g, '')) : 0
      return { name: c.name, amount, notes: c.notes || '' }
    })
    .filter(item => item.amount > 0)

  // Calculate payment method breakdown
  const paymentMethods = Object.entries(summary.byPaymentMethod)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)

  // Calculate role breakdown
  const roleBreakdown = Object.entries(summary.byRole)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)

  const maxSpend = topConsultants[0]?.totalPaid || 1

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Contractor Costs</h2>
            <p className="text-sm text-gray-600">
              Comprehensive view of all contractor relationships and spend
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">TOTAL CONTRACTORS</div>
            <div className="text-3xl font-bold text-blue-600">{summary.totalConsultants}</div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs font-medium text-gray-500">TOTAL PAID</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              ${(summary.totalPaid / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs font-medium text-gray-500">OUTSTANDING</div>
            <div className="text-2xl font-bold text-orange-600 mt-1">
              ${(summary.totalOutstanding / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs font-medium text-gray-500">ACTIVE</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {summary.activeConsultants}
            </div>
          </div>
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs font-medium text-gray-500">ENDED</div>
            <div className="text-2xl font-bold text-gray-600 mt-1">
              {summary.endedConsultants}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Grid Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Top Contractors by Spend */}
        <div className="col-span-6 bg-white rounded border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Top Contractors by Spend</h3>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <div className="space-y-3">
            {topConsultants.map((consultant) => (
              <div key={consultant.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs font-medium text-gray-700">{consultant.name}</div>
                    <div className="text-xs text-gray-500">{consultant.role}</div>
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    ${(consultant.totalPaid / 1000).toFixed(1)}K
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{ width: `${(consultant.totalPaid / maxSpend) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CFO Insights - Contractor Spend */}
        <div className="col-span-6 bg-blue-50 border border-blue-200 rounded p-4">
          <div className="text-xs font-semibold text-blue-800 mb-2">💡 CONTRACTOR INSIGHTS</div>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Top 5 contractors represent ${(topConsultants.reduce((sum, c) => sum + c.totalPaid, 0) / 1000).toFixed(0)}K of spend</li>
            <li>• {summary.activeConsultants} active relationships requiring ongoing management</li>
            <li>• Diversified payment methods reduce single-point dependency</li>
            {summary.totalOutstanding > 0 && (
              <li>• Outstanding ${(summary.totalOutstanding / 1000).toFixed(0)}K needs immediate attention</li>
            )}
          </ul>
        </div>

        {/* Outstanding Invoices Alert */}
        {outstandingInvoices.length > 0 && (
          <>
            <div className="col-span-6 bg-orange-50 border-2 border-orange-300 rounded p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-orange-800">⚠️ Outstanding Invoices</h3>
                <div className="text-lg font-bold text-orange-600">
                  ${(summary.totalOutstanding / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="space-y-2 mt-3">
                {outstandingInvoices.map((invoice, idx) => (
                  <div key={idx} className="flex justify-between items-start bg-white rounded border border-orange-200 p-2">
                    <div>
                      <div className="text-xs font-medium text-gray-700">{invoice.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {invoice.notes.includes('unpaid') ? 'Payment pending' : 'Action required'}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-orange-600">
                      ${invoice.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CFO Alert - Outstanding */}
            <div className="col-span-6 bg-orange-50 border border-orange-200 rounded p-4">
              <div className="text-xs font-semibold text-orange-800 mb-2">🚨 ACCOUNTS PAYABLE ACTION</div>
              <ul className="text-xs text-orange-700 space-y-1">
                <li>• {outstandingInvoices.length} invoice{outstandingInvoices.length > 1 ? 's' : ''} require{outstandingInvoices.length === 1 ? 's' : ''} payment</li>
                <li>• Total liability: ${summary.totalOutstanding.toLocaleString()}</li>
                <li>• Prioritize payment to maintain contractor relationships</li>
                <li>• Review payment terms to avoid future delays</li>
              </ul>
            </div>
          </>
        )}

        {/* Active Contractors */}
        <div className="col-span-6 bg-white rounded border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Active Contractors</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activeConsultants.slice(0, 8).map((consultant) => (
              <div key={consultant.id} className="flex justify-between items-center py-1">
                <div>
                  <div className="text-xs font-medium text-gray-700">{consultant.name}</div>
                  <div className="text-xs text-gray-500">{consultant.specialization}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-gray-700">
                    ${consultant.hourlyRate > 0 ? `${consultant.hourlyRate}/hr` : 'Project'}
                  </div>
                  <div className="text-xs text-gray-500">{consultant.paymentMethod.split('+')[0].trim()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="col-span-6 bg-white rounded border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Payment Methods</h3>
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          </div>
          <div className="space-y-3">
            {paymentMethods.map(([method, amount]) => {
              const percentage = (amount / summary.totalPaid) * 100
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-medium text-gray-700">{method}</div>
                    <div className="text-sm font-semibold text-purple-600">
                      ${(amount / 1000).toFixed(1)}K ({percentage.toFixed(0)}%)
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-purple-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Role Breakdown */}
        <div className="col-span-6 bg-white rounded border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Spend by Role</h3>
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          </div>
          <div className="space-y-3">
            {roleBreakdown.map(([role, amount]) => {
              const percentage = (amount / summary.totalPaid) * 100
              return (
                <div key={role} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-medium text-gray-700">{role}</div>
                    <div className="text-sm font-semibold text-indigo-600">
                      ${(amount / 1000).toFixed(1)}K ({percentage.toFixed(0)}%)
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-indigo-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="col-span-6 bg-white rounded border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Geographic Distribution</h3>
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          </div>
          <div className="space-y-2">
            {Object.entries(summary.byCountry)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([country, amount]) => (
                <div key={country} className="flex justify-between items-center">
                  <div className="text-xs text-gray-600">{country}</div>
                  <div className="text-sm font-semibold text-teal-600">
                    ${(amount / 1000).toFixed(1)}K
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
