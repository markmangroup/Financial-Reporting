# Credit Card Subledger Integration Plan

## Problem Statement

Currently, "Credit Card (Operating)" appears as the largest expense category at $152,374. This is misleading because:
- It represents **payments** from checking account to credit card (transfers, not expenses)
- The **actual expenses** are in the credit card subledger: Software, Travel, Meals, etc.
- Users cannot see what they're really spending money on

## Solution Architecture

### Phase 1: Update Financial Calculations (Golden Record)

**File:** `src/lib/financialCalculations.ts`

**Changes:**
1. Add new function: `calculateCreditCardSubledgerTotals()`
2. Load credit card data and sum by major categories:
   - Operating Expenses (Software, Office, Equipment)
   - Travel & Transportation
   - Meals & Entertainment
   - Bills & Utilities
3. Replace `creditCardExpenses` with subledger breakdown in `FinancialTotals` interface
4. Keep credit card payments separate as `creditCardPayments` (for reconciliation only)

**New Interface:**
```typescript
export interface FinancialTotals {
  // Revenue (unchanged)
  businessRevenue: number

  // Consultant Expenses (unchanged)
  consultantExpenses: number

  // NEW: Credit Card Subledger Breakout
  creditCardOperatingExpenses: number // Software, office, equipment
  creditCardTravelExpenses: number // Travel, hotels, vehicle
  creditCardMealsExpenses: number // Client meals, team events
  creditCardUtilitiesExpenses: number // Internet, phone, electricity

  // Other Expenses (unchanged)
  autoLoanExpenses: number
  bankFeesExpenses: number

  // Totals
  totalBusinessExpenses: number // NOW INCLUDES SUBLEDGER DETAIL

  // Reconciliation (not part of P&L)
  creditCardPayments: number // For reconciliation check only

  // ... rest unchanged
}
```

### Phase 2: Update Insight Templates

**Files to Update:**
1. `src/lib/insights/insightTemplates.ts` - All 11 insight templates
2. Specifically:
   - `largest-expense-ytd` - Replace "Credit Card" with top subledger category
   - `consultant-analysis` - No changes (already correct)
   - `travel-spending` - Use `creditCardTravelExpenses` instead of estimate
   - `software-spending` - Use actual subledger software category data
   - `profitability-check` - Update expense breakdown
   - `expense-efficiency` - Update with subledger categories

**Pattern for Expense Breakdown:**
```typescript
const expenseCategories = [
  { name: 'Consultants', amount: financials.consultantExpenses, icon: '👥' },
  { name: 'Software & Subscriptions', amount: financials.creditCardOperatingExpenses, icon: '💻', source: 'Credit Card' },
  { name: 'Travel & Transportation', amount: financials.creditCardTravelExpenses, icon: '✈️', source: 'Credit Card' },
  { name: 'Meals & Entertainment', amount: financials.creditCardMealsExpenses, icon: '🍽️', source: 'Credit Card' },
  { name: 'Utilities & Bills', amount: financials.creditCardUtilitiesExpenses, icon: '📱', source: 'Credit Card' },
  { name: 'Auto Loan', amount: financials.autoLoanExpenses, icon: '🚗' },
  { name: 'Bank Fees', amount: financials.bankFeesExpenses, icon: '🏦' },
].sort((a, b) => b.amount - a.amount)
```

### Phase 3: Source Attribution

**Where to show "from credit card subledger":**

1. **Hover Tooltips** - Most places (non-intrusive):
   ```tsx
   <div className="group relative">
     Software & Subscriptions
     <div className="hidden group-hover:block ...">
       Source: Credit Card Subledger
       {subcategories breakdown}
     </div>
   </div>
   ```

2. **Small Text** - In detailed views only:
   ```tsx
   <div className="text-xs text-gray-500">
     via Credit Card transactions
   </div>
   ```

3. **NOT in** - Charts, headlines, summaries (keep clean)

### Phase 4: Reconciliation Display

**Where:** Income Statement only (not insights)

**Pattern:**
```typescript
// Show both:
Credit Card Expenses (Subledger Detail) .... $152,374 📊
  └─ Software & Subscriptions .............. $67,200
  └─ Travel & Transportation ............... $42,100
  └─ Meals & Entertainment ................. $28,500
  └─ Utilities & Bills ..................... $14,574

Credit Card Payments (Checking Account) .... $152,374 ✓
  └─ Reconciliation Status: Matched

// If mismatch:
⚠️ Variance: $500 (0.3%)
```

### Phase 5: Detailed Subledger Access

**Pattern from Income Statement:**
- Categories show with 📊 icon
- Click → Opens full CreditCardSubledger view
- Breadcrumb: "Insights > Largest Expense > Software Detail"

**Implementation:**
```typescript
<button
  onClick={() => onDrillDown('software-detail')}
  className="text-blue-600 hover:underline flex items-center"
>
  <span className="mr-1">📊</span>
  View detailed breakdown
</button>
```

## Implementation Order

### Step 1: Update Financial Calculations ✅ Priority
**Impact:** Foundation for everything else
**Files:**
- `src/lib/financialCalculations.ts`
- `src/lib/creditCardDataLoader.ts` (ensure accessible)

### Step 2: Update Largest Expense Insight
**Impact:** Fixes the immediate user complaint
**Files:**
- `src/lib/insights/insightTemplates.ts` (largest-expense-ytd template)

### Step 3: Update All Other Insights
**Impact:** Consistency across insights
**Files:**
- `src/lib/insights/insightTemplates.ts` (all 11 templates)

### Step 4: Add Tooltips & Source Attribution
**Impact:** Transparency for users
**Files:**
- `src/components/insights/NarrativeBlock.tsx` (add tooltip rendering)

### Step 5: Create Drill-Down Navigation
**Impact:** Deep exploration capability
**Files:**
- `src/components/insights/InsightsInterface.tsx` (add drill-down state)
- `src/components/visualizations/CreditCardSubledger.tsx` (ensure embeddable)

## Data Validation Checks

At each step, validate:
1. **Sum Check:** creditCardPayments ≈ sum(all subledger categories)
2. **Golden Record:** totalBusinessExpenses = consultants + subledger + auto + fees
3. **Balance Sheet:** Assets = Liabilities + Equity (should still balance)
4. **No Double Counting:** Credit card payments NOT in totalBusinessExpenses

## Questions Answered

1. **Should we remove Credit Card Autopay from checking account categories?**
   - Keep it in checking account categories (it's a real transaction)
   - BUT exclude it from "business operating expenses" calculation
   - Use it ONLY for reconciliation verification

2. **Replace everywhere with subledger breakdown?**
   - YES for all expense analysis (insights, visualizations)
   - SHOW BOTH in Income Statement (for reconciliation)
   - NO in Cash Flow Statement (keep checking account view)

3. **Where to indicate "from credit card subledger"?**
   - Hover tooltips (most places)
   - Small text in detailed views
   - NOT in headlines/charts (keep clean)

4. **Show reconciliation?**
   - YES in Income Statement (traditional view)
   - NO in Insights (keep focused on insights, not accounting mechanics)
   - YES in admin/audit views if we build them

## Success Criteria

✅ "What is my largest expense?" shows actual expense categories (Software, Travel, etc.)
✅ Credit card payments appear only for reconciliation, not as expense category
✅ All expense totals still reconcile to golden record
✅ Users can drill down into any credit card category for full detail
✅ Source attribution is clear but not intrusive
✅ Balance sheet still balances
