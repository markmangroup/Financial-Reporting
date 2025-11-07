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

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-600 mt-0.5">{project.client}</p>
            {project.description && (
              <p className="text-xs text-gray-500 mt-1 max-w-3xl">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              project.status === 'active'
                ? 'bg-green-100 text-green-700'
                : project.status === 'completed'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {project.status}
            </span>
            <span className="text-xs text-gray-500 capitalize">{project.type.replace(/-/g, ' ')}</span>
          </div>
        </div>
        {/* Financial Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">Financial Performance</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">Revenue</div>
              <div className="text-lg font-bold text-gray-900">
                ${(project.financial.revenue / 1000).toFixed(0)}K
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">Costs</div>
              <div className="text-lg font-bold text-gray-900">
                ${(project.financial.costs.totalConsultantCosts / 1000).toFixed(0)}K
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">Profit</div>
              <div className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(profit / 1000).toFixed(0)}K
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">Margin</div>
              <div className={`text-lg font-bold ${
                margin >= 30 ? 'text-green-600' :
                margin >= 10 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {margin.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Revenue Details */}
          {project.financial.revenueDetails && project.financial.revenueDetails.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Revenue Breakdown</h3>
              <div className="space-y-1">
                {project.financial.revenueDetails.map((detail, index) => (
                  <div key={index} className="flex items-center justify-between text-xs border-b border-gray-100 pb-1">
                    <div>
                      <span className="font-medium text-gray-900">{detail.invoice}</span>
                      <span className="text-gray-500 ml-2">{detail.description}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{new Date(detail.date).toLocaleDateString()}</span>
                      <span className="font-semibold text-gray-900">${(detail.amount / 1000).toFixed(1)}K</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Team & Consultants */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">Team & Cost Allocation</h2>

          {project.team.primaryContact && (
            <div className="mb-3">
              <span className="text-xs text-gray-600">Primary Contact: </span>
              <span className="text-xs font-medium text-gray-900">{project.team.primaryContact}</span>
            </div>
          )}

          <div className="space-y-2">
            {project.financial.costs.consultants.map((consultant, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-2">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{consultant.name}</div>
                    <div className="text-xs text-gray-500">{consultant.sourceEvidence}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-gray-900">
                      ${(consultant.allocatedCost / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-gray-500">
                      {consultant.allocationPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
                {consultant.notes && (
                  <div className="text-xs text-gray-600 mt-1 bg-gray-50 p-1.5 rounded">
                    {consultant.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">Documents</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contracts */}
            {project.documents.contracts.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  📜 Contracts ({project.documents.contracts.length})
                </h3>
                <div className="space-y-1">
                  {project.documents.contracts.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.sharepointUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:text-blue-700 hover:underline truncate"
                    >
                      {doc.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Proposals */}
            {project.documents.proposals.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  📋 Proposals ({project.documents.proposals.length})
                </h3>
                <div className="space-y-1">
                  {project.documents.proposals.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.sharepointUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:text-blue-700 hover:underline truncate"
                    >
                      {doc.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Deliverables */}
            {project.documents.deliverables.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  🎁 Deliverables ({project.documents.deliverables.length})
                </h3>
                <div className="space-y-1">
                  {project.documents.deliverables.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.sharepointUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:text-blue-700 hover:underline truncate"
                    >
                      {doc.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Documentation */}
            {project.documents.documentation.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  📝 Documentation ({project.documents.documentation.length})
                </h3>
                <div className="space-y-1">
                  {project.documents.documentation.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.sharepointUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:text-blue-700 hover:underline truncate"
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
            <p className="text-xs text-gray-500 text-center py-4">No documents have been downloaded yet</p>
          )}
        </div>

        {/* Codebase & GitHub Repos */}
        {(project as any).codebase && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">💻 Codebase</h2>

            {/* Summary Stats */}
            {((project as any).codebase.totalFiles || (project as any).codebase.totalSizeKB || (project as any).codebase.technologies) && (
              <div className="grid grid-cols-3 gap-3 mb-4 bg-gray-50 p-3 rounded-lg">
                {(project as any).codebase.totalFiles && (
                  <div>
                    <div className="text-xs text-gray-600">Total Files</div>
                    <div className="text-base font-bold text-gray-900">{(project as any).codebase.totalFiles.toLocaleString()}</div>
                  </div>
                )}
                {(project as any).codebase.totalSizeKB && (
                  <div>
                    <div className="text-xs text-gray-600">Size</div>
                    <div className="text-base font-bold text-gray-900">{((project as any).codebase.totalSizeKB / 1024).toFixed(1)} MB</div>
                  </div>
                )}
                {(project as any).codebase.technologies && (project as any).codebase.technologies.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-600">Technology</div>
                    <div className="text-base font-bold text-gray-900">{(project as any).codebase.technologies[0]}</div>
                  </div>
                )}
              </div>
            )}

            {/* Repos */}
            {(project as any).codebase.repos && (project as any).codebase.repos.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2">GitHub Repositories ({(project as any).codebase.repos.length})</h3>
                <div className="space-y-2">
                  {(project as any).codebase.repos.map((repo: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-sm text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {repo.name}
                          </a>
                          {repo.description && (
                            <div className="text-xs text-gray-600 mt-0.5">{repo.description}</div>
                          )}
                          {repo.lastCommit && repo.lastCommit !== 'unknown' && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              Last updated: {new Date(repo.lastCommit).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-600 ml-3">
                          <div>{repo.files.toLocaleString()} files</div>
                          <div>{(repo.size / 1024).toFixed(1)} MB</div>
                          {repo.primaryLanguage && (
                            <div className="mt-1">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {repo.primaryLanguage}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        {project.timeline && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">Timeline</h2>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Start Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(project.timeline.startDate).toLocaleDateString()}
                </span>
              </div>
              {project.timeline.endDate && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">End Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(project.timeline.endDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {project.timeline.lastActivityDate && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Last Activity</span>
                  <span className="font-medium text-gray-900">
                    {new Date(project.timeline.lastActivityDate).toLocaleDateString()}
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
