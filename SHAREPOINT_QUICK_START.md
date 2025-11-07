# SharePoint Integration - Quick Start Guide

## ✅ What I Built For You

I've created a complete SharePoint API integration that will automatically sync your financial data. Here's what's ready:

### 1. **SharePoint Client** (`src/lib/sharepoint/sharepointClient.ts`)
- Connects to Microsoft Graph API
- Downloads files from SharePoint
- Handles authentication automatically

### 2. **API Endpoint** (`src/app/api/sharepoint/sync/route.ts`)
- `/api/sharepoint/sync` - Handles data synchronization
- Supports: Test connection, Sync income files, Browse folders

### 3. **UI Component** (Blue "Sync from SharePoint" button in navigation)
- Test SharePoint connection
- Download income files with one click
- Browse available folders
- Shows sync status and errors

### 4. **Complete Documentation** (`docs/SHAREPOINT_SETUP.md`)
- Step-by-step Azure AD setup
- Screenshots and examples
- Troubleshooting guide

---

## 🚀 Your 15-Minute Setup Checklist

### **Part 1: Azure AD App Registration** (5 minutes)

1. Go to https://portal.azure.com
2. Search for "Azure Active Directory"
3. Click "App registrations" → "+ New registration"
4. Name: `Markman Financial Reporting`
5. Click "Register"
6. **COPY THESE 2 VALUES**:
   - Application (client) ID
   - Directory (tenant) ID

### **Part 2: Create Client Secret** (2 minutes)

1. Click "Certificates & secrets" → "+ New client secret"
2. Description: `Financial Dashboard`
3. Expires: `24 months`
4. Click "Add"
5. **IMMEDIATELY COPY THE SECRET VALUE** (you can only see it once!)

### **Part 3: Grant Permissions** (3 minutes)

1. Click "API permissions" → "+ Add a permission"
2. Click "Microsoft Graph" → "Application permissions"
3. Add these 2 permissions:
   - ✅ `Sites.Read.All`
   - ✅ `Files.Read.All`
4. Click "Grant admin consent" → "Yes"

### **Part 4: Get SharePoint Site ID** (3 minutes)

1. Open your SharePoint site
2. Press F12 (open developer tools)
3. In Console tab, run: `_spPageContextInfo.siteId`
4. **COPY THE SITE ID**

### **Part 5: Configure App** (2 minutes)

1. Create `.env.local` file in project root
2. Add these 4 lines (with YOUR actual values):

```env
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
SHAREPOINT_SITE_ID=your-site-id
```

3. Save the file
4. Restart dev server: Stop (Ctrl+C) and `npm run dev`

---

## 🎯 Test It Now!

1. **Refresh your dashboard** (http://localhost:3001)
2. **Click the blue "Sync from SharePoint" button** in the top navigation
3. **Click "Test Connection"**
   - ✅ Success = You'll see your site name
   - ❌ Error = Check the troubleshooting section below

4. **Click "Sync Income Data"**
   - Downloads files from `/Income Files/Laurel AG/` and `/Income Files/Metropolitan/`
   - Saves to your local `/data/` folder

---

## 🔧 Common Issues & Fixes

### Issue: "SharePoint not configured"
**Fix**: Make sure `.env.local` exists with all 4 variables, then restart dev server

### Issue: "Authentication failed"
**Fix**: Double-check your `AZURE_CLIENT_SECRET` - create a new one if needed

### Issue: "Insufficient privileges"
**Fix**: Go back to Azure AD → API permissions → Click "Grant admin consent"

### Issue: Site ID not working
**Fix**: Try this alternative method:
1. Go to: https://developer.microsoft.com/en-us/graph/graph-explorer
2. Sign in
3. Run: `https://graph.microsoft.com/v1.0/sites?search=Markman`
4. Find your site in the results and copy the `id` field

---

## 📂 What Data Gets Synced?

### Currently Configured:
- ✅ **Income Files**:
  - `/Income Files/Laurel AG/*.csv`
  - `/Income Files/Metropolitan/*.csv`

### Coming Soon (I can add these next):
- 🔄 Time Sheets from `/Governance/`
- 🔄 SOWs from `/Legal Documents/SOWs/`
- 🔄 Project deliverables

---

## 🎉 Next Steps After Setup

Once SharePoint sync is working:

1. **Sync Income Data** → Enables profitability insights
2. **New insights will appear**:
   - "Am I profitable?" - Revenue vs. Expenses
   - "Which client is most profitable?"
   - "What's my profit margin?"
   - "Project-level ROI"

3. **Set up automatic sync** (optional):
   - I can add a scheduled task to sync daily/weekly
   - Or keep it manual with the button

---

## 📝 Need More Help?

- **Detailed guide**: See `docs/SHAREPOINT_SETUP.md`
- **Azure Portal**: https://portal.azure.com
- **Graph Explorer**: https://developer.microsoft.com/en-us/graph/graph-explorer
- **Troubleshooting**: Check browser console (F12) and server logs

---

## 🔒 Security Notes

- `.env.local` is in `.gitignore` - never commit it!
- Client secret is only visible ONCE when created
- Only "Read" permissions are granted (no write access)
- Credentials are server-side only (not exposed to browser)

---

**Ready to go?** Follow the 15-minute checklist above, then click the "Sync from SharePoint" button!
