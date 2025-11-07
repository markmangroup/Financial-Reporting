'use client'

import { useState } from 'react'
import EmailAnalysisButton from '@/components/consultant/EmailAnalysisButton'

export default function TestEmailAnalysisPage() {
  const [selectedConsultant, setSelectedConsultant] = useState('Swan')

  const consultants = [
    { name: 'Swan', email: 'contact@swansoftweb.com' },
    { name: 'Niki', email: '' },
    { name: 'Abri', email: 'abri@markmanassociates.com' },
    { name: 'Carmen', email: '' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📧 Email Analysis Test
          </h1>
          <p className="text-gray-600 mb-8">
            Extract project details and deliverables from Outlook emails
          </p>

          {/* Consultant Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Consultant
            </label>
            <select
              value={selectedConsultant}
              onChange={(e) => setSelectedConsultant(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {consultants.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} {c.email ? `(${c.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Analysis Button */}
          <div className="mb-6">
            <EmailAnalysisButton
              consultantName={selectedConsultant}
              consultantEmail={consultants.find(c => c.name === selectedConsultant)?.email}
              onAnalysisComplete={(data) => {
                console.log('Analysis complete:', data)
              }}
            />
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              📝 Setup Required
            </h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Go to <a href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/01af3f85-883a-4485-b0a5-39dee5cacac6" target="_blank" className="underline">Azure AD App Registration</a></li>
              <li>2. Add <strong>Mail.Read</strong> API permission under Microsoft Graph</li>
              <li>3. Grant admin consent for the permission</li>
              <li>4. Click "Analyze Outlook Emails" to extract work history</li>
            </ol>
          </div>

          {/* How It Works */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              🔍 How It Works
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Searches your Outlook mailbox for emails from/to consultant</li>
              <li>• Extracts project names, deliverables, and timeline</li>
              <li>• Caches results to <code className="text-xs bg-gray-200 px-1 rounded">public/data/consultant-work-history/</code></li>
              <li>• Makes data available in consultant detail insights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
