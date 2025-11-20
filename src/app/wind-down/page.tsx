'use client'

import { useState } from 'react'

export default function WindDownPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedItems(newChecked)
  }

  // Remaining Actions - Do Before March 2026
  const remainingActions = [
    { id: 'sharepoint-final', action: 'Final SharePoint backup before March 2026', detail: 'Check Carmen\'s OneDrive, download any remaining docs', date: 'Before 3/15/2026' },
    { id: 'ms-license-verify', action: 'Verify Microsoft license goes to Mike (not Carmen)', detail: 'Confirm before 3/15/2026 when it drops to 1', date: 'Before 3/15/2026' },
  ]

  // Lower Priority - Handle When Ready
  const laterActions = [
    { id: 'rent', action: 'Move Highland rent to personal card', contact: 'YSI Property Management', amount: '$8,730/mo', phone: 'TBD' },
    { id: 'duke', action: 'Transfer Duke Energy to personal', contact: 'Duke Energy', amount: '$125/mo', phone: '800-777-9898' },
  ]

  // Completed Items
  const completedItems = [
    { id: 'ms-backup', action: 'SharePoint backup completed', detail: '46 critical documents backed up', date: '2025-11-10' },
    { id: 'ms-cancel', action: 'Microsoft 365 licenses reduced (11→1)', detail: 'Effective 3/15/2026 - Saving $237.60/mo', date: '2025-11-10' },
    { id: 'midjourney', action: 'Midjourney cancelled', detail: 'Saving $30/mo', date: '2025-11-10' },
    { id: 'anthropic', action: 'Anthropic/Claude moved to personal card', detail: 'No longer business expense (~$600/mo)', date: '2025-11-10' },
    { id: 'openai', action: 'OpenAI ChatGPT moved to personal card', detail: 'No longer business expense ($200/mo)', date: '2025-11-10' },
    { id: 'youtube', action: 'YouTube TV already on personal card', detail: 'No longer business expense ($112/mo)', date: 'Before 2025-11-10' },
    { id: 'github', action: 'GitHub downgraded to Free (was 8 seats)', detail: 'Saving $32/mo - Removed 7 contractor seats + downgraded to free!', date: '2025-11-10' },
    { id: 'vercel', action: 'Vercel downgraded to Free "Hobby" plan', detail: 'No longer business expense ($20/mo)', date: '2025-11-10' },
    { id: 'att', action: 'AT&T canceled (fighting for refund)', detail: 'Saving $75/mo + seeking $1,032.65 refund for unused service', date: '2025-11-10' },
    { id: 'fiber', action: 'Google Fiber moved to personal', detail: 'No longer business expense ($70/mo)', date: '2025-11-10' },
  ]

  // Contractor Status - Nearly Complete
  const contractors = [
    { id: 'niky', name: 'Nikoleta Nôtová - NikyN', amount: '$12,300', status: 'Paid 11/06/2025', country: 'Slovakia' },
    { id: 'nikola', name: 'Nikola Draganov', amount: '$2,880', status: 'Paid 11/06/2025', country: 'Bulgaria' },
    { id: 'trusted', name: 'Trusted Ltd', amount: '$1,310', status: 'Paid 11/06/2025', country: 'Bulgaria' },
    { id: 'ivana', name: 'Ivana Kmecová', amount: '$2,677.50', status: 'Paid 09/08/2025', country: 'Slovakia' },
    { id: 'teiz', name: 'Inversiones Teiz, S.L', amount: '$1,010.50', status: 'Paid 10/03/2025', country: 'Spain' },
    { id: 'jan', name: 'Jan Dzubak', amount: '$682', status: 'Paid 10/03/2025', country: 'Unknown' },
    { id: 'niko', name: 'Niko - Potential Final Payment', amount: '$495', status: 'Pending via Bill.com', country: 'TBD' },
  ]

  // Final Steps - Week 9-10
  const finalSteps = [
    { id: 'export-data', action: 'Export all financial dashboard data' },
    { id: 'billcom-close', action: 'Close Bill.com account' },
    { id: 'chase-transfer', action: 'Transfer final Chase funds to personal' },
    { id: 'chase-checking', action: 'Close Chase checking account', savings: '$95/mo' },
    { id: 'chase-card', action: 'Cancel Chase credit card', savings: '$195/year' },
    { id: 'llc-dissolve', action: 'File NC LLC dissolution (if needed)' },
  ]

  const calculateProgress = () => {
    const total = remainingActions.length + laterActions.length + finalSteps.length
    const completed = completedItems.length + checkedItems.size
    return Math.round((completed / (total + completedItems.length)) * 100)
  }

  const calculateSavings = () => {
    let monthly = 237.60 + 30 + 32 + 20 + 75 + 70 // Microsoft + Midjourney + GitHub + Vercel + AT&T + Google Fiber
    if (checkedItems.has('chase-checking')) monthly += 95
    return monthly
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Markman Group Wind-Down</h1>
              <p className="text-orange-100 mt-2">Systematic business closure plan</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Progress</div>
              <div className="text-4xl font-bold">{calculateProgress()}%</div>
              <div className="text-sm opacity-90">Complete</div>
            </div>
          </div>
        </div>

        {/* Savings Tracker */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Target Monthly Savings</div>
            <div className="text-2xl font-bold text-green-600">$1,149</div>
            <div className="text-xs text-gray-400">$13,788/year</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Completed Savings</div>
            <div className="text-2xl font-bold text-blue-600">${calculateSavings()}</div>
            <div className="text-xs text-gray-400">${calculateSavings() * 12}/year</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Remaining Actions</div>
            <div className="text-2xl font-bold text-orange-600">
              {remainingActions.length + laterActions.length + finalSteps.length - checkedItems.size}
            </div>
            <div className="text-xs text-gray-400">out of {remainingActions.length + laterActions.length + finalSteps.length}</div>
          </div>
        </div>

        {/* 📋 REMAINING ACTIONS - Do Before March 2026 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="bg-blue-500 text-white px-6 py-3 rounded-t-lg">
            <h2 className="text-xl font-bold">📋 REMAINING ACTIONS - Do Before March 2026</h2>
            <p className="text-sm text-blue-100 mt-1">Final SharePoint backup + license verification</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Done</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {remainingActions.map((item) => (
                  <tr key={item.id} className={checkedItems.has(item.id) ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={checkedItems.has(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.action}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.detail}</td>
                    <td className="px-6 py-4 text-sm text-orange-600 font-semibold">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ COMPLETED */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="bg-gray-700 text-white px-6 py-3 rounded-t-lg">
            <h2 className="text-xl font-bold">✅ COMPLETED - Business Expenses Eliminated</h2>
            <p className="text-sm text-gray-300 mt-1">
              Actual Savings: $464.60/mo | Moved to Personal: ~$912/mo | Total Business Reduction: $1,376.60/mo
            </p>
          </div>
          <div className="p-6 space-y-4">
            {completedItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 border-b border-gray-100 pb-4 last:border-0">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{item.action}</div>
                  <div className="text-sm text-gray-500">{item.detail}</div>
                  <div className="text-xs text-gray-400 mt-1">Completed: {item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🌍 CONTRACTOR STATUS */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="bg-green-500 text-white px-6 py-3 rounded-t-lg">
            <h2 className="text-xl font-bold">🌍 CONTRACTOR PAYMENTS - Nearly Complete</h2>
            <p className="text-sm text-green-100 mt-1">$20,860 paid • Only $495 to Niko remaining (via Bill.com)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">✓</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contractors.map((contractor) => (
                  <tr key={contractor.id} className={checkedItems.has(contractor.id) ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={checkedItems.has(contractor.id)}
                        onChange={() => toggleItem(contractor.id)}
                        className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{contractor.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{contractor.country}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{contractor.amount}</td>
                    <td className="px-6 py-4 text-sm text-green-600">{contractor.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-green-50 border-t border-green-200 px-6 py-4">
            <p className="text-sm text-green-900">
              <strong>Status:</strong> All contractors paid except potential $495 to Niko (via Bill.com). Nearly complete!
            </p>
          </div>
        </div>

        {/* 🏠 LOWER PRIORITY - Handle Later */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="bg-gray-500 text-white px-6 py-3 rounded-t-lg">
            <h2 className="text-xl font-bold">🏠 LOWER PRIORITY - Handle These Later</h2>
            <p className="text-sm text-gray-100 mt-1">Utilities & rent - do at your convenience</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Done</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {laterActions.map((item) => (
                  <tr key={item.id} className={checkedItems.has(item.id) ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={checkedItems.has(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.action}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.contact}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.amount}</td>
                    <td className="px-6 py-4 text-sm text-blue-600">{item.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🏦 FINAL STEPS */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="bg-purple-500 text-white px-6 py-3 rounded-t-lg">
            <h2 className="text-xl font-bold">🏦 FINAL STEPS - Week 9-10 (DO LAST)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Done</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {finalSteps.map((item) => (
                  <tr key={item.id} className={checkedItems.has(item.id) ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={checkedItems.has(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.action}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">{item.savings || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Plan & Execution Tracker */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📋 EXECUTION DOCUMENTS</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white rounded p-3">
              <div>
                <div className="font-medium text-blue-900">Your Action Plan</div>
                <div className="text-sm text-blue-700">Step-by-step instructions for completing each action</div>
              </div>
              <a
                href="/WIND-DOWN-ACTION-PLAN.md"
                target="_blank"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View Action Plan
              </a>
            </div>
            <div className="flex items-center justify-between bg-white rounded p-3">
              <div>
                <div className="font-medium text-blue-900">Execution Tracker (Detailed)</div>
                <div className="text-sm text-blue-700">Complete tracker with visual proof requirements</div>
              </div>
              <a
                href="/data/wind-down-execution-tracker.md"
                target="_blank"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View Full Tracker
              </a>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="text-sm text-yellow-800">
                <strong>📸 Visual Proof:</strong> Save screenshots to <code className="bg-yellow-100 px-2 py-1 rounded text-xs">/data/wind-down-proof/</code> as you complete each action
              </div>
            </div>
          </div>
        </div>

        {/* Critical Warnings */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-900 mb-3">⚠️ CRITICAL WARNINGS</h3>
          <div className="space-y-2 text-sm text-red-800">
            <div className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span><strong>✅ SharePoint Backup Complete</strong> - 46 critical documents backed up. Microsoft licenses can be safely reduced.</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span><strong>Carmen&apos;s License Expires 3/15/2026</strong> - Only 1 license will remain. Decide before March who keeps the final license.</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span><strong>Don&apos;t cancel credit card</strong> until all recurring payments are moved (Highland, Duke, Google Fiber).</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span><strong>Close bank accounts LAST</strong> - After all contractors are paid and data is exported.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
