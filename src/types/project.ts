export interface ProjectDocument {
  filename: string
  localPath: string
  sharepointUrl: string
  sharepointPath: string
  downloadedAt: string
  fileHash: string
  fileSize: number
  modifiedBy: string
  modifiedDate: string
  projectId: string
  category: 'contracts' | 'proposals' | 'deliverables' | 'documentation'
}

export interface ConsultantAllocation {
  name: string
  totalCost: number
  allocationPercent: number
  allocatedCost: number
  sourceEvidence: string
  notes?: string
}

export interface ProjectMetadata {
  id: string
  name: string
  client: string
  type: string
  status: 'active' | 'completed' | 'on-hold' | 'cancelled'
  description?: string
  timeline?: {
    startDate: string
    endDate?: string
    lastActivityDate?: string
  }
  financial: {
    revenue: number
    revenueDetails?: Array<{
      date: string
      amount: number
      invoice: string
      description: string
    }>
    costs: {
      consultants: ConsultantAllocation[]
      totalConsultantCosts: number
      overheadAllocated: number
    }
    profitability: {
      grossProfit: number
      grossMargin: number
    }
  }
  team: {
    consultants: string[]
    primaryContact?: string
  }
  sharepoint: {
    path: string
    url: string
    lastSyncedAt: string
  }
  github?: {
    repos: string[]
  }
  documents: {
    contracts: ProjectDocument[]
    proposals: ProjectDocument[]
    deliverables: ProjectDocument[]
    documentation: ProjectDocument[]
  }
  migrationStatus?: {
    inventoryComplete: boolean
    documentsDownloaded: boolean
    validated: boolean
    lastUpdated: string
  }
  notes?: string[]
}

export interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalRevenue: number
  totalCosts: number
  totalProfit: number
  avgMargin: number
  totalDocuments: number
}
