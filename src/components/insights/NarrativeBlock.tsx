'use client'

import { useState } from 'react'
import { NarrativeSection, VisualizationConfig } from '@/lib/insights/insightTypes'
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface NarrativeBlockProps {
  section: NarrativeSection
  index: number
}

export default function NarrativeBlock({ section, index }: NarrativeBlockProps) {
  const animationDelay = `${index * 100}ms`
  const [showOtherModal, setShowOtherModal] = useState(false)
  const [otherCategories, setOtherCategories] = useState<any[]>([])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleBarClick = (data: any) => {
    if (data && data.isAggregate && data.aggregatedCategories) {
      setOtherCategories(data.aggregatedCategories)
      setShowOtherModal(true)
    }
  }

  const renderVisualization = (viz: VisualizationConfig) => {
    const colors = viz.config?.colors || ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']

    switch (viz.type) {
      case 'bar':
        return (
          <>
            <div className="relative">
              <ResponsiveContainer width="100%" height={Math.max(viz.data.length * 60, 250)}>
                <BarChart
                  data={viz.data}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => viz.config?.format === 'currency' ? `$${(value / 1000).toFixed(0)}k` : value}
                    fontSize={11}
                  />
                  <YAxis
                    type="category"
                    dataKey={viz.config?.xKey || 'category'}
                    fontSize={11}
                    width={110}
                  />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 pointer-events-none">
                            <div className="flex items-center space-x-2 mb-2">
                              {data.icon && <span className="text-xl">{data.icon}</span>}
                              <p className="font-semibold text-gray-900">{data.category}</p>
                            </div>
                            <p className="text-sm font-bold" style={{ color: data.color }}>
                              {formatCurrency(data.amount)}
                            </p>
                            {data.percentage && (
                              <p className="text-xs text-gray-600">
                                {data.percentage.toFixed(1)}% of total
                              </p>
                            )}
                            {data.isAggregate && (
                              <p className="text-xs text-blue-600 mt-2 font-semibold">
                                👆 Click bar to see breakdown
                              </p>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey={viz.config?.yKey || 'amount'}
                    radius={[0, 8, 8, 0]}
                    onClick={(data) => handleBarClick(data)}
                  >
                    {viz.data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || colors[index % colors.length]}
                        cursor={entry.isAggregate ? 'pointer' : 'default'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Helper text for Other category */}
              {viz.data.some((d: any) => d.isAggregate) && (
                <div className="text-xs text-gray-500 mt-2 text-center italic">
                  💡 Tip: Click the &quot;Other&quot; bar to see all remaining categories
                </div>
              )}
            </div>

            {/* Other Categories Modal */}
            {showOtherModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">Other Expense Categories</h3>
                        <p className="text-blue-100 text-sm mt-1">
                          {otherCategories.length} additional categories
                        </p>
                      </div>
                      <button
                        onClick={() => setShowOtherModal(false)}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                    <div className="space-y-2">
                      {otherCategories.map((cat: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{cat.icon}</span>
                            <span className="font-medium text-gray-900">{cat.name}</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(cat.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={viz.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${entry.percentage?.toFixed(1) || 0}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {viz.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'metric-cards':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {viz.data.map((metric: any, idx: number) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="text-2xl mb-1">{metric.icon}</div>
                <div className="text-xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">{metric.label}</div>
              </div>
            ))}
          </div>
        )

      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-200">
                {viz.data.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{row.label}</td>
                    <td className="px-4 py-3 text-sm font-medium text-right text-gray-900">{row.value}</td>
                    {row.percentage && (
                      <td className="px-4 py-3 text-sm text-right text-gray-500">{row.percentage}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      default:
        return null
    }
  }

  switch (section.type) {
    case 'metric':
      return (
        <div
          className="prose prose-lg max-w-none animate-fade-in"
          style={{ animationDelay }}
        >
          <p className="text-gray-700 leading-relaxed"
             dangerouslySetInnerHTML={{ __html: section.content?.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>') || '' }}
          />
        </div>
      )

    case 'chart':
      return (
        <div
          className="bg-white rounded-lg border border-gray-200 p-3 animate-slide-up h-full"
          style={{ animationDelay }}
        >
          {section.title && (
            <h3 className="text-sm font-bold text-gray-900 mb-2">{section.title}</h3>
          )}
          {section.visualization && renderVisualization(section.visualization)}
        </div>
      )

    case 'breakdown':
      return section.data && section.data.length > 0 ? (
        <div
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3 animate-slide-up h-full"
          style={{ animationDelay }}
        >
          {section.title && (
            <h3 className="text-sm font-bold text-gray-900 mb-2">{section.title}</h3>
          )}
          <div className="space-y-1.5">
            {section.data.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-2 bg-white rounded-lg border border-blue-100 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-0.5">
                  <span className="text-sm font-semibold text-gray-900 flex-1">{item.name}</span>
                  <span className="text-sm font-bold text-blue-600 ml-2">
                    {typeof item.amount === 'number' ? formatCurrency(item.amount) : item.amount}
                  </span>
                </div>
                {item.detail && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.detail}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null

    case 'callout':
      const getCalloutStyle = () => {
        const content = section.content || ''
        if (content.includes('✅')) return 'from-green-50 to-emerald-50 border-green-200'
        if (content.includes('⚠️')) return 'from-yellow-50 to-amber-50 border-yellow-200'
        if (content.includes('🚨')) return 'from-red-50 to-rose-50 border-red-200'
        return 'from-blue-50 to-indigo-50 border-blue-200'
      }

      return (
        <div
          className={`bg-gradient-to-br ${getCalloutStyle()} rounded-lg border p-2 animate-fade-in`}
          style={{ animationDelay }}
        >
          <div
            className="text-xs leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: section.content?.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>') || ''
            }}
          />
        </div>
      )

    case 'list':
      return section.data ? (
        <div
          className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-slide-up h-full"
          style={{ animationDelay }}
        >
          {section.title && (
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
            </div>
          )}
          <div className="divide-y divide-gray-200">
            {section.data.map((item: any, idx: number) => (
              <div key={idx} className="px-3 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <span className="text-xs font-medium text-gray-900">{item.label}</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{item.value}</div>
                  {item.percentage && (
                    <div className="text-xs text-gray-500">{item.percentage}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null

    default:
      return null
  }
}
