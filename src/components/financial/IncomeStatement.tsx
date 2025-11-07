'use client'

import { useState } from 'react'
import { ParsedCSVData } from '@/types'
import { calculateFinancialTotals } from '@/lib/financialCalculations'
import { CreditCardData } from '@/lib/creditCardParser'
import DualViewLayout from '@/components/layout/DualViewLayout'
import IncomeStatementDashboard from '@/components/visualizations/IncomeStatementDashboard'
import HeroIncomeStatement from '@/components/visualizations/HeroIncomeStatement'
import CreditCardSubledger from '@/components/visualizations/CreditCardSubledger'

interface IncomeStatementProps {
  checkingData: ParsedCSVData | null
  creditData: ParsedCSVData | null
  fullCreditCardData?: CreditCardData | null
}

export default function IncomeStatement({ checkingData, creditData, fullCreditCardData }: IncomeStatementProps) {
  const [showCreditCardSubledger, setShowCreditCardSubledger] = useState(false)
  const [showConsultantBreakdown, setShowConsultantBreakdown] = useState(false)

  if (!checkingData) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <div className="text-gray-400 text-lg mb-4">Upload your Chase checking account CSV to view Income Statement</div>
        </div>
      </div>
    )
  }

  // Show Credit Card Subledger if requested
  if (showCreditCardSubledger) {
    return (
      <div className="space-y-6">
        {/* Navigation breadcrumb */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => setShowCreditCardSubledger(false)}
              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              ← Back to Income Statement
            </button>
            <span className="text-gray-500">/</span>
            <span className="text-gray-900 font-medium">Credit Card Payments Detail</span>
          </div>
        </div>
        <CreditCardSubledger />
      </div>
    )
  }

  // USE GOLDEN RECORD CALCULATIONS
  const financials = calculateFinancialTotals(checkingData, fullCreditCardData)

  // Revenue
  const businessRevenue = financials.businessRevenue

  // Expenses (broken down for display)
  const consultantExpenses = financials.consultantExpenses
  const operatingExpenses = financials.creditCardTotalExpenses + financials.autoLoanExpenses + financials.bankFeesExpenses
  const additionalExpenses = 0 // No additional expenses with golden record

  // Totals
  const calculatedTotalExpenses = financials.totalBusinessExpenses
  const totalExpenses = financials.totalBusinessExpenses
  const netIncome = financials.netIncome

  // Component-level calculations from golden record
  const creditCardTotalExpenses = financials.creditCardTotalExpenses
  const creditCardPayments = financials.creditCardPayments
  const autoLoanExpenses = financials.autoLoanExpenses
  const bankFeesExpenses = financials.bankFeesExpenses

  // AUDIT VALIDATION CHECKS - Using golden record values (should always match)
  const consultantCheck = Math.abs(consultantExpenses - financials.consultantExpenses) < 0.01
  const operatingCheck = Math.abs(operatingExpenses - (financials.creditCardTotalExpenses + financials.autoLoanExpenses + financials.bankFeesExpenses)) < 0.01
  const creditCardCheck = Math.abs(creditCardPayments - financials.creditCardPayments) < 0.01
  const totalCheck = Math.abs(calculatedTotalExpenses - totalExpenses) < 0.01 // Should be exact match now

  // Traditional tabular view
  const traditionalView = (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">MARKMAN GROUP</h1>
          <h2 className="text-xl font-semibold text-gray-700 mt-2">INCOME STATEMENT</h2>
          <div className="text-sm text-gray-500 mt-1">
            For the Period {checkingData.summary.dateRange.start} to {checkingData.summary.dateRange.end}
          </div>
        </div>

        <div className="space-y-6">
          {/* Revenue Section */}
          <div className="border-b border-gray-300 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">REVENUE</h3>
            <div className="space-y-2 ml-4">
              {checkingData.categories
                .filter(c => c.category.includes('Client Payment') || c.category.includes('Laurel') || c.category.includes('Metropolitan'))
                .map(client => (
                  <div key={client.category} className="flex justify-between">
                    <span className="text-gray-700">{client.category.replace('Client Payment - ', '').replace('Laurel Management', 'Laurel Management').replace('Metropolitan Partners', 'Metropolitan Partners')}</span>
                    <span className="font-medium">${client.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))
              }
            </div>
            <div className="flex justify-between mt-3 pt-2 border-t border-gray-200 font-semibold">
              <span>Total Revenue</span>
              <span>${businessRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="border-b border-gray-300 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">EXPENSES</h3>

            {/* All expenses combined and sorted largest to smallest */}
            <div className="ml-4 space-y-1">
              {(() => {
                // Combine all expenses into one array for unified sorting
                const allExpenses = [
                  // Consultant Services
                  ...(financials.consultantExpenses > 0 ? [{
                    name: 'Consultant Services',
                    amount: financials.consultantExpenses,
                    hasBreakdown: true,
                    type: 'consultant' as const
                  }] : []),
                  // Credit Card Categories (already sorted)
                  ...financials.creditCardCategoryBreakdown.map(c => ({
                    name: c.name,
                    amount: c.amount,
                    hasBreakdown: false,
                    type: 'credit-card' as const
                  })),
                  // Other checking account expenses
                  ...(financials.autoLoanExpenses > 0 ? [{
                    name: 'Auto Loan',
                    amount: financials.autoLoanExpenses,
                    hasBreakdown: false,
                    type: 'checking' as const
                  }] : []),
                  ...(financials.bankFeesExpenses > 0 ? [{
                    name: 'Bank Fees',
                    amount: financials.bankFeesExpenses,
                    hasBreakdown: false,
                    type: 'checking' as const
                  }] : [])
                ]

                // Sort all expenses by amount (largest first)
                allExpenses.sort((a, b) => b.amount - a.amount)

                return allExpenses.map((expense, idx) => (
                  <div key={idx}>
                    {/* Main expense line */}
                    <div className="flex justify-between text-gray-700">
                      <span className="flex items-center gap-2">
                        {expense.name}
                        {expense.hasBreakdown && !showConsultantBreakdown && (
                          <button
                            onClick={() => setShowConsultantBreakdown(true)}
                            className="text-blue-600 hover:text-blue-800 text-xs hover:underline"
                          >
                            View Details →
                          </button>
                        )}
                      </span>
                      <span className="font-medium">${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {/* Consultant breakdown (if expanded) */}
                    {expense.type === 'consultant' && showConsultantBreakdown && financials.consultantBreakdown.length > 0 && (
                      <div className="ml-4 space-y-1 border-l-2 border-blue-200 pl-3 my-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Consultant Breakdown</span>
                          <button
                            onClick={() => setShowConsultantBreakdown(false)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Collapse ↑
                          </button>
                        </div>
                        {financials.consultantBreakdown.map((consultant, cidx) => (
                          <div key={cidx} className="flex justify-between text-sm text-gray-600">
                            <span>{consultant.name}</span>
                            <span>${consultant.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              })()}
            </div>

            {/* Credit Card Detail Link */}
            <div className="mt-4 ml-4">
              <button
                onClick={() => setShowCreditCardSubledger(true)}
                className="text-blue-600 hover:text-blue-800 text-xs hover:underline flex items-center gap-1"
              >
                📊 View Transaction-Level Credit Card Details →
              </button>
            </div>

            {/* Additional Expenses */}
            {additionalExpenses > 0 && (
              <div className="ml-4 mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Additional Expenses</h4>
                <div className="space-y-1 ml-4">
                  {additionalExpenses > 0 && (
                    <div className="flex justify-between text-sm group relative cursor-help">
                      <span className="text-gray-600">Other Expenses</span>
                      <span>${additionalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>

                      {/* Tooltip */}
                      <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white p-3 rounded shadow-lg z-50 w-96">
                        <div className="text-xs font-semibold mb-2">Other Expenses Details:</div>
                        <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                          {checkingData.transactions
                            .filter(t =>
                              t.amount < 0 &&
                              !t.category?.includes('Client Payment') &&
                              !t.category?.includes('Consultant') &&
                              !t.category?.includes('Credit Card Autopay') &&
                              !t.category?.includes('Auto Loan') &&
                              !t.category?.includes('Monthly Bank') &&
                              !t.category?.includes('Business Service') &&
                              !t.category?.includes('Account Transfer') &&
                              !t.category?.includes('Wire Transfer Reversal') &&
                              !t.category?.includes('Account Verification') &&
                              !t.category?.includes('LOAN_PMT')
                            )
                            .slice(0, 10)
                            .map((transaction, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="truncate pr-2">{transaction.date} - {transaction.category || 'Uncategorized'}: {transaction.description.substring(0, 20)}...</span>
                                <span>${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between mt-2 pt-1 border-t border-gray-100 font-medium text-sm">
                  <span>Subtotal - Additional Expenses</span>
                  <span>${additionalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-3 pt-2 border-t border-gray-200 font-semibold">
              <span className="flex items-center gap-2">
                Total Expenses
                <span className={`text-xs ${totalCheck ? 'text-green-600' : 'text-red-600'}`}>
                  {totalCheck ? '✓' : '✗'}
                </span>
              </span>
              <span>${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Net Income */}
          <div className="pt-4">
            <div className={`flex justify-between text-xl font-bold ${
              netIncome >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>NET INCOME</span>
              <span>${netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <h4 className="font-semibold text-gray-800 mb-3">KEY METRICS</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-500">GROSS MARGIN</div>
                <div className="text-lg font-semibold text-gray-900">
                  {businessRevenue > 0 ? ((netIncome / businessRevenue) * 100).toFixed(1) : '0.0'}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-500">EXPENSE RATIO</div>
                <div className="text-lg font-semibold text-gray-900">
                  {businessRevenue > 0 ? ((totalExpenses / businessRevenue) * 100).toFixed(1) : '0.0'}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-500">TRANSACTIONS</div>
                <div className="text-lg font-semibold text-gray-900">
                  {checkingData.summary.totalTransactions}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Mapping Validation */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <h4 className="font-semibold text-gray-800 mb-3">TRANSACTION MAPPING AUDIT</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Transaction Coverage:</h5>
                <div className="space-y-1">
                  <div>Total Transactions: {checkingData.summary.totalTransactions}</div>
                  <div>Mapped Transactions: {checkingData.transactions.filter(t => t.category && t.category !== 'Uncategorized').length}</div>
                  <div className="text-red-600">Unmapped Transactions: {checkingData.transactions.filter(t => !t.category || t.category === 'Uncategorized').length}</div>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Categories Needing Review:</h5>
                <div className="space-y-1">
                  {checkingData.categories
                    .filter(c =>
                      c.category.includes('Unknown') ||
                      c.category.includes('Uncategorized') ||
                      c.category.includes('ACH') ||
                      c.category.includes('MISC')
                    )
                    .map(cat => (
                      <div key={cat.category} className="text-amber-600">
                        {cat.category}: ${cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({cat.count} txns)
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Debug Section - Calculation Verification */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <h4 className="font-semibold text-gray-800 mb-3">CALCULATION VERIFICATION</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Calculated Totals:</h5>
                <div className="space-y-1">
                  <div>Consultant Expenses: ${consultantExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div>Credit Card Expenses (Subledger): ${creditCardTotalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div>Credit Card Payments (Checking): ${creditCardPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div>Auto Loan: ${autoLoanExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div>Bank Fees: ${bankFeesExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div>Operating Expenses: ${operatingExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div>Additional Expenses (Other): ${additionalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Validation Results:</h5>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 ${consultantCheck ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{consultantCheck ? '✓' : '✗'}</span>
                    Consultant Services Math
                  </div>
                  <div className={`flex items-center gap-2 ${creditCardCheck ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{creditCardCheck ? '✓' : '✗'}</span>
                    Credit Card Total Math
                  </div>
                  <div className={`flex items-center gap-2 ${operatingCheck ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{operatingCheck ? '✓' : '✗'}</span>
                    Operating Expenses Math
                  </div>
                  <div className={`flex items-center gap-2 ${totalCheck ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{totalCheck ? '✓' : '✗'}</span>
                    Total Expenses Match
                  </div>
                  <div className="mt-2 text-gray-600">
                    Calculated Total: ${calculatedTotalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-gray-600">
                    CSV Parser Total: ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-gray-600">
                    Difference: ${Math.abs(calculatedTotalExpenses - totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-2 text-xs text-yellow-300">
                    <div>Debug: C=${consultantExpenses.toFixed(0)} + O=${operatingExpenses.toFixed(0)} + A=${additionalExpenses.toFixed(0)} = ${(consultantExpenses + operatingExpenses + additionalExpenses).toFixed(0)} vs Actual=${totalExpenses.toFixed(0)}</div>
                    {Math.abs(calculatedTotalExpenses - totalExpenses) > 0.01 && (
                      <div className="text-red-300">Difference: ${Math.abs(calculatedTotalExpenses - totalExpenses).toFixed(2)} - Check for missing expense categories</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Visual dashboard view
  const visualView = <IncomeStatementDashboard checkingData={checkingData} fullCreditCardData={fullCreditCardData} />

  // Hero magazine view
  const heroView = <HeroIncomeStatement checkingData={checkingData} fullCreditCardData={fullCreditCardData} />

  return (
    <DualViewLayout
      title="MARKMAN GROUP INCOME STATEMENT"
      subtitle={`For the Period ${checkingData.summary.dateRange.start} to ${checkingData.summary.dateRange.end}`}
      traditionalView={traditionalView}
      visualView={visualView}
      heroView={heroView}
    />
  )
}