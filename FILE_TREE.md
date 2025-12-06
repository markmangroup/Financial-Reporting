# File Tree Structure

## Root Configuration Files
```
.
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.js
├── postcss.config.js
├── tailwind.config.js
├── .eslintrc.json
├── .gitignore
├── .env.local
└── next-env.d.ts
```

## Source Code (src/)

### App Routes (src/app/)
```
src/app/
├── api/
│   ├── consultant-work-history/route.ts
│   ├── consultants/route.ts
│   ├── credit-card-data/route.ts
│   ├── export-consultant-emails/route.ts
│   ├── generate-resume-pdf/route.ts
│   ├── projects/route.ts
│   ├── save-email-review/route.ts
│   └── sharepoint/sync/route.ts
├── globals.css
├── layout.tsx
├── page.tsx
├── jill-interview/page.tsx
├── resume/page.tsx
├── resume-pdf/page.tsx
├── review-consultant-emails/page.tsx
├── test-email-analysis/page.tsx
└── wind-down/page.tsx
```

### Components (src/components/)
```
src/components/
├── charts/FinancialCharts.tsx
├── consultant/EmailAnalysisButton.tsx
├── currencies/BTCDashboard.tsx
├── financial/
│   ├── AnalyticsDashboard.tsx
│   ├── BalanceSheet.tsx
│   ├── CashFlowStatement.tsx
│   ├── ContractorCosts.tsx
│   ├── ContractorCostsPage.tsx
│   └── IncomeStatement.tsx
├── insights/
│   ├── BreadcrumbNav.tsx
│   ├── InsightSkeleton.tsx
│   ├── InsightsInterface.tsx
│   ├── NarrativeBlock.tsx
│   ├── QuickCapture.tsx
│   ├── SearchBox.tsx
│   ├── SmartDiscovery.tsx
│   └── Sparkline.tsx
├── layout/
│   ├── DualViewLayout.tsx
│   └── Navigation.tsx
├── operating/OperatingDashboard.tsx
├── projects/
│   ├── ProjectCard.tsx
│   ├── ProjectDetail.tsx
│   └── ProjectsExplorer.tsx
├── sharepoint/SharePointSyncButton.tsx
├── ui/FileUpload.tsx
├── validation/
│   ├── DataValidation.tsx
│   └── TransactionAudit.tsx
└── visualizations/
    ├── BalanceSheetDashboard.tsx
    ├── CashFlowBridgeChart.tsx
    ├── CashFlowInsights.tsx
    ├── ComparativeAnalysis.tsx
    ├── ConsultantBreakdown.tsx
    ├── ConsultantSpendChart.tsx
    ├── CreditCardSubledger.tsx
    ├── ExecutiveSummaryDashboard.tsx
    ├── ExpenseAnalysisChart.tsx
    ├── ExpenseWaterfall.tsx
    ├── ExpenseWaterfallChart.tsx
    ├── HeroBalanceSheet.tsx
    ├── HeroIncomeStatement.tsx
    ├── IncomeStatementDashboard.tsx
    ├── KPIDashboard.tsx
    ├── KeyMetricCards.tsx
    ├── OperationalMetricsDashboard.tsx
    ├── RevenueBreakdown.tsx
    ├── RevenuePerformanceChart.tsx
    ├── RevenueTrendChart.tsx
    └── StrategicKPITracker.tsx
```

### Libraries (src/lib/)
```
src/lib/
├── billComDataLoader.ts
├── billComParser.ts
├── consultantDataLoader.ts
├── consultantSubledgerLoader.ts
├── consultantSubledgerParser.ts
├── consultantWorkHistoryLoader.ts
├── creditCardDataLoader.ts
├── creditCardParser.ts
├── csvParser.ts
├── dataAuditor.ts
├── dataValidator.ts
├── financialCalculations.ts
├── insights/
│   ├── comparisonUtils.ts
│   ├── consultantReconciliation.ts
│   ├── dataLoader.ts
│   ├── insightTemplates.ts
│   ├── insightTypes.ts
│   └── tagSystem.ts
├── loadRealData.ts
├── monthlyReconciliation.ts
├── outlook/outlookClient.ts
├── projectDataLoader.ts
├── reconciliationValidator.ts
├── sharepoint/sharepointClient.ts
├── subledgerReconciliation.ts
└── utils/rounding.ts
```

### Types (src/types/)
```
src/types/
├── index.ts
└── project.ts
```

### Data (src/data/)
```
src/data/
└── sampleData.ts
```

## Data Files (data/)

```
data/
├── MIGRATION-STATUS.md
├── SESSION-SUMMARY-2025-11-07.md
├── accounting-master.xlsx
├── bill-com-bills.csv
├── bill-com-vendors.csv
├── billcom-payments-2025-11-10.csv
├── billcom-vendor-details.json
├── consultant-project-mapping.json
├── consultants/_schema.json
├── document-downloads-log.json
├── laurel-analysis.json
├── laurel-forecast.xlsx
├── laurel-master-data.xlsx
├── markman-group-wind-down-checklist.md
├── metropolitan-forecast.xlsx
├── project-profitability-analysis.json
├── project-profitability-final.json
├── project-profitability-summary.md
├── project-profitability-updated.md
├── projects/
│   ├── _schema.json
│   ├── braindead-portal/metadata.json
│   ├── dittmar-ap-automation/metadata.json
│   ├── laurel-ag-proposal-tools/
│   │   ├── metadata.json
│   │   └── deliverables/ (multiple .xlsx files)
│   ├── markman-internal/
│   │   ├── metadata.json
│   │   └── documentation/ (time sheet templates)
│   ├── mdl-pitch/metadata.json
│   ├── metropolitan-current-state/metadata.json
│   ├── notice-board/metadata.json
│   └── siguler-guff/
│       ├── code-analysis.json
│       └── metadata.json
├── sharepoint-inventory-2025-11-07.json
├── validation-report.json
├── violet-street-consolidated-income-statement.json
├── wind-down-execution-tracker.md
└── wind-down-proof/
    ├── README.md
    ├── anthropic-openai-moved-proof.md
    └── microsoft-license-reduction-proof.md
```

## Documentation (docs/)
```
docs/
├── CLAUDE-IN-APP-VISION.md
├── CODEX-REVIEW-ANALYSIS.md
├── IDENTITY-CRISIS-AND-PATH-FORWARD.md
├── INDEPENDENT-REVIEW-PROMPT.md
├── INSIGHTS-IMPROVEMENT-PLAN.md
├── MIKE-OS-VISION.md
├── SHAREPOINT_SETUP.md
├── THE-REAL-PROBLEM.md
├── credit-card-subledger-integration-plan.md
├── how-to-search-swan-communications.md
├── insights-enhancement-plan.md
├── missing-visualizations-roadmap.md
├── project-profitability-next-steps.md
├── sharepoint-timesheet-search-instructions.md
├── violet-street-excel-audit.md
└── violet-street-vs-markman-comparison.md
```

## Root Scripts & Analysis Files
```
Root level analysis scripts:
├── analyze-all-project-codebases.js
├── analyze-consultant-project-mapping.js
├── analyze-github-repos.js
├── analyze-historical-data.js
├── analyze-july-example.js
├── analyze-miscellaneous.js
├── analyze-project-profitability.js
├── audit-github-repos.js
├── calculate-final-profitability.js
├── check-credit-card-payments.js
├── comprehensive-contractor-reconciliation.js
├── debug-payment-discrepancy.js
├── debug-reconciliation-discrepancy.js
├── debug-transactions.js
├── download-sharepoint-documents.js
├── extract-document-text.js
├── extract-siguler-code-structure.js
├── final-contractor-reconciliation.js
├── find-sharepoint-site.js
├── identify-one-off-payments.js
├── inventory-sharepoint-with-auth.js
├── inventory-sharepoint.js
├── reconcile-consultants.js
├── reconcile-upwork-payments.js
├── search-sharepoint-timesheets.js
├── search-swan-communications.js
├── test-comprehensive-filters.js
├── test-corrected-periods.js
├── test-email-api.js
├── test-fixed-categories.js
├── test-monthly-reconciliation.js
├── test-new-categories.js
├── test-payment-periods.js
├── test-return-transactions.js
├── test-subledger-reconciliation.js
├── test-updated-reconciliation.js
└── validate-migration.js
```

## Public Assets (public/)
```
public/
├── bill-com-bills.csv
├── bill-com-vendors.csv
├── consultant-subledger-template.csv
├── data/consultant-work-history/ (JSON files)
└── resume-generated.pdf
```



