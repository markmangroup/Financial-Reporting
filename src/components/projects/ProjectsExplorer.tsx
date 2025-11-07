'use client'

import { useState, useEffect } from 'react'
import type { ProjectMetadata } from '@/types/project'
import ProjectCard from './ProjectCard'
import ProjectDetail from './ProjectDetail'

interface ProjectsExplorerProps {
  projects: ProjectMetadata[]
}

export default function ProjectsExplorer({ projects }: ProjectsExplorerProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectMetadata | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      searchQuery === '' ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.team.consultants.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = filterStatus === 'all' || project.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Calculate summary stats
  const totalRevenue = filteredProjects.reduce((sum, p) => sum + p.financial.revenue, 0)
  const totalCosts = filteredProjects.reduce((sum, p) => sum + p.financial.costs.totalConsultantCosts, 0)
  const totalProfit = totalRevenue - totalCosts
  const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    )
  }

  return (
    <div className="h-full bg-gray-50 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header with Inline Stats */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-xs text-gray-500 mt-0.5">{filteredProjects.length} projects</p>
          </div>

          {/* Inline Summary Stats */}
          <div className="flex items-center gap-4 bg-white rounded-lg px-4 py-2 border border-gray-200">
            <div>
              <div className="text-xs text-gray-500">Total Revenue</div>
              <div className="text-base font-bold text-gray-900">${(totalRevenue / 1000).toFixed(0)}K</div>
            </div>
            <div className="border-l border-gray-200 pl-4">
              <div className="text-xs text-gray-500">Total Costs</div>
              <div className="text-base font-bold text-gray-900">${(totalCosts / 1000).toFixed(0)}K</div>
            </div>
            <div className="border-l border-gray-200 pl-4">
              <div className="text-xs text-gray-500">Total Profit</div>
              <div className={`text-base font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(totalProfit / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="border-l border-gray-200 pl-4">
              <div className="text-xs text-gray-500">Avg Margin</div>
              <div className={`text-base font-bold ${
                avgMargin >= 30 ? 'text-green-600' :
                avgMargin >= 10 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {avgMargin.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Compact Search and Filters */}
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            placeholder="Search projects, clients, or consultants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex gap-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Compact Table View */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Project</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Client</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Type</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Revenue</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Costs</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Profit</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Margin</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Team</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Docs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((project) => {
                const profit = project.financial.profitability.grossProfit
                const margin = project.financial.profitability.grossMargin
                const totalDocs = project.documents.contracts.length +
                                 project.documents.proposals.length +
                                 project.documents.deliverables.length +
                                 project.documents.documentation.length

                return (
                  <tr
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-sm text-gray-900">{project.name}</div>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{project.client}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 capitalize">
                      {project.type.replace(/-/g, ' ')}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : project.status === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-gray-900">
                      ${(project.financial.revenue / 1000).toFixed(0)}K
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm text-gray-600">
                      ${(project.financial.costs.totalConsultantCosts / 1000).toFixed(0)}K
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold">
                      <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${(profit / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm font-bold">
                      <span className={
                        margin >= 30 ? 'text-green-600' :
                        margin >= 10 ? 'text-yellow-600' :
                        'text-red-600'
                      }>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs text-gray-500">
                      {project.team.consultants.length}
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs text-gray-500">
                      {totalDocs}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredProjects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No projects found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
