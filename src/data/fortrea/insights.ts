// Knowledge base for Fortrea insights and commentary
// Derived from public releases and CFO Jill McConnell's strategic commentary
// Sources: GlobeNewswire, SEC filings, TradingView, Investing.com, MedicalBuyer

import { getFortreaQuarters, getFortreaAnnual, getLatestQuarter, getLatestAnnual } from '@/lib/fortreaData'

export interface FortreaInsight {
  topic: string
  content: string
  source: string
  data?: any
}

/**
 * Get revenue insights with CFO-level nuance
 */
export function getRevenueInsights(): FortreaInsight {
  const quarters = getFortreaQuarters()
  const latest = getLatestQuarter()
  const q3_2024 = quarters.find(q => q.id === '2024Q3')
  const q3_2023 = quarters.find(q => q.id === '2023Q3')
  
  if (!latest || !q3_2024 || !q3_2023) {
    return {
      topic: 'Revenue',
      content: 'Revenue data is being updated.',
      source: 'Internal'
    }
  }

  const q3_2025_vs_q3_2024 = ((latest.revenue - q3_2024.revenue) / q3_2024.revenue) * 100
  const q3_2025_vs_q3_2023 = ((latest.revenue - q3_2023.revenue) / q3_2023.revenue) * 100

  return {
    topic: 'Revenue',
    content: `Revenue in Q3 2025 was $${latest.revenue.toFixed(1)}M, up ${q3_2025_vs_q3_2024.toFixed(1)}% versus Q3 2024 and ${q3_2025_vs_q3_2023 >= 0 ? 'up' : 'down'} ${Math.abs(q3_2025_vs_q3_2023).toFixed(1)}% versus Q3 2023. This growth exceeded analyst expectations of $648.3M, driven by strong commercial execution and win rates reaching the highest level in six quarters. However, CFO Jill McConnell noted that higher pass-through revenues, rather than service fees, drove much of the revenue upside, which limited margin expansion. With backlog at $${((latest.backlog || 0) / 1000).toFixed(2)}B and trailing 12-month book-to-bill of 1.07x, management raised full-year 2025 revenue guidance to $2.7-2.75 billion, reflecting confidence in continued growth momentum.`,
    source: 'Q3 2025 release and earnings call transcript',
    data: {
      latest: latest.revenue,
      q3_2024: q3_2024.revenue,
      q3_2023: q3_2023.revenue,
      change: q3_2025_vs_q3_2024
    }
  }
}

/**
 * Get margin insights with CFO-level nuance
 */
export function getMarginInsights(): FortreaInsight {
  const quarters = getFortreaQuarters()
  const latest = getLatestQuarter()
  const q3_2024 = quarters.find(q => q.id === '2024Q3')
  const q1_2024 = quarters.find(q => q.id === '2024Q1')
  const latestAnnual = getLatestAnnual()

  if (!latest || !latestAnnual || !q3_2024) {
    return {
      topic: 'Margins',
      content: 'Margin data is being updated.',
      source: 'Internal'
    }
  }

  return {
    topic: 'Margins',
    content: `Adjusted EBITDA margin was ${latest.adjEbitdaMarginPct.toFixed(1)}% in Q3 2025, down from ${q3_2024.adjEbitdaMarginPct.toFixed(1)}% in Q3 2024, with adjusted EBITDA of $${latest.adjEbitda.toFixed(1)}M (slightly exceeding analyst estimates of $49.49M). The margin compression reflects higher pass-through revenues in the revenue mix, which CFO Jill McConnell explained limits margin expansion despite revenue growth. Operating margin improved to -1.2% from -2.7% in Q3 2024, demonstrating operational progress. CEO Anshul Thakral stated there are no structural barriers to achieving industry-standard margins, but margin improvement will require consistent backlog growth and continued cost discipline. Management narrowed full-year 2025 adjusted EBITDA guidance to $175-195M, reflecting the margin dynamics observed in Q3.`,
    source: 'Q3 2025 release and earnings call transcript',
    data: {
      quarterlyMargin: latest.adjEbitdaMarginPct,
      annualMargin: latestAnnual.adjEbitdaMarginPct,
      q3_2024Margin: q3_2024.adjEbitdaMarginPct,
      q1Margin: q1_2024?.adjEbitdaMarginPct
    }
  }
}

/**
 * Get backlog insights with CFO-level nuance
 */
export function getBacklogInsights(): FortreaInsight {
  const quarters = getFortreaQuarters()
  const latest = getLatestQuarter()
  const q3_2024 = quarters.find(q => q.id === '2024Q3')

  if (!latest || !q3_2024) {
    return {
      topic: 'Backlog',
      content: 'Backlog data is being updated.',
      source: 'Internal'
    }
  }

  const backlogGrowth = latest.backlog && q3_2024.backlog 
    ? ((latest.backlog - q3_2024.backlog) / q3_2024.backlog) * 100 
    : 0

  return {
    topic: 'Backlog',
    content: `Backlog stands at $${((latest.backlog || 0) / 1000).toFixed(2)}B as of Q3 2025, representing a ${backlogGrowth >= 0 ? '' : 'modest '}${Math.abs(backlogGrowth).toFixed(1)}% change year-over-year from Q3 2024. This provides roughly 2+ years of revenue visibility at current run-rates. The Q3 2025 book-to-bill ratio was ${latest.bookToBill?.toFixed(2) || '1.13'}x for the quarter, with a trailing 12-month ratio of 1.07x, indicating solid sales momentum. CEO Anshul Thakral noted that win rates improved significantly, reaching the highest level in six quarters, attributed to enhanced technology and workflow processes that have accelerated site selection and trial enrollment. The company is focusing on rightsizing contracts and pursuing independent deals with improved operational discipline, while maintaining a cautious approach to ensure only profitable contracts are pursued.`,
    source: 'Q3 2025 release and earnings call transcript',
    data: {
      backlog: latest.backlog,
      bookToBill: latest.bookToBill,
      backlogGrowth
    }
  }
}

/**
 * Get transformation insights with CFO-level nuance
 */
export function getTransformationInsights(): FortreaInsight {
  return {
    topic: 'Transformation',
    content: `2024 marks the shift from separation to transformation phase. Fortrea is transitioning from being a former division of LabCorp to an independent industry leader. The mid-2023 spin-off required standing up new internal systems, migrating off LabCorp's infrastructure, and exiting Transition Service Agreements (TSAs), which temporarily elevated costs. By Q4 2024, Fortrea had exited the majority of TSAs with LabCorp and migrated over 90% of IT applications and servers to Fortrea's independent environment. Key systems including ERP and HCM are on track to go live by early 2025, which will fully remove remaining dependencies. Management intentionally invested in building independent capabilities and absorbed one-time separation expenses in 2023-24, creating a foundation for future efficiency. The transformation phase involved necessary groundwork for a leaner, more focused organization, with the heavy lifting of separation now behind us. This positions Fortrea for improved profitability as we normalize operations and cost structure to what standalone peers have, setting the company up for margin expansion once the transformation is complete.`,
    source: 'FY 2024 release and management commentary'
  }
}

/**
 * Get cost actions insights
 */
export function getCostActionsInsights(): FortreaInsight {
  const quarters = getFortreaQuarters()
  const q1_2024 = quarters.find(q => q.id === '2024Q1')
  const q2_2024 = quarters.find(q => q.id === '2024Q2')
  const q3_2024 = quarters.find(q => q.id === '2024Q3')

  return {
    topic: 'Cost Actions',
    content: `As part of the transformation, Fortrea initiated targeted restructuring and cost reduction programs in late 2023 to right-size the organization. These cost actions include streamlining SG&A, exiting costly TSA arrangements by end of 2024, consolidating vendors, and reducing overhead inherited pre-spin. Adjusted EBITDA more than doubled from Q1 2024 ($${q1_2024?.adjEbitda.toFixed(1) || '29.5'}M) to Q2 2024 ($${q2_2024?.adjEbitda.toFixed(1) || '55.2'}M) as initial cost measures took hold, and margins have stabilized in the high single digits by Q3 2024 (${q3_2024?.adjEbitdaMarginPct.toFixed(1) || '9.5'}%) after dipping to ${q1_2024?.adjEbitdaMarginPct.toFixed(1) || '4.5'}% in Q1. In Q2 2024, Fortrea paid down approximately $504M of debt using proceeds from an asset sale and receivables securitization, reducing interest costs and improving financial flexibility. Management is targeting a return to historical profitability levels (12-13% adjusted EBITDA margins) by 2025, with further SG&A reductions expected once fully independent.`,
    source: 'Q2-Q3 2024 releases and CFO commentary'
  }
}

/**
 * Get profitability and cash insights
 */
export function getProfitabilityCashInsights(): FortreaInsight {
  const quarters = getFortreaQuarters()
  const latest = getLatestQuarter()
  const q3_2024 = quarters.find(q => q.id === '2024Q3')

  if (!latest) {
    return {
      topic: 'Profitability and Cash',
      content: 'Cash flow data is being updated.',
      source: 'Internal'
    }
  }

  return {
    topic: 'Profitability and Cash',
    content: `On a GAAP basis, Fortrea reported a net loss in Q3 2025 of $${Math.abs(latest.gaapNetIncome).toFixed(1)}M, an improvement from $${Math.abs(q3_2024?.gaapNetIncome || 18.5).toFixed(1)}M in Q3 2024. On an adjusted basis, the company reported adjusted net income of $${latest.adjNetIncome?.toFixed(1) || '10.8'}M and adjusted EPS of $${latest.adjDilutedEPS?.toFixed(2) || '0.12'}, though this missed analyst expectations of $0.16. Operating cash flow was a strong point: Fortrea generated $${latest.operatingCashFlow?.toFixed(1) || '86.8'}M in Q3 2025, leading to free cash flow of $${latest.freeCashFlow?.toFixed(1) || '79.5'}M. Days Sales Outstanding (DSO) improved by 13 days compared to the previous quarter, reaching 33 days, demonstrating effective working capital management. This cash generation, combined with the company's strategic focus on financial excellence and capital structure optimization, positions Fortrea well for continued operational improvements.`,
    source: 'Q3 2025 release and earnings call transcript'
  }
}

/**
 * Get all insights
 */
export function getAllInsights(): FortreaInsight[] {
  return [
    getRevenueInsights(),
    getMarginInsights(),
    getBacklogInsights(),
    getTransformationInsights(),
    getCostActionsInsights(),
    getProfitabilityCashInsights()
  ]
}

/**
 * Get all insights
 */
export function getAllInsights(): FortreaInsight[] {
  return [
    getRevenueInsights(),
    getMarginInsights(),
    getBacklogInsights(),
    getTransformationInsights()
  ]
}

