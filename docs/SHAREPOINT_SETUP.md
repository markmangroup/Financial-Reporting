# SharePoint API Integration Setup Guide

## Overview
This guide will help you set up automatic data sync from your SharePoint site to the Financial Reporting Dashboard.

## Step 1: Create Azure AD App Registration

1. **Go to Azure Portal**
   - Navigate to: https://portal.azure.com
   - Sign in with your Microsoft 365 account

2. **Register a New Application**
   - In the search bar, type "Azure Active Directory" and click it
   - Click "App registrations" in the left sidebar
   - Click "+ New registration" at the top

3. **Configure the App**
   - **Name**: `Markman Financial Reporting`
   - **Supported account types**: Select "Accounts in this organizational directory only"
   - **Redirect URI**: Leave blank for now
   - Click "Register"

4. **Copy Your App Credentials**
   - After registration, you'll see the "Overview" page
   - **COPY THESE VALUES** (you'll need them later):
     - **Application (client) ID**: (looks like: `12345678-1234-1234-1234-123456789abc`)
     - **Directory (tenant) ID**: (looks like: `87654321-4321-4321-4321-cba987654321`)

## Step 2: Create a Client Secret

1. **Navigate to Certificates & Secrets**
   - In your app's page, click "Certificates & secrets" in the left sidebar
   - Click "+ New client secret"

2. **Create the Secret**
   - **Description**: `Financial Dashboard API Key`
   - **Expires**: Select "24 months" (or your preference)
   - Click "Add"

3. **IMMEDIATELY Copy the Secret Value**
   - **IMPORTANT**: You can only see this value ONCE!
   - **COPY THIS VALUE**: (looks like: `a1b2c3d4~eFgHiJkLmNoPqRsTuVwXyZ.1234567890`)
   - Save it somewhere secure (you'll add it to .env.local)

## Step 3: Grant API Permissions

1. **Navigate to API Permissions**
   - In your app's page, click "API permissions" in the left sidebar

2. **Add Microsoft Graph Permissions**
   - Click "+ Add a permission"
   - Click "Microsoft Graph"
   - Click "Application permissions" (NOT Delegated permissions)

3. **Select These Permissions** (search for each one):
   - ✅ `Sites.Read.All` - Read items in all site collections
   - ✅ `Files.Read.All` - Read files in all site collections

4. **Grant Admin Consent**
   - Click "Grant admin consent for [Your Organization]"
   - Click "Yes" to confirm
   - **IMPORTANT**: You must be a Global Administrator to grant consent

## Step 4: Get Your SharePoint Site ID

### Option A: Using Browser Developer Tools (Easiest)

1. **Open Your SharePoint Site**
   - Go to: https://[yourcompany].sharepoint.com/sites/[yoursite]
   - Example: `https://markmangroup.sharepoint.com/sites/MarkmanGroup`

2. **Open Browser Developer Tools**
   - Press `F12` (or right-click → Inspect)
   - Go to the "Console" tab

3. **Run This Command**:
   ```javascript
   _spPageContextInfo.siteId
   ```

4. **Copy the Site ID**
   - It looks like: `12345678-1234-1234-1234-123456789abc`

### Option B: Using Graph Explorer

1. **Go to Graph Explorer**
   - Navigate to: https://developer.microsoft.com/en-us/graph/graph-explorer
   - Sign in with your Microsoft 365 account

2. **Run This Query**:
   ```
   https://graph.microsoft.com/v1.0/sites?search=Markman
   ```

3. **Find Your Site in the Results**
   - Look for your site name in the response
   - Copy the `id` field

## Step 5: Configure Your Application

1. **Create/Edit `.env.local` File**
   - In your project root, create a file named `.env.local`
   - Add these lines (replace with YOUR actual values):

```env
# Azure AD App Registration
AZURE_TENANT_ID=your-tenant-id-here
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here

# SharePoint Site
SHAREPOINT_SITE_ID=your-site-id-here

# Optional: For frontend display
NEXT_PUBLIC_SHAREPOINT_ENABLED=true
```

2. **Example `.env.local`**:
```env
AZURE_TENANT_ID=87654321-4321-4321-4321-cba987654321
AZURE_CLIENT_ID=12345678-1234-1234-1234-123456789abc
AZURE_CLIENT_SECRET=a1b2c3d4~eFgHiJkLmNoPqRsTuVwXyZ.1234567890
SHAREPOINT_SITE_ID=98765432-8765-8765-8765-876543219876
NEXT_PUBLIC_SHAREPOINT_ENABLED=true
```

3. **Save the File**
   - **IMPORTANT**: `.env.local` is already in `.gitignore` - never commit this file!

## Step 6: Restart Your Development Server

1. **Stop the current server** (Ctrl+C in terminal)
2. **Restart**: `npm run dev`
3. **Verify**: You should see the "Sync Data" button in your dashboard

## Step 7: Test the Connection

1. **Open Your Dashboard**
   - Go to: http://localhost:3001

2. **Test SharePoint Connection**
   - You should see a "Sync from SharePoint" button in the navigation
   - Click it
   - Select "Test Connection"
   - If successful, you'll see: ✅ "Connected to [Your Site Name]"

3. **Sync Income Data**
   - Click "Sync Income Files"
   - The app will download files from:
     - `/Income Files/Laurel AG/`
     - `/Income Files/Metropolitan/`
   - Files will be saved to your local `/data/` folder

## Troubleshooting

### Error: "SharePoint not configured"
- **Solution**: Make sure all 4 environment variables are set in `.env.local`
- **Check**: Restart your dev server after adding variables

### Error: "Authentication failed"
- **Solution**: Verify your `AZURE_CLIENT_SECRET` is correct
- **Note**: The secret value is only shown ONCE when created
- **Fix**: Create a new client secret if you lost the original

### Error: "Insufficient privileges"
- **Solution**: Grant admin consent in Azure AD (Step 3.4)
- **Check**: Ensure you added `Sites.Read.All` and `Files.Read.All` permissions

### Error: "Site not found"
- **Solution**: Double-check your `SHAREPOINT_SITE_ID`
- **Try**: Use Graph Explorer to verify the site ID

### Files Not Syncing
- **Check folder structure**: Ensure folders exist at:
  - `/Income Files/Laurel AG/`
  - `/Income Files/Metropolitan/`
- **Check file formats**: Only `.csv` and `.xlsx` files are synced
- **Check permissions**: Ensure the app has `Files.Read.All` permission

## Folder Structure Expected

The integration expects this SharePoint folder structure:

```
📁 Markman Group (SharePoint Site)
├── 📁 Income Files
│   ├── 📁 Laurel AG
│   │   └── 📄 invoice-*.csv
│   └── 📁 Metropolitan
│       └── 📄 invoice-*.csv
├── 📁 Governance
│   └── 📄 timesheet-*.csv
└── 📁 Legal Documents
    └── 📁 SOWs
        ├── 📁 Laurel AG
        └── 📁 Metropolitan
```

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Rotate secrets regularly** - Create new client secrets every 12 months
3. **Use least privilege** - Only grant Read permissions, not Write
4. **Monitor access** - Check Azure AD sign-in logs periodically

## What Data Gets Synced?

Currently configured to sync:
- ✅ Income Files (Laurel AG + Metropolitan invoices)
- 🔄 Time Sheets (coming soon)
- 🔄 SOWs (coming soon)

## Next Steps

After successful setup:
1. Click "Sync Income Files" to download revenue data
2. New insights will appear:
   - Client Profitability Analysis
   - Revenue vs. Expense Trends
   - Project ROI
3. Set up automatic sync schedule (optional)

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Check the server logs (terminal where `npm run dev` is running)
3. Verify all Azure AD permissions are granted
4. Ensure SharePoint folder paths match exactly

---

**Last Updated**: November 2025
**Version**: 1.0
