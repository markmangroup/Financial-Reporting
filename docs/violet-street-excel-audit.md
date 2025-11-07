# VIOLET STREET EXCEL AUDIT - Data Flow & Source Analysis

## Executive Summary

Violet Street's financial model consists of **TWO main Excel workbooks** with **85 sheets total** containing a complex web of formulas that consolidate data from **monthly GL actuals** (Jan 2023 onwards) into **multi-year forecasts** (2024-2029) across **10+ brand entities**.

**Key Finding**: The workbooks are **96-99% formula-driven** with actual source data coming from:
1. **ActBS sheet** (Actual Balance Sheet) - Monthly GL account balances from QuickBooks/accounting system
2. **Key sheet** - Configuration parameters (contra revenue %, channel programs)
3. **Brand entity input sheets** - Some have input rows marked with 'x' that feed the consolidation

---

## WORKBOOK STRUCTURE

### File 1: Income Statement Workbook (9.4 MB)
- **79 sheets total**
- **62,400+ cells** of financial data
- **96.6% formula density** in consolidated views

#### Sheet Categories:

**1. Configuration & Parameters (Low Formula %)**
- `Key` (1.7% formulas) - Channel programs, contra revenue %, expense assumptions
  - Defines returns, trade marketing, markdowns, cash discounts by brand/channel
  - Example: Wholesale has 5% returns, 3% trade marketing, 2% markdowns
  - DTC has 8% returns, 8-16% trade marketing, 0% markdowns

**2. Brand/Entity P&L Sheets (83.7% formulas)**
- Individual sheets for each brand:
  - `Bari`, `BDAOakley`, `Growth`, `Ice`, `Murakami`, `NP1`, `NP2`
  - `Pigalle`, `Sport`, `Spunge`, `Sunflower`
- `Corp` (88.3% formulas) - Corporate overhead allocation
- Each brand sheet has ~250 rows × 148 columns
- Mix of input data (rows marked with 'x') and calculated values

**3. Consolidation & Summary Sheets (96-99% formulas)**
- `ConsolIS` (96.6%) - **MAIN CONSOLIDATED P&L**
  - 400 rows × 156 columns
  - Rolls up all brand P&Ls into parent company view
  - Years: 2023 actual + 2024-2029 budget/forecast
  - Includes quarterly and monthly breakdowns

- `SummISEntity` (92.5%) - Summary by entity for a specific year
- `SummaryISYY` (82.3%) - Year-over-year summary
- `PresIS` (73.7%) - Presentation format P&L
- `EntityIS`, `EntityIS3yr` (89.5%) - Multi-year entity comparisons

**4. Revenue & Cost Detail Sheets (98-99% formulas)**
- `rev` (98.3%) - Revenue calculations by brand/channel
- `RevSumm` (97.6%) - Revenue summary rollups
- `units` (64.6%) - Unit sales and pricing (partially input data)
- `cost` (83.8%) - Cost calculations
- `CostSumm` (97.9%) - Cost summary rollups
- `tariffs` (98.9%) - Tariff calculations
- `PaySumm` (84.9%) - Payment/cash flow summary

**5. Helper Sheets**
- `start`, `end` - Navigation markers (empty)
- `Summary>`, `Units>` - Quick navigation links

---

### File 2: Balance Sheet & Cash Flow Workbook (541 KB)
- **6 sheets total**
- **Focus**: Balance Sheet, Cash Flow Statement, Working Capital

#### Sheet Details:

**1. ActBS - Actual Balance Sheet (95.5% formulas, BUT contains source data)**
- **131 rows × 86 columns**
- **Source Data**: Monthly GL account balances from QuickBooks
- **Date Range**: Jan 2023 through Jun 2024 (18 months of actuals)
- **Structure**:
  - Column A: Account category (Cash, AR, Inventory, etc.)
  - Column B: GL account code & name (e.g., "1000 Cash", "1200 Accounts Receivable")
  - Columns C+: Monthly balances for each GL account

**Example GL Accounts Found**:
```
ASSETS:
1000 Cash
  - 1090 Shopify Clearing
  - CNB Operating (8899): $15.3M (Jan 2023)
  - CNB Savings (9725)
1072 Bill.com Money Out Clearing
1073 Bill.com Money In Clearing

1200 Accounts Receivable: $30,690 (Jan 2023)

1300 Inventory
  - 1305 Finished Goods
  - 1310 Raw Materials
  - 1315 Packaging

1400 Prepaids
  - 1405 Prepaid Inventory
  - 1410 Other Prepaid Expenses: $103,446 (Jan 2023)

1700 Fixed Assets
  - 1710 Furniture & Fixtures: $88,197
  - 1711 Accum Depreciation: -$2,100
  - 1712 Office Equipment: $9,979
  - 1713 Office Equip Accum Depr: -$166

1800 Intangible Assets
  - 1720 Leasehold Improvements: $175,594
  - 1805 Organizational Costs
  - 1810 Start-Up Costs

LIABILITIES:
2000 Accounts Payable: $33,386 (Jan 2023)

2100 Credit Cards
  - 2105 AmEx: $2,252 (Jan 2023)

2300 Accrued Expenses: -$28,881
```

**2. BS - Full Balance Sheet (98.5% formulas)**
- 114 rows × 104 columns
- Quarterly + annual balance sheets
- Pulls from ActBS for actuals, projects forward for budget years

**3. CFS - Cash Flow Statement (97.7% formulas)**
- 2,193 rows × 104 columns (massive detail)
- Operating, Investing, Financing activities
- Links to BS and Income Statement

**4. WC - Working Capital Analysis (99.5% formulas)**
- 359 rows × 101 columns
- AR days, inventory turns, AP days
- Working capital requirements by period

**5. BSPres, CFSPres - Presentation Formats (67-73% formulas)**
- Executive summary versions
- Less detailed, formatted for board/investor presentations

---

## DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SOURCE DATA INPUTS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. ActBS Sheet (GL Account Balances - Monthly from QuickBooks)     │
│     - Cash: $15.3M (Jan 2023)                                        │
│     - AR: $30K                                                        │
│     - Inventory: TBD                                                  │
│     - AP: $33K                                                        │
│     - Credit Cards: $2K                                               │
│     → 18 months of actuals (Jan 2023 - Jun 2024)                    │
│                                                                       │
│  2. Key Sheet (Configuration Parameters)                             │
│     - Contra revenue %: Returns (5-8%), Trade Mktg (3-16%)          │
│     - Channel assumptions: Wholesale vs DTC                          │
│     - Expense assumptions: CC fees, Shopify fees, ads                │
│                                                                       │
│  3. Brand Entity Sheets - Input Rows (marked with 'x')              │
│     - Ice: Units, Revenue by period                                  │
│     - Bari: Units, Revenue by period                                 │
│     - Growth, Murakami, etc: Same pattern                            │
│     → Appears to be top-line revenue inputs per brand                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    CALCULATION LAYERS (Formulas)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  LAYER 1: Brand-Level P&L Sheets (10+ brands)                       │
│    ├─ Revenue calculations (gross, contra, net)                     │
│    ├─ COGS calculations (product cost, freight, tariffs, obs)       │
│    ├─ Operating expense allocations                                 │
│    └─ Brand profitability                                            │
│                                                                       │
│  LAYER 2: Revenue & Cost Detail Sheets                              │
│    ├─ rev sheet: Revenue by brand/channel/period                    │
│    ├─ units sheet: Unit economics and pricing                       │
│    ├─ cost sheet: Product cost buildups                             │
│    └─ tariffs sheet: Import duty calculations                       │
│                                                                       │
│  LAYER 3: Consolidated P&L (ConsolIS)                               │
│    ├─ Sums all brand P&Ls                                            │
│    ├─ Adds corporate overhead                                        │
│    ├─ Calculates consolidated margins                                │
│    └─ Projects 2024-2029                                             │
│                                                                       │
│  LAYER 4: Balance Sheet & Cash Flow                                 │
│    ├─ BS sheet: Rolls forward balance sheet from ActBS              │
│    ├─ CFS sheet: Derives cash flow from P&L + BS changes            │
│    └─ WC sheet: Working capital KPIs                                │
│                                                                       │
│  LAYER 5: Summary & Presentation Sheets                             │
│    ├─ PresIS, BSPres, CFSPres: Executive summaries                  │
│    ├─ SummISEntity: Entity-level comparison                          │
│    └─ SummaryISYY: Year-over-year trends                            │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                            OUTPUTS                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  • Consolidated Income Statement (2023-2029)                         │
│  • Entity-Level P&Ls for 10+ brands                                 │
│  • Balance Sheet (monthly actuals + annual projections)             │
│  • Cash Flow Statement (operating/investing/financing)              │
│  • Working Capital Analysis (AR days, inventory turns, AP days)     │
│  • Unit Economics (revenue/cost/margin per unit)                    │
│  • Budget vs Actual Variance Analysis                               │
│  • Multi-year financial projections with quarterly breakdown         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## KEY INSIGHTS FROM AUDIT

### 1. **Source Data is Monthly GL Account Balances**
- The `ActBS` sheet contains **monthly account balances exported from QuickBooks** (or similar GL system)
- Data starts Jan 2023 and goes through Jun 2024 (18 months of actuals)
- This is **Balance Sheet data only** - we have NOT found a source P&L transaction detail sheet yet

### 2. **Income Statement Appears to be Top-Down Modeled**
- Brand entity sheets have some input rows, but **mostly formulas**
- Likely the revenue targets are input, and expenses are modeled as % of revenue
- **No transaction-level P&L data found** in these workbooks (may be in separate QuickBooks export)

### 3. **Complex Multi-Layer Formula Chains**
- ConsolIS sheet is **96.6% formulas**
- It references 10+ brand sheets
- Each brand sheet references revenue/cost/units sheets
- Those sheets reference Key sheet for assumptions
- **Breaking one formula could cascade errors across entire model**

### 4. **Actual vs Budget Split**
- 2023 = Actuals (but source appears to be from ActBS balance sheet, not P&L)
- 2024-2029 = Budget/Forecast (modeled)
- **Missing**: We don't see actual P&L transaction data feeding into the Income Statement

---

## WHAT'S MISSING (Source Data We Need)

To replicate this in Markman-style parsing, we need:

### ✅ **Have (Found in Excel)**:
1. Balance Sheet GL account balances (monthly, Jan 2023 - Jun 2024)
2. Configuration parameters (contra revenue %, assumptions)
3. Consolidated financial statements structure (what the output should look like)

### ❌ **Don't Have Yet (Need to Find)**:
1. **P&L Transaction Detail** - The actual revenue and expense transactions
   - Likely exists as a separate QuickBooks P&L export (CSV or Excel)
   - Or embedded in another sheet we haven't found yet

2. **Unit Sales Detail** - The actual unit sales by SKU/product
   - The `units` sheet has formulas, not raw data
   - Likely comes from Shopify, inventory system, or sales database

3. **Invoice/Order Detail** - Product sales by customer/channel
   - Needed to calculate returns, trade marketing allowances, discounts

4. **Vendor/Supplier Invoices** - Product cost and freight bills
   - Needed to calculate landed costs
   - May be in Bill.com or accounting system

5. **Payroll Detail** - Employee costs by department
   - Feeds into G&A expense categories

---

## RECOMMENDED APPROACH: VIOLET STREET DATA EXTRACTION

### Option 1: **Extract from QuickBooks Directly** ✅ BEST
Instead of trying to reverse-engineer the Excel formulas, go to the source:

1. **Request QuickBooks Exports** from Bret Butcher:
   - **P&L Detail Report** (transaction-level, Jan 2023 - current)
   - **Balance Sheet Detail** (monthly, Jan 2023 - current)
   - **General Ledger Export** (all transactions with GL codes)
   - **Customer Invoices** (sales detail by customer/product)
   - **Vendor Bills** (COGS and expenses by vendor)

2. **File Formats**: CSV or Excel (NOT PDF)

3. **These exports will give us**:
   - Every revenue transaction (by product, customer, date)
   - Every expense transaction (by vendor, GL account, date)
   - Every balance sheet change (assets, liabilities, equity)
   - **This is analogous to Markman's Chase CSV files** but at GL level

### Option 2: **Use ActBS as Proxy for Now** ⚠️ LIMITED
We could build a parser that:
1. Extracts monthly GL balances from ActBS sheet
2. Calculates changes month-over-month to infer P&L activity
3. Maps GL accounts to financial statement line items

**Limitations**:
- Balance Sheet changes don't tell us WHAT transactions occurred
- Can't break down revenue by product/customer
- Can't break down expenses by vendor/category
- Can't calculate landed costs without invoice detail

### Option 3: **Contact Bret Butcher** 📧 RECOMMENDED NEXT STEP
Email Bret and ask:
> "Hi Bret - We're building an upgraded financial dashboard to replace the manual Excel process. To load your actual financial data (2023-2024), we need exports from your accounting system in CSV format:
>
> 1. **Profit & Loss Detail Report** (Jan 2023 - present, transaction-level)
> 2. **Balance Sheet** (monthly, Jan 2023 - present)
> 3. **General Ledger Export** (all transactions with GL account codes)
> 4. **Sales by Customer/Product** (if available from Shopify or POS)
> 5. **Vendor Bill Detail** (for COGS and landed cost tracking)
>
> These files will allow us to automatically recreate your financial statements and eliminate the 79-sheet Excel workbook. Can you or your accountant export these from QuickBooks?"

---

## COMPARISON: VIOLET STREET vs MARKMAN GROUP DATA

| Aspect | Violet Street | Markman Group |
|--------|--------------|---------------|
| **Source System** | QuickBooks (GL-based) | Chase Bank (transaction-based) |
| **Data Format** | Monthly GL account balances | Individual bank transactions |
| **Data Granularity** | Account-level rollups | Transaction-level detail |
| **Revenue Detail** | Need to request from Shopify/POS | Client ACH deposits |
| **Expense Detail** | Need GL transaction export | Credit card merchant transactions |
| **Current State** | 79-sheet Excel with 96% formulas | 2 CSV files parsed directly |
| **Data Frequency** | Monthly | Daily (transaction-level) |
| **Complexity** | Multi-entity consolidation | Single entity |

**Key Difference**:
- Markman has **transaction-level data** (every credit card swipe, every wire transfer)
- Violet Street has **GL account-level data** (monthly balances per account)
- To match Markman's level of detail, we need **Violet Street's GL transaction export**

---

## NEXT STEPS

### Immediate (This Week):
1. ✅ **Document findings** (this file)
2. 📧 **Email Bret Butcher** requesting QuickBooks exports (Option 3 above)
3. 🔍 **Search for existing P&L exports** - Check if Bret already sent CSV/Excel files with transaction data

### Once We Get Source Data:
4. 🛠️ **Build VS GL Parser** (like Markman's csvParser.ts)
   - Parse QuickBooks P&L export
   - Parse QuickBooks Balance Sheet export
   - Map GL accounts to financial statement line items
   - Handle multi-entity consolidation (Brain Dead, Ice, Bari, etc.)

5. 📊 **Recreate Financial Statements**
   - Income Statement (match ConsolIS output)
   - Balance Sheet (match BS output)
   - Cash Flow Statement (match CFS output)

6. ✅ **Validate Against Excel**
   - Compare our parsed/calculated numbers to Excel outputs
   - Ensure accuracy within 1% tolerance

7. 🎨 **Build VS Dashboard**
   - Adapt Markman insights interface for product company
   - Add landed cost calculator
   - Add multi-brand breakdowns
   - Add budget vs actual variance

---

## CONCLUSION

The Violet Street Excel workbooks are **extremely complex formula-driven models** (96-99% formulas) that consolidate data from **monthly GL account balances** in the ActBS sheet. However, we do **NOT have the underlying P&L transaction detail** needed to replicate the Income Statement parsing we did for Markman Group.

**The path forward** is to:
1. Request QuickBooks P&L and GL exports from Bret Butcher (transaction-level data)
2. Build a GL transaction parser (similar to csvParser.ts for Markman)
3. Map GL accounts to financial statement line items
4. Recreate the financial statements from source data (not Excel formulas)
5. Demonstrate that our system produces identical results to their Excel model

This approach will allow us to **eliminate the 79-sheet Excel workbook** and replace it with a **clean, auditable, formula-free data pipeline** that automatically refreshes when new QuickBooks data is exported.
