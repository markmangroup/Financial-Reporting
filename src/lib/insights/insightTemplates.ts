import { InsightTemplate, InsightData, InsightNarrative } from './insightTypes'
import { calculateFinancialTotals } from '@/lib/financialCalculations'
import { loadCreditCardData } from '@/lib/creditCardDataLoader'
import { BankTransaction } from '@/types'
import { reconcileConsultants, formatReconciliationSummary } from './consultantReconciliation'

// Helper to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Helper to format percentage
const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`
}

// INSIGHT TEMPLATES LIBRARY
export const insightTemplates: InsightTemplate[] = [
  // 1. LARGEST EXPENSE CATEGORY
  {
    id: 'largest-expense-ytd',
    triggers: ['largest expense', 'biggest expense', 'top expense', 'most expensive', 'where am i spending'],
    category: 'expense',
    titleTemplate: 'Your Largest Expense Category',
    priority: 100,
    nextQuestions: ['expense-trend', 'vendor-breakdown', 'consultant-analysis'],
    generateNarrative: (data: InsightData) => {
      const creditCardData = data.creditCardData
      const financials = calculateFinancialTotals(data.checkingData, creditCardData)

      // Map icons to specific categories
      const categoryIcons: Record<string, string> = {
        'Office Rent': '🏢',
        'Freelance Services': '💼',
        'AI Services': '🤖',
        'Office Software': '💻',
        'Development Tools': '⚙️',
        'Cloud Services': '☁️',
        'Vehicle Fuel': '⚡',
        'Vehicle Maintenance': '🔧',
        'Client Meals': '🍽️',
        'Hotels': '🏨',
        'Air Travel': '✈️',
        'Ground Transportation': '🚕',
        'Telecommunications': '📱',
        'Internet': '🌐',
        'Electricity': '💡',
        'Insurance': '🛡️',
        'Auto Loan': '🚗',
        'Bank Fees': '🏦',
        'Consultant Services': '👥'
      }

      // Calculate top expense categories using granular category breakdown
      const expenseCategories = [
        // Consultant Services
        ...(financials.consultantExpenses > 0 ? [{
          name: 'Consultant Services',
          amount: financials.consultantExpenses,
          icon: categoryIcons['Consultant Services'],
          color: '#EF4444',
          source: 'checking' as const,
          hasBreakdown: true
        }] : []),
        // Credit Card Categories (granular level - Office Rent, Software, etc.)
        ...financials.creditCardCategoryBreakdown.map(c => ({
          name: c.name,
          amount: c.amount,
          icon: categoryIcons[c.name] || '📊',
          color: '#8B5CF6',
          source: 'credit-card' as const,
          hasBreakdown: false
        })),
        // Other checking account expenses
        ...(financials.autoLoanExpenses > 0 ? [{
          name: 'Auto Loan',
          amount: financials.autoLoanExpenses,
          icon: categoryIcons['Auto Loan'],
          color: '#F59E0B',
          source: 'checking' as const,
          hasBreakdown: false
        }] : []),
        ...(financials.bankFeesExpenses > 0 ? [{
          name: 'Bank Fees',
          amount: financials.bankFeesExpenses,
          icon: categoryIcons['Bank Fees'],
          color: '#9CA3AF',
          source: 'checking' as const,
          hasBreakdown: false
        }] : [])
      ].filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount)

      const topCategory = expenseCategories[0]
      const secondCategory = expenseCategories[1]
      const thirdCategory = expenseCategories[2]

      // Use total business expenses from golden record
      const totalBusinessExpenses = financials.totalBusinessExpenses
      const percentOfTotal = (topCategory.amount / totalBusinessExpenses) * 100

      // Get detailed breakdown for top category (only for categories that have sub-details)
      const getDetailedBreakdown = () => {
        if (topCategory.name === 'Consultant Services') {
          // Get consultant breakdown from financials
          return financials.consultantBreakdown.slice(0, 5)
        } else if (creditCardData && topCategory.source === 'credit-card') {
          // Get transaction-level breakdown for this specific category
          const transactions = creditCardData.transactions
            .filter((t: any) => t.detailCategory === topCategory.name && t.type === 'debit')
            .sort((a: any, b: any) => Math.abs(b.amount) - Math.abs(a.amount))
            .slice(0, 5)
            .map((t: any) => ({
              name: t.vendor || t.description,
              amount: Math.abs(t.amount)
            }))
          return transactions
        }
        return []
      }

      const detailBreakdown = getDetailedBreakdown()

      // Generate contextual insights based on top category
      const getContextualInsight = () => {
        const top3Total = expenseCategories.slice(0, 3).reduce((sum, cat) => sum + cat.amount, 0)
        const top3Percent = (top3Total / totalBusinessExpenses) * 100

        if (topCategory.name === 'Consultant Services') {
          const topConsultantPercent = detailBreakdown.length > 0 ? (detailBreakdown[0].amount / topCategory.amount) * 100 : 0
          return `⚠️ **Concentration Risk**: Your top consultant represents ${formatPercent(topConsultantPercent)} of consultant spend. Top 3 expense categories (${topCategory.name}, ${secondCategory?.name || 'N/A'}, ${thirdCategory?.name || 'N/A'}) account for ${formatPercent(top3Percent)} of total expenses.`
        } else if (topCategory.name === 'Office Rent') {
          return `🏢 **Facility Costs**: ${formatCurrency(topCategory.amount)} in office rent. Top 3 categories (${topCategory.name}, ${secondCategory?.name || 'N/A'}, ${thirdCategory?.name || 'N/A'}) represent ${formatPercent(top3Percent)} of expenses. Consider lease negotiation or space optimization.`
        } else if (topCategory.name.includes('Services') || topCategory.name.includes('Software')) {
          return `💻 **Technology & Services**: ${formatCurrency(topCategory.amount)} in ${topCategory.name}. Top 3 categories represent ${formatPercent(top3Percent)} of expenses. Review tool utilization and vendor contracts.`
        } else if (topCategory.name.includes('Travel') || topCategory.name.includes('Vehicle')) {
          return `✈️ **Travel Costs**: ${formatCurrency(topCategory.amount)} in ${topCategory.name}. Top 3 categories account for ${formatPercent(top3Percent)} of expenses. Analyze trip frequency and cost-saving alternatives.`
        } else {
          return `💡 **Expense Insight**: ${topCategory.name} is your largest expense at ${formatPercent(percentOfTotal)}. Top 3 categories (${topCategory.name}, ${secondCategory?.name || 'N/A'}, ${thirdCategory?.name || 'N/A'}) represent ${formatPercent(top3Percent)} of total spending.`
        }
      }

      // Generate actionable recommendations based on top category
      const getRecommendations = () => {
        const recommendations: any[] = []

        if (topCategory.name === 'Consultant Services') {
          recommendations.push({
            type: 'warning',
            icon: '⚠️',
            title: 'High Consultant Concentration',
            description: `Consultants represent ${formatPercent(percentOfTotal)} of expenses (${formatCurrency(topCategory.amount)}). ${detailBreakdown.length > 0 ? `Top consultant accounts for ${formatCurrency(detailBreakdown[0].amount)}. ` : ''}Consider: (1) Evaluate ROI per consultant (2) Explore full-time hires for core functions (3) Negotiate rates for high-spend consultants`,
            action: {
              label: 'View consultant analysis',
              insightId: 'consultant-analysis'
            }
          })
          recommendations.push({
            type: 'opportunity',
            icon: '📊',
            title: 'Track Consultant Performance',
            description: 'Implement performance metrics to ensure ROI on these significant investments. Monitor deliverables and output quality.',
            action: {
              label: 'View profitability',
              insightId: 'profitability-check'
            }
          })
        } else if (topCategory.name === 'Office Rent') {
          recommendations.push({
            type: 'opportunity',
            icon: '🏢',
            title: 'Facility Cost Optimization',
            description: `${formatCurrency(topCategory.amount)} in office rent. ${detailBreakdown.length > 0 ? `Top location: ${detailBreakdown[0].name} at ${formatCurrency(detailBreakdown[0].amount)}. ` : ''}Actions: (1) Review lease terms for renewal negotiation (2) Explore hybrid work options to reduce space needs (3) Consider co-working alternatives (4) Negotiate multi-year discounts. Potential 10-20% savings.`,
            action: {
              label: 'View facility details',
              insightId: 'facility-spending'
            }
          })
        } else if (topCategory.name.includes('Services') || topCategory.name.includes('Software') || topCategory.name.includes('AI')) {
          recommendations.push({
            type: 'opportunity',
            icon: '💻',
            title: 'Technology Cost Optimization',
            description: `${formatCurrency(topCategory.amount)} in ${topCategory.name}. ${detailBreakdown.length > 0 ? `Top vendor: ${detailBreakdown[0].name} at ${formatCurrency(detailBreakdown[0].amount)}. ` : ''}Actions: (1) Review tool/software utilization (2) Negotiate vendor contracts (3) Consolidate overlapping services (4) Explore annual vs monthly pricing. Potential 15-25% savings.`,
            action: {
              label: 'View technology breakdown',
              insightId: 'software-spending'
            }
          })
        } else if (topCategory.name.includes('Travel') || topCategory.name.includes('Vehicle') || topCategory.name.includes('Fuel')) {
          recommendations.push({
            type: 'opportunity',
            icon: '✈️',
            title: 'Travel Cost Optimization',
            description: `${formatCurrency(topCategory.amount)} in ${topCategory.name}. Consider: (1) Negotiate corporate rates with preferred vendors (2) Implement travel policy limits (3) Evaluate virtual meeting alternatives (4) Optimize trip frequency and routing`,
            action: {
              label: 'View travel details',
              insightId: 'travel-spending'
            }
          })
        } else {
          recommendations.push({
            type: 'opportunity',
            icon: '📊',
            title: 'Optimize Top Expense',
            description: `${topCategory.name} represents ${formatPercent(percentOfTotal)} of total expenses. Review spending patterns and identify cost reduction opportunities.`,
            action: {
              label: 'View expense trends',
              insightId: 'expense-trend'
            }
          })
        }

        // Always add efficiency check
        recommendations.push({
          type: 'info',
          icon: '⚡',
          title: 'Expense Efficiency Check',
          description: 'Analyze how efficiently each dollar spent generates revenue. Identify high-ROI and low-ROI expense categories.',
          action: {
            label: 'View efficiency metrics',
            insightId: 'expense-efficiency'
          }
        })

        return recommendations
      }

      // Contextual related insights
      const getRelatedInsights = () => {
        if (topCategory.name === 'Consultants') {
          return ['consultant-analysis', 'profitability-check', 'expense-efficiency']
        } else if (topCategory.name === 'Software & Subscriptions') {
          return ['software-spending', 'expense-efficiency', 'monthly-burn-rate']
        } else if (topCategory.name === 'Travel & Transportation') {
          return ['travel-spending', 'expense-efficiency', 'monthly-burn-rate']
        } else {
          return ['expense-efficiency', 'profitability-check', 'monthly-burn-rate']
        }
      }

      // Prepare chart data: Top 5 + Other aggregate
      const top5Categories = expenseCategories.slice(0, 5)
      const otherCategories = expenseCategories.slice(5)
      const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.amount, 0)

      const chartData = [
        ...top5Categories.map((cat, idx) => ({
          category: cat.name,
          amount: cat.amount,
          icon: cat.icon,
          color: cat.color,
          percentage: (cat.amount / financials.totalBusinessExpenses) * 100
        })),
        ...(otherTotal > 0 ? [{
          category: 'Other',
          amount: otherTotal,
          icon: '📊',
          color: '#9CA3AF',
          percentage: (otherTotal / financials.totalBusinessExpenses) * 100,
          isAggregate: true,
          aggregatedCategories: otherCategories
        }] : [])
      ]

      // Prepare better breakdown summary for top category
      const getImprovedBreakdown = () => {
        if (topCategory.name === 'Consultant Services') {
          // Show top consultants with summary metrics
          const topConsultants = financials.consultantBreakdown.slice(0, 5)
          return topConsultants.map(c => ({
            name: c.name,
            amount: c.amount,
            detail: `${formatPercent((c.amount / topCategory.amount) * 100)} of consultant spend`
          }))
        } else if (creditCardData && topCategory.source === 'credit-card') {
          // For credit card categories, show vendor aggregation (not individual transactions)
          const vendorMap = new Map<string, number>()

          creditCardData.transactions
            .filter((t: any) => t.detailCategory === topCategory.name && t.type === 'debit')
            .forEach((t: any) => {
              const vendor = t.vendor || t.description
              const existing = vendorMap.get(vendor) || 0
              vendorMap.set(vendor, existing + Math.abs(t.amount))
            })

          return Array.from(vendorMap.entries())
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map(v => ({
              name: v.name,
              amount: v.amount,
              detail: `${formatPercent((v.amount / topCategory.amount) * 100)} of ${topCategory.name}`
            }))
        }
        return []
      }

      const improvedBreakdown = getImprovedBreakdown()

      return {
        headline: {
          title: `${formatCurrency(topCategory.amount)} on ${topCategory.name}`,
          subtitle: `Your largest expense category ${data.period?.label || 'YTD'}`,
          metric: {
            value: formatCurrency(topCategory.amount),
            label: topCategory.name.toUpperCase(),
            trend: {
              direction: 'up',
              percentage: percentOfTotal,
              comparison: 'of total expenses'
            }
          }
        },
        sections: [
          {
            type: 'metric',
            content: `${topCategory.icon} This represents **${formatPercent(percentOfTotal)}** of your total operating expenses (${formatCurrency(financials.totalBusinessExpenses)}). ${secondCategory ? `Your second-largest expense is ${secondCategory.name} at ${formatCurrency(secondCategory.amount)} (${formatPercent((secondCategory.amount / financials.totalBusinessExpenses) * 100)}).` : ''}`
          },
          {
            type: 'chart',
            title: 'All Expense Categories',
            visualization: {
              type: 'bar',
              data: chartData,
              config: {
                xKey: 'category',
                yKey: 'amount',
                format: 'currency',
                colors: chartData.map(c => c.color)
              }
            }
          },
          {
            type: 'breakdown',
            title: `Top Vendors in ${topCategory.name}`,
            data: improvedBreakdown
          },
          {
            type: 'callout',
            content: getContextualInsight()
          }
        ],
        recommendations: getRecommendations(),
        relatedInsights: getRelatedInsights()
      }
    }
  },

  // 2. REVENUE SOURCES
  {
    id: 'revenue-sources',
    triggers: ['revenue', 'income', 'clients', 'who pays me', 'revenue sources', 'top client'],
    category: 'revenue',
    titleTemplate: 'Your Revenue Sources',
    priority: 95,
    nextQuestions: ['revenue-trend', 'profitability-check', 'client-concentration'],
    generateNarrative: (data: InsightData) => {
      const financials = calculateFinancialTotals(data.checkingData)

      const clients = data.checkingData.categories
        .filter((c: any) => c.category.includes('Client Payment'))
        .map((c: any) => ({
          name: c.category.replace('Client Payment - ', ''),
          amount: c.amount,
          percentage: (c.amount / financials.businessRevenue) * 100
        }))
        .sort((a: any, b: any) => b.amount - a.amount)

      const topClient = clients[0]

      return {
        headline: {
          title: `${formatCurrency(financials.businessRevenue)} Total Revenue`,
          subtitle: `From ${clients.length} active clients`,
          metric: {
            value: formatCurrency(financials.businessRevenue),
            label: 'Total Revenue',
            trend: {
              direction: 'up',
              percentage: 0,
              comparison: 'vs last period'
            }
          }
        },
        sections: [
          {
            type: 'metric',
            content: `Your top client is **${topClient.name}** at ${formatCurrency(topClient.amount)} (${formatPercent(topClient.percentage)} of revenue)`
          },
          {
            type: 'chart',
            title: 'Revenue by Client',
            visualization: {
              type: 'pie',
              data: clients,
              config: {
                colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B']
              }
            }
          },
          {
            type: 'list',
            title: 'Client Breakdown',
            data: clients.map((c: any) => ({
              label: c.name,
              value: formatCurrency(c.amount),
              percentage: formatPercent(c.percentage)
            }))
          },
          {
            type: 'callout',
            content: topClient.percentage > 50
              ? `⚠️ **Concentration Risk**: ${topClient.name} represents over ${formatPercent(topClient.percentage)} of your revenue. Consider diversifying.`
              : `✅ **Healthy Diversification**: Your revenue is well-distributed across multiple clients.`
          }
        ],
        recommendations: [
          {
            type: topClient.percentage > 50 ? 'warning' : 'success',
            icon: topClient.percentage > 50 ? '⚠️' : '✅',
            title: topClient.percentage > 50 ? 'High Client Concentration' : 'Good Client Mix',
            description: topClient.percentage > 50
              ? 'Consider strategies to diversify revenue sources'
              : 'Your revenue distribution reduces business risk',
            action: {
              label: 'View revenue trends',
              insightId: 'revenue-trend'
            }
          }
        ],
        relatedInsights: ['profitability-check', 'revenue-trend', 'largest-expense-ytd']
      }
    }
  },

  // 3. PROFITABILITY CHECK
  {
    id: 'profitability-check',
    triggers: ['profitable', 'profit', 'net income', 'am i making money', 'bottom line', 'margin'],
    category: 'profitability',
    titleTemplate: 'Your Profitability',
    priority: 90,
    nextQuestions: ['largest-expense-ytd', 'revenue-sources', 'cash-position'],
    generateNarrative: (data: InsightData) => {
      const financials = calculateFinancialTotals(data.checkingData)
      const profitMargin = (financials.netIncome / financials.businessRevenue) * 100
      const isProfitable = financials.netIncome > 0

      return {
        headline: {
          title: isProfitable
            ? `${formatCurrency(financials.netIncome)} Net Profit`
            : `${formatCurrency(Math.abs(financials.netIncome))} Net Loss`,
          subtitle: `${formatPercent(Math.abs(profitMargin))} profit margin`,
          metric: {
            value: formatCurrency(financials.netIncome),
            label: 'Net Income',
            trend: {
              direction: isProfitable ? 'up' : 'down',
              percentage: Math.abs(profitMargin),
              comparison: 'profit margin'
            }
          }
        },
        sections: [
          {
            type: 'chart',
            visualization: {
              type: 'metric-cards',
              data: [
                {
                  label: 'Revenue',
                  value: formatCurrency(financials.businessRevenue),
                  icon: '💰'
                },
                {
                  label: 'Expenses',
                  value: formatCurrency(financials.totalBusinessExpenses),
                  icon: '💸'
                },
                {
                  label: 'Net Income',
                  value: formatCurrency(financials.netIncome),
                  icon: isProfitable ? '✅' : '⚠️'
                },
                {
                  label: 'Profit Margin',
                  value: formatPercent(profitMargin),
                  icon: '📊'
                }
              ]
            }
          },
          {
            type: 'chart',
            title: 'Revenue vs Expenses',
            visualization: {
              type: 'bar',
              data: [
                { category: 'Revenue', amount: financials.businessRevenue, type: 'revenue' },
                { category: 'Expenses', amount: financials.totalBusinessExpenses, type: 'expense' },
                { category: 'Net Income', amount: Math.abs(financials.netIncome), type: isProfitable ? 'profit' : 'loss' }
              ],
              config: {
                xKey: 'category',
                yKey: 'amount',
                format: 'currency'
              }
            }
          },
          {
            type: 'callout',
            content: isProfitable
              ? `✅ **Healthy Performance**: You're generating ${formatPercent(profitMargin)} profit margin, which is ${profitMargin > 20 ? 'excellent' : profitMargin > 10 ? 'good' : 'adequate'}.`
              : `⚠️ **Operating at a Loss**: Review expenses to identify cost reduction opportunities.`
          }
        ],
        recommendations: [
          {
            type: isProfitable ? 'success' : 'warning',
            icon: isProfitable ? '✅' : '⚠️',
            title: isProfitable ? 'Strong Profitability' : 'Negative Margin',
            description: isProfitable
              ? 'Your business is generating healthy profits'
              : 'Expenses exceed revenue - consider cost optimization',
            action: {
              label: isProfitable ? 'See revenue growth' : 'Analyze expenses',
              insightId: isProfitable ? 'revenue-trend' : 'largest-expense-ytd'
            }
          }
        ],
        relatedInsights: ['largest-expense-ytd', 'revenue-sources', 'cash-position']
      }
    }
  },

  // 4. CASH POSITION
  {
    id: 'cash-position',
    triggers: ['cash', 'balance', 'bank balance', 'how much money', 'cash position', 'runway'],
    category: 'cash',
    titleTemplate: 'Your Cash Position',
    priority: 85,
    nextQuestions: ['burn-rate', 'profitability-check', 'largest-expense-ytd'],
    generateNarrative: (data: InsightData) => {
      const financials = calculateFinancialTotals(data.checkingData)
      const currentBalance = financials.currentCashBalance
      const monthlyBurn = financials.totalBusinessExpenses / 12 // Rough estimate
      const runwayMonths = currentBalance / monthlyBurn

      return {
        headline: {
          title: formatCurrency(currentBalance),
          subtitle: `Current cash balance`,
          metric: {
            value: formatCurrency(currentBalance),
            label: 'Cash on Hand',
            trend: {
              direction: runwayMonths > 6 ? 'up' : runwayMonths > 3 ? 'flat' : 'down',
              percentage: runwayMonths,
              comparison: 'months of runway'
            }
          }
        },
        sections: [
          {
            type: 'metric',
            content: `At current burn rate, you have approximately **${runwayMonths.toFixed(1)} months** of cash runway.`
          },
          {
            type: 'callout',
            content: runwayMonths > 6
              ? `✅ **Strong Cash Position**: You have over 6 months of runway - excellent financial cushion.`
              : runwayMonths > 3
              ? `⚠️ **Adequate Cash**: 3-6 months of runway. Monitor closely and consider building reserves.`
              : `🚨 **Low Cash**: Less than 3 months runway. Immediate action needed to improve cash position.`
          }
        ],
        recommendations: [
          {
            type: runwayMonths > 6 ? 'success' : runwayMonths > 3 ? 'info' : 'warning',
            icon: runwayMonths > 6 ? '✅' : runwayMonths > 3 ? 'ℹ️' : '⚠️',
            title: runwayMonths > 6 ? 'Healthy Reserves' : runwayMonths > 3 ? 'Monitor Closely' : 'Action Required',
            description: `${runwayMonths.toFixed(1)} months of operating expenses in reserve`,
            action: {
              label: 'View burn rate analysis',
              insightId: 'burn-rate'
            }
          }
        ],
        relatedInsights: ['burn-rate', 'profitability-check', 'largest-expense-ytd']
      }
    }
  },

  // 5. SOFTWARE SPENDING (Popular query)
  {
    id: 'software-spending',
    triggers: ['software', 'subscriptions', 'saas', 'software costs', 'tools', 'platforms'],
    category: 'expense',
    titleTemplate: 'Software & Subscription Spending',
    priority: 80,
    nextQuestions: ['vendor-breakdown', 'expense-trend', 'largest-expense-ytd'],
    generateNarrative: (data: InsightData) => {
      // This would need credit card data to be fully accurate
      return {
        headline: {
          title: 'Software & Subscriptions Analysis',
          subtitle: 'Coming soon - detailed software spending breakdown',
          metric: {
            value: 'N/A',
            label: 'Software Costs'
          }
        },
        sections: [
          {
            type: 'callout',
            content: '💡 This insight requires credit card transaction data for detailed software spending analysis.'
          }
        ],
        recommendations: [],
        relatedInsights: ['largest-expense-ytd', 'vendor-breakdown']
      }
    }
  },

  // 6. CONSULTANT SPENDING ANALYSIS (ENHANCED WITH SUB-LEDGER)
  {
    id: 'consultant-analysis',
    triggers: ['consultant', 'consultants', 'contractor', 'international', 'freelancer', 'consultant costs', 'consultant spending'],
    category: 'expense',
    titleTemplate: 'Consultant & Contractor Spending',
    priority: 85,
    nextQuestions: ['individual-consultant-costs', 'expense-trend', 'profitability-check'],
    generateNarrative: (data: InsightData) => {
      const financials = calculateFinancialTotals(data.checkingData)
      const consultantTotal = financials.consultantExpenses
      const percentOfExpenses = (consultantTotal / financials.totalBusinessExpenses) * 100

      // Enhanced: Use consultant breakdown from financial calculations
      const consultantPayments = financials.consultantBreakdown

      // NEW: Reconcile Chase payments with consultant subledger
      const reconciliation = reconcileConsultants(data, consultantTotal, consultantPayments)

      // Combine all consultants: matched + chase-only + subledger-only
      const allConsultants = [
        ...reconciliation.matched,
        ...reconciliation.chaseOnly,
        ...reconciliation.subledgerOnly
      ]

      // Enhanced: Map reconciled consultants to enriched format
      const consultantArray = allConsultants.map(consultant => ({
        name: consultant.name,
        amount: consultant.amount,
        subledgerAmount: consultant.subledgerAmount,
        percentage: consultant.percentage,
        payments: consultant.payments,
        country: consultant.country,
        role: consultant.role,
        specialization: consultant.specialization,
        hourlyRate: consultant.hourlyRate,
        contractType: consultant.contractType,
        status: consultant.status,
        paymentMethod: consultant.paymentMethod,
        source: consultant.source,
        matched: consultant.matched
      }))

      // Count unique countries
      const countries = new Set(consultantArray.filter(c => c.country).map(c => c.country))

      // Enhanced: Add Bill.com outstanding bills data if available
      let totalOutstanding = 0
      let outstandingBillsCount = 0
      const consultantsWithOutstanding: any[] = []

      if (data.billComData && data.billComData.bills) {
        const unpaidBills = data.billComData.bills.filter((bill: any) =>
          bill.paymentStatus === 'Unpaid' && bill.balanceDue > 0
        )

        unpaidBills.forEach((bill: any) => {
          totalOutstanding += bill.balanceDue
          outstandingBillsCount++

          // Try to match vendor to consultant
          const consultantName = consultantArray.find(c =>
            bill.vendor.toLowerCase().includes(c.name.toLowerCase()) ||
            c.name.toLowerCase().includes(bill.vendor.toLowerCase())
          )

          if (consultantName) {
            const existing = consultantsWithOutstanding.find(c => c.name === consultantName.name)
            if (existing) {
              existing.outstanding += bill.balanceDue
              existing.billCount++
            } else {
              consultantsWithOutstanding.push({
                name: consultantName.name,
                outstanding: bill.balanceDue,
                billCount: 1,
                vendor: bill.vendor
              })
            }
          }
        })
      }

      return {
        headline: {
          title: `${formatCurrency(consultantTotal)} on Consultants`,
          subtitle: `${formatPercent(percentOfExpenses)} of total operating expenses`,
          metric: {
            value: formatCurrency(consultantTotal),
            label: 'Total Consultant Spending',
            trend: {
              direction: 'up',
              percentage: percentOfExpenses,
              comparison: 'of total expenses'
            }
          }
        },
        sections: [
          {
            type: 'metric',
            content: `You're working with **${consultantArray.length} consultants** across **${countries.size} countries**, representing your largest operating expense category.`
          },
          {
            type: 'callout',
            content: `📊 **Reconciliation Summary**\n\n${formatReconciliationSummary(reconciliation)}`
          },
          {
            type: 'chart',
            title: 'Consultant Spending Breakdown',
            visualization: {
              type: 'bar',
              data: consultantArray.map(c => ({
                category: c.name,
                amount: c.amount,
                percentage: c.percentage,
                color: c.status === 'Inactive' ? '#9CA3AF' : '#8B5CF6'
              })),
              config: {
                xKey: 'category',
                yKey: 'amount',
                format: 'currency',
                colors: consultantArray.map(c => c.status === 'Inactive' ? '#9CA3AF' : '#8B5CF6')
              }
            }
          },
          {
            type: 'breakdown',
            title: 'Consultant Details (Click for detail view)',
            data: consultantArray.map(c => ({
              name: c.name,
              amount: c.amount,
              detail: [
                c.role && `${c.role}`,
                c.country && `${c.country}`,
                c.contractType && `${c.contractType}`,
                c.payments && `${c.payments} payments`,
                c.amount > 0 && '👉 Click for detailed analysis'
              ].filter(Boolean).join(' • '),
              clickable: c.amount > 0,
              insightId: 'individual-consultant-detail',
              consultantName: c.name
            }))
          },
          {
            type: 'callout',
            content: `⚠️ **Concentration Risk**: Your top consultant accounts for **${formatPercent(consultantArray[0]?.percentage || 0)}** of your total consultant spending. Top 3 consultants represent **${formatPercent(consultantArray.slice(0, 3).reduce((sum, c) => sum + c.percentage, 0))}** of expenses. Consider whether this concentration presents any business continuity risk.`
          },
          ...(totalOutstanding > 0 ? [{
            type: 'callout' as const,
            content: `💰 **Outstanding Bills**: You have **${formatCurrency(totalOutstanding)}** in unpaid consultant invoices across **${outstandingBillsCount} bills**${consultantsWithOutstanding.length > 0 ? `: ${consultantsWithOutstanding.map(c => `${c.name} ($${c.outstanding.toLocaleString()})`).join(', ')}` : ''}. Review Bill.com for payment processing.`
          }] : [])
        ],
        recommendations: [
          ...(totalOutstanding > 0 ? [{
            type: 'warning' as const,
            icon: '💰',
            title: 'Outstanding Consultant Invoices',
            description: `${formatCurrency(totalOutstanding)} in unpaid bills (${outstandingBillsCount} invoices). Review Bill.com to process payments and maintain good consultant relationships.`
          }] : []),
          {
            type: 'warning',
            icon: '⚠️',
            title: 'High Consultant Concentration',
            description: `Top consultant represents ${formatPercent(consultantArray[0]?.percentage || 0)} of consultant spend. Consider: (1) Evaluate ROI per consultant (2) Explore full-time hires for core functions (3) Negotiate rates for high-spend consultants`,
            action: {
              label: 'View consultant analysis',
              insightId: 'consultant-analysis'
            }
          },
          {
            type: 'opportunity',
            icon: '🌍',
            title: 'Geographic diversification',
            description: `You're working across ${countries.size} countries. Review if this geographic spread provides cost or capability advantages.`
          }
        ],
        relatedInsights: ['individual-consultant-costs', 'largest-expense-ytd', 'profitability-check']
      }
    }
  },

  // 7. INDIVIDUAL CONSULTANT DETAIL DRILL-DOWN
  {
    id: 'individual-consultant-detail',
    triggers: ['swan', 'niki', 'abri', 'carmen', 'jan', 'petrana', 'beata', 'consultant detail', 'consultant payments'],
    category: 'expense',
    titleTemplate: 'Consultant Detail Analysis',
    priority: 80,
    nextQuestions: ['consultant-analysis', 'profitability-check', 'largest-expense-ytd'],
    generateNarrative: (data: InsightData) => {
      // Extract consultant name from search query (if available)
      // For now, we'll parse from transaction categories
      const financials = calculateFinancialTotals(data.checkingData)
      const consultantPayments = financials.consultantBreakdown

      // Find consultant from query or use top consultant
      const consultantName = consultantPayments[0]?.name || 'Unknown'
      const consultantMatch = consultantPayments.find(c => c.name === consultantName)

      if (!consultantMatch) {
        return {
          headline: {
            title: 'Consultant Not Found',
            subtitle: 'Unable to find consultant details',
            metric: {
              value: 'N/A',
              label: 'Consultant Details'
            }
          },
          sections: [],
          recommendations: [],
          relatedInsights: ['consultant-analysis']
        }
      }

      // Get all transactions for this consultant
      const consultantTransactions = data.checkingData.transactions
        .filter((t: BankTransaction) =>
          t.category && t.category.includes('Consultant') && t.category.includes(consultantName)
        )
        .map((t: BankTransaction) => ({
          date: new Date(t.date),
          amount: Math.abs(t.amount),
          description: t.description,
          balance: t.balance
        }))
        .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())

      // Extract invoice numbers and payment details from descriptions
      const paymentDetails = consultantTransactions.map((tx: any) => {
        const desc = tx.description
        let invoiceNumber = null
        let paymentNote = null
        let workDescription = null

        // Try to extract invoice number (e.g., "Invoice US-338")
        const invoiceMatch = desc.match(/Invoice\s+([A-Z0-9-]+)/i)
        if (invoiceMatch) invoiceNumber = invoiceMatch[1]

        // Extract work description (text after invoice number or dash)
        const workMatch = desc.match(/(?:Invoice\s+[A-Z0-9-]+\s*-\s*(.+)|WIRE TRANSFER VIA[^-]+-\s*(.+))/i)
        if (workMatch) {
          workDescription = (workMatch[1] || workMatch[2] || '').trim()
        }

        // Check for special markers
        if (desc.toLowerCase().includes('final')) paymentNote = 'Final Payment'

        return {
          ...tx,
          invoiceNumber,
          paymentNote,
          workDescription,
          monthYear: tx.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          shortDate: tx.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
      })

      // Calculate metrics
      const totalPaid = consultantTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0)
      const paymentCount = consultantTransactions.length
      const avgPayment = totalPaid / paymentCount
      const firstPayment = consultantTransactions[0]?.date
      const lastPayment = consultantTransactions[consultantTransactions.length - 1]?.date

      // Calculate contract duration
      let contractMonths = 0
      if (firstPayment && lastPayment) {
        contractMonths = Math.round(
          (lastPayment.getTime() - firstPayment.getTime()) / (1000 * 60 * 60 * 24 * 30)
        )
      }
      const monthlyAverage = contractMonths > 0 ? totalPaid / contractMonths : totalPaid

      // Try to get additional context from consultant subledger
      const reconciliation = reconcileConsultants(data, financials.consultantExpenses, consultantPayments)
      const allConsultants = [
        ...reconciliation.matched,
        ...reconciliation.chaseOnly,
        ...reconciliation.subledgerOnly
      ]
      const subledgerData = allConsultants.find(c => c.name === consultantName)

      // Find invoices in description
      const invoices = new Set(paymentDetails.map((p: any) => p.invoiceNumber).filter(Boolean))

      // Load work history from cached email analysis or manual entry
      const workHistory = data.consultantWorkHistories?.get(consultantName.toLowerCase()) || null
      console.log(`✅ Work history for ${consultantName}:`, workHistory)

      // Analyze what client work they likely supported based on payment timing
      const clientWorkCorrelation: any[] = []
      paymentDetails.forEach((p: any) => {
        const paymentDate = p.date
        const monthStr = paymentDate.toISOString().substring(0, 7) // YYYY-MM

        // Find client revenue in the same month
        const clientRevenue = data.checkingData.transactions
          .filter((t: BankTransaction) => {
            const txMonth = t.date.substring(0, 7)
            return txMonth === monthStr && t.category && t.category.includes('Client Payment')
          })

        if (clientRevenue.length > 0) {
          const clients = [...new Set(clientRevenue.map((t: BankTransaction) => {
            if (t.category?.includes('Laurel')) return 'Laurel AG'
            if (t.category?.includes('Metropolitan')) return 'Metropolitan Partners'
            return 'Other'
          }))]

          clientWorkCorrelation.push({
            date: p.shortDate,
            amount: p.amount,
            clients: clients.join(', '),
            detail: `Likely supported ${clients.join(' & ')} projects`
          })
        }
      })

      const hasClientCorrelation = clientWorkCorrelation.length > 0

      return {
        headline: {
          title: `${consultantName}`,
          subtitle: `${subledgerData?.role || 'Consultant'} • ${subledgerData?.country || 'Unknown Location'}`,
          metric: {
            value: formatCurrency(totalPaid),
            label: 'Total Paid',
            trend: {
              direction: 'up',
              percentage: (totalPaid / financials.consultantExpenses) * 100,
              comparison: 'of consultant spend'
            }
          }
        },
        sections: [
          // Key Metrics Row
          {
            type: 'chart',
            visualization: {
              type: 'metric-cards',
              data: [
                {
                  label: 'Total Paid',
                  value: formatCurrency(totalPaid),
                  icon: '💰'
                },
                {
                  label: 'Duration',
                  value: `${contractMonths}mo`,
                  icon: '📅'
                },
                {
                  label: 'Monthly Avg',
                  value: formatCurrency(monthlyAverage),
                  icon: '📊'
                },
                ...(subledgerData?.hourlyRate ? [{
                  label: 'Hourly Rate',
                  value: `${formatCurrency(subledgerData.hourlyRate)}/hr`,
                  icon: '⏱️'
                }] : [{
                  label: 'Payments',
                  value: paymentCount.toString(),
                  icon: '📝'
                }])
              ]
            }
          },

          // Consultant Profile (compact)
          ...(subledgerData ? [{
            type: 'metric' as const,
            content: [
              subledgerData.specialization && `**${subledgerData.specialization}**`,
              subledgerData.contractType && `${subledgerData.contractType}`,
              subledgerData.status && `Status: ${subledgerData.status}`,
              subledgerData.paymentMethod && `Paid via ${subledgerData.paymentMethod}`
            ].filter(Boolean).join(' • ')
          }] : []),

          // Payment Timeline (cleaner colors)
          {
            type: 'chart',
            title: 'Payment History',
            visualization: {
              type: 'bar',
              data: paymentDetails.map((p: any) => ({
                category: p.shortDate,
                amount: p.amount,
                color: '#8B5CF6'
              })),
              config: {
                xKey: 'category',
                yKey: 'amount',
                format: 'currency',
                colors: ['#8B5CF6']
              }
            }
          },

          // Work History from emails or manual entry
          ...(() => {
            console.log(`🔍 Rendering decision for ${consultantName}:`, {
              hasWorkHistory: !!workHistory,
              hasProjects: workHistory?.projects?.length > 0,
              projectCount: workHistory?.projects?.length || 0,
              hasClientCorrelation,
              clientCorrelationCount: clientWorkCorrelation.length
            })

            if (workHistory && workHistory.projects.length > 0) {
              console.log(`📦 Rendering projects for ${consultantName}:`, workHistory.projects)
              return [{
                type: 'breakdown' as const,
                title: 'Projects & Deliverables',
                data: workHistory.projects.map((project: string) => ({
                  name: project,
                  amount: '',
                  detail: 'Full-stack development services'
                }))
              }]
            } else if (hasClientCorrelation) {
              console.log(`👥 Rendering client correlation for ${consultantName}`)
              return [{
                type: 'breakdown' as const,
                title: `${subledgerData?.role || 'Development'} Work`,
                data: clientWorkCorrelation
              }]
            } else {
              console.log(`💼 Rendering fallback callout for ${consultantName}`)
              return [{
                type: 'callout' as const,
                content: `💼 **${subledgerData?.role || 'Development Team'}**: ${subledgerData?.specialization || 'Full-stack development'} services${subledgerData?.country ? ` based in ${subledgerData.country}` : ''}`
              }]
            }
          })(),

          // Deliverables section if available
          ...(workHistory && workHistory.deliverables.length > 0 ? [{
            type: 'callout' as const,
            content: `✅ **Key Deliverables**: ${workHistory.deliverables.join(' • ')}`
          }] : []),

          // Invoice Summary
          ...(invoices.size > 0 ? [{
            type: 'breakdown' as const,
            title: 'Invoices Processed',
            data: paymentDetails
              .filter((p: any) => p.invoiceNumber)
              .map((p: any) => ({
                name: `Invoice ${p.invoiceNumber}`,
                amount: p.amount,
                detail: `${p.shortDate} • ${p.paymentNote || 'Processed'}`
              }))
          }] : []),

          // Quick Insights
          {
            type: 'callout',
            content: `📊 ${contractMonths}-month engagement (${firstPayment?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${lastPayment?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}) • Ranking ${consultantPayments.findIndex(c => c.name === consultantName) + 1} of ${consultantPayments.length} consultants`
          }
        ],
        recommendations: [
          ...(totalPaid > 30000 ? [{
            type: 'warning' as const,
            icon: '⚠️',
            title: 'High Investment - Track ROI',
            description: `${formatCurrency(totalPaid)} investment warrants regular performance reviews and ROI tracking`,
            action: {
              label: 'Compare all consultants',
              insightId: 'consultant-analysis'
            }
          }] : []),
          ...(subledgerData?.hourlyRate ? [{
            type: 'info' as const,
            icon: '⏱️',
            title: 'Estimated Time Investment',
            description: `~${Math.round(totalPaid / subledgerData.hourlyRate)} hours billed (${Math.round((totalPaid / subledgerData.hourlyRate) / contractMonths)} hrs/month avg at ${formatCurrency(subledgerData.hourlyRate)}/hr)`
          }] : []),
          {
            type: 'opportunity',
            icon: '📈',
            title: 'Benchmark Analysis',
            description: `Compare deliverables and outcomes vs. other ${subledgerData?.role || 'consultants'} to optimize future engagements`,
            action: {
              label: 'View all consultants',
              insightId: 'consultant-analysis'
            }
          }
        ],
        relatedInsights: ['consultant-analysis', 'profitability-check', 'largest-expense-ytd']
      }
    }
  },

  // 8. TRAVEL SPENDING BREAKDOWN
  {
    id: 'travel-spending',
    triggers: ['travel', 'travel costs', 'travel expenses', 'transportation', 'flights', 'hotels', 'airfare'],
    category: 'expense',
    titleTemplate: 'Travel & Transportation Spending',
    priority: 75,
    nextQuestions: ['tesla-charging', 'largest-expense-ytd', 'expense-trend'],
    generateNarrative: (data: InsightData) => {
      const financials = calculateFinancialTotals(data.checkingData)

      // Use actual travel expenses from credit card subledger
      const travelExpenses = financials.creditCardTravelExpenses
      const percentOfExpenses = (travelExpenses / financials.totalBusinessExpenses) * 100

      return {
        headline: {
          title: `${formatCurrency(travelExpenses)} on Travel`,
          subtitle: 'Travel & Transportation expenses',
          metric: {
            value: formatCurrency(travelExpenses),
            label: 'Total Travel Spending',
            trend: {
              direction: 'up',
              percentage: percentOfExpenses,
              comparison: 'of total expenses'
            }
          }
        },
        sections: [
          {
            type: 'metric',
            content: `Your travel and transportation expenses total **${formatCurrency(travelExpenses)}**, representing **${formatPercent(percentOfExpenses)}** of your total business expenses.`
          },
          {
            type: 'callout',
            content: '📊 **Travel Breakdown**: This includes vehicle fuel (Tesla Supercharger), air travel (Delta, American, United), hotels (Marriott, Hilton, Westin), and ground transportation (Uber, rentals). Click "View detailed breakdown" below to see the full subledger.'
          }
        ],
        recommendations: [
          {
            type: 'opportunity',
            icon: '🚗',
            title: 'Track vehicle charging patterns',
            description: 'Tesla Supercharger transactions can reveal travel frequency and patterns.',
            action: {
              label: 'View Tesla charging costs',
              insightId: 'tesla-charging'
            }
          }
        ],
        relatedInsights: ['tesla-charging', 'largest-expense-ytd', 'software-spending']
      }
    }
  },

  // 8. TOP CLIENT ANALYSIS
  {
    id: 'top-client-analysis',
    triggers: ['top client', 'biggest client', 'largest client', 'best client', 'client revenue'],
    category: 'revenue',
    titleTemplate: 'Your Top Client Analysis',
    priority: 80,
    nextQuestions: ['revenue-concentration-risk', 'revenue-sources', 'profitability-check'],
    generateNarrative: (data: InsightData) => {
      const financials = calculateFinancialTotals(data.checkingData)

      // Break down revenue by client
      const clientRevenue: { [key: string]: { total: number; count: number; lastPayment?: Date } } = {}

      data.checkingData.transactions.forEach((tx: BankTransaction) => {
        const category = tx.category || ''
        if (category.includes('Client Payment')) {
          let clientName = 'Unknown Client'

          if (category.includes('Laurel Management')) clientName = 'Laurel Management'
          else if (category.includes('Metropolitan Partners')) clientName = 'Metropolitan Partners'

          if (!clientRevenue[clientName]) {
            clientRevenue[clientName] = { total: 0, count: 0 }
          }

          clientRevenue[clientName].total += tx.amount
          clientRevenue[clientName].count++

          const txDate = new Date(tx.date)
          if (!clientRevenue[clientName].lastPayment || txDate > clientRevenue[clientName].lastPayment!) {
            clientRevenue[clientName].lastPayment = txDate
          }
        }
      })

      const clientArray = Object.entries(clientRevenue)
        .map(([name, data]) => ({
          name,
          amount: data.total,
          count: data.count,
          percentage: (data.total / financials.businessRevenue) * 100,
          lastPayment: data.lastPayment
        }))
        .sort((a, b) => b.amount - a.amount)

      const topClient = clientArray[0]
      const isHighConcentration = topClient.percentage > 50

      return {
        headline: {
          title: `${topClient.name} is Your Top Client`,
          subtitle: `${formatCurrency(topClient.amount)} in revenue (${formatPercent(topClient.percentage)})`,
          metric: {
            value: formatCurrency(topClient.amount),
            label: 'Revenue from Top Client',
            trend: {
              direction: isHighConcentration ? 'up' : 'flat',
              percentage: topClient.percentage,
              comparison: 'of total revenue'
            }
          }
        },
        sections: [
          {
            type: 'chart',
            visualization: {
              type: 'metric-cards',
              data: [
                {
                  label: 'Total Revenue',
                  value: formatCurrency(topClient.amount),
                  icon: '💰'
                },
                {
                  label: 'Payments Received',
                  value: topClient.count.toString(),
                  icon: '📝'
                },
                {
                  label: 'Revenue Share',
                  value: formatPercent(topClient.percentage),
                  icon: '📊'
                },
                {
                  label: 'Last Payment',
                  value: topClient.lastPayment?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'N/A',
                  icon: '📅'
                }
              ]
            }
          },
          {
            type: 'metric',
            content: `${topClient.name} has made **${topClient.count} payments** throughout the year, representing **${formatPercent(topClient.percentage)}** of your total business revenue.`
          },
          {
            type: 'chart',
            title: 'All Client Revenue',
            visualization: {
              type: 'pie',
              data: clientArray.map(c => ({
                name: c.name,
                amount: c.amount,
                percentage: c.percentage
              })),
              config: {
                colors: ['#8B5CF6', '#06B6D4', '#10B981']
              }
            }
          }
        ],
        recommendations: [
          isHighConcentration ? {
            type: 'warning',
            icon: '⚠️',
            title: 'High revenue concentration',
            description: `With ${formatPercent(topClient.percentage)} of revenue from one client, consider diversifying your client base to reduce business risk.`,
            action: {
              label: 'Assess concentration risk',
              insightId: 'revenue-concentration-risk'
            }
          } : {
            type: 'success',
            icon: '✅',
            title: 'Healthy revenue diversification',
            description: `Your top client represents ${formatPercent(topClient.percentage)} of revenue, which indicates good client diversification.`
          },
          {
            type: 'info',
            icon: '📈',
            title: 'Track payment patterns',
            description: 'Monitor payment frequency and timing to forecast cash flow more accurately.'
          }
        ],
        relatedInsights: ['revenue-concentration-risk', 'revenue-sources', 'cash-position']
      }
    }
  },

  // 9. REVENUE CONCENTRATION RISK
  {
    id: 'revenue-concentration-risk',
    triggers: ['concentration', 'risk', 'diversification', 'client risk', 'revenue risk', 'too dependent'],
    category: 'revenue',
    titleTemplate: 'Revenue Concentration Risk Assessment',
    priority: 70,
    nextQuestions: ['revenue-sources', 'top-client-analysis', 'cash-position'],
    generateNarrative: (data: InsightData) => {
      const financials = calculateFinancialTotals(data.checkingData)

      // Calculate client concentration
      const clientRevenue: { [key: string]: number } = {}
      data.checkingData.transactions.forEach((tx: BankTransaction) => {
        const category = tx.category || ''
        if (category.includes('Client Payment')) {
          let clientName = 'Other'
          if (category.includes('Laurel')) clientName = 'Laurel Management'
          else if (category.includes('Metropolitan')) clientName = 'Metropolitan Partners'

          clientRevenue[clientName] = (clientRevenue[clientName] || 0) + tx.amount
        }
      })

      const clientArray = Object.entries(clientRevenue)
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: (amount / financials.businessRevenue) * 100
        }))
        .sort((a, b) => b.amount - a.amount)

      const topClientPercent = clientArray[0]?.percentage || 0
      const top2ClientPercent = (clientArray[0]?.percentage || 0) + (clientArray[1]?.percentage || 0)

      // Risk assessment
      const riskLevel = topClientPercent > 60 ? 'High' : topClientPercent > 40 ? 'Moderate' : 'Low'
      const riskColor = riskLevel === 'High' ? '🔴' : riskLevel === 'Moderate' ? '🟡' : '🟢'

      return {
        headline: {
          title: `${riskColor} ${riskLevel} Revenue Concentration Risk`,
          subtitle: `Top client: ${formatPercent(topClientPercent)} of revenue`,
          metric: {
            value: formatPercent(topClientPercent),
            label: 'Top Client Revenue Share',
            trend: {
              direction: topClientPercent > 50 ? 'up' : 'flat',
              percentage: topClientPercent,
              comparison: 'concentration level'
            }
          }
        },
        sections: [
          {
            type: 'chart',
            visualization: {
              type: 'metric-cards',
              data: [
                {
                  label: 'Top Client',
                  value: formatPercent(topClientPercent),
                  icon: '👤'
                },
                {
                  label: 'Top 2 Clients',
                  value: formatPercent(top2ClientPercent),
                  icon: '👥'
                },
                {
                  label: 'Total Clients',
                  value: clientArray.length.toString(),
                  icon: '🏢'
                },
                {
                  label: 'Risk Level',
                  value: riskLevel,
                  icon: riskColor
                }
              ]
            }
          },
          {
            type: 'metric',
            content: riskLevel === 'High'
              ? `⚠️ **High Risk**: Your top client represents **${formatPercent(topClientPercent)}** of revenue. Losing this client would significantly impact your business. Consider strategies to diversify your client base.`
              : riskLevel === 'Moderate'
                ? `🟡 **Moderate Risk**: Your top client represents **${formatPercent(topClientPercent)}** of revenue. While not critical, increasing client diversification would reduce business risk.`
                : `✅ **Low Risk**: Your top client represents **${formatPercent(topClientPercent)}** of revenue, indicating healthy diversification. Your business is well-positioned to weather client changes.`
          },
          {
            type: 'chart',
            title: 'Revenue Distribution',
            visualization: {
              type: 'pie',
              data: clientArray,
              config: {
                colors: ['#EF4444', '#F59E0B', '#10B981']
              }
            }
          }
        ],
        recommendations: [
          riskLevel === 'High' ? {
            type: 'warning',
            icon: '🎯',
            title: 'Prioritize client acquisition',
            description: 'Focus on acquiring 2-3 new clients to reduce dependence on your top client. Target: Get top client below 50% of revenue.'
          } : {
            type: 'success',
            icon: '✅',
            title: 'Maintain healthy balance',
            description: 'Your current client mix is healthy. Continue nurturing existing relationships while exploring growth opportunities.'
          },
          {
            type: 'info',
            icon: '💼',
            title: 'Strengthen relationships',
            description: 'Regular check-ins and value delivery to key clients helps ensure revenue stability.',
            action: {
              label: 'View top client details',
              insightId: 'top-client-analysis'
            }
          }
        ],
        relatedInsights: ['top-client-analysis', 'revenue-sources', 'profitability-check']
      }
    }
  },

  // 10. MONTHLY BURN RATE
  {
    id: 'monthly-burn-rate',
    triggers: ['burn rate', 'monthly spending', 'cash burn', 'spending rate', 'how much per month'],
    category: 'cash',
    titleTemplate: 'Monthly Burn Rate Analysis',
    priority: 85,
    nextQuestions: ['cash-position', 'largest-expense-ytd', 'profitability-check'],
    generateNarrative: (data: InsightData) => {
      const financials = calculateFinancialTotals(data.checkingData)

      // Calculate monthly averages from transactions
      const monthlyData: { [key: string]: { expenses: number; revenue: number } } = {}

      data.checkingData.transactions.forEach((tx: BankTransaction) => {
        const month = tx.date.substring(0, 7) // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = { expenses: 0, revenue: 0 }
        }

        const category = tx.category || ''
        if (tx.amount < 0) {
          monthlyData[month].expenses += Math.abs(tx.amount)
        } else if (category.includes('Client Payment')) {
          monthlyData[month].revenue += tx.amount
        }
      })

      const months = Object.keys(monthlyData).sort()
      const avgMonthlyExpenses = Object.values(monthlyData).reduce((sum, m) => sum + m.expenses, 0) / months.length
      const avgMonthlyRevenue = Object.values(monthlyData).reduce((sum, m) => sum + m.revenue, 0) / months.length
      const avgMonthlyBurn = avgMonthlyExpenses - avgMonthlyRevenue

      const runway = avgMonthlyBurn < 0 ? Infinity : financials.currentCashBalance / avgMonthlyBurn

      return {
        headline: {
          title: avgMonthlyBurn > 0
            ? `Burning ${formatCurrency(avgMonthlyBurn)}/month`
            : `Generating ${formatCurrency(Math.abs(avgMonthlyBurn))}/month`,
          subtitle: `Based on ${months.length} months of data`,
          metric: {
            value: formatCurrency(Math.abs(avgMonthlyBurn)),
            label: avgMonthlyBurn > 0 ? 'Average Monthly Burn' : 'Average Monthly Surplus',
            trend: {
              direction: avgMonthlyBurn > 0 ? 'down' : 'up',
              percentage: (Math.abs(avgMonthlyBurn) / avgMonthlyRevenue) * 100,
              comparison: 'of revenue'
            }
          }
        },
        sections: [
          {
            type: 'chart',
            visualization: {
              type: 'metric-cards',
              data: [
                {
                  label: 'Avg Monthly Revenue',
                  value: formatCurrency(avgMonthlyRevenue),
                  icon: '💰'
                },
                {
                  label: 'Avg Monthly Expenses',
                  value: formatCurrency(avgMonthlyExpenses),
                  icon: '💸'
                },
                {
                  label: 'Net Monthly Flow',
                  value: formatCurrency(avgMonthlyRevenue - avgMonthlyExpenses),
                  icon: avgMonthlyBurn < 0 ? '✅' : '⚠️'
                },
                {
                  label: 'Runway',
                  value: runway === Infinity ? '∞' : `${Math.floor(runway)} mo`,
                  icon: '📅'
                }
              ]
            }
          },
          {
            type: 'metric',
            content: avgMonthlyBurn > 0
              ? `⚠️ You're spending **${formatCurrency(avgMonthlyBurn)}** more per month than you're earning. At this rate, with **${formatCurrency(financials.currentCashBalance)}** in the bank, you have approximately **${Math.floor(runway)} months** of runway.`
              : `✅ You're **cash flow positive**, generating **${formatCurrency(Math.abs(avgMonthlyBurn))}** more per month than you spend. Your business is sustainable and growing cash reserves.`
          },
          {
            type: 'chart',
            title: 'Monthly Cash Flow Trend',
            visualization: {
              type: 'bar',
              data: months.slice(-6).map(month => ({
                category: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                amount: monthlyData[month].revenue - monthlyData[month].expenses
              })),
              config: {
                xKey: 'category',
                yKey: 'amount',
                format: 'currency',
                colors: ['#10B981', '#10B981', '#10B981', '#EF4444', '#EF4444', '#EF4444']
              }
            }
          }
        ],
        recommendations: avgMonthlyBurn > 0 ? [
          {
            type: 'warning',
            icon: '🚨',
            title: 'Take action to extend runway',
            description: `With ${Math.floor(runway)} months of runway, consider: 1) Increasing revenue 2) Reducing expenses 3) Securing additional capital`,
            action: {
              label: 'View expense breakdown',
              insightId: 'largest-expense-ytd'
            }
          },
          {
            type: 'opportunity',
            icon: '💼',
            title: 'Focus on revenue growth',
            description: 'Increasing monthly revenue by 20% would significantly improve your runway and business sustainability.'
          }
        ] : [
          {
            type: 'success',
            icon: '🎉',
            title: 'Strong financial position',
            description: 'Your business is generating positive cash flow. Consider reinvesting surplus into growth initiatives.'
          },
          {
            type: 'opportunity',
            icon: '📈',
            title: 'Optimize for growth',
            description: 'With healthy cash flow, you can afford strategic investments in marketing, product, or team expansion.'
          }
        ],
        relatedInsights: ['cash-position', 'profitability-check', 'largest-expense-ytd']
      }
    }
  },

  // 11. EXPENSE EFFICIENCY SCORE
  {
    id: 'expense-efficiency',
    triggers: ['efficiency', 'efficient', 'revenue per dollar', 'expense ratio', 'operating efficiency', 'productivity'],
    category: 'efficiency',
    titleTemplate: 'Expense Efficiency Analysis',
    priority: 65,
    nextQuestions: ['profitability-check', 'largest-expense-ytd', 'consultant-analysis'],
    generateNarrative: (data: InsightData) => {
      const financials = calculateFinancialTotals(data.checkingData)

      const revenuePerDollar = financials.businessRevenue / financials.totalBusinessExpenses
      const expenseRatio = (financials.totalBusinessExpenses / financials.businessRevenue) * 100
      const profitMargin = (financials.netIncome / financials.businessRevenue) * 100

      // Efficiency rating
      const efficiencyRating = revenuePerDollar > 2 ? 'Excellent' : revenuePerDollar > 1.5 ? 'Good' : revenuePerDollar > 1.2 ? 'Fair' : 'Poor'
      const ratingIcon = efficiencyRating === 'Excellent' ? '🌟' : efficiencyRating === 'Good' ? '✅' : efficiencyRating === 'Fair' ? '🟡' : '🔴'

      return {
        headline: {
          title: `${ratingIcon} ${efficiencyRating} Expense Efficiency`,
          subtitle: `Generating $${revenuePerDollar.toFixed(2)} per $1 spent`,
          metric: {
            value: `$${revenuePerDollar.toFixed(2)}`,
            label: 'Revenue per Expense Dollar',
            trend: {
              direction: revenuePerDollar > 1.5 ? 'up' : 'flat',
              percentage: profitMargin,
              comparison: 'profit margin'
            }
          }
        },
        sections: [
          {
            type: 'chart',
            visualization: {
              type: 'metric-cards',
              data: [
                {
                  label: 'Revenue per $1',
                  value: `$${revenuePerDollar.toFixed(2)}`,
                  icon: '💰'
                },
                {
                  label: 'Expense Ratio',
                  value: formatPercent(expenseRatio),
                  icon: '📊'
                },
                {
                  label: 'Profit Margin',
                  value: formatPercent(profitMargin),
                  icon: '📈'
                },
                {
                  label: 'Efficiency Rating',
                  value: efficiencyRating,
                  icon: ratingIcon
                }
              ]
            }
          },
          {
            type: 'metric',
            content: `For every dollar you spend on business operations, you generate **$${revenuePerDollar.toFixed(2)}** in revenue. This translates to a **${formatPercent(expenseRatio)}** expense ratio and **${formatPercent(profitMargin)}** profit margin.`
          },
          {
            type: 'callout',
            content: efficiencyRating === 'Excellent'
              ? '🌟 **Outstanding**: Your expense efficiency is excellent. You\'re generating strong returns on operational spending.'
              : efficiencyRating === 'Good'
                ? '✅ **Solid Performance**: Your expense efficiency is good. There may be opportunities for optimization.'
                : efficiencyRating === 'Fair'
                  ? '🟡 **Room for Improvement**: Your expense efficiency is fair. Consider reviewing major expense categories for optimization opportunities.'
                  : '🔴 **Action Needed**: Your expense efficiency is below target. Immediate focus on cost optimization or revenue growth is recommended.'
          }
        ],
        recommendations: [
          {
            type: efficiencyRating === 'Poor' || efficiencyRating === 'Fair' ? 'warning' : 'info',
            icon: '🔍',
            title: 'Review expense categories',
            description: 'Analyze your largest expense categories to identify optimization opportunities.',
            action: {
              label: 'View expense breakdown',
              insightId: 'largest-expense-ytd'
            }
          },
          {
            type: 'opportunity',
            icon: '📈',
            title: 'Focus on high-ROI activities',
            description: 'Double down on activities and expenses that directly drive revenue growth.'
          }
        ],
        relatedInsights: ['profitability-check', 'largest-expense-ytd', 'revenue-sources']
      }
    }
  }
  // ====================
  // PROJECT-AWARE INSIGHTS
  // ====================

  // PROJECT PROFITABILITY OVERVIEW
  {
    id: 'project-profitability-overview',
    triggers: ['project profit', 'project profitability', 'which projects are profitable', 'project performance', 'project margins', 'project roi'],
    category: 'profitability',
    titleTemplate: 'Project Profitability Overview',
    priority: 95,
    nextQuestions: ['consultant-project-allocation', 'project-revenue-breakdown'],
    generateNarrative: (data: InsightData) => {
      const projects = data.projects || []

      if (projects.length === 0) {
        return {
          headline: {
            title: 'No Project Data Available',
            subtitle: 'Project metadata is not loaded',
            metric: {
              value: '0',
              label: 'Projects'
            }
          },
          sections: [{
            type: 'callout',
            content: 'Project data needs to be loaded to generate this insight.'
          }],
          relatedInsights: []
        }
      }

      // Calculate project stats
      const activeProjects = projects.filter((p: any) => p.status === 'active')
      const totalRevenue = projects.reduce((sum: number, p: any) => sum + (p.financial?.revenue || 0), 0)
      const totalCosts = projects.reduce((sum: number, p: any) => sum + (p.financial?.costs?.totalConsultantCosts || 0), 0)
      const totalProfit = totalRevenue - totalCosts
      const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

      // Sort projects by profitability
      const projectsWithMargins = projects
        .filter((p: any) => p.financial?.revenue > 0)
        .map((p: any) => ({
          name: p.name,
          revenue: p.financial.revenue,
          costs: p.financial.costs.totalConsultantCosts,
          profit: p.financial.profitability.grossProfit,
          margin: p.financial.profitability.grossMargin,
          status: p.status
        }))
        .sort((a: any, b: any) => b.profit - a.profit)

      // Find most and least profitable
      const mostProfitable = projectsWithMargins[0]
      const leastProfitable = projectsWithMargins[projectsWithMargins.length - 1]

      return {
        headline: {
          title: `Analyzing ${projects.length} Projects Across Portfolio`,
          subtitle: `${activeProjects.length} currently active`,
          metric: {
            value: formatCurrency(totalProfit),
            label: 'Total Gross Profit',
            trend: {
              direction: overallMargin > 30 ? 'up' : overallMargin > 15 ? 'flat' : 'down',
              percentage: overallMargin,
              comparison: 'average margin'
            }
          }
        },
        sections: [
          {
            type: 'metric',
            title: 'Portfolio Summary',
            content: `Your ${projects.length} projects have generated ${formatCurrency(totalRevenue)} in revenue with ${formatCurrency(totalCosts)} in consultant costs, yielding an overall margin of ${formatPercent(overallMargin)}.`,
            data: {
              metrics: [
                { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: '💰' },
                { label: 'Total Costs', value: formatCurrency(totalCosts), icon: '💸' },
                { label: 'Gross Profit', value: formatCurrency(totalProfit), icon: '📈' },
                { label: 'Avg Margin', value: formatPercent(overallMargin), icon: '🎯' }
              ]
            }
          },
          {
            type: 'breakdown',
            title: '🏆 Most Profitable Project',
            content: mostProfitable ?
              `**${mostProfitable.name}** leads with ${formatCurrency(mostProfitable.profit)} profit (${formatPercent(mostProfitable.margin)} margin) on ${formatCurrency(mostProfitable.revenue)} revenue.` :
              'No profitable projects yet.'
          },
          {
            type: 'breakdown',
            title: '⚠️ Least Profitable Project',
            content: leastProfitable && projectsWithMargins.length > 1 ?
              `**${leastProfitable.name}** shows ${formatCurrency(leastProfitable.profit)} profit (${formatPercent(leastProfitable.margin)} margin). ${leastProfitable.margin < 15 ? 'Consider reviewing cost structure.' : 'Still healthy margins.'}` :
              'All projects performing well.'
          },
          {
            type: 'chart',
            title: 'Project Performance Comparison',
            visualization: {
              type: 'bar',
              data: projectsWithMargins.slice(0, 8),
              config: {
                xKey: 'name',
                yKey: 'profit',
                format: 'currency'
              }
            }
          }
        ],
        recommendations: [
          overallMargin > 35 ? {
            type: 'success',
            icon: '🎉',
            title: 'Excellent portfolio performance',
            description: `Your ${formatPercent(overallMargin)} average margin is outstanding. Focus on scaling your high-performing projects.`
          } : overallMargin > 20 ? {
            type: 'info',
            icon: '💡',
            title: 'Solid profitability',
            description: `${formatPercent(overallMargin)} margin is healthy. Look for opportunities to optimize lower-margin projects.`
          } : {
            type: 'warning',
            icon: '⚠️',
            title: 'Margin improvement needed',
            description: `${formatPercent(overallMargin)} margin suggests cost optimization opportunities. Review consultant allocations.`,
            action: {
              label: 'Analyze consultant costs',
              insightId: 'consultant-project-allocation'
            }
          },
          {
            type: 'opportunity',
            icon: '🔍',
            title: 'Deep-dive into top performers',
            description: `Study what makes ${mostProfitable?.name || 'your best projects'} successful and replicate those patterns.`
          }
        ],
        relatedInsights: ['consultant-project-allocation', 'project-revenue-breakdown', 'profitability-check']
      }
    }
  },

  // CONSULTANT SPEND BY PROJECT
  {
    id: 'consultant-project-allocation',
    triggers: ['consultant by project', 'consultant spend project', 'project consultant costs', 'who worked on project', 'consultant allocation'],
    category: 'expense',
    titleTemplate: 'Consultant Allocation by Project',
    priority: 90,
    nextQuestions: ['project-profitability-overview', 'consultant-analysis'],
    generateNarrative: (data: InsightData) => {
      const projects = data.projects || []

      if (projects.length === 0) {
        return {
          headline: {
            title: 'No Project Data Available',
            metric: { value: '0', label: 'Projects' }
          },
          sections: [],
          relatedInsights: []
        }
      }

      // Build consultant → projects mapping
      const consultantProjectMap = new Map<string, any[]>()
      let totalConsultantCosts = 0

      projects.forEach((project: any) => {
        if (project.financial?.costs?.consultants) {
          project.financial.costs.consultants.forEach((consultant: any) => {
            if (!consultantProjectMap.has(consultant.name)) {
              consultantProjectMap.set(consultant.name, [])
            }
            consultantProjectMap.get(consultant.name)!.push({
              projectName: project.name,
              projectStatus: project.status,
              allocatedCost: consultant.allocatedCost,
              allocationPercent: consultant.allocationPercent
            })
            totalConsultantCosts += consultant.allocatedCost
          })
        }
      })

      // Sort consultants by total spend
      const consultantSummaries = Array.from(consultantProjectMap.entries())
        .map(([name, projectAllocations]) => ({
          name,
          totalSpend: projectAllocations.reduce((sum, p) => sum + p.allocatedCost, 0),
          projectCount: projectAllocations.length,
          projects: projectAllocations
        }))
        .sort((a, b) => b.totalSpend - a.totalSpend)

      const topConsultant = consultantSummaries[0]

      return {
        headline: {
          title: 'Consultant Costs Across All Projects',
          subtitle: `${consultantSummaries.length} consultants working across ${projects.length} projects`,
          metric: {
            value: formatCurrency(totalConsultantCosts),
            label: 'Total Consultant Spend'
          }
        },
        sections: [
          {
            type: 'breakdown',
            title: '👥 Top Consultant by Spend',
            content: topConsultant ?
              `**${topConsultant.name}** has been allocated ${formatCurrency(topConsultant.totalSpend)} across ${topConsultant.projectCount} project${topConsultant.projectCount > 1 ? 's' : ''}.` :
              'No consultant allocations found.'
          },
          {
            type: 'list',
            title: 'Consultant Breakdown',
            data: {
              items: consultantSummaries.slice(0, 10).map(c => ({
                label: c.name,
                value: formatCurrency(c.totalSpend),
                detail: `${c.projectCount} project${c.projectCount > 1 ? 's' : ''}`,
                subItems: c.projects.map((p: any) =>
                  `${p.projectName}: ${formatCurrency(p.allocatedCost)} (${formatPercent(p.allocationPercent)})`
                )
              }))
            }
          },
          {
            type: 'chart',
            title: 'Consultant Spend Distribution',
            visualization: {
              type: 'bar',
              data: consultantSummaries.slice(0, 8).map(c => ({
                consultant: c.name,
                spend: c.totalSpend
              })),
              config: {
                xKey: 'consultant',
                yKey: 'spend',
                format: 'currency'
              }
            }
          }
        ],
        recommendations: [
          {
            type: 'info',
            icon: '📊',
            title: 'Well-distributed workload',
            description: `Consultant work is spread across ${consultantSummaries.length} team members, with ${topConsultant?.name || 'your lead consultant'} carrying the largest allocation.`
          },
          consultantSummaries.some(c => c.projectCount > 3) ? {
            type: 'warning',
            icon: '⚠️',
            title: 'Watch for overallocation',
            description: 'Some consultants are spread across many projects. Monitor for burnout risk and quality impacts.'
          } : {
            type: 'success',
            icon: '✅',
            title: 'Healthy project distribution',
            description: 'No consultants are overextended across too many concurrent projects.'
          }
        ],
        relatedInsights: ['project-profitability-overview', 'consultant-analysis', 'largest-expense-ytd']
      }
    }
  },

  // PROJECT REVENUE BREAKDOWN
  {
    id: 'project-revenue-breakdown',
    triggers: ['project revenue', 'revenue by project', 'which projects make money', 'project income', 'revenue sources project'],
    category: 'revenue',
    titleTemplate: 'Revenue by Project',
    priority: 88,
    nextQuestions: ['project-profitability-overview', 'revenue-sources'],
    generateNarrative: (data: InsightData) => {
      const projects = data.projects || []

      if (projects.length === 0) {
        return {
          headline: {
            title: 'No Project Data Available',
            metric: { value: '0', label: 'Projects' }
          },
          sections: [],
          relatedInsights: []
        }
      }

      // Calculate revenue stats
      const projectRevenues = projects
        .filter((p: any) => p.financial?.revenue > 0)
        .map((p: any) => ({
          name: p.name,
          client: p.client,
          revenue: p.financial.revenue,
          status: p.status,
          invoiceCount: p.financial.revenueDetails?.length || 0
        }))
        .sort((a, b) => b.revenue - a.revenue)

      const totalRevenue = projectRevenues.reduce((sum, p) => sum + p.revenue, 0)
      const activeRevenue = projectRevenues.filter(p => p.status === 'active').reduce((sum, p) => sum + p.revenue, 0)
      const topProject = projectRevenues[0]
      const topProjectShare = topProject ? (topProject.revenue / totalRevenue) * 100 : 0

      return {
        headline: {
          title: 'Revenue Distribution Across Projects',
          subtitle: `${projectRevenues.length} revenue-generating projects`,
          metric: {
            value: formatCurrency(totalRevenue),
            label: 'Total Project Revenue'
          }
        },
        sections: [
          {
            type: 'breakdown',
            title: '🏆 Top Revenue Generator',
            content: topProject ?
              `**${topProject.name}** for ${topProject.client} leads with ${formatCurrency(topProject.revenue)} (${formatPercent(topProjectShare)} of total revenue). ${topProject.invoiceCount} invoice${topProject.invoiceCount !== 1 ? 's' : ''} issued.` :
              'No revenue-generating projects yet.'
          },
          {
            type: 'metric',
            title: 'Revenue Stats',
            data: {
              metrics: [
                { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: '💰' },
                { label: 'Active Projects', value: formatCurrency(activeRevenue), icon: '🔄' },
                { label: 'Avg per Project', value: formatCurrency(totalRevenue / Math.max(projectRevenues.length, 1)), icon: '📊' }
              ]
            }
          },
          {
            type: 'list',
            title: 'Revenue by Project',
            data: {
              items: projectRevenues.slice(0, 10).map(p => ({
                label: p.name,
                value: formatCurrency(p.revenue),
                detail: `${p.client} • ${p.status}`,
                badge: p.status === 'active' ? '🟢' : p.status === 'completed' ? '✅' : '⏸️'
              }))
            }
          },
          {
            type: 'chart',
            title: 'Project Revenue Comparison',
            visualization: {
              type: 'bar',
              data: projectRevenues.slice(0, 8),
              config: {
                xKey: 'name',
                yKey: 'revenue',
                format: 'currency'
              }
            }
          }
        ],
        recommendations: [
          topProjectShare > 50 ? {
            type: 'warning',
            icon: '⚠️',
            title: 'Revenue concentration risk',
            description: `${topProject?.name || 'Your top project'} represents ${formatPercent(topProjectShare)} of revenue. Consider diversifying client base.`
          } : {
            type: 'success',
            icon: '✅',
            title: 'Well-diversified revenue',
            description: 'Revenue is balanced across multiple projects, reducing dependency risk.'
          },
          {
            type: 'opportunity',
            icon: '💡',
            title: 'Replicate top performers',
            description: `Study the engagement model of ${topProject?.name || 'high-revenue projects'} and apply learnings to other clients.`
          }
        ],
        relatedInsights: ['project-profitability-overview', 'revenue-sources', 'profitability-check']
      }
    }
  },
]

// Helper function to search insights
export function searchInsights(query: string): string[] {
  const lowerQuery = query.toLowerCase().trim()

  if (!lowerQuery) return []

  const matches = insightTemplates
    .filter(template =>
      template.triggers.some(trigger =>
        trigger.includes(lowerQuery) || lowerQuery.includes(trigger)
      )
    )
    .sort((a, b) => b.priority - a.priority)
    .map(template => template.id)

  return matches.slice(0, 5) // Return top 5 matches
}

// Get insight by ID
export function getInsightTemplate(id: string): InsightTemplate | undefined {
  return insightTemplates.find(template => template.id === id)
}

// Get all insights for a category
export function getInsightsByCategory(category: string): InsightTemplate[] {
  return insightTemplates
    .filter(template => template.category === category)
    .sort((a, b) => b.priority - a.priority)
}
