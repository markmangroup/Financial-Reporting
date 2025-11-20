// Core types for the guided insights system

export interface InsightTemplate {
  id: string
  triggers: string[] // Keywords that activate this insight
  tags: string[] // Semantic tags for better discovery (e.g., "travel", "risk", "recurring")
  relatedTags?: string[] // Tags that this insight naturally leads to
  category: 'expense' | 'revenue' | 'cash' | 'profitability' | 'efficiency' | 'vendors'
  titleTemplate: string
  generateNarrative: (data: InsightData) => InsightNarrative
  nextQuestions: string[] // IDs of related insights
  priority: number // Higher = shows up first in search
}

export interface InsightData {
  checkingData: any
  creditCardData?: any
  consultantSubledger?: any
  billComData?: any
  consultantWorkHistories?: Map<string, any> // Consultant name -> work history
  projects?: any[] // Project metadata for cross-referencing financial data
  period?: {
    start: string
    end: string
    label: string // "YTD", "MTD", "Last 30 days"
  }
}

export interface InsightNarrative {
  headline: {
    title: string
    subtitle?: string
    metric: {
      value: string
      label: string
      trend?: {
        direction: 'up' | 'down' | 'flat'
        percentage: number
        comparison: string
      }
    }
  }
  sections: NarrativeSection[]
  recommendations?: Recommendation[]
  relatedInsights: string[] // IDs of next suggested insights
}

export interface NarrativeSection {
  type: 'metric' | 'breakdown' | 'chart' | 'comparison' | 'trend' | 'list' | 'callout'
  title?: string
  content?: string
  data?: any
  visualization?: VisualizationConfig
}

export interface VisualizationConfig {
  type: 'bar' | 'pie' | 'line' | 'area' | 'table' | 'metric-cards'
  data: any[]
  config?: {
    xKey?: string
    yKey?: string
    colors?: string[]
    format?: 'currency' | 'percent' | 'number'
  }
}

export interface Recommendation {
  type: 'warning' | 'opportunity' | 'info' | 'success'
  icon: string
  title: string
  description: string
  action?: {
    label: string
    insightId: string // Which insight to navigate to
  }
}

export interface SearchSuggestion {
  insightId: string
  display: string // What user sees in dropdown
  preview: string // Quick answer preview
  confidence: number // 0-1 relevance score
  category: string
  icon: string
}

export interface ConsultantWorkHistory {
  consultantName: string
  projects: {
    projectName: string
    role: string
    startDate: string
    endDate?: string
    allocation: number
  }[]
  totalEarnings: number
  activeStatus: 'active' | 'inactive'
}
