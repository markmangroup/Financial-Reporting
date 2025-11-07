'use client'

import type { ProjectMetadata } from '@/types/project'

interface ProjectCardProps {
  project: ProjectMetadata
  onClick: () => void
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const margin = project.financial.profitability.grossMargin
  const profit = project.financial.profitability.grossProfit

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    'on-hold': 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700'
  }

  const typeIcons = {
    'application-development': '💻',
    'process-discovery': '🔍',
    'data-engineering': '⚙️',
    'reporting-analytics': '📊',
    'process-automation': '🤖'
  }

  const totalDocs =
    project.documents.contracts.length +
    project.documents.proposals.length +
    project.documents.deliverables.length +
    project.documents.documentation.length

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all text-left w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeIcons[project.type as keyof typeof typeIcons] || '📁'}</span>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              statusColors[project.status]
            }`}
          >
            {project.status}
          </span>
        </div>
        {totalDocs > 0 && (
          <span className="text-sm text-gray-500">
            📄 {totalDocs}
          </span>
        )}
      </div>

      {/* Project Name & Client */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
        {project.name}
      </h3>
      <p className="text-sm text-gray-600 mb-4">{project.client}</p>

      {/* Financials */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Revenue</div>
          <div className="text-sm font-semibold text-gray-900">
            ${(project.financial.revenue / 1000).toFixed(0)}K
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Margin</div>
          <div
            className={`text-sm font-semibold ${
              margin >= 30
                ? 'text-green-600'
                : margin >= 10
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {margin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span>👥</span>
        <span>
          {project.team.consultants.length} consultant{project.team.consultants.length !== 1 ? 's' : ''}
        </span>
      </div>
    </button>
  )
}
