'use client'

import { useState } from 'react'

interface EmailAnalysisButtonProps {
  consultantName: string
  consultantEmail?: string
  onAnalysisComplete?: (data: any) => void
}

export default function EmailAnalysisButton({
  consultantName,
  consultantEmail,
  onAnalysisComplete,
}: EmailAnalysisButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const params = new URLSearchParams({
        name: consultantName,
      })
      if (consultantEmail) {
        params.append('email', consultantEmail)
      }

      const response = await fetch(`/api/consultant-work-history?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze emails')
      }

      setResult(data)
      if (onAnalysisComplete) {
        onAnalysisComplete(data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        {isAnalyzing ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Analyzing emails...</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Analyze Outlook Emails</span>
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">❌ {error}</p>
          <p className="text-xs text-red-600 mt-1">
            Make sure Mail.Read permission is granted in Azure AD app registration
          </p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
          <div className="flex items-center space-x-2 text-green-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">Analysis Complete!</span>
          </div>
          <p className="text-sm text-green-800">{result.message}</p>
          {result.projects && result.projects.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-green-900 mb-1">Projects Found:</p>
              <ul className="text-xs text-green-800 space-y-1">
                {result.projects.slice(0, 5).map((project: string, idx: number) => (
                  <li key={idx}>• {project}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
