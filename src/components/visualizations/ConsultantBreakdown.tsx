'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ParsedCSVData } from '@/types'

interface ConsultantBreakdownProps {
  checkingData: ParsedCSVData
}

const COLORS = {
  uk: '#3b82f6',       // Blue
  spain: '#ef4444',    // Red
  bulgaria: '#10b981', // Green
  slovakia: '#f59e0b', // Amber
  other: '#8b5cf6'     // Purple
}

export default function ConsultantBreakdown({ checkingData }: ConsultantBreakdownProps) {
  // Extract consultant expenses by region/person
  const consultantCategories = checkingData.categories.filter(c =>
    c.category.includes('Consultant') || c.category.includes('Swan')
  )

  // Group by region/type
  const consultantData = [
    {
      name: 'UK Consultants',
      amount: consultantCategories
        .filter(c => c.category.includes('UK'))
        .reduce((sum, c) => sum + Math.abs(c.amount), 0),
      color: COLORS.uk,
      count: consultantCategories.filter(c => c.category.includes('UK')).length
    },
    {
      name: 'Spain (Carmen)',
      amount: consultantCategories
        .filter(c => c.category.includes('Spain'))
        .reduce((sum, c) => sum + Math.abs(c.amount), 0),
      color: COLORS.spain,
      count: consultantCategories.filter(c => c.category.includes('Spain')).length
    },
    {
      name: 'Bulgaria (Pepi)',
      amount: consultantCategories
        .filter(c => c.category.includes('Bulgaria'))
        .reduce((sum, c) => sum + Math.abs(c.amount), 0),
      color: COLORS.bulgaria,
      count: consultantCategories.filter(c => c.category.includes('Bulgaria')).length
    },
    {
      name: 'Slovakia (Ivana)',
      amount: consultantCategories
        .filter(c => c.category.includes('Slovakia'))
        .reduce((sum, c) => sum + Math.abs(c.amount), 0),
      color: COLORS.slovakia,
      count: consultantCategories.filter(c => c.category.includes('Slovakia')).length
    },
    {
      name: 'Other Services',
      amount: consultantCategories
        .filter(c =>
          c.category.includes('Swan') ||
          c.category.includes('Bill.com') ||
          (c.category.includes('Consultant') &&
           !c.category.includes('UK') &&
           !c.category.includes('Spain') &&
           !c.category.includes('Bulgaria') &&
           !c.category.includes('Slovakia'))
        )
        .reduce((sum, c) => sum + Math.abs(c.amount), 0),
      color: COLORS.other,
      count: consultantCategories.filter(c =>
        c.category.includes('Swan') ||
        c.category.includes('Bill.com') ||
        (c.category.includes('Consultant') &&
         !c.category.includes('UK') &&
         !c.category.includes('Spain') &&
         !c.category.includes('Bulgaria') &&
         !c.category.includes('Slovakia'))
      ).length
    }
  ].filter(item => item.amount > 0) // Only show categories with expenses
   .sort((a, b) => b.amount - a.amount) // Sort by amount descending

  const totalConsultantExpenses = consultantData.reduce((sum, item) => sum + item.amount, 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.amount / totalConsultantExpenses) * 100).toFixed(1)

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600 font-medium">
            ${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-gray-600 text-sm">{percentage}% of consultant expenses</p>
          <p className="text-gray-500 text-xs">{data.count} transaction{data.count !== 1 ? 's' : ''}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Consultant Expenses</h3>
        <p className="text-sm text-gray-600">Breakdown by region and service</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={consultantData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
              {consultantData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xs font-medium text-gray-500 mb-1">TOTAL CONSULTANT SPEND</div>
            <div className="text-xl font-bold text-blue-600">
              ${totalConsultantExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-gray-500 mb-1">ACTIVE REGIONS</div>
            <div className="text-xl font-bold text-gray-900">
              {consultantData.length}
            </div>
          </div>
        </div>

        {/* Top consultant callout */}
        {consultantData.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-xs font-medium text-blue-700 mb-1">LARGEST EXPENSE</div>
            <div className="text-sm font-semibold text-blue-900">
              {consultantData[0].name}: ${consultantData[0].amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-blue-600">
              {((consultantData[0].amount / totalConsultantExpenses) * 100).toFixed(1)}% of total consultant spend
            </div>
          </div>
        )}
      </div>
    </div>
  )
}