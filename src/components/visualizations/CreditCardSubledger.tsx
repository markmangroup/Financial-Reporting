'use client'

import { useState, useMemo, useEffect } from 'react'
import { CreditCardData, CreditCardTransaction } from '@/lib/creditCardParser'
import { loadCreditCardData } from '@/lib/creditCardDataLoader'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CreditCardSubledgerProps {
  // Optional props for when called from parent component
  creditCardData?: CreditCardData | null
  checkingData?: null // No longer used but kept for backwards compatibility
}

type SortField = 'date' | 'description' | 'category' | 'vendor' | 'amount'
type SortDirection = 'asc' | 'desc'

export default function CreditCardSubledger({ creditCardData: propData, checkingData }: CreditCardSubledgerProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'traditional' | 'visual' | 'hero'>('side-by-side')
  const [creditCardData, setCreditCardData] = useState<CreditCardData | null>(propData || null)
  const [loading, setLoading] = useState(!propData)

  // Table sorting state
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Category detail modal state
  const [selectedCategoryForDetail, setSelectedCategoryForDetail] = useState<string | null>(null)

  // Hierarchical category filters
  const [majorCategoryFilter, setMajorCategoryFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all')

  // Comprehensive filters for parsed data
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all')
  const [chaseTypeFilter, setChaseTypeFilter] = useState<string>('all')
  const [vendorFilter, setVendorFilter] = useState<string>('all')

  // Calculate LTD date range from data
  const ltdDateRange = useMemo(() => {
    if (!creditCardData) return { start: '', end: '' }
    const transactions = creditCardData.transactions
    if (transactions.length === 0) return { start: '', end: '' }

    const dates = transactions.map(t => t.date)
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

    return {
      start: minDate.toISOString().split('T')[0],
      end: maxDate.toISOString().split('T')[0]
    }
  }, [creditCardData])

  const [dateRangeFilter, setDateRangeFilter] = useState<{start: string, end: string}>({ start: '', end: '' })

  // Load credit card data if not provided
  useEffect(() => {
    if (!propData && !creditCardData) {
      setLoading(true)
      loadCreditCardData()
        .then((data) => {
          setCreditCardData(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Failed to load credit card data:', error)
          setLoading(false)
        })
    }
  }, [propData, creditCardData])

  // Set LTD as default date range when data loads, but use today as end date
  useEffect(() => {
    if (ltdDateRange.start && ltdDateRange.end && dateRangeFilter.start === '' && dateRangeFilter.end === '') {
      const today = new Date().toISOString().split('T')[0]
      setDateRangeFilter({
        start: ltdDateRange.start,
        end: today // Always use today's date as the default end date
      })
    }
  }, [ltdDateRange, dateRangeFilter])

  // Get unique options for all filters (moved here to avoid hook order violations)
  const chaseTypes = useMemo(() => {
    if (!creditCardData) return ['all']
    const types = new Set(['all'])
    creditCardData.transactions.forEach(t => {
      if (t.chaseType) types.add(t.chaseType)
    })
    return Array.from(types).sort()
  }, [creditCardData])

  const vendors = useMemo(() => {
    if (!creditCardData) return ['all']
    const vendors = new Set(['all'])
    creditCardData.transactions.forEach(t => {
      if (t.vendor && t.vendor !== 'Unknown') vendors.add(t.vendor)
    })
    return Array.from(vendors).sort()
  }, [creditCardData])

  // Get unique major categories
  const majorCategories = useMemo(() => {
    if (!creditCardData) return ['all']
    const categories = new Set(['all'])
    creditCardData.transactions.forEach(t => {
      if (t.majorCategory) categories.add(t.majorCategory)
    })
    return Array.from(categories).sort()
  }, [creditCardData])

  // Get categories filtered by major category
  const availableCategories = useMemo(() => {
    if (!creditCardData) return ['all']
    const categories = new Set(['all'])
    creditCardData.transactions.forEach(t => {
      if (majorCategoryFilter === 'all' || t.majorCategory === majorCategoryFilter) {
        if (t.subCategory) categories.add(t.subCategory)
      }
    })
    return Array.from(categories).sort()
  }, [creditCardData, majorCategoryFilter])

  // Get subcategories filtered by major category and category
  const availableSubcategories = useMemo(() => {
    if (!creditCardData) return ['all']
    const subcategories = new Set(['all'])
    creditCardData.transactions.forEach(t => {
      const majorMatch = majorCategoryFilter === 'all' || t.majorCategory === majorCategoryFilter
      const categoryMatch = categoryFilter === 'all' || t.subCategory === categoryFilter
      if (majorMatch && categoryMatch) {
        if (t.detailCategory) subcategories.add(t.detailCategory)
      }
    })
    return Array.from(subcategories).sort()
  }, [creditCardData, majorCategoryFilter, categoryFilter])

  // Reset dependent filters when parent filter changes
  useEffect(() => {
    setCategoryFilter('all')
    setSubcategoryFilter('all')
  }, [majorCategoryFilter])

  useEffect(() => {
    setSubcategoryFilter('all')
  }, [categoryFilter])

  // Filter and sort transactions with comprehensive filters
  const filteredTransactions = useMemo(() => {
    if (!creditCardData) return []

    let transactions = creditCardData.transactions

    // Filter by hierarchical categories
    if (majorCategoryFilter !== 'all') {
      transactions = transactions.filter(t => t.majorCategory === majorCategoryFilter)
    }
    if (categoryFilter !== 'all') {
      transactions = transactions.filter(t => t.subCategory === categoryFilter)
    }
    if (subcategoryFilter !== 'all') {
      transactions = transactions.filter(t => t.detailCategory === subcategoryFilter)
    }

    // Filter by transaction type (Debit/Credit)
    if (transactionTypeFilter !== 'all') {
      transactions = transactions.filter(t => t.type === transactionTypeFilter)
    }

    // Filter by Chase type (Sale, Payment, Return)
    if (chaseTypeFilter !== 'all') {
      transactions = transactions.filter(t => t.chaseType === chaseTypeFilter)
    }

    // Filter by vendor
    if (vendorFilter !== 'all') {
      transactions = transactions.filter(t => t.vendor === vendorFilter)
    }

    // Filter by date range
    if (dateRangeFilter.start) {
      const startDate = new Date(dateRangeFilter.start)
      transactions = transactions.filter(t => t.date >= startDate)
    }
    if (dateRangeFilter.end) {
      const endDate = new Date(dateRangeFilter.end)
      endDate.setHours(23, 59, 59, 999) // Include full end date
      transactions = transactions.filter(t => t.date <= endDate)
    }

    // Sort by selected field and direction
    return transactions.sort((a, b) => {
      let aVal: any, bVal: any

      switch (sortField) {
        case 'date':
          aVal = a.date.getTime()
          bVal = b.date.getTime()
          break
        case 'description':
          aVal = a.description.toLowerCase()
          bVal = b.description.toLowerCase()
          break
        case 'category':
          aVal = (a.detailCategory || a.subCategory || a.majorCategory || '').toLowerCase()
          bVal = (b.detailCategory || b.subCategory || b.majorCategory || '').toLowerCase()
          break
        case 'vendor':
          aVal = (a.vendor || '').toLowerCase()
          bVal = (b.vendor || '').toLowerCase()
          break
        case 'amount':
          aVal = a.amount
          bVal = b.amount
          break
        default:
          aVal = a.date.getTime()
          bVal = b.date.getTime()
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [creditCardData, majorCategoryFilter, categoryFilter, subcategoryFilter, transactionTypeFilter, chaseTypeFilter, vendorFilter, dateRangeFilter, sortField, sortDirection])

  // Calculate filtered totals
  const filteredTotals = useMemo(() => {
    const debits = filteredTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
    const credits = filteredTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
    return { debits, credits, net: debits - credits }
  }, [filteredTransactions])

  // Calculate filtered category breakdown from filtered transactions
  const filteredCategoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {}

    filteredTransactions.forEach(t => {
      if (t.type === 'debit') {
        // Use the most specific category level available
        const categoryKey = t.detailCategory || t.subCategory || t.majorCategory || t.category || 'Uncategorized'
        breakdown[categoryKey] = (breakdown[categoryKey] || 0) + t.amount
      }
    })

    return breakdown
  }, [filteredTransactions])

  // Calculate top categories from filtered data
  const topCategories = useMemo(() => {
    const totalDebits = filteredTotals.debits

    return Object.entries(filteredCategoryBreakdown)
      .map(([category, amount]) => ({
        category,
        amount: Math.abs(amount),
        percentage: totalDebits > 0 ? (Math.abs(amount) / totalDebits) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)
  }, [filteredCategoryBreakdown, filteredTotals])

  // Get detailed breakdown for selected category
  const categoryDetailTransactions = useMemo(() => {
    if (!selectedCategoryForDetail) return []

    return filteredTransactions.filter(t => {
      const categoryKey = t.detailCategory || t.subCategory || t.majorCategory || t.category || 'Uncategorized'
      return categoryKey === selectedCategoryForDetail && t.type === 'debit'
    }).sort((a, b) => b.amount - a.amount)
  }, [selectedCategoryForDetail, filteredTransactions])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">💳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Credit Card Data</h2>
          <p className="text-gray-600">Fetching transaction details...</p>
        </div>
      </div>
    )
  }

  if (!creditCardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Credit Card Data Not Available</h2>
          <p className="text-gray-600">Unable to load credit card transaction data.</p>
        </div>
      </div>
    )
  }

  const TraditionalView = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Credit Card Transaction Detail</h2>

        {/* Comprehensive Filters */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">🔍 Comprehensive Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Hierarchical Category Filters */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Major Category</label>
              <select
                value={majorCategoryFilter}
                onChange={(e) => setMajorCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                {majorCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Major Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
                disabled={majorCategoryFilter === 'all' && availableCategories.length === 1}
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
                disabled={(majorCategoryFilter === 'all' && categoryFilter === 'all') || availableSubcategories.length === 1}
              >
                {availableSubcategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Subcategories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Transaction Type</label>
              <select
                value={transactionTypeFilter}
                onChange={(e) => setTransactionTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Types</option>
                <option value="debit">Debit (Expenses)</option>
                <option value="credit">Credit (Payments/Returns)</option>
              </select>
            </div>

            {/* Chase Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Chase Type</label>
              <select
                value={chaseTypeFilter}
                onChange={(e) => setChaseTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                {chaseTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Chase Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Vendor</label>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                {vendors.map(vendor => (
                  <option key={vendor} value={vendor}>
                    {vendor === 'all' ? 'All Vendors' : vendor}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filters */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateRangeFilter.start}
                onChange={(e) => setDateRangeFilter(prev => ({...prev, start: e.target.value}))}
                className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateRangeFilter.end}
                onChange={(e) => setDateRangeFilter(prev => ({...prev, end: e.target.value}))}
                className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
              />
            </div>
          </div>

          {/* Quick Reset and LTD Button */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => {
                setMajorCategoryFilter('all')
                setCategoryFilter('all')
                setSubcategoryFilter('all')
                setTransactionTypeFilter('all')
                setChaseTypeFilter('all')
                setVendorFilter('all')
                setDateRangeFilter(ltdDateRange)
              }}
              className="px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reset to LTD
            </button>
            <button
              onClick={() => {
                setDateRangeFilter(ltdDateRange)
              }}
              className="px-3 py-1 text-xs font-medium bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Set Date to LTD
            </button>
          </div>

          {/* Filter Summary */}
          <div className="text-xs text-gray-600 bg-white rounded p-2">
            <strong>Active Filters:</strong> {filteredTransactions.length} of {creditCardData.transactions.length} transactions
            {majorCategoryFilter !== 'all' && ` • Major: ${majorCategoryFilter}`}
            {categoryFilter !== 'all' && ` • Category: ${categoryFilter}`}
            {subcategoryFilter !== 'all' && ` • Sub: ${subcategoryFilter}`}
            {transactionTypeFilter !== 'all' && ` • Type: ${transactionTypeFilter}`}
            {chaseTypeFilter !== 'all' && ` • Chase Type: ${chaseTypeFilter}`}
            {vendorFilter !== 'all' && ` • Vendor: ${vendorFilter}`}
            {dateRangeFilter.start && ` • From: ${dateRangeFilter.start}`}
            {dateRangeFilter.end && ` • To: ${dateRangeFilter.end}`}
            {dateRangeFilter.start === ltdDateRange.start && dateRangeFilter.end === ltdDateRange.end && ` • 📊 LTD`}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              ${filteredTotals.debits.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Net Expenses</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              ${filteredTotals.debits.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Payments</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${filteredTotals.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(filteredTotals.net).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Net Amount</div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => {
                  if (sortField === 'date') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortField('date')
                    setSortDirection('desc')
                  }
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {sortField === 'date' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => {
                  if (sortField === 'description') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortField('description')
                    setSortDirection('asc')
                  }
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Description</span>
                  {sortField === 'description' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => {
                  if (sortField === 'category') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortField('category')
                    setSortDirection('asc')
                  }
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Category</span>
                  {sortField === 'category' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chase Type</th>
              <th
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => {
                  if (sortField === 'vendor') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortField('vendor')
                    setSortDirection('asc')
                  }
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Vendor</span>
                  {sortField === 'vendor' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th
                className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => {
                  if (sortField === 'amount') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortField('amount')
                    setSortDirection('desc')
                  }
                }}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Amount</span>
                  {sortField === 'amount' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.slice(0, 50).map((transaction, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {transaction.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {transaction.description}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  <div className="space-y-1">
                    {transaction.majorCategory && (
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {transaction.majorCategory}
                      </span>
                    )}
                    {transaction.subCategory && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {transaction.subCategory}
                      </span>
                    )}
                    {transaction.detailCategory && (
                      <span className="inline-block px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs">
                        {transaction.detailCategory}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  <span className={`inline-block px-2 py-1 rounded-full ${
                    transaction.chaseType === 'Payment' ? 'bg-green-100 text-green-700' :
                    transaction.chaseType === 'Return' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {transaction.chaseType || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                    {transaction.vendor || 'Unknown'}
                  </span>
                </td>
                <td className={`px-4 py-3 text-sm font-medium text-right ${
                  transaction.type === 'credit' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type === 'credit' ? '-' : '+'}${transaction.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTransactions.length > 50 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing first 50 of {filteredTransactions.length} transactions
        </div>
      )}
    </div>
  )

  const VisualView = () => {

    const recentTransactions = filteredTransactions.slice(0, 10)

    return (
      <div className="space-y-8">
        {/* Hero Metrics - Now filtered */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200 p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">💳 Credit Card Analysis</h2>
            <p className="text-gray-600">
              {filteredTransactions.length === creditCardData.transactions.length
                ? 'Transaction breakdown and spending insights'
                : `Filtered view: ${filteredTransactions.length} of ${creditCardData.transactions.length} transactions`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-white border border-red-100">
              <div className="text-2xl font-bold text-red-600">
                ${filteredTotals.debits.toLocaleString()}
              </div>
              <div className="text-xs text-red-500 uppercase tracking-wide">Net Expenses</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                ${filteredTotals.credits.toLocaleString()}
              </div>
              <div className="text-xs text-green-500 uppercase tracking-wide">Total Payments</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {filteredTransactions.length}
              </div>
              <div className="text-xs text-blue-500 uppercase tracking-wide">Transactions</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(filteredCategoryBreakdown).length}
              </div>
              <div className="text-xs text-purple-500 uppercase tracking-wide">Categories</div>
            </div>
          </div>
        </div>

        {/* Category Breakdown - Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Top Expense Categories</h3>
            <p className="text-sm text-gray-600">💡 Click any bar or card to see transaction details</p>
          </div>
          {topCategories && topCategories.length > 0 ? (
            <div className="w-full h-96 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topCategories}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 80,
                  }}
                  onClick={(data) => {
                    if (data && data.activeLabel) {
                      setSelectedCategoryForDetail(data.activeLabel as string)
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    fontSize={11}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                    labelFormatter={(label) => `${label}`}
                    content={(props: any) => {
                      if (props.active && props.payload && props.payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900">{props.label}</p>
                            <p className="text-sm text-red-600">${props.payload[0].value.toLocaleString()}</p>
                            <p className="text-xs text-gray-600">{props.payload[0].payload.percentage.toFixed(1)}% of total</p>
                            <p className="text-xs text-blue-600 mt-1">Click to see details →</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                  >
                    {topCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${(index * 45) % 360}, 65%, 55%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg mb-4">
              <div className="text-gray-500">Loading chart data...</div>
            </div>
          )}

          {/* Category Summary - Now clickable */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {topCategories.slice(0, 4).map((category, index) => (
              <div
                key={index}
                className="text-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-blue-300"
                onClick={() => setSelectedCategoryForDetail(category.category)}
              >
                <div className="text-sm font-medium text-gray-900">{category.category}</div>
                <div className="text-lg font-bold text-red-600">${category.amount.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}% of total</div>
                <div className="text-xs text-blue-600 mt-1">Click for details →</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Detail Modal */}
        {selectedCategoryForDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCategoryForDetail(null)}>
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCategoryForDetail}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {categoryDetailTransactions.length} transactions • $
                    {categoryDetailTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCategoryForDetail(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {categoryDetailTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {categoryDetailTransactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{transaction.description}</span>
                            {transaction.vendor && (
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                {transaction.vendor}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-600">
                            <span>{transaction.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            {transaction.majorCategory && transaction.majorCategory !== selectedCategoryForDetail && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                {transaction.majorCategory}
                              </span>
                            )}
                            {transaction.subCategory && transaction.subCategory !== selectedCategoryForDetail && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                {transaction.subCategory}
                              </span>
                            )}
                            {transaction.detailCategory && transaction.detailCategory !== selectedCategoryForDetail && (
                              <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full">
                                {transaction.detailCategory}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-red-600 whitespace-nowrap">
                          ${transaction.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No transactions found for this category
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total: <span className="font-bold text-gray-900">
                    ${categoryDetailTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCategoryForDetail(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {transaction.type === 'credit' ? '💸' : '💰'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{transaction.description}</div>
                    <div className="text-sm text-gray-600">
                      {transaction.date.toLocaleDateString()} • {transaction.category}
                    </div>
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  transaction.type === 'credit' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type === 'credit' ? '-' : '+'}${transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const SideBySideView = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <TraditionalView />
      <VisualView />
    </div>
  )

  const HeroView = () => (
    <div className="space-y-8">
      {/* Massive Hero Section - Now filtered */}
      <div className="bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 rounded-lg text-white p-12">
        <div className="text-center">
          <div className="text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
            ${filteredTotals.debits.toLocaleString()}
          </div>
          <h1 className="text-4xl font-bold mb-4">Credit Card Spending</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            {filteredTransactions.length === creditCardData.transactions.length
              ? `Detailed analysis of ${filteredTransactions.length} transactions across ${Object.keys(filteredCategoryBreakdown).length} categories`
              : `Filtered: ${filteredTransactions.length} of ${creditCardData.transactions.length} transactions across ${Object.keys(filteredCategoryBreakdown).length} categories`}
          </p>
        </div>
      </div>
      <VisualView />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* View Mode Selector */}
      <div className="flex flex-wrap gap-2 justify-center bg-white rounded-lg border border-gray-200 p-4">
        {[
          { mode: 'side-by-side', label: '📊 Side-by-Side', desc: 'Traditional + Visual' },
          { mode: 'traditional', label: '📋 Traditional', desc: 'Table View' },
          { mode: 'visual', label: '🎨 Visual', desc: 'Charts & Insights' },
          { mode: 'hero', label: '⭐ Hero', desc: 'Magazine Style' }
        ].map(({ mode, label, desc }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode as any)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              viewMode === mode
                ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="text-xs">{label}</div>
            <div className="text-xs opacity-75">{desc}</div>
          </button>
        ))}
      </div>

      {/* Render Selected View */}
      {viewMode === 'traditional' && <TraditionalView />}
      {viewMode === 'visual' && <VisualView />}
      {viewMode === 'side-by-side' && <SideBySideView />}
      {viewMode === 'hero' && <HeroView />}
    </div>
  )
}