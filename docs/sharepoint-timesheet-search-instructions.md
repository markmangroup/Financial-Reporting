# SharePoint Timesheet Search - Quick Guide

## ✅ What We Know So Far:

### Revenue (Verified):
- **Laurel AG**: $134,000 (73.9%)
- **Metropolitan Partners**: $47,320 (26.1%)
- **Total**: $181,320

### Cost Allocations:
- **Swan ($47,230)**: ✅ **100% Laurel AG** (per your direction)

### Need to Allocate ($77,852):
- Upwork: ~$40,000 (May-Sept 2024)
- Niki: $15,000
- Carmen: $14,342
- Ivana: $11,104
- Abri: $10,638
- Petrana: $9,990
- Beata: $7,640
- Jan: $6,630
- Marianna: $5,360
- Pepi: $2,460
- Nikola: $3,870

---

## 🔍 SharePoint Search Instructions

### Option 1: Manual Search (Fastest - 2 minutes)

1. **Go to your SharePoint site**
   - URL: [your sharepoint site]

2. **Use the search box** at the top of the page

3. **Try these search terms:**
   ```
   timesheet
   time sheet
   hours worked
   consultant hours
   Laurel timesheet
   Metropolitan timesheet
   project hours
   ```

4. **Filter results:**
   - File type: Excel (.xlsx, .xls)
   - Modified: 2024-2025
   - Look for files with consultant names or project names

5. **Download any timesheet files** to:
   ```
   /Users/mike/markman-group-financial-reporting/data/timesheets/
   ```

6. **Tell me what you found** and I'll analyze them

---

### Option 2: Automated Search (Requires Token)

If you want to use the automated script:

```bash
# 1. Get Microsoft Graph API token
# Go to: https://developer.microsoft.com/en-us/graph/graph-explorer
# Sign in and copy your access token

# 2. Set the token
export MS_GRAPH_TOKEN="paste-token-here"

# 3. Run the search script
node search-sharepoint-timesheets.js
```

This will automatically search for:
- Files containing: "timesheet", "hours worked", "consultant hours"
- Files with consultant names: Niki, Carmen, Upwork, Ivana, etc.
- Save results to: `./data/sharepoint-timesheets-found.json`

---

## 📊 What I'll Do With Timesheet Data

Once you provide the timesheets, I'll:

1. **Parse the Excel files** to extract:
   - Consultant name
   - Hours worked per project
   - Date range
   - Client/project names

2. **Calculate allocation percentages**:
   ```
   Example: If Niki worked 100 hours total:
   - 60 hours on Laurel → 60% allocation
   - 40 hours on Metropolitan → 40% allocation

   Niki's $15,000 cost:
   - Laurel: $9,000 (60%)
   - Metropolitan: $6,000 (40%)
   ```

3. **Sum up total costs per client**

4. **Calculate profitability**:
   ```
   Laurel AG:
   - Revenue: $134,000
   - Swan: $47,230
   - Other consultants: $?? (from timesheets)
   - Profit: Revenue - Costs
   - Margin: Profit / Revenue

   Metropolitan Partners:
   - Revenue: $47,320
   - Swan: $0
   - Other consultants: $?? (from timesheets)
   - Profit: Revenue - Costs
   - Margin: Profit / Revenue
   ```

---

## 🚀 Next Steps

**Please do ONE of these:**

1. **Search SharePoint manually** (2 mins)
   - Download timesheets to `./data/timesheets/`
   - Tell me what files you found

2. **Run the automated search** (5 mins)
   - Get Graph API token
   - Run: `node search-sharepoint-timesheets.js`

3. **Give me rough estimates** (30 seconds)
   - "Upwork was all Laurel"
   - "Niki was 50/50 split"
   - etc.

Once we have allocation data, I can calculate exact project profitability!
