'use client'

import { useState, useEffect } from 'react'
import ContractorCosts from './ContractorCosts'
import { Consultant, ConsultantSummary } from '@/lib/consultantDataLoader'

export default function ContractorCostsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [summary, setSummary] = useState<ConsultantSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/consultants')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setConsultants(data.consultants)
          setSummary(data.summary)
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Loading contractor data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-red-800 font-semibold mb-2">Error Loading Data</div>
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-2xl mb-2">📄</div>
          <div className="text-gray-800 font-semibold mb-2">No Contractor Data</div>
          <div className="text-gray-600 text-sm">No consultant subledger data available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <ContractorCosts consultants={consultants} summary={summary} />
    </div>
  )
}
