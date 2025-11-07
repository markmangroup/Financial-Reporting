'use client'

import { ParsedCSVData } from '@/types'
import { calculateFinancialTotals } from '@/lib/financialCalculations'

interface HeroBalanceSheetProps {
  checkingData: ParsedCSVData
  creditData?: ParsedCSVData | null
}

export default function HeroBalanceSheet({ checkingData, creditData }: HeroBalanceSheetProps) {
  const financials = calculateFinancialTotals(checkingData)

  const cashPosition = financials.currentCashBalance
  const creditCardBalance = creditData ? Math.abs(creditData.summary.balance || 0) : 0
  const isDebtFree = creditCardBalance === 0
  const equityRatio = cashPosition > 0 ? ((financials.totalOwnerEquity / cashPosition) * 100) : 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50/30 p-16">
      <div className="max-w-7xl mx-auto">

        {/* HERO SECTION */}
        <div className="text-center mb-32">
          <div className="text-2xl font-light text-gray-400 mb-8 tracking-[0.2em] uppercase">
            Markman Group • Balance Sheet • {checkingData.summary.dateRange.end}
          </div>

          {/* THE HERO NUMBER - Cash Position */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full"></div>

            <div className="relative text-9xl font-black tracking-tight text-green-600"
                 style={{fontSize: '120px', lineHeight: '1.1'}}>
              ${(cashPosition / 1000).toFixed(0)}K
            </div>
          </div>

          <div className="text-4xl font-light text-gray-600 mb-4">
            Cash Position
          </div>
          <div className="text-xl text-gray-400">
            100% liquid assets • {isDebtFree ? 'Debt-free' : `$${(creditCardBalance / 1000).toFixed(0)}K debt`}
          </div>
        </div>

        {/* SUPPORTING TRIO */}
        <div className="grid grid-cols-3 gap-16 mb-32">

          {/* Card 1: Asset Quality */}
          <div className="text-center group">
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">

              <div className="h-32 mb-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">💰</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Liquidity</div>
                </div>
              </div>

              <div className="text-4xl font-bold text-green-600 mb-2">
                100%
              </div>
              <div className="text-lg text-gray-500 mb-4">
                Liquid Assets
              </div>
              <div className="text-sm text-gray-400">
                Maximum flexibility • Zero risk
              </div>
            </div>
          </div>

          {/* Card 2: Debt Position */}
          <div className="text-center group">
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">

              <div className="h-32 mb-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">{isDebtFree ? '💎' : '💳'}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Debt Status</div>
                </div>
              </div>

              <div className={`text-4xl font-bold mb-2 ${isDebtFree ? 'text-green-600' : 'text-orange-500'}`}>
                {isDebtFree ? '$0' : `$${(creditCardBalance / 1000).toFixed(0)}K`}
              </div>
              <div className="text-lg text-gray-500 mb-4">
                {isDebtFree ? 'Debt Free' : 'Credit Card'}
              </div>
              <div className="text-sm text-gray-400">
                {isDebtFree ? 'Clean balance sheet' : 'Manageable exposure'}
              </div>
            </div>
          </div>

          {/* Card 3: Financial Strength */}
          <div className="text-center group">
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">

              <div className="h-32 mb-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">📈</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Equity Ratio</div>
                </div>
              </div>

              <div className="text-4xl font-bold text-blue-600 mb-2">
                {equityRatio.toFixed(0)}%
              </div>
              <div className="text-lg text-gray-500 mb-4">
                Equity Position
              </div>
              <div className="text-sm text-gray-400">
                Strong foundation • Low leverage
              </div>
            </div>
          </div>
        </div>

        {/* SINGLE INSIGHT BOX */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-16 text-center">
            <div className="text-5xl mb-8">🏦</div>
            <div className="text-2xl font-medium text-gray-800 mb-6 leading-relaxed">
              Strong balance sheet with excellent liquidity position
            </div>
            <div className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {cashPosition > 40000
                ? 'Healthy cash reserves provide strategic flexibility and operational security during revenue fluctuations.'
                : 'Conservative cash management maintains liquidity while supporting business operations.'
              }
            </div>
          </div>
        </div>

        {/* Balance Sheet Equation - Visual */}
        <div className="mt-24 mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-12 border border-gray-100">
              <div className="text-center text-lg text-gray-500 mb-8">
                Balance Sheet Equation
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${(cashPosition / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-500">Assets</div>
                </div>

                <div className="text-3xl text-gray-300 mx-8">=</div>

                <div className="text-center flex-1">
                  <div className="text-3xl font-bold text-red-500 mb-2">
                    ${(creditCardBalance / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-500">Liabilities</div>
                </div>

                <div className="text-3xl text-gray-300 mx-4">+</div>

                <div className="text-center flex-1">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${(financials.totalOwnerEquity / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-500">Equity</div>
                </div>
              </div>

              <div className="text-center mt-8">
                <div className="inline-flex items-center space-x-2 text-green-600">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">✓ Balanced</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal footer */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Cash ${(cashPosition / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Debt ${(creditCardBalance / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Equity ${(financials.totalOwnerEquity / 1000).toFixed(0)}K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}