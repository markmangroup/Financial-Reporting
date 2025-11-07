'use client'

import { useState } from 'react'

export default function SharePointSyncButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async (dataType: 'test' | 'income' | 'folders') => {
    setIsSyncing(true)
    setError(null)
    setSyncResult(null)

    try {
      const response = await fetch('/api/sharepoint/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed')
      }

      setSyncResult(data)
      setLastSync(new Date())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <>
      {/* Sync Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Sync from SharePoint
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">SharePoint Data Sync</h3>
                  <p className="text-blue-100 text-sm mt-1">
                    Sync financial data from your SharePoint site
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Test Connection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">1. Test Connection</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Verify that SharePoint credentials are configured correctly
                </p>
                <button
                  onClick={() => handleSync('test')}
                  disabled={isSyncing}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSyncing ? 'Testing...' : 'Test Connection'}
                </button>
              </div>

              {/* Sync Income Files */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">2. Sync Income Files</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Download invoice data from Laurel AG and Metropolitan folders
                </p>
                <button
                  onClick={() => handleSync('income')}
                  disabled={isSyncing}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSyncing ? 'Syncing...' : 'Sync Income Data'}
                </button>
              </div>

              {/* Browse Folders */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">3. Browse Available Data</h4>
                <p className="text-sm text-gray-600 mb-3">
                  View all available folders and files in SharePoint
                </p>
                <button
                  onClick={() => handleSync('folders')}
                  disabled={isSyncing}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSyncing ? 'Loading...' : 'Browse Folders'}
                </button>
              </div>

              {/* Result Display */}
              {syncResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h5 className="font-semibold text-green-900">Success!</h5>
                      <pre className="text-xs text-green-700 mt-2 bg-white p-3 rounded overflow-auto">
                        {JSON.stringify(syncResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h5 className="font-semibold text-red-900">Error</h5>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                      {error.includes('not configured') && (
                        <div className="mt-3 text-sm text-red-600">
                          <p className="font-medium">Setup Required:</p>
                          <ol className="list-decimal list-inside mt-2 space-y-1">
                            <li>Create Azure AD App Registration</li>
                            <li>Add credentials to .env.local file</li>
                            <li>Restart the development server</li>
                          </ol>
                          <p className="mt-2">
                            See <code className="bg-red-100 px-2 py-1 rounded">docs/SHAREPOINT_SETUP.md</code> for detailed instructions
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Last Sync Time */}
              {lastSync && (
                <div className="text-sm text-gray-500 text-center">
                  Last synced: {lastSync.toLocaleString()}
                </div>
              )}

              {/* Help Text */}
              <div className="text-sm text-gray-500 text-center pt-4 border-t">
                <p>Need help setting up SharePoint integration?</p>
                <p className="mt-1">
                  See <code className="bg-gray-100 px-2 py-1 rounded text-xs">docs/SHAREPOINT_SETUP.md</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
