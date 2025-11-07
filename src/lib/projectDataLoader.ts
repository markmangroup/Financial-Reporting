import fs from 'fs'
import path from 'path'
import type { ProjectMetadata, ConsultantAllocation, ProjectDocument, ProjectStats } from '@/types/project'

// Re-export types for backward compatibility
export type { ProjectMetadata, ConsultantAllocation, ProjectDocument, ProjectStats } from '@/types/project'

export function loadAllProjects(): ProjectMetadata[] {
  const projectsDir = path.join(process.cwd(), 'data', 'projects')

  if (!fs.existsSync(projectsDir)) {
    return []
  }

  const projects: ProjectMetadata[] = []
  const entries = fs.readdirSync(projectsDir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      const metadataPath = path.join(projectsDir, entry.name, 'metadata.json')

      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
          projects.push(metadata)
        } catch (error) {
          console.error(`Error loading project metadata for ${entry.name}:`, error)
        }
      }
    }
  }

  return projects
}

export function loadProject(projectId: string): ProjectMetadata | null {
  const metadataPath = path.join(process.cwd(), 'data', 'projects', projectId, 'metadata.json')

  if (!fs.existsSync(metadataPath)) {
    return null
  }

  try {
    return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
  } catch (error) {
    console.error(`Error loading project ${projectId}:`, error)
    return null
  }
}

export function getProjectStats() {
  const projects = loadAllProjects()

  const totalRevenue = projects.reduce((sum, p) => sum + p.financial.revenue, 0)
  const totalCosts = projects.reduce((sum, p) => sum + p.financial.costs.totalConsultantCosts, 0)
  const totalProfit = totalRevenue - totalCosts
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  const activeProjects = projects.filter(p => p.status === 'active').length
  const completedProjects = projects.filter(p => p.status === 'completed').length

  const totalDocuments = projects.reduce((sum, p) =>
    sum +
    p.documents.contracts.length +
    p.documents.proposals.length +
    p.documents.deliverables.length +
    p.documents.documentation.length,
  0)

  return {
    totalProjects: projects.length,
    activeProjects,
    completedProjects,
    totalRevenue,
    totalCosts,
    totalProfit,
    avgMargin,
    totalDocuments
  }
}

export function searchProjects(query: string): ProjectMetadata[] {
  const projects = loadAllProjects()
  const lowerQuery = query.toLowerCase()

  return projects.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.client.toLowerCase().includes(lowerQuery) ||
    p.description?.toLowerCase().includes(lowerQuery) ||
    p.team.consultants.some(c => c.toLowerCase().includes(lowerQuery))
  )
}
