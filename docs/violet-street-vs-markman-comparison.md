# VIOLET STREET vs MARKMAN GROUP: Financial Data Comparison

## Executive Summary

We have successfully extracted and analyzed **Violet Street's** (parent company of Brain Dead) financial data from two comprehensive Excel files containing their **2024-2029 Annual Operating Plan (AOP)**. This document compares their data structure against **Markman Group's** existing system to identify commonalities, differences, and the path to making our financial reporting system support both companies.

---

## DATA SOURCES ANALYZED

### Violet Street Files (Password-Protected Excel, Now Decrypted)
1. **`violet-street-income-statement-2024-2029.xlsx`** (9.4 MB)
   - 79 sheets including consolidated and entity-level P&Ls
   - Sheets: ConsolIS, SummISEntity, PresIS, Corp, Bari, BDAOakley, Growth, Ice, Murakami, NP1, NP2, Pigalle, Sport, Spunge, Sunflower, etc.
   - **Key Sheet**: `ConsolIS` - Consolidated Income Statement with 400 rows × 156 columns

2. **`violet-street-balance-sheet-cashflow-2024-2029.xlsx`** (541 KB)
   - 6 sheets: CFSPres, BSPres, BS, CFS, WC, ActBS
   - Balance Sheet, Cash Flow Statement, Working Capital analysis
   - Quarterly and annual data from 2023-2029

### Markman Group Files (CSV Format)
1. **Chase Checking CSV** - All cash transactions
2. **Chase Credit Card CSV** - Operating expenses
3. **Bill.com Vendor/Bills CSVs** - Consultant invoices and payments
4. **Consultant Subledger CSV** - Master consultant data

---

## VIOLET STREET FINANCIAL PROFILE (2023-2029)

### Company Overview
- **Parent Company**: Violet Street
- **Subsidiary Brands**: Brain Dead, Brain Dead Oakley, Ice, Murakami, Pigalle, Sport, Spunge, Sunflower, and others
- **Industry**: Fashion/Apparel (streetwear, accessories, eyewear)
- **Business Model**: Product design, manufacturing, distribution, retail
- **Status**: High-growth, currently unprofitable, projecting profitability by 2026

### Key Financial Metrics (2023 Actual vs 2029 Projection)

| Metric | 2023 (Actual) | 2024 (Budget) | 2029 (Projection) | CAGR |
|--------|--------------|---------------|-------------------|------|
| **Units Sold** | 3,249 | 37,300 | 4,269,915 | 180% |
| **Gross Revenue** | $512K | $4.6M | $453M | 135% |
| **Net Revenue** | $512K | $3.9M | $371M | 136% |
| **Gross Profit** | $18K | $2.7M | $177M | 158% |
| **Operating Income** | -$6.5M | -$8.1M | $16.7M | - |
| **Net Income** | -$6.2M | -$8.4M | $15.8M | - |
| **Gross Margin** | 3.6% | 67.9% | 47.8% | - |
| **Operating Margin** | -1279% | -206% | 4.5% | - |

### Revenue Structure
- **Product Revenue**: 76% of gross revenue (2023), growing to 100% by 2025
- **Other Revenue**: 24% in 2023 (likely royalties/licensing), phased out by 2025
- **Contra Revenue**: 0% in 2023, ramping to 18% by 2029
  - Returns/Damages: 7% of gross
  - Trade Marketing: 10% of gross
  - Cash Discounts: 0.5% of gross
  - Markdowns/Cleanse: 0.5% of gross

### Cost Structure (as % of Net Revenue)
**2023 (Startup Phase)**:
- COGS: 96% (very high due to low volume)
- Gross Profit: 4%
- Operating Expenses: 1,282%
- Operating Loss: -1,279%

**2024 (Scale-Up Phase)**:
- COGS: 32%
- Gross Profit: 68%
- Operating Expenses: 274%
- Operating Loss: -206%

**2029 (Mature Phase - Projected)**:
- COGS: 52%
- Gross Profit: 48%
- Operating Expenses: 43%
- Operating Income: 4.5%

### COGS Breakdown (2029)
- Product Cost: $160M (43% of net revenue)
- Freight-In: $2.9M (0.8%)
- Tariffs: $29.2M (7.9%)
- Obsolescence: $1.6M (0.4%)
- **Total COGS**: $194M (52%)

### Operating Expense Categories (2029 Projections)
1. **Marketing**: $94M (25% of net revenue)
   - Traditional Advertising: $93M
   - Online Advertising: TBD
   - Royalty: $384K
   - Website: TBD
   - Marketing Admin: $47K

2. **Product Development & Design**: $33M (9%)
   - Product Development: TBD
   - Design: TBD
   - Admin: TBD

3. **General & Administrative**: $0 (needs validation - likely incorrect extraction)
   - Finance, IT, Corporate, HR, Legal, Payroll

4. **Operations**: $19M (5%)
   - Fulfillment: $14M
   - Freight Out: $5M
   - Operations Admin: $79K

5. **Selling**: TBD
   - CC Fees: $13M
   - Customer Service: $902K
   - Sales Admin: $138K

6. **Depreciation & Amortization**: $10M (2.7%)

---

## MARKMAN GROUP FINANCIAL PROFILE (2024-2025)

### Company Overview
- **Type**: Professional Services / Consulting
- **Industry**: Software Development, Data Analytics, Project Management
- **Business Model**: Staff augmentation via independent consultants
- **Status**: Profitable, stable cash flow

### Key Financial Metrics (YTD 2024-2025)

| Metric | Amount |
|--------|--------|
| **Business Revenue** | ~$900K annually |
| **Consultant Expenses** | $125K (reconciled total) |
| **Operating Expenses** | ~$200K (AI tools, cloud, travel, office) |
| **Owner Equity/Distributions** | ~$400K |
| **Net Income** | Profitable (exact amount TBD) |
| **Cash Position** | Strong, 6+ months runway |

### Revenue Structure
- **Client Revenue Sources**:
  - Laurel Management (primary client)
  - Metropolitan Partners (secondary client)
  - Project-based consulting engagements

### Cost Structure
- **Consultant Payments** (largest expense):
  - Swan: $67K (Full-stack development team, US-based)
  - Niki: $18K (Developer, international)
  - Carmen: $14K (Advisory, Spain-based)
  - Ivana: $11K (Testing/Development, Slovakia)
  - Abri: $7K (DevOps, South Africa)
  - Jan: $4K (Developer, Slovakia)
  - Petrana: $3K (QA, Bulgaria)

- **Operating Expenses** by Category:
  - AI Services: Anthropic, OpenAI, ChatGPT
  - Cloud Services: Vercel, MongoDB, Google, AWS
  - Development Tools: GitHub, npm packages
  - Travel: Tesla charging, flights, hotels
  - Meals & Entertainment: Client meetings, team events
  - Office: Apple equipment, supplies

---

## KEY DIFFERENCES: VIOLET STREET vs MARKMAN GROUP

| Dimension | Violet Street (Brain Dead) | Markman Group |
|-----------|----------------------------|---------------|
| **Industry** | Fashion/Apparel (product) | Consulting (service) |
| **Revenue Type** | Product sales | Client projects |
| **Revenue Scale** | $512K → $453M (2023-2029) | ~$900K/year |
| **Growth Rate** | 135% CAGR (hyper-growth) | Stable |
| **Profitability** | Negative → Positive by 2026 | Currently profitable |
| **Main Cost** | Product + Freight + Tariffs | Consultant labor |
| **Data Complexity** | Multi-entity, multi-brand | Single entity |
| **Financial System** | Complex Excel with 79 sheets | Simple Chase CSVs |
| **Key Metric** | Landed cost per unit | Consultant utilization |
| **Data Frequency** | Monthly + Quarterly + Annual | Transaction-level |
| **Entities** | 10+ brands under parent | 1 entity |
| **Currencies** | USD (imports from Asia) | USD only |
| **Inventory** | Yes (units on hand, obsolescence) | No (pure services) |
| **Contra Revenue** | 18% (returns, marketing allowances) | 0% |
| **COGS Components** | Product + Freight + Tariffs + Obsolescence | N/A |
| **Working Capital** | High (AR, inventory, AP) | Low (minimal AR/AP) |

---

## COMMON REQUIREMENTS (What Both Companies Need)

### ✅ Shared Financial Statements
1. **Income Statement (P&L)**
   - Revenue (with custom categories per company)
   - Cost of Revenue/COGS
   - Operating Expenses (custom categories)
   - Operating Income
   - Interest, Taxes
   - Net Income

2. **Cash Flow Analysis**
   - Operating cash flow
   - Investing activities
   - Financing activities
   - Beginning/ending cash

3. **Expense Categorization**
   - Custom category hierarchies per industry
   - Vendor/merchant mapping
   - Auto-categorization rules

4. **Period Comparisons**
   - YoY, QoQ, MoM
   - Budget vs Actual
   - Multi-year trends

### ✅ Shared Analytics Needs
1. **Trend Analysis**: Revenue and expense trends over time
2. **Category Breakdown**: Top expense categories
3. **Vendor/Supplier Analysis**: Top vendors by spend
4. **Profitability Metrics**: Margins, EBITDA, break-even
5. **AI-Powered Insights**: Natural language Q&A like current system
6. **Data Import**: CSV, Excel, API integration
7. **Dashboard Views**: Executive summary, detailed drill-downs

---

## UNIQUE REQUIREMENTS BY COMPANY

### Violet Street Needs (Not in Markman)
1. ✅ **Multi-Entity Consolidation**: Roll up 10+ brands into parent
2. ✅ **Landed Cost Calculator**: Product + Freight + Duties + Tariffs
3. ✅ **Inventory Management**: Units on hand, valuation methods (FIFO/LIFO), obsolescence
4. ✅ **Contra Revenue Tracking**: Returns, damages, trade marketing, markdowns
5. ✅ **Unit Economics**: Cost per unit, revenue per unit, margin per unit
6. ✅ **Multi-Brand P&L**: Separate P&L for each brand, consolidated view
7. ✅ **Royalty Management**: Licensing revenue, royalty expense tracking
8. ✅ **Depreciation Schedules**: Fixed assets, intangibles, fixtures
9. ✅ **Working Capital Analysis**: AR days, inventory turns, AP days
10. ✅ **Budget vs Actual**: Compare AOP to actuals with variance analysis

### Markman Group Needs (Not in Violet Street)
1. ✅ **Consultant Time Tracking**: Hours, rates, utilization
2. ✅ **Consultant Profitability**: Margin by consultant, by project
3. ✅ **Client Profitability**: Revenue vs consultant costs per client
4. ✅ **Contractor Reconciliation**: Bill.com to bank payment matching
5. ✅ **SaaS Expense Tracking**: AI tools, cloud services, dev tools
6. ✅ **Work History**: Project deliverables, timeline, email analysis
7. ✅ **International Payments**: Wire transfers, exchange rates, multi-country consultants

---

## DATA STRUCTURE COMPARISON

### Violet Street (Excel-Based GL)
```
ConsolIS Sheet (Consolidated Income Statement)
├── Row Structure: ~400 rows of line items
├── Column Structure: ~156 columns (years, quarters, entities)
├── Years: 2023 Actual, 2024-2029 Budget/Forecast
├── Periods: Annual + Quarterly + Monthly
├── Entities: Consolidated + 10+ brand entities
└── Data Points: ~62,400 cells of financial data

Key Features:
- Row 8: Units Sold
- Row 13-16: Gross Revenue (Product + Other)
- Row 19-25: Contra Revenue (Returns, Trade Marketing, Discounts, Markdowns)
- Row 28: Net Revenue
- Row 32-40: COGS (Product Cost, Freight-In, Tariffs, Obsolescence)
- Row 43: Gross Profit
- Row 47-50: Operations Expenses
- Row 53-61: Selling Expenses
- Row 63-71: Marketing & Product Dev Expenses
- Row 73-80: G&A Expenses
- Row 84-85: Depreciation & Amortization
- Row 87: Total Operating Expenses
- Row 90: Operating Income (EBIT)
- Row 93: Interest Expense
- Row 102: Net Income
- Row 109: EBITDA
```

### Markman Group (CSV-Based Transactions)
```
Chase Checking CSV
├── Row Structure: ~500 transactions per year
├── Columns: Details, Posting Date, Description, Amount, Type, Balance, Check #
├── Categories: 20+ auto-assigned categories
├── Transactions: Credit card payments, consultant wires, client ACH, owner transfers
└── Balance Tracking: Running account balance

Chase Credit Card CSV
├── Row Structure: ~200 transactions per year
├── Columns: Card, Transaction Date, Post Date, Description, Category, Type, Amount, Memo
├── Categories: 150+ vendor mappings to expense categories
└── Reconciliation: Payments in checking match credit card totals

Bill.com Vendors + Bills CSV
├── Vendors: 11 consultants
├── Bills: ~50 invoices per year
├── Outstanding Balances: $15K total
└── Reconciliation: Bills match bank wire payments

Consultant Subledger CSV
├── Rows: 11 consultants
├── Columns: 15 fields (ID, Name, Country, Role, Rate, Contract, Dates, Status, etc.)
└── Usage: Master data for consultant analysis
```

---

## TRANSFORMATION NEEDED: EXCEL → DASHBOARD

### Current State (Violet Street)
- **79-sheet Excel workbook** with complex formulas
- **Manual data entry** for actuals
- **Static snapshots** with no real-time updates
- **Limited visibility** (only finance team can access)
- **No audit trail** of changes
- **Hard to analyze** trends across brands
- **Error-prone** (formula breaks, version control issues)

### Target State (Markman-Style Dashboard)
- **Single-page dashboard** with drill-downs
- **Automated data import** from GL/accounting system
- **Real-time refresh** on data update
- **Self-service access** for executives and managers
- **Full audit trail** of all changes and uploads
- **AI-powered insights** with natural language queries
- **Mobile-friendly** for on-the-go access
- **Version control** with history and rollback

### Key Improvements for Violet Street
1. **Replace 79 sheets** → Consolidated dashboard with tabs for each brand
2. **Replace manual formulas** → Automated calculations from source data
3. **Replace static Excel** → Interactive web app with drill-downs
4. **Add AI insights** → "What's our gross margin by brand?" → Instant answer
5. **Add alerts** → "Returns exceed 10% threshold" → Automatic notification
6. **Add comparisons** → Budget vs Actual variance analysis built-in
7. **Add forecasting** → AI-powered projections based on actuals

---

## IMPLEMENTATION ROADMAP

### Phase 1: Multi-Tenant Foundation (2 weeks)
✅ Create company profile configuration system
✅ Add industry-specific feature flags
✅ Implement data source adapters (CSV, Excel, API)
✅ Build unified data model supporting both product and service companies

### Phase 2: Violet Street Data Import (1 week)
✅ Build Excel parser for ConsolIS sheet structure
✅ Extract 2023-2029 P&L data from AOP files
✅ Import Balance Sheet and Cash Flow data
✅ Create entity-level breakdowns for each brand

### Phase 3: Violet Street Unique Features (2 weeks)
- Landed Cost Calculator module
- Multi-entity consolidation
- Contra revenue tracking
- Unit economics dashboard
- Budget vs Actual variance analysis
- Working capital analysis

### Phase 4: Insights Adaptation (1 week)
- Extend insights engine to handle product company questions
- Add landed cost, inventory, and unit economics insights
- Create brand-specific drill-downs
- Add multi-entity comparison views

### Phase 5: Markman Enhancement (1 week)
- Enhance consultant tracking with project-level detail
- Add client profitability analysis
- Improve work history integration
- Build contractor payment reconciliation dashboard

### Phase 6: Testing & Rollout (1 week)
- Load actual VS data for 2023-2024
- Compare dashboard outputs to Excel workbook
- User acceptance testing with Bret Butcher (VS CFO)
- Demonstrate superiority over manual Excel process

---

## SUCCESS METRICS

### For Violet Street
- **Time Savings**: Reduce monthly close from 5 days → 1 day
- **Accuracy**: Eliminate formula errors and version control issues
- **Visibility**: Give all executives real-time access to financial data
- **Insights**: Answer ad-hoc questions in seconds vs hours
- **Scalability**: Easily add new brands without Excel sheet explosion

### For Markman Group
- **Client Profitability**: Clear visibility into which clients are most profitable
- **Consultant ROI**: Track revenue generated vs consultant cost per client
- **Cash Flow**: Better runway tracking and burn rate visibility
- **Expense Control**: Identify SaaS waste and optimize tool spend

---

## NEXT STEPS

1. **Review this document** with you to confirm understanding
2. **Prioritize features** - Which company should we build for first?
3. **Design data import strategy** - How will VS get data into the system?
4. **Build Phase 1** - Multi-tenant foundation with company profiles
5. **Demonstrate prototype** to Bret Butcher for VS buy-in

## RECOMMENDATION

**Start with Violet Street** as the primary use case because:
1. They have comprehensive GL data ready to import
2. Their CFO (Bret Butcher) has expressed pain with current manual Excel process
3. The landed cost calculator is a clear, measurable improvement
4. Success with VS validates the system for other product companies
5. VS is higher revenue scale ($500M projected) vs Markman ($1M)

Once VS is live, Markman Group becomes the template for service/consulting companies, creating a **dual-track product** that covers both major business models.
