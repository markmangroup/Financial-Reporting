# How to Search for Swan Project Information

## What We're Looking For

We need to find detailed project information for **Swan Softweb Solutions LLC** to calculate ROI per project. Currently we only have:

- 5 payment dates and amounts from Chase bank ($47,230 total)
- High-level project names from manual entry
- One invoice reference: "US-338" (Jan/Feb services)

We need to find:
- Actual invoices (especially US-338)
- Project descriptions and deliverables
- Hours worked per project
- Which payment corresponds to which project

## Option 1: Quick Manual Search (Recommended)

### Step 1: Search Outlook

1. Open Outlook desktop or web
2. Use search box with these queries:
   - `from:contact@swansoftweb.com`
   - `Swan OR Softweb`
   - `US-338`
   - `invoice AND swan`
3. Date range: November 2024 - July 2025
4. Look for:
   - Emails with attachments (likely invoices)
   - Project kickoff/completion emails
   - Status updates or milestone emails

### Step 2: Search SharePoint

1. Go to your SharePoint site
2. Use search box with:
   - `Swan Softweb`
   - `US-338`
   - Look in: "All Sites" or specific project folders
3. File types to check: PDF, Word, Excel
4. Look for:
   - Invoices folder
   - Vendor documents
   - Project folders (Laurel AG, Metropolitan Partners, Financial Reporting)

### Step 3: Export What You Find

**If you find relevant emails:**
- Select the emails
- File > Save As > choose folder: `/Users/mike/markman-group-financial-reporting/data/swan-communications/`
- Save as .msg or export to PDF

**If you find documents in SharePoint:**
- Download to: `/Users/mike/markman-group-financial-reporting/data/swan-communications/`

Once you save files locally, I can analyze them immediately!

## Option 2: Automated Search via Microsoft Graph API

### Prerequisites
1. Install node-fetch if not already installed:
   ```bash
   cd /Users/mike/markman-group-financial-reporting
   npm install node-fetch
   ```

### Get Access Token

#### Method A: Graph Explorer (Easy)
1. Go to https://developer.microsoft.com/en-us/graph/graph-explorer
2. Sign in with your Microsoft account
3. Click "Access token" in left sidebar
4. Click "Copy"
5. Run in terminal:
   ```bash
   export MS_GRAPH_TOKEN="paste-token-here"
   ```

#### Method B: Azure AD App (Persistent)
1. Go to https://portal.azure.com
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Name: "Markman Financial Search"
5. Redirect URI: Leave default
6. Click "Register"
7. Copy "Application (client) ID"
8. Go to "API permissions" > "Add a permission"
9. Microsoft Graph > Delegated permissions:
   - Mail.Read
   - Files.Read.All
   - Sites.Read.All
10. Click "Grant admin consent"
11. Go to "Certificates & secrets" > "New client secret"
12. Copy the secret value

Then use this token to authenticate (requires additional OAuth flow implementation).

### Run the Search Script

```bash
cd /Users/mike/markman-group-financial-reporting
node search-swan-communications.js
```

This will:
1. Search Outlook for emails containing Swan, Softweb, US-338
2. Search SharePoint for related documents
3. Extract project mentions (Laurel AG, Metropolitan Partners, etc.)
4. Save results to `./data/swan-communications/`
5. Generate a markdown report

### Output Files

After running, you'll get:
- `swan-emails-raw.json` - All emails found
- `swan-documents-raw.json` - All SharePoint documents found
- `swan-projects-organized.json` - Emails organized by project
- `swan-search-report.md` - Human-readable summary

## What We'll Do With The Data

Once we have the invoices and project details, I'll:

1. **Map payments to projects**
   - Nov 18, 2024: $15,600 → Which project?
   - Jan 15, 2025: $6,600 → Which project?
   - Apr 23, 2025: $17,180 → Invoice US-338 mentions "Jan/Feb services"
   - Jul 18, 2025: $7,850 → "Final payment"

2. **Calculate ROI per project**
   - Revenue generated from each client project
   - Swan costs allocated to that project
   - ROI = (Revenue - Swan Cost) / Swan Cost

3. **Update swan.json with actual data**
   - Replace manual entries with invoice-backed details
   - Add billing breakdowns
   - Link deliverables to specific invoices

4. **Enhance consultant detail page**
   - Show project timeline with costs
   - Display invoices with download links
   - Calculate and show profitability per project

## Quick Start (Do This Now)

**Fastest way to get results:**

1. Open Outlook, search: `from:contact@swansoftweb.com`
2. Find email with "US-338" invoice attachment
3. Save that email + attachment to desktop
4. Tell me where you saved it, I'll analyze it immediately

This single invoice will give us ~40% of the total spend breakdown!
