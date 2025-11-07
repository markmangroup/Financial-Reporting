'use client'

import type { ProjectMetadata } from '@/types/project'

interface ProjectDetailProps {
  project: ProjectMetadata
  onBack: () => void
}

export default function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const margin = project.financial.profitability.grossMargin
  const profit = project.financial.profitability.grossProfit

  return (
    <div className="h-full bg-gray-50 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-3 text-sm"
        >
          ← Back to Projects
        </button>

        {/* Enhanced Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 mb-4 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  project.status === 'active'
                    ? 'bg-green-500 text-white'
                    : project.status === 'completed'
                    ? 'bg-blue-400 text-white'
                    : project.status === 'cancelled'
                    ? 'bg-red-400 text-white'
                    : 'bg-gray-400 text-white'
                }`}>
                  {project.status.toUpperCase()}
                </span>
              </div>
              <p className="text-blue-100 text-sm mb-1">{project.client}</p>
              {project.description && (
                <p className="text-blue-50 text-sm mt-3 max-w-4xl leading-relaxed">{project.description}</p>
              )}
              <div className="mt-3">
                <span className="inline-block px-3 py-1 bg-white bg-opacity-20 text-white text-xs font-medium rounded-full">
                  {project.type.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Financial Overview - Enhanced Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Revenue</div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">💰</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${(project.financial.revenue / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-gray-500 mt-1">Total invoiced</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Costs</div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm">💸</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${(project.financial.costs.totalConsultantCosts / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-gray-500 mt-1">Consultant costs</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Profit</div>
              <div className={`w-8 h-8 ${profit >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                <span className={`${profit >= 0 ? 'text-green-600' : 'text-red-600'} text-sm`}>
                  {profit >= 0 ? '📈' : '📉'}
                </span>
              </div>
            </div>
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(profit / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-gray-500 mt-1">Gross profit</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Margin</div>
              <div className={`w-8 h-8 ${
                margin >= 30 ? 'bg-green-100' :
                margin >= 10 ? 'bg-yellow-100' :
                'bg-red-100'
              } rounded-full flex items-center justify-center`}>
                <span className={`${
                  margin >= 30 ? 'text-green-600' :
                  margin >= 10 ? 'text-yellow-600' :
                  'text-red-600'
                } text-sm`}>
                  {margin >= 30 ? '🎯' : margin >= 10 ? '⚡' : '⚠️'}
                </span>
              </div>
            </div>
            <div className={`text-2xl font-bold ${
              margin >= 30 ? 'text-green-600' :
              margin >= 10 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {margin.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {margin >= 30 ? 'Excellent' : margin >= 10 ? 'Good' : 'Low'}
            </div>
          </div>
        </div>

        {/* Revenue Details */}
        {project.financial.revenueDetails && project.financial.revenueDetails.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">Revenue Breakdown</h2>
            <div className="space-y-2">
              {project.financial.revenueDetails.map((detail, index) => (
                <div key={index} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{detail.invoice}</div>
                    <div className="text-xs text-gray-500">{detail.description}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-semibold text-gray-900">${(detail.amount / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-gray-500">{new Date(detail.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

        {/* Team & Consultants */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">👥 Team & Cost Allocation</h2>

          {project.team.primaryContact && (
            <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Primary Contact</span>
              <div className="text-sm font-medium text-blue-900 mt-1">{project.team.primaryContact}</div>
            </div>
          )}

          <div className="space-y-3">
            {project.financial.costs.consultants.map((consultant, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-sm font-bold">{consultant.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{consultant.name}</div>
                        <div className="text-xs text-gray-500">{consultant.sourceEvidence}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-base text-gray-900">
                      ${(consultant.allocatedCost / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block">
                      {consultant.allocationPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
                {consultant.notes && (
                  <div className="text-xs text-gray-700 mt-2 bg-gray-50 border border-gray-100 p-2 rounded">
                    💡 {consultant.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">📂 Documents</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contracts */}
            {project.documents.contracts.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1.5">
                  📜 Contracts <span className="bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full text-xs">{project.documents.contracts.length}</span>
                </h3>
                <div className="space-y-1.5">
                  {project.documents.contracts.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.sharepointUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-red-700 hover:text-red-800 hover:underline truncate bg-white px-2 py-1 rounded border border-red-100"
                    >
                      {doc.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Proposals */}
            {project.documents.proposals.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                  📋 Proposals <span className="bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full text-xs">{project.documents.proposals.length}</span>
                </h3>
                <div className="space-y-1.5">
                  {project.documents.proposals.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.sharepointUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-700 hover:text-blue-800 hover:underline truncate bg-white px-2 py-1 rounded border border-blue-100"
                    >
                      {doc.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Deliverables */}
            {project.documents.deliverables.length > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                  🎁 Deliverables <span className="bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full text-xs">{project.documents.deliverables.length}</span>
                </h3>
                <div className="space-y-1.5">
                  {project.documents.deliverables.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.sharepointUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-green-700 hover:text-green-800 hover:underline truncate bg-white px-2 py-1 rounded border border-green-100"
                    >
                      {doc.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Documentation */}
            {project.documents.documentation.length > 0 && (
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
                  📝 Documentation <span className="bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full text-xs">{project.documents.documentation.length}</span>
                </h3>
                <div className="space-y-1.5">
                  {project.documents.documentation.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.sharepointUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-purple-700 hover:text-purple-800 hover:underline truncate bg-white px-2 py-1 rounded border border-purple-100"
                    >
                      {doc.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {project.documents.contracts.length === 0 &&
           project.documents.proposals.length === 0 &&
           project.documents.deliverables.length === 0 &&
           project.documents.documentation.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm text-gray-600">No documents have been downloaded yet</p>
              <p className="text-xs text-gray-500 mt-1">Documents will appear here once synced from SharePoint</p>
            </div>
          )}
        </div>

        {/* Codebase & GitHub Repos */}
        {(project as any).codebase && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">💻 Codebase Analysis</h2>

            {/* Summary Stats */}
            {((project as any).codebase.totalFiles || (project as any).codebase.totalSizeKB || (project as any).codebase.technologies) && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {(project as any).codebase.totalFiles && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-3">
                    <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Total Files</div>
                    <div className="text-xl font-bold text-indigo-900">{(project as any).codebase.totalFiles.toLocaleString()}</div>
                  </div>
                )}
                {(project as any).codebase.totalSizeKB && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-3">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Code Size</div>
                    <div className="text-xl font-bold text-blue-900">{((project as any).codebase.totalSizeKB / 1024).toFixed(1)} MB</div>
                  </div>
                )}
                {(project as any).codebase.technologies && (project as any).codebase.technologies.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-lg p-3">
                    <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Stack</div>
                    <div className="text-base font-bold text-green-900">{(project as any).codebase.technologies[0]}</div>
                  </div>
                )}
              </div>
            )}

            {/* Repos */}
            {(project as any).codebase.repos && (project as any).codebase.repos.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <span>📦 GitHub Repositories</span>
                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{(project as any).codebase.repos.length}</span>
                </h3>
                <div className="space-y-3">
                  {(project as any).codebase.repos.map((repo: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gradient-to-r from-gray-50 to-white hover:border-blue-300 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 bg-gray-900 rounded flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                              </svg>
                            </div>
                            <a
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-sm text-gray-900 hover:text-blue-600"
                            >
                              {repo.name}
                            </a>
                          </div>
                          {repo.description && (
                            <div className="text-xs text-gray-600 mb-1.5 ml-9">{repo.description}</div>
                          )}
                          <div className="flex items-center gap-3 ml-9">
                            {repo.lastCommit && repo.lastCommit !== 'unknown' && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <span>🕒</span>
                                <span>Updated {new Date(repo.lastCommit).toLocaleDateString()}</span>
                              </div>
                            )}
                            {repo.primaryLanguage && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {repo.primaryLanguage}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4 space-y-1">
                          <div className="text-xs font-semibold text-gray-700">{repo.files.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">files</div>
                          <div className="text-xs font-semibold text-gray-700 mt-1">{(repo.size / 1024).toFixed(1)} MB</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Project Notes & Details */}
        {project.notes && project.notes.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">📝 Project Details & Highlights</h2>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <div className="space-y-2.5">
                {project.notes.map((note, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-700 text-xs font-bold">✓</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed flex-1">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {project.timeline && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">🕒 Timeline</h2>
            <div className="space-y-2.5">
              <div className="bg-green-50 border border-green-100 rounded-lg p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-green-700 text-xs">🚀</span>
                  </div>
                  <span className="text-xs font-semibold text-green-700">Start Date</span>
                </div>
                <span className="text-sm font-bold text-green-900">
                  {new Date(project.timeline.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {project.timeline.endDate && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 text-xs">🏁</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-700">End Date</span>
                  </div>
                  <span className="text-sm font-bold text-blue-900">
                    {new Date(project.timeline.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
              {project.timeline.lastActivityDate && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center">
                      <span className="text-purple-700 text-xs">📅</span>
                    </div>
                    <span className="text-xs font-semibold text-purple-700">Last Activity</span>
                  </div>
                  <span className="text-sm font-bold text-purple-900">
                    {new Date(project.timeline.lastActivityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
