import { NextRequest, NextResponse } from 'next/server'
import { getFortreaQuarters, getLatestQuarter } from '@/lib/fortreaData'
import { 
  getRevenueInsights, 
  getMarginInsights, 
  getBacklogInsights, 
  getTransformationInsights,
  getCostActionsInsights,
  getProfitabilityCashInsights
} from '@/data/fortrea/insights'

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Invalid question format' },
        { status: 400 }
      )
    }

    const lowerQuestion = question.toLowerCase()

    // Rule-based routing with CFO-level nuanced answers
    let answer = ''

    if (lowerQuestion.includes('revenue') || lowerQuestion.includes('growth') || lowerQuestion.includes('top line') || lowerQuestion.includes('decline')) {
      const insight = getRevenueInsights()
      answer = insight.content
    } else if (lowerQuestion.includes('margin') || lowerQuestion.includes('profitability') || lowerQuestion.includes('ebitda') || lowerQuestion.includes('improve')) {
      const insight = getMarginInsights()
      answer = insight.content
    } else if (lowerQuestion.includes('backlog') || lowerQuestion.includes('book-to-bill') || lowerQuestion.includes('bookings') || lowerQuestion.includes('demand')) {
      const insight = getBacklogInsights()
      answer = insight.content
    } else if (lowerQuestion.includes('transformation') || lowerQuestion.includes('transition') || lowerQuestion.includes('phase') || lowerQuestion.includes('spin') || lowerQuestion.includes('labcorp') || lowerQuestion.includes('separation')) {
      const insight = getTransformationInsights()
      answer = insight.content
    } else if (lowerQuestion.includes('cost') || lowerQuestion.includes('efficiency') || lowerQuestion.includes('restructuring') || lowerQuestion.includes('sga')) {
      const insight = getCostActionsInsights()
      answer = insight.content
    } else if (lowerQuestion.includes('profit') || lowerQuestion.includes('cash') || lowerQuestion.includes('liquidity') || lowerQuestion.includes('debt') || lowerQuestion.includes('fcf') || lowerQuestion.includes('free cash')) {
      const insight = getProfitabilityCashInsights()
      answer = insight.content
    } else {
      // Generic helpful response
      const latest = getLatestQuarter()
      answer = `This is a prototype finance copilot trained on Fortrea's public results and CFO-level commentary. ` +
        `I can answer questions about revenue trends, margin improvement, backlog and book-to-bill, the post-spin transformation, cost actions, and profitability/cash flow. ` +
        `For example, Fortrea's Q3 2024 revenue was $${latest?.revenue.toFixed(1) || '674.9'}M with adjusted EBITDA margin of ${latest?.adjEbitdaMarginPct.toFixed(1) || '9.5'}%. ` +
        `With deeper internal data integration, I could provide more detailed insights on segment performance, project pipeline, and operational metrics.`
    }

    return NextResponse.json({ answer })
  } catch (error) {
    console.error('Error processing question:', error)
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    )
  }
}

