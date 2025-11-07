'use client'

import { useState } from 'react'

interface DualViewLayoutProps {
  title: string
  subtitle: string
  traditionalView: React.ReactNode
  visualView: React.ReactNode
  heroView?: React.ReactNode
}

type ViewMode = 'traditional' | 'visual' | 'side-by-side' | 'hero'

export default function DualViewLayout({
  title,
  subtitle,
  traditionalView,
  visualView,
  heroView
}: DualViewLayoutProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side')

  const ViewToggle = () => (
    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
      <button
        onClick={() => setViewMode('side-by-side')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
          viewMode === 'side-by-side'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        📈 Dual View
      </button>
      {heroView && (
        <button
          onClick={() => setViewMode('hero')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            viewMode === 'hero'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ✨ Magazine
        </button>
      )}
      <button
        onClick={() => setViewMode('traditional')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
          viewMode === 'traditional'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        📊 Traditional
      </button>
      <button
        onClick={() => setViewMode('visual')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
          viewMode === 'visual'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        🎨 Visual
      </button>
    </div>
  )

  const renderContent = () => {
    switch (viewMode) {
      case 'hero':
        return heroView ? (
          <div className="w-full -mx-6 -mt-6">
            {heroView}
          </div>
        ) : null
      case 'traditional':
        return (
          <div className="w-full">
            {traditionalView}
          </div>
        )
      case 'visual':
        return (
          <div className="w-full">
            {visualView}
          </div>
        )
      case 'side-by-side':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  📊 Traditional View
                </span>
              </div>
              {traditionalView}
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🎨 Visual Dashboard
                </span>
              </div>
              {visualView}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={viewMode === 'hero' ? 'w-full' : 'p-6 max-w-full mx-auto'}>
      {/* Header - Hidden for hero view */}
      {viewMode !== 'hero' && (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-6">{subtitle}</p>
          <ViewToggle />
        </div>
      )}

      {/* Hero view toggle - floating */}
      {viewMode === 'hero' && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <ViewToggle />
        </div>
      )}

      {/* Content */}
      <div className="w-full">
        {renderContent()}
      </div>

      {/* Footer insights for dual view */}
      {viewMode === 'side-by-side' && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-indigo-600 font-medium">💡 Dual View Insights</span>
            </div>
            <div className="text-sm text-indigo-800">
              The traditional tabular view provides audit-level detail and precise calculations,
              while the visual dashboard reveals patterns, trends, and insights at a glance.
              Together, they offer both analytical rigor and executive-level comprehension.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}