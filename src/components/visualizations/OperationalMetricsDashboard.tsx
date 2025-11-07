'use client'

import { ParsedCSVData } from '@/types'
import { calculateFinancialTotals } from '@/lib/financialCalculations'
import ExpenseWaterfallChart from './ExpenseWaterfallChart'
import CashFlowBridgeChart from './CashFlowBridgeChart'
import RevenueTrendChart from './RevenueTrendChart'
import ConsultantSpendChart from './ConsultantSpendChart'

interface OperationalMetricsDashboardProps {
  checkingData: ParsedCSVData
}

export default function OperationalMetricsDashboard({ checkingData }: OperationalMetricsDashboardProps) {
  const financials = calculateFinancialTotals(checkingData)

  // Calculate operational metrics
  const burnRate = financials.totalBusinessExpenses / 12 // Monthly burn
  const cashRunway = Math.floor(financials.currentCashBalance / burnRate) // Months
  const revenuePerEmployee = financials.businessRevenue / 5 // Assuming 5 team members
  const consultantEfficiency = financials.businessRevenue / financials.consultantExpenses

  return (
    <div className="space-y-8">
      {/* Operational KPI Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Operational Metrics Dashboard</h1>
          <p className="text-gray-600">Advanced financial analytics and performance indicators</p>
        </div>

        {/* Key Operational Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${Math.round(burnRate).toLocaleString()}
              </div>
              <div className="text-xs text-blue-500 uppercase tracking-wide">Monthly Burn Rate</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-center">
              <div className={`text-2xl font-bold ${cashRunway > 6 ? 'text-green-600' : cashRunway > 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                {cashRunway}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Months Runway</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${Math.round(revenuePerEmployee).toLocaleString()}
              </div>
              <div className="text-xs text-purple-500 uppercase tracking-wide">Revenue/Employee</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {consultantEfficiency.toFixed(1)}x
              </div>
              <div className="text-xs text-indigo-500 uppercase tracking-wide">Consultant ROI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Financial Analysis Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Revenue Trend Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <RevenueTrendChart totalRevenue={financials.businessRevenue} />
        </div>

        {/* Expense Waterfall Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ExpenseWaterfallChart
            revenue={financials.businessRevenue}
            consultantExpenses={financials.consultantExpenses}
            creditCardOperatingExpenses={financials.creditCardOperatingExpenses}
            creditCardTravelExpenses={financials.creditCardTravelExpenses}
            creditCardMealsExpenses={financials.creditCardMealsExpenses}
            creditCardUtilitiesExpenses={financials.creditCardUtilitiesExpenses}
            creditCardTotalExpenses={financials.creditCardTotalExpenses}
            autoLoanExpenses={financials.autoLoanExpenses}
            bankFees={financials.bankFeesExpenses}
            netIncome={financials.netIncome}
          />
        </div>
      </div>

      {/* Cash Flow and Consultant Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Cash Flow Bridge */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <CashFlowBridgeChart
            openingCash={180000} // Estimated opening cash
            operatingCashFlow={financials.netIncome}
            capitalExpenses={financials.autoLoanExpenses}
            financingCashFlow={0}
            closingCash={financials.currentCashBalance}
            revenue={financials.businessRevenue}
            expenses={financials.totalBusinessExpenses}
          />
        </div>

        {/* Consultant Deep Dive */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ConsultantSpendChart
            totalConsultantSpend={financials.consultantExpenses}
            checkingData={checkingData}
          />
        </div>
      </div>

      {/* Operational Intelligence Summary */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Operational Intelligence</h3>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Performance Indicators */}
          <div className="bg-white rounded-lg p-4 border border-slate-100">
            <h4 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wide">
              Performance Health
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Gross Margin:</span>
                <span className={`font-semibold ${financials.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {((financials.netIncome / financials.businessRevenue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Consultant Ratio:</span>
                <span className="font-semibold text-blue-600">
                  {((financials.consultantExpenses / financials.businessRevenue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cash Efficiency:</span>
                <span className={`font-semibold ${cashRunway > 6 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {cashRunway > 12 ? 'Strong' : cashRunway > 6 ? 'Healthy' : 'Caution'}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white rounded-lg p-4 border border-slate-100">
            <h4 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wide">
              Risk Indicators
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Liquidity Risk:</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  cashRunway > 6 ? 'bg-green-100 text-green-700' :
                  cashRunway > 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  {cashRunway > 6 ? 'Low' : cashRunway > 3 ? 'Medium' : 'High'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Revenue Concentration:</span>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                  Balanced
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cost Structure:</span>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                  Variable
                </span>
              </div>
            </div>
          </div>

          {/* Strategic Opportunities */}
          <div className="bg-white rounded-lg p-4 border border-slate-100">
            <h4 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wide">
              Growth Opportunities
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Scale consulting network</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>Increase client retention</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>Optimize cost structure</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 bg-amber-400 rounded-full"></span>
                <span>Expand service offerings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Action Items */}
        <div className="mt-6 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <h5 className="font-semibold text-indigo-900 mb-2">Executive Action Items</h5>
          <div className="text-sm text-indigo-800 space-y-1">
            <div>• Monitor cash runway monthly to maintain 6+ month buffer</div>
            <div>• Optimize consultant utilization to improve ROI above 2.0x</div>
            <div>• Diversify revenue streams to reduce client concentration risk</div>
            <div>• Implement automated financial reporting for real-time insights</div>
          </div>
        </div>
      </div>
    </div>
  )
}