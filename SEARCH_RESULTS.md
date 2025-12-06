# Search Results: Keywords in Workspace

## Search Terms
- rule
- category
- reporting
- report
- transaction
- classification
- financial-reporting
- engine
- mg

---

## 1. FILES/DIRECTORIES WITH KEYWORDS IN PATH

### "report" / "reporting"
- `powerpoint-analysis/audit_report.md`
- `data/github-repos/analysis-report.json`
- `data/project-profitability-summary.md`
- `data/project-profitability-updated.md`
- `data/project-profitability-analysis.json`
- `data/project-profitability-final.json`
- `data/validation-report.json`
- `data/sharepoint-inventory-2025-11-07.json` (contains "report" in content)
- `docs/project-profitability-next-steps.md`
- `docs/violet-street-excel-audit.md`
- `docs/missing-visualizations-roadmap.md`
- `docs/insights-enhancement-plan.md`
- `docs/credit-card-subledger-integration-plan.md`
- `data/projects/laurel-ag-proposal-tools/deliverables/Rental Reporting List.xlsx`

### "transaction"
- `debug-transactions.js`
- `src/components/validation/TransactionAudit.tsx`
- `src/types/index.ts` (contains `BankTransaction` type)
- `data/Chase5939_Activity_20250929.CSV`
- `data/Chase5939_Activity_20251110.CSV`
- `data/Chase8008_Activity20230929_20250929_20250929.CSV`
- `data/Chase8008_Activity20231110_20251110_20251110.CSV`

### "category" / "classification"
- `src/lib/creditCardParser.ts` (extensive category/classification logic)
- `src/lib/insights/insightTemplates.ts` (category-based insights)
- `src/lib/insights/insightTypes.ts` (category types)
- `src/components/validation/TransactionAudit.tsx` (category validation)
- `src/components/validation/DataValidation.tsx` (category validation)
- `test-new-categories.js`
- `test-fixed-categories.js`

### "mg" (Markman Group)
- `data/markman-group-wind-down-checklist.md`
- Project root: `markman-group-financial-reporting/` (directory name)

### "financial-reporting"
- Project root directory: `markman-group-financial-reporting/` (contains "financial-reporting")

---

## 2. FILES WITH KEYWORDS IN CONTENT

### "category" - Most Relevant Files

#### `src/lib/creditCardParser.ts`
**Full Path:** `/Users/mike/markman-group-financial-reporting/src/lib/creditCardParser.ts`

**Key Content:**
```typescript
export interface CreditCardTransaction {
  date: Date
  description: string
  category: string  // Main category field
  type: 'debit' | 'credit'
  amount: number
  balance?: number
  // Hierarchical categorization
  majorCategory?: string // Top-level grouping
  subCategory?: string // Mid-level category
  detailCategory?: string // Detailed subcategory
}

// Enhanced vendor-based category mapping for business expense classification
const VENDOR_CATEGORY_MAPPING: Record<string, {
  majorCategory: string
  category: string
  subcategory: string
}> = {
  // Extensive mapping of vendors to categories
  'ANTHROPIC': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'AI Services' },
  // ... 200+ vendor mappings
}

function categorizeCreditCardTransaction(description: string, amount: number): {
  majorCategory: string
  category: string
  subcategory: string
}
```

**Preview (lines 1-50):**
- Defines `CreditCardTransaction` interface with hierarchical categorization
- Contains `VENDOR_CATEGORY_MAPPING` with 200+ vendor-to-category mappings
- Implements `categorizeCreditCardTransaction()` function for automatic classification

#### `src/lib/insights/insightTemplates.ts`
**Full Path:** `/Users/mike/markman-group-financial-reporting/src/lib/insights/insightTemplates.ts`

**Key Content:**
```typescript
export const insightTemplates: InsightTemplate[] = [
  {
    id: 'largest-expense-ytd',
    category: 'expense',  // Insight category
    titleTemplate: 'Your Largest Expense Category',
    // ... generates insights about expense categories
  },
  {
    id: 'revenue-sources',
    category: 'revenue',
    // ...
  }
]
```

**Preview (lines 24-50):**
- Contains insight templates with `category` field
- Categories include: 'expense', 'revenue', 'cash', 'profitability', 'efficiency', 'vendors'
- Generates narratives about expense categories, revenue sources, etc.

#### `src/lib/insights/insightTypes.ts`
**Full Path:** `/Users/mike/markman-group-financial-reporting/src/lib/insights/insightTypes.ts`

**Key Content:**
```typescript
export interface InsightTemplate {
  id: string
  triggers: string[]
  tags: string[]
  category: 'expense' | 'revenue' | 'cash' | 'profitability' | 'efficiency' | 'vendors'
  titleTemplate: string
  generateNarrative: (data: InsightData) => InsightNarrative
  nextQuestions: string[]
  priority: number
}
```

**Preview:**
- Defines `category` as a union type for insight templates
- Categories: expense, revenue, cash, profitability, efficiency, vendors

#### `src/components/validation/TransactionAudit.tsx`
**Full Path:** `/Users/mike/markman-group-financial-reporting/src/components/validation/TransactionAudit.tsx`

**Key Content:**
```typescript
interface TransactionIssue {
  transaction: BankTransaction
  issues: string[]
  severity: 'low' | 'medium' | 'high'
}

const auditTransactions = (transactions: BankTransaction[]): TransactionIssue[] => {
  // Check for missing or poor categorization
  if (!transaction.category || transaction.category === 'Other' || transaction.category === '') {
    transactionIssues.push('Missing category')
    severity = 'medium'
  }
  // ...
}
```

**Preview (lines 11-50):**
- Validates transaction categories
- Flags missing or poor categorization
- Displays category information in audit results

#### `src/components/validation/DataValidation.tsx`
**Full Path:** `/Users/mike/markman-group-financial-reporting/src/components/validation/DataValidation.tsx`

**Key Content:**
```typescript
// Category Issues
{checkingValidation.categoryValidation.uncategorized > 0 && (
  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
    <div className="text-sm font-medium text-yellow-800">
      {checkingValidation.categoryValidation.uncategorized} uncategorized transactions
    </div>
  </div>
)}

{/* Top Categories */}
<h5 className="text-sm font-medium text-gray-700 mb-2">Category Distribution</h5>
{Object.entries(checkingValidation.categoryValidation.majorCategories)
  .map(([category, count]) => (
    <div key={category} className="flex justify-between">
      <span className="text-gray-600">{category}</span>
      <span className="font-medium">{count}</span>
    </div>
  ))}
```

**Preview:**
- Validates category distribution
- Shows uncategorized transaction counts
- Displays top categories with counts

---

### "transaction" - Most Relevant Files

#### `src/components/validation/TransactionAudit.tsx`
**Full Path:** `/Users/mike/markman-group-financial-reporting/src/components/validation/TransactionAudit.tsx`

**Key Content:**
```typescript
interface TransactionIssue {
  transaction: BankTransaction
  issues: string[]
  severity: 'low' | 'medium' | 'high'
}

const auditTransactions = (transactions: BankTransaction[]): TransactionIssue[] => {
  transactions.forEach(transaction => {
    // Validates transaction data
    // Checks for missing categories, unusual amounts, date issues, etc.
  })
}
```

**Preview (lines 1-50):**
- Component for auditing bank transactions
- Validates transaction data quality
- Flags issues with transactions (missing category, invalid dates, duplicates, etc.)

#### `src/types/index.ts`
**Full Path:** `/Users/mike/markman-group-financial-reporting/src/types/index.ts`

**Key Content:**
```typescript
export interface BankTransaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  type: 'debit' | 'credit'
  balance?: number
  account: string
}
```

**Preview:**
- Core type definition for `BankTransaction`
- Used throughout the application for transaction data

#### `src/lib/subledgerReconciliation.ts`
**Full Path:** `/Users/mike/markman-group-financial-reporting/src/lib/subledgerReconciliation.ts`

**Key Content:**
```typescript
export interface StatementPeriod {
  periodId: string
  startDate: Date
  endDate: Date
  paymentDate: Date | null
  paymentAmount: number
  charges: CreditCardTransaction[]  // Array of transactions
  chargesTotal: number
  variance: number
  percentVariance: number
  isReconciled: boolean
  notes: string[]
}
```

**Preview (lines 1-80):**
- Defines statement periods with transaction arrays
- Reconciles credit card transactions with checking account payments

#### `debug-transactions.js`
**Full Path:** `/Users/mike/markman-group-financial-reporting/debug-transactions.js`

**Preview:**
- Script for debugging transaction data
- Analyzes transaction parsing and validation

---

### "report" / "reporting" - Most Relevant Files

#### `powerpoint-analysis/audit_report.md`
**Full Path:** `/Users/mike/markman-group-financial-reporting/powerpoint-analysis/audit_report.md`

**Preview:**
- Audit report document
- Contains analysis and reporting information

#### `data/project-profitability-summary.md`
**Full Path:** `/Users/mike/markman-group-financial-reporting/data/project-profitability-summary.md`

**Preview:**
- Summary report of project profitability analysis

#### `data/project-profitability-analysis.json`
**Full Path:** `/Users/mike/markman-group-financial-reporting/data/project-profitability-analysis.json`

**Preview:**
- JSON data file containing project profitability reporting data

#### `docs/project-profitability-next-steps.md`
**Full Path:** `/Users/mike/markman-group-financial-reporting/docs/project-profitability-next-steps.md`

**Preview:**
- Documentation about project profitability reporting next steps

---

### "classification" - Most Relevant Files

#### `src/lib/creditCardParser.ts`
**Full Path:** `/Users/mike/markman-group-financial-reporting/src/lib/creditCardParser.ts`

**Key Content:**
```typescript
// Enhanced vendor-based category mapping for business expense classification
const VENDOR_CATEGORY_MAPPING: Record<string, {
  majorCategory: string
  category: string
  subcategory: string
}> = {
  // 200+ vendor mappings for automatic classification
}

function categorizeCreditCardTransaction(description: string, amount: number): {
  majorCategory: string
  category: string
  subcategory: string
}
```

**Preview:**
- Implements automatic transaction classification
- Maps vendors to expense categories
- Hierarchical classification (majorCategory → category → subcategory)

---

### "mg" (Markman Group) - Files

#### `data/markman-group-wind-down-checklist.md`
**Full Path:** `/Users/mike/markman-group-financial-reporting/data/markman-group-wind-down-checklist.md`

**Preview:**
- Wind-down checklist for Markman Group
- Contains "mg" in filename

---

## 3. SUMMARY BY KEYWORD

### "category"
**Files Found:** 15+ files
**Key Files:**
- `src/lib/creditCardParser.ts` - Core categorization logic (200+ vendor mappings)
- `src/lib/insights/insightTemplates.ts` - Insight categories
- `src/lib/insights/insightTypes.ts` - Category type definitions
- `src/components/validation/TransactionAudit.tsx` - Category validation
- `src/components/validation/DataValidation.tsx` - Category distribution

### "transaction"
**Files Found:** 20+ files
**Key Files:**
- `src/components/validation/TransactionAudit.tsx` - Transaction auditing component
- `src/types/index.ts` - `BankTransaction` type definition
- `src/lib/subledgerReconciliation.ts` - Transaction reconciliation
- `debug-transactions.js` - Transaction debugging script
- All CSV files in `data/` containing transaction data

### "report" / "reporting"
**Files Found:** 15+ files
**Key Files:**
- `powerpoint-analysis/audit_report.md` - Audit report
- `data/project-profitability-*.md` - Profitability reports
- `data/project-profitability-*.json` - Profitability data
- `docs/project-profitability-next-steps.md` - Reporting documentation
- `data/projects/laurel-ag-proposal-tools/deliverables/Rental Reporting List.xlsx`

### "classification"
**Files Found:** 5+ files
**Key Files:**
- `src/lib/creditCardParser.ts` - Automatic transaction classification system

### "mg" (Markman Group)
**Files Found:** 2 files
**Key Files:**
- `data/markman-group-wind-down-checklist.md`
- Project root directory name

### "financial-reporting"
**Files Found:** 1
**Key Files:**
- Project root directory: `markman-group-financial-reporting/`

### "rule"
**Files Found:** 0 (in source code)
**Note:** No "rule" keyword found in source files (only in node_modules)

### "engine"
**Files Found:** 0 (in source code)
**Note:** No "engine" keyword found in source files

---

## 4. MOST RELEVANT FILES FOR REVIEW

### High Priority (Core Functionality)

1. **`src/lib/creditCardParser.ts`**
   - Contains extensive category/classification logic
   - 200+ vendor-to-category mappings
   - Hierarchical categorization system

2. **`src/lib/insights/insightTemplates.ts`**
   - Insight system with category-based organization
   - Generates narratives about expense categories

3. **`src/components/validation/TransactionAudit.tsx`**
   - Transaction validation and category checking
   - Flags missing/poor categorization

4. **`src/lib/subledgerReconciliation.ts`**
   - Transaction reconciliation logic
   - Statement period management

5. **`src/types/index.ts`**
   - Core `BankTransaction` type definition
   - Used throughout application

### Medium Priority (Data & Reports)

6. **`data/project-profitability-*.json`** - Profitability reporting data
7. **`powerpoint-analysis/audit_report.md`** - Audit reports
8. **`data/markman-group-wind-down-checklist.md`** - Markman Group documentation

---

## 5. FILE PREVIEWS

### `src/lib/creditCardParser.ts` (Key Sections)

**Lines 1-50:**
```typescript
export interface CreditCardTransaction {
  date: Date
  description: string
  category: string
  type: 'debit' | 'credit'
  amount: number
  balance?: number
  postDate?: Date
  vendor?: string
  // Hierarchical categorization
  majorCategory?: string // Top-level grouping (Operating Expenses, Travel, etc.)
  subCategory?: string // Mid-level category (Software & Subscriptions, etc.)
  detailCategory?: string // Detailed subcategory (AI Services, etc.)
}

// Enhanced vendor-based category mapping for business expense classification
const VENDOR_CATEGORY_MAPPING: Record<string, {
  majorCategory: string
  category: string
  subcategory: string
}> = {
  // AI & Software Development Services
  'ANTHROPIC': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'AI Services' },
  'OPENAI': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'AI Services' },
  // ... 200+ more mappings
}
```

**Lines 200-300:**
```typescript
export function parseCreditCardCSV(csvContent: string): CreditCardData {
  // Parses CSV and categorizes transactions
  const { majorCategory, category, subcategory } = categorizeCreditCardTransaction(description, amount)
  const fullCategory = subcategory ? `${category} - ${subcategory}` : category
  // ...
}
```

### `src/lib/insights/insightTemplates.ts` (Key Sections)

**Lines 24-50:**
```typescript
export const insightTemplates: InsightTemplate[] = [
  // 1. LARGEST EXPENSE CATEGORY
  {
    id: 'largest-expense-ytd',
    triggers: ['largest expense', 'biggest expense', 'top expense'],
    tags: ['expense', 'cost-saving', 'trend'],
    category: 'expense',
    titleTemplate: 'Your Largest Expense Category',
    priority: 100,
    generateNarrative: (data: InsightData) => {
      // Calculate top expense categories
      const expenseCategories = [
        // Consultant Services
        ...(financials.consultantExpenses > 0 ? [{
          name: 'Consultant Services',
          amount: financials.consultantExpenses,
          icon: '👥',
          source: 'checking'
        }] : []),
        // ... more categories
      ]
    }
  }
]
```

### `src/components/validation/TransactionAudit.tsx` (Key Sections)

**Lines 11-50:**
```typescript
interface TransactionIssue {
  transaction: BankTransaction
  issues: string[]
  severity: 'low' | 'medium' | 'high'
}

const auditTransactions = (transactions: BankTransaction[]): TransactionIssue[] => {
  transactions.forEach(transaction => {
    // Check for missing or poor categorization
    if (!transaction.category || transaction.category === 'Other' || transaction.category === '') {
      transactionIssues.push('Missing category')
      severity = 'medium'
    }
    
    // Check for unusual amounts
    if (Math.abs(transaction.amount) > 50000) {
      transactionIssues.push('Large amount - verify')
      severity = 'high'
    }
    // ... more validation
  })
}
```

---

## 6. DIRECTORY STRUCTURE WITH KEYWORDS

```
markman-group-financial-reporting/          # Contains "financial-reporting" and "mg"
├── src/
│   ├── lib/
│   │   ├── creditCardParser.ts            # "category", "classification"
│   │   ├── insights/
│   │   │   ├── insightTemplates.ts         # "category"
│   │   │   └── insightTypes.ts             # "category"
│   │   └── subledgerReconciliation.ts       # "transaction"
│   ├── components/
│   │   └── validation/
│   │       ├── TransactionAudit.tsx        # "transaction", "category"
│   │       └── DataValidation.tsx         # "category", "transaction"
│   └── types/
│       └── index.ts                       # "transaction"
├── data/
│   ├── markman-group-wind-down-checklist.md  # "mg"
│   ├── project-profitability-*.md         # "report"
│   ├── project-profitability-*.json       # "report"
│   └── Chase*_Activity_*.CSV              # "transaction"
├── docs/
│   └── project-profitability-next-steps.md    # "report"
└── powerpoint-analysis/
    └── audit_report.md                    # "report"
```

---

## END OF SEARCH RESULTS



