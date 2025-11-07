# Project Profitability Analysis - Next Steps

## Current Status

### ✅ What We Know:
1. **Swan ($47,230)** → Allocated 100% to **Laurel AG**
2. **Revenue discrepancy** → Dashboard shows ~$447K, but we found $145K in ACH credits
   - Need to verify what the dashboard is including
3. **Timesheets exist in SharePoint** → Will use these to allocate remaining consultant costs

### ❓ What We Need:
1. Verify total revenue number
2. Get timesheet data from SharePoint
3. Allocate Upwork (~$40K) and other consultants to projects

---

## Step 1: Get SharePoint Timesheets

### Option A: Automated Search (Requires Graph API Token)

```bash
# Get access token
# 1. Go to: https://developer.microsoft.com/en-us/graph/graph-explorer
# 2. Sign in
# 3. Copy access token
# 4. Run:
export MS_GRAPH_TOKEN="your-token-here"

# Search for timesheets
node search-sharepoint-timesheets.js
```

This will search for files containing:
- "timesheet"
- "hours worked"
- "consultant hours"
- Consultant names (Niki, Carmen, Upwork, Ivana)

### Option B: Manual Search (Faster)

1. Go to your SharePoint site
2. Use search box: `timesheet OR "hours worked" OR "time tracking"`
3. Filter by: Excel files, last modified 2024-2025
4. Download any timesheet files to: `/Users/mike/markman-group-financial-reporting/data/timesheets/`

---

## Step 2: Verify Revenue Number

The dashboard shows higher revenue than $145K. Let me check what it's including:

**Possible sources:**
- Owner equity transfers? (We saw $20K and $50K transfers)
- Credit card payments for services?
- Missing ACH credits?

**Action needed:**
- Open dashboard at localhost:3001
- Go to Income Statement or Revenue Sources
- Check what's included in the $447K figure

---

## Step 3: Allocate Consultant Costs

Once we have timesheets, we'll create a mapping:

### Consultants to Allocate:

| Consultant | Amount | Period | Status |
|------------|--------|--------|--------|
| **Swan** | $47,230 | Nov 2024 - Jul 2025 | ✅ **100% Laurel** |
| **Upwork** | ~$40,000 | May - Sept 2024 | ⏳ Awaiting timesheets |
| **Niki** | $15,000 | 2024-2025 | ⏳ Awaiting timesheets |
| **Carmen** | $14,342 | 2024-2025 | ⏳ Awaiting timesheets |
| **Ivana** | $11,104 | 2024-2025 | ⏳ Awaiting timesheets |
| **Abri** | $10,638 | 2024-2025 | ⏳ Awaiting timesheets |
| **Petrana** | $9,990 | 2024-2025 | ⏳ Awaiting timesheets |
| **Beata** | $7,640 | 2024-2025 | ⏳ Awaiting timesheets |
| **Jan** | $6,630 | 2024-2025 | ⏳ Awaiting timesheets |
| **Marianna** | $5,360 | 2024-2025 | ⏳ Awaiting timesheets |
| **Pepi** | $2,460 | 2024-2025 | ⏳ Awaiting timesheets |
| **Nikola** | $3,870 | 2024-2025 | ⏳ Awaiting timesheets |

---

## Step 4: Calculate Project Profitability

Once we have allocations, I'll create:

### Per-Client Analysis:

**Laurel AG:**
- Revenue: $134,000 (confirmed ACH credits)
- Consultant Costs:
  - Swan: $47,230 (confirmed)
  - Upwork: $?? (from timesheets)
  - Others: $?? (from timesheets)
- **Profit**: Revenue - Costs
- **Margin**: Profit / Revenue

**Metropolitan Partners:**
- Revenue: $11,830 (confirmed ACH credits) + more?
- Consultant Costs:
  - Swan: $0 (all allocated to Laurel)
  - Others: $?? (from timesheets)
- **Profit**: Revenue - Costs
- **Margin**: Profit / Revenue

---

## Quick Actions You Can Take Now:

### 1. Check Dashboard Revenue (30 seconds)
```bash
# Dashboard should be running on localhost:3001
# Go to Income Statement or Revenue insight
# Tell me what revenue total you see
```

### 2. Search SharePoint Manually (2 minutes)
- Go to SharePoint
- Search: "timesheet" or "hours"
- Download any Excel files to: `./data/timesheets/`
- Tell me what you found

### 3. Or Give Me Rough Estimates
If you remember roughly:
- "Upwork was all Laurel initial design"
- "Niki was 50% Laurel, 50% Metropolitan"
- etc.

I can use those allocations to calculate approximate profitability now!

---

## What Do You Want To Do Next?

**Option 1:** Check dashboard revenue number first ← RECOMMENDED
**Option 2:** Search SharePoint for timesheets
**Option 3:** Give me rough allocation estimates
**Option 4:** Run the automated SharePoint search script
