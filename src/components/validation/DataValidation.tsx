'use client'

import { ParsedCSVData } from '@/types'
import { validateCheckingData, ValidationReport } from '@/lib/dataValidator'
import { useState } from 'react'

interface DataValidationProps {
  checkingData?: ParsedCSVData | null
  creditData?: ParsedCSVData | null
  rawCheckingCSV?: string
  rawCreditCSV?: string
}

export default function DataValidation({ checkingData, creditData, rawCheckingCSV, rawCreditCSV }: DataValidationProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (!checkingData && !creditData) return null

  const checkingValidation = checkingData && rawCheckingCSV
    ? validateCheckingData(checkingData, rawCheckingCSV)
    : null

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Data Validation & Reconciliation</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Summary Validation */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {checkingValidation && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Checking Account Validation</h4>

            {/* Current Balance Check */}
            <div className={`p-3 rounded border ${
              checkingValidation.currentBalance.isValid
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Balance</span>
                <span className={`text-sm font-semibold ${
                  checkingValidation.currentBalance.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {checkingValidation.currentBalance.isValid ? '✓ Valid' : '✗ Invalid'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <div>Calculated: ${checkingValidation.currentBalance.calculated.toLocaleString()}</div>
                <div>Expected: ${checkingValidation.currentBalance.expected.toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  Most Recent: {checkingValidation.currentBalance.mostRecentDate}
                </div>
              </div>
            </div>

            {/* Transaction Count */}
            <div className={`p-3 rounded border ${
              checkingValidation.transactionCount.isValid
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transaction Count</span>
                <span className={`text-sm font-semibold ${
                  checkingValidation.transactionCount.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {checkingValidation.transactionCount.isValid ? '✓ Valid' : '✗ Invalid'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <div>Parsed: {checkingValidation.transactionCount.parsed}</div>
                <div>From CSV: {checkingValidation.transactionCount.expectedFromCSV}</div>
              </div>
            </div>

            {/* Date Range */}
            <div className={`p-3 rounded border ${
              checkingValidation.dateRange.isChronological
                ? 'border-green-200 bg-green-50'
                : 'border-yellow-200 bg-yellow-50'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Date Order</span>
                <span className={`text-sm font-semibold ${
                  checkingValidation.dateRange.isChronological ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {checkingValidation.dateRange.isChronological ? '✓ Chronological' : '! Check Order'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <div>Earliest: {checkingValidation.dateRange.earliest}</div>
                <div>Latest: {checkingValidation.dateRange.latest}</div>
              </div>
            </div>
          </div>
        )}

        {creditData && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Credit Card Validation</h4>
            <div className="p-3 rounded border border-blue-200 bg-blue-50">
              <div className="text-sm">
                <div className="font-medium">Transaction Count: {creditData.transactions.length}</div>
                <div>Date Range: {creditData.summary.dateRange.start} to {creditData.summary.dateRange.end}</div>
                <div>Total Spending: ${creditData.summary.totalDebits.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Validation */}
      {showDetails && checkingValidation && (
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-800 mb-4">Detailed Analysis</h4>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm font-medium text-gray-700">Total Credits</div>
              <div className="text-lg font-semibold text-green-600">
                ${checkingValidation.totals.credits.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm font-medium text-gray-700">Total Debits</div>
              <div className="text-lg font-semibold text-red-600">
                ${checkingValidation.totals.debits.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm font-medium text-gray-700">Net Calculated</div>
              <div className={`text-lg font-semibold ${
                checkingValidation.totals.netCalculated >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${checkingValidation.totals.netCalculated.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Category Issues */}
          {checkingValidation.categoryValidation.uncategorized > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
              <div className="text-sm font-medium text-yellow-800">
                ⚠️ {checkingValidation.categoryValidation.uncategorized} transactions need better categorization
              </div>
            </div>
          )}

          {/* Top Categories */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Category Distribution</h5>
            <div className="text-sm space-y-1">
              {Object.entries(checkingValidation.categoryValidation.majorCategories)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([category, count]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-gray-600">{category}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}