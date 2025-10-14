'use client'

import { useState } from 'react'

interface NavigationProps {
  activeTab: 'operating' | 'currencies'
  onTabChange: (tab: 'operating' | 'currencies') => void
  storageInfo?: {
    hasData: boolean
    dataAge: number
    isStale: boolean
    lastUpdated: string
  }
}

export default function Navigation({ activeTab, onTabChange, storageInfo }: NavigationProps) {
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
          <nav className="flex space-x-8">
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
            {storageInfo?.hasData && (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  storageInfo.isStale ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="text-xs text-gray-500">
                  {storageInfo.isStale ? 'Data stale' : 'Data saved'}
                </div>
              </div>
            )}
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