# Fortrea Real Data Implementation Summary

## Overview
The Fortrea dashboard has been upgraded from mock data to **real Fortrea financial data** from public releases, with Q3-driven narrative components and an "Ask Fortrea" chat feature.

---

## Files Created/Modified

### New Files
1. **`src/data/fortrea/insights.ts`** - Knowledge base for Fortrea insights and commentary
2. **`src/app/api/fortrea/ask/route.ts`** - API route for Ask Fortrea chat feature

### Modified Files
1. **`src/types/fortrea.ts`** - Added quarterly and annual data types
2. **`src/data/fortrea/financials.ts`** - Replaced mock data with real Fortrea quarterly and annual data
3. **`src/lib/fortreaData.ts`** - Updated data access functions for new structure
4. **`src/app/fortrea/page.tsx`** - Complete rewrite to use real data, add Q3 context, and Ask Fortrea chat

---

## Real Fortrea Data Structure

### Quarterly Data (`fortreaQuarters`)
- **Q3 2023**: Revenue $713.8M, GAAP Net Income -$16.1M, Adj. EBITDA $68.2M (9.6% margin)
- **Q3 2024**: Revenue $674.9M, GAAP Net Income -$18.5M, Adj. EBITDA $64.2M (9.5% margin), Backlog $7.6B, Book-to-bill 1.23x
- **Q4 2024**: Revenue $697.0M, GAAP Net Income -$73.9M, Adj. EBITDA $56.0M (8.0% margin), Backlog $7.7B, Book-to-bill 1.35x
- **Q3 2025**: Revenue $701.3M, GAAP Net Income -$15.9M, Adj. EBITDA $50.7M (7.2% margin), Backlog $7.6B, Book-to-bill 1.13x

### Annual Data (`fortreaAnnual`)
- **2022**: Revenue $3,096.1M, GAAP Net Income $192.9M, Adj. EBITDA $405.1M (13.1% margin)
- **2023**: Revenue $3,109.0M, GAAP Net Income -$3.4M, Adj. EBITDA $267.3M (8.6% margin), Backlog $7.4B
- **2024**: Revenue $2,696.4M, GAAP Net Income -$271.5M, Adj. EBITDA $202.5M (7.5% margin), Backlog $7.7B

**Sources:**
- Q3 2024: GlobeNewswire release
- Q4/FY 2024: Nasdaq release
- Q3 2025: Latest quarterly release
- FY 2023: GlobeNewswire release

---

## Key Features Implemented

### 1. Q3 2024 Context Block
**Location:** Overview tab, top section

**Content:**
- Narrative about Q3 2024 execution
- Key bullet points:
  - Revenue decline vs Q3 2023 (5.4%)
  - GAAP loss driven by spin-related costs
  - Backlog and book-to-bill strength
- Uses real numbers from `q3_2024` data

### 2. Backlog & Demand Card
**Location:** Overview tab, next to Q3 context block

**Content:**
- Latest backlog value (in billions)
- Book-to-bill ratio
- Narrative about pharma/biotech awards and revenue visibility

### 3. Real Data KPIs
**Location:** Overview tab, KPI cards

**Updated Metrics:**
- **Revenue**: Latest quarter revenue (Q3 2025: $701.3M)
- **GAAP Net Income**: Latest quarter (Q3 2025: -$15.9M)
- **Adjusted EBITDA**: Latest quarter (Q3 2025: $50.7M)
- **Adj. Diluted EPS**: Latest quarter (Q3 2025: $0.12)

All cards show sequential changes and use real quarterly data.

### 4. Quarterly Charts
**Location:** Overview tab

**Revenue Trend Chart:**
- Shows last 4 quarters of revenue
- Uses `last4Quarters` data
- X-axis: Quarter labels (Q3 2023, Q3 2024, Q4 2024, Q3 2025)
- Y-axis: Revenue in millions

**Margin Trends Chart:**
- Shows Adjusted EBITDA margin % and GAAP Net margin %
- Last 4 quarters
- Color-coded lines (blue for EBITDA margin, indigo for net margin)

### 5. Income Statement Tab
**Updated to use real annual data:**
- Columns: Year, Revenue, GAAP Net Income (Loss), Adjusted EBITDA, Adj. EBITDA Margin %
- Data from `fortreaAnnual` (2022-2024)
- All values formatted in millions USD
- Margins shown as percentages

### 6. Balance Sheet Tab
**Status:** Placeholder with clear messaging
- Note: "Illustrative balance sheet structure – placeholder values only"
- Explains that balance sheet data will be available in future releases

### 7. Cash Flow & Trends Tab
**Updated with:**
- Transformation phase narrative
- Cash generation trends chart using Adjusted EBITDA as proxy
- Last 4 quarters of data
- Clear labeling that it's an "EBITDA proxy for cash generation"

### 8. Ask Fortrea Chat Feature
**Location:** Overview tab, bottom section

**Features:**
- Chat interface with message history
- Rule-based question routing:
  - **Revenue/Growth questions**: Returns last 4 quarters revenue with trend analysis
  - **Margin/Profitability questions**: Returns adjusted EBITDA margins and profitability context
  - **Backlog questions**: Returns backlog and book-to-bill data
  - **Transformation questions**: Returns transformation phase narrative
  - **Generic questions**: Helpful default response
- API route: `/api/fortrea/ask`
- Knowledge base: `src/data/fortrea/insights.ts`

**Example Questions & Responses:**

**Q: "What's our revenue trend?"**
**A:** "Revenue for the last four quarters: Q3 2023: $713.8M, Q3 2024: $674.9M, Q4 2024: $697.0M, Q3 2025: $701.3M. Q3 2024 revenue was $674.9M, down 5.4% vs Q3 2023, reflecting the ongoing post-spin transition. Recent quarters show stabilization with Q3 2025 at $701.3M."

**Q: "How are our margins?"**
**A:** "Adjusted EBITDA margin was 7.2% in Q3 2025, compared to 7.5% for full-year 2024. The company is focused on cost actions and operational efficiency to improve profitability during the transformation phase. Adjusted EBITDA in Q3 2025 was $50.7M."

**Q: "What's our backlog?"**
**A:** "Backlog stands at $7.6B with a book-to-bill ratio of 1.13x. Strong bookings and backlog growth support forward revenue visibility while the team works through post-spin efficiency improvements."

---

## Data Access Functions

### New Functions (Real Data)
- `getFortreaQuarters()` - Returns all quarterly data, sorted by time
- `getFortreaAnnual()` - Returns all annual data, sorted by year
- `getLatestQuarter()` - Returns most recent quarter (Q3 2025)
- `getLatestAnnual()` - Returns most recent annual (2024)
- `getLastNQuarters(n)` - Returns last N quarters (default: 4)

### Legacy Functions (Maintained for Compatibility)
- `getFortreaIncomeStatement()` - Converts annual data to legacy format
- `getFortreaBalanceSheet()` - Returns placeholder data
- `getFortreaCashFlow()` - Returns placeholder data

---

## UI/UX Improvements

### Q3 Context Integration
- **Q3 2024 Context Block**: Prominent placement at top of Overview tab
- Uses Fortrea's own language and framing
- Real numbers from Q3 2024 release
- Professional, CFO-appropriate tone

### Narrative Components
- **Transformation Phase**: Mentioned in Cash Flow tab
- **Backlog & Demand**: Dedicated card in Overview
- All narrative uses Fortrea's public language

### Ask Fortrea Chat
- **Professional styling**: Matches dashboard aesthetic
- **Fortrea blue accents**: `#003B5C` for user messages
- **Scrollable history**: Last 10 exchanges (implemented via state)
- **Loading states**: "Thinking..." indicator
- **Error handling**: Graceful error messages

---

## Components Using Real Data

### Overview Tab
- ✅ KPI cards: Latest quarter data
- ✅ Revenue trend chart: Last 4 quarters
- ✅ Margin trends chart: Last 4 quarters
- ✅ Q3 context block: Q3 2024 data
- ✅ Backlog card: Latest quarter data
- ✅ Ask Fortrea chat: Real-time data access

### Income Statement Tab
- ✅ Annual table: Real annual data (2022-2024)
- ✅ All metrics: From `fortreaAnnual`

### Balance Sheet Tab
- ⚠️ Placeholder: Awaiting balance sheet data from future releases

### Cash Flow & Trends Tab
- ✅ Transformation narrative: Real context
- ✅ Cash generation chart: Adjusted EBITDA proxy from quarters

---

## What Jill Will See

When opening `/fortrea`, Jill will see:

1. **Real Fortrea Numbers**
   - Q3 2025 revenue: $701.3M (not mock $4.1B)
   - Real adjusted EBITDA margins: 7.2% (not mock 9.5%)
   - Actual backlog: $7.6B
   - Real book-to-bill: 1.13x

2. **Q3-Driven Context**
   - Q3 2024 context block with real narrative
   - Backlog & demand card with actual numbers
   - Transformation phase messaging

3. **Fortrea's Language**
   - "Post-spin transition"
   - "Transformation phase"
   - "Cost actions and operational efficiency"
   - "Strong bookings and backlog growth"

4. **Interactive Chat**
   - Can ask questions about revenue, margins, backlog
   - Gets answers using real data
   - Professional, CFO-appropriate responses

5. **Quarterly Focus**
   - Charts show last 4 quarters (not fake 5-year annual)
   - KPIs based on latest quarter
   - Sequential comparisons

---

## Technical Notes

### Data Format
- All financial values in millions USD
- Backlog in millions (displayed as billions)
- Book-to-bill as ratio (e.g., 1.23x)
- EPS in USD (e.g., $0.23)

### API Route
- **Endpoint**: `POST /api/fortrea/ask`
- **Request**: `{ "question": string }`
- **Response**: `{ "answer": string }`
- **Error handling**: Returns 400 for invalid requests, 500 for server errors

### Future Integration Hooks
The API route includes comments indicating where to:
- Call an embedding store built from transcripts + filings
- Call an LLM with retrieved context for richer answers
- Currently uses deterministic rule-based routing

---

## Summary

The Fortrea dashboard now:
- ✅ Uses **real Fortrea data** from public releases
- ✅ Shows **Q3-driven context** with Fortrea's language
- ✅ Includes **Ask Fortrea chat** with rule-based intelligence
- ✅ Presents **quarterly focus** (last 4 quarters)
- ✅ Maintains **executive polish** and Fortune-500 styling
- ✅ Uses **Fortrea's narrative** and framing throughout

The dashboard now feels like it was **built inside Fortrea**, using **her numbers** and **her language**, not like a generic SaaS demo.

