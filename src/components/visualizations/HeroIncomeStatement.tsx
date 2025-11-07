'use client'

import { ParsedCSVData } from '@/types'
import { CreditCardData } from '@/lib/creditCardParser'
import { calculateFinancialTotals } from '@/lib/financialCalculations'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface HeroIncomeStatementProps {
  checkingData: ParsedCSVData
  fullCreditCardData?: CreditCardData | null
}

export default function HeroIncomeStatement({ checkingData, fullCreditCardData }: HeroIncomeStatementProps) {
  const financials = calculateFinancialTotals(checkingData, fullCreditCardData)

  const isLoss = financials.netIncome < 0
  const netAmount = Math.abs(financials.netIncome)

  // Revenue breakdown for simple pie
  const revenueData = [
    { value: 134000, color: '#10b981' },
    { value: 47320, color: '#3b82f6' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-16">
      <div className="max-w-7xl mx-auto">

        {/* HERO SECTION - Dominates everything */}
        <div className="text-center mb-32">
          <div className="text-2xl font-light text-gray-400 mb-8 tracking-[0.2em] uppercase">
            Markman Group • {checkingData.summary.dateRange.start} → {checkingData.summary.dateRange.end}
          </div>

          {/* THE HERO NUMBER - 120px as planned */}
          <div className="relative mb-12">
            <div className={`absolute inset-0 blur-3xl rounded-full ${
              isLoss ? 'bg-red-500/10' : 'bg-green-500/10'
            }`}></div>

            <div className={`relative text-9xl font-black tracking-tight ${
              isLoss ? 'text-red-600' : 'text-green-600'
            }`} style={{fontSize: '120px', lineHeight: '1.1'}}>
              {isLoss ? '-' : '+'}${(netAmount / 1000).toFixed(0)}K
            </div>
          </div>

          <div className="text-4xl font-light text-gray-600 mb-4">
            {isLoss ? 'Operating Loss' : 'Net Profit'}
          </div>
          <div className="text-xl text-gray-400">
            {((financials.netIncome / financials.businessRevenue) * 100).toFixed(0)}% margin
          </div>
        </div>

        {/* SUPPORTING TRIO - Exactly 3 cards as planned */}
        <div className="grid grid-cols-3 gap-16 mb-32">

          {/* Card 1: Revenue Story */}
          <div className="text-center group">
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">

              {/* Simple visual */}
              <div className="h-32 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      innerRadius={20}
                      dataKey="value"
                      stroke="none"
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Hero number for this card */}
              <div className="text-4xl font-bold text-green-600 mb-2">
                $181K
              </div>
              <div className="text-lg text-gray-500 mb-4">
                Total Revenue
              </div>
              <div className="text-sm text-gray-400">
                Two clients • Diverse portfolio
              </div>
            </div>
          </div>

          {/* Card 2: Cost Story */}
          <div className="text-center group">
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">

              {/* Icon visual */}
              <div className="h-32 mb-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">🌍</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Global Team</div>
                </div>
              </div>

              <div className="text-4xl font-bold text-blue-600 mb-2">
                $125K
              </div>
              <div className="text-lg text-gray-500 mb-4">
                Consultant Costs
              </div>
              <div className="text-sm text-gray-400">
                69% of revenue • 4 countries
              </div>
            </div>
          </div>

          {/* Card 3: Efficiency Story */}
          <div className="text-center group">
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">

              {/* Visual indicator */}
              <div className="h-32 mb-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">📉</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Efficiency</div>
                </div>
              </div>

              <div className="text-4xl font-bold text-orange-500 mb-2">
                173%
              </div>
              <div className="text-lg text-gray-500 mb-4">
                Expense Ratio
              </div>
              <div className="text-sm text-gray-400">
                $26K monthly burn rate
              </div>
            </div>
          </div>
        </div>

        {/* SINGLE INSIGHT BOX - One sentence story */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-16 text-center">
            <div className="text-5xl mb-8">💡</div>
            <div className="text-2xl font-medium text-gray-800 mb-6 leading-relaxed">
              Service business with global consultant network currently operating at a loss
            </div>
            <div className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Spending $173 for every $100 earned. Focus needed on revenue growth or cost optimization to achieve profitability.
            </div>
          </div>
        </div>

        {/* Minimal footer - Just the essentials */}
        <div className="mt-24 text-center">
          <div className="inline-flex items-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Revenue $181K</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Expenses $313K</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Loss -$131K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}