'use client'

import SharePointSyncButton from '../sharepoint/SharePointSyncButton'

interface NavigationProps {
  activeTab: 'insights' | 'projects' | 'operating' | 'income-statement' | 'balance-sheet' | 'cash-flow' | 'analytics' | 'currencies'
  onTabChange: (tab: 'insights' | 'projects' | 'operating' | 'income-statement' | 'balance-sheet' | 'cash-flow' | 'analytics' | 'currencies') => void
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-full px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Markman Group Financial Dashboard
            </h1>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-6">
            <button
              onClick={() => onTabChange('insights')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'insights'
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-300 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              💡 Insights
            </button>
            <button
              onClick={() => onTabChange('projects')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'projects'
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📁 Projects
            </button>
            <button
              onClick={() => onTabChange('operating')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'operating'
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Operating
            </button>
            <button
              onClick={() => onTabChange('income-statement')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'income-statement'
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Income Statement
            </button>
            <button
              onClick={() => onTabChange('balance-sheet')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'balance-sheet'
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Balance Sheet
            </button>
            <button
              onClick={() => onTabChange('cash-flow')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'cash-flow'
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Cash Flow
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-300 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => onTabChange('currencies')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'currencies'
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Currencies
            </button>
          </nav>

          {/* Additional Actions */}
          <div className="flex items-center space-x-4">
            <a
              href="/review-consultant-emails"
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              title="Review consultant emails and extract project details"
            >
              📧 Review Emails
            </a>
            <SharePointSyncButton />
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}