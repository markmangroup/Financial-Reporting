'use client'

import { BankTransaction, ParsedCSVData } from '@/types'
import { useState } from 'react'

interface TransactionAuditProps {
  checkingData?: ParsedCSVData | null
  creditData?: ParsedCSVData | null
}

interface TransactionIssue {
  transaction: BankTransaction
  issues: string[]
  severity: 'low' | 'medium' | 'high'
}

export default function TransactionAudit({ checkingData, creditData }: TransactionAuditProps) {
  const [showAudit, setShowAudit] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<'checking' | 'credit'>('checking')

  if (!checkingData && !creditData) return null

  const auditTransactions = (transactions: BankTransaction[]): TransactionIssue[] => {
    const issues: TransactionIssue[] = []

    transactions.forEach(transaction => {
      const transactionIssues: string[] = []
      let severity: 'low' | 'medium' | 'high' = 'low'

      // Check for missing or poor categorization
      if (!transaction.category || transaction.category === 'Other' || transaction.category === '') {
        transactionIssues.push('Missing category')
        severity = 'medium'
      }

      // Check for unusual amounts
      if (Math.abs(transaction.amount) > 50000) {
        transactionIssues.push('Large amount - verify')
        severity = 'high'
      }

      // Check for date format issues
      if (!transaction.date || new Date(transaction.date).toString() === 'Invalid Date') {
        transactionIssues.push('Invalid date format')
        severity = 'high'
      }

      // Check for missing descriptions
      if (!transaction.description || transaction.description.trim().length < 5) {
        transactionIssues.push('Insufficient description')
        severity = 'medium'
      }

      // Check for potential duplicates (same amount and date)
      const potentialDuplicates = transactions.filter(t =>
        t.id !== transaction.id &&
        t.date === transaction.date &&
        Math.abs(t.amount - transaction.amount) < 0.01
      )
      if (potentialDuplicates.length > 0) {
        transactionIssues.push(`Potential duplicate (${potentialDuplicates.length} similar)`)
        severity = 'high'
      }

      // Check for unusual patterns in checking account
      if (transaction.account === 'Chase-5939') {
        // Very small amounts might be fees or errors
        if (Math.abs(transaction.amount) < 1 && Math.abs(transaction.amount) > 0) {
          transactionIssues.push('Unusually small amount')
        }

        // Check for missing balance data
        if (transaction.balance === undefined || transaction.balance === null) {
          transactionIssues.push('Missing balance data')
        }
      }

      if (transactionIssues.length > 0) {
        issues.push({
          transaction,
          issues: transactionIssues,
          severity
        })
      }
    })

    return issues.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  const checkingIssues = checkingData ? auditTransactions(checkingData.transactions) : []
  const creditIssues = creditData ? auditTransactions(creditData.transactions) : []

  const currentIssues = selectedAccount === 'checking' ? checkingIssues : creditIssues
  const currentData = selectedAccount === 'checking' ? checkingData : creditData

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Transaction Audit</h3>
        <button
          onClick={() => setShowAudit(!showAudit)}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {showAudit ? 'Hide Audit' : 'Show Transaction Audit'}
        </button>
      </div>

      {showAudit && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid md:grid-cols-2 gap-4">
            {checkingData && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-800">Checking Account Issues</div>
                <div className="text-2xl font-bold text-red-600">{checkingIssues.length}</div>
                <div className="text-sm text-gray-600">
                  High: {checkingIssues.filter(i => i.severity === 'high').length} |
                  Medium: {checkingIssues.filter(i => i.severity === 'medium').length} |
                  Low: {checkingIssues.filter(i => i.severity === 'low').length}
                </div>
              </div>
            )}

            {creditData && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-800">Credit Card Issues</div>
                <div className="text-2xl font-bold text-red-600">{creditIssues.length}</div>
                <div className="text-sm text-gray-600">
                  High: {creditIssues.filter(i => i.severity === 'high').length} |
                  Medium: {creditIssues.filter(i => i.severity === 'medium').length} |
                  Low: {creditIssues.filter(i => i.severity === 'low').length}
                </div>
              </div>
            )}
          </div>

          {/* Account Selector */}
          {checkingData && creditData && (
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedAccount('checking')}
                className={`px-4 py-2 rounded font-medium ${
                  selectedAccount === 'checking'
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Checking Account ({checkingIssues.length} issues)
              </button>
              <button
                onClick={() => setSelectedAccount('credit')}
                className={`px-4 py-2 rounded font-medium ${
                  selectedAccount === 'credit'
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Credit Card ({creditIssues.length} issues)
              </button>
            </div>
          )}

          {/* Transaction Issues */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">
              {selectedAccount === 'checking' ? 'Checking Account' : 'Credit Card'} Transaction Issues
              ({currentIssues.length} total)
            </h4>

            {currentIssues.length === 0 ? (
              <div className="text-center py-8 text-green-600 font-medium">
                ✅ No issues found in {selectedAccount} transactions!
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {currentIssues.slice(0, 50).map((issue, index) => (
                  <div
                    key={issue.transaction.id}
                    className={`p-4 rounded border-l-4 ${
                      issue.severity === 'high'
                        ? 'border-red-400 bg-red-50'
                        : issue.severity === 'medium'
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-blue-400 bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">
                          {issue.transaction.date} | ${Math.abs(issue.transaction.amount).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {issue.transaction.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Category: {issue.transaction.category || 'None'} |
                          Type: {issue.transaction.type}
                          {issue.transaction.balance && ` | Balance: $${issue.transaction.balance.toLocaleString()}`}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className={`text-xs px-2 py-1 rounded ${
                          issue.severity === 'high'
                            ? 'bg-red-200 text-red-800'
                            : issue.severity === 'medium'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}>
                          {issue.severity.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-red-600 space-y-1">
                        {issue.issues.map((issueText, i) => (
                          <div key={i}>• {issueText}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {currentIssues.length > 50 && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Showing first 50 of {currentIssues.length} issues
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {currentData && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-800 mb-2">Quick Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Total Transactions</div>
                  <div className="font-semibold">{currentData.transactions.length}</div>
                </div>
                <div>
                  <div className="text-gray-600">Issues Found</div>
                  <div className="font-semibold text-red-600">{currentIssues.length}</div>
                </div>
                <div>
                  <div className="text-gray-600">Issue Rate</div>
                  <div className="font-semibold">
                    {((currentIssues.length / currentData.transactions.length) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Data Quality</div>
                  <div className={`font-semibold ${
                    currentIssues.length === 0 ? 'text-green-600' :
                    currentIssues.length < currentData.transactions.length * 0.05 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {currentIssues.length === 0 ? 'Excellent' :
                     currentIssues.length < currentData.transactions.length * 0.05 ? 'Good' :
                     'Needs Review'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}