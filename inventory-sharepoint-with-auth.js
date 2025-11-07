#!/usr/bin/env node

/**
 * Complete SharePoint Inventory with Azure Service Principal Auth
 * Lists all files and folders in Markman Associates SharePoint
 * Uses credentials from .env.local
 */

const https = require('https');
const fs = require('fs');

// Load .env.local manually
function loadEnv() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    return env;
  } catch (error) {
    console.error('Error reading .env.local:', error.message);
    return {};
  }
}

const env = loadEnv();
const TENANT_ID = env.AZURE_TENANT_ID;
const CLIENT_ID = env.AZURE_CLIENT_ID;
const CLIENT_SECRET = env.AZURE_CLIENT_SECRET;
const SITE_ID = env.SHAREPOINT_SITE_ID;

if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
  console.log('\n⚠️  Missing Azure credentials in .env.local\n');
  console.log('Required variables:');
  console.log('  - AZURE_TENANT_ID');
  console.log('  - AZURE_CLIENT_ID');
  console.log('  - AZURE_CLIENT_SECRET\n');
  process.exit(1);
}

let accessToken = null;

async function getAccessToken() {
  if (accessToken) return accessToken;

  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    }).toString();

    const options = {
      hostname: 'login.microsoftonline.com',
      path: `/${TENANT_ID}/oauth2/v2.0/token`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          accessToken = response.access_token;
          resolve(accessToken);
        } else {
          reject(new Error(`Token request failed (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function makeRequest(path) {
  const token = await getAccessToken();

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.microsoft.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function getSiteInfo() {
  console.log('🔍 Connecting to SharePoint site...');
  try {
    const siteInfo = await makeRequest(`/v1.0/sites/${SITE_ID}`);
    console.log(`✅ Connected to: ${siteInfo.displayName}`);
    console.log(`   URL: ${siteInfo.webUrl}`);
    return siteInfo;
  } catch (error) {
    throw new Error(`Failed to get site info: ${error.message}`);
  }
}

async function getDocumentLibrary(siteId) {
  console.log('📚 Getting document library...');
  try {
    const drives = await makeRequest(`/v1.0/sites/${siteId}/drives`);
    const docLibrary = drives.value.find(d => d.name === 'Documents' || d.driveType === 'documentLibrary');
    if (!docLibrary) {
      throw new Error('Could not find Documents library');
    }
    console.log(`✅ Found library: ${docLibrary.name}`);
    return docLibrary.id;
  } catch (error) {
    throw new Error(`Failed to get document library: ${error.message}`);
  }
}

async function listFolderContents(driveId, itemId = 'root', currentPath = '/', depth = 0) {
  const endpoint = itemId === 'root'
    ? `/v1.0/drives/${driveId}/root/children`
    : `/v1.0/drives/${driveId}/items/${itemId}/children`;

  try {
    const response = await makeRequest(endpoint);
    const items = response.value || [];

    const results = [];

    for (const item of items) {
      const itemPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;

      const itemInfo = {
        name: item.name,
        path: itemPath,
        type: item.folder ? 'folder' : 'file',
        size: item.size || 0,
        modified: item.lastModifiedDateTime,
        modifiedBy: item.lastModifiedBy?.user?.displayName || 'Unknown',
        webUrl: item.webUrl,
        id: item.id,
        depth: depth
      };

      // Add file-specific info
      if (!item.folder && item.file) {
        itemInfo.mimeType = item.file.mimeType;
        itemInfo.extension = item.name.split('.').pop().toLowerCase();
      }

      results.push(itemInfo);

      // Recursively get folder contents
      if (item.folder) {
        const indent = '  '.repeat(depth);
        console.log(`${indent}📁 ${itemPath}`);
        const subItems = await listFolderContents(driveId, item.id, itemPath, depth + 1);
        results.push(...subItems);
      }
    }

    return results;
  } catch (error) {
    console.error(`❌ Error listing ${currentPath}: ${error.message}`);
    return [];
  }
}

function generateReport(inventory) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 SHAREPOINT INVENTORY SUMMARY');
  console.log('='.repeat(80));

  // Count by type
  const folders = inventory.filter(i => i.type === 'folder');
  const files = inventory.filter(i => i.type === 'file');

  console.log(`\n📁 Total Folders: ${folders.length}`);
  console.log(`📄 Total Files: ${files.length}`);

  // Files by extension
  const filesByExt = {};
  files.forEach(f => {
    const ext = f.extension || 'unknown';
    filesByExt[ext] = (filesByExt[ext] || 0) + 1;
  });

  console.log('\n📋 Files by Type:');
  Object.entries(filesByExt)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ext, count]) => {
      console.log(`   .${ext}: ${count} files`);
    });

  // Total size
  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
  const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`\n💾 Total Size: ${sizeMB} MB`);

  // Recently modified
  console.log('\n🕐 Recently Modified (Last 10 Files):');
  files
    .sort((a, b) => new Date(b.modified) - new Date(a.modified))
    .slice(0, 10)
    .forEach(f => {
      const date = new Date(f.modified).toLocaleDateString();
      console.log(`   ${date} - ${f.path}`);
    });

  // Search for timesheets
  console.log('\n⏰ FILES RELATED TO TIMESHEETS:');
  const timesheetFiles = inventory.filter(i =>
    i.type === 'file' &&
    (i.name.toLowerCase().includes('timesheet') ||
     i.name.toLowerCase().includes('time sheet') ||
     i.name.toLowerCase().includes('hours') ||
     i.name.toLowerCase().includes('time tracking') ||
     i.path.toLowerCase().includes('timesheet'))
  );

  if (timesheetFiles.length > 0) {
    timesheetFiles.forEach(f => {
      console.log(`\n   📄 ${f.path}`);
      console.log(`      📅 Modified: ${new Date(f.modified).toLocaleDateString()}`);
      console.log(`      👤 By: ${f.modifiedBy}`);
      console.log(`      🔗 ${f.webUrl}`);
    });
  } else {
    console.log('   ℹ️  No files with "timesheet" or "hours" in name found');
  }

  // Search for consultant names
  console.log('\n👥 FILES RELATED TO CONSULTANTS:');
  const consultantNames = ['niki', 'carmen', 'ivana', 'abri', 'petrana', 'beata', 'jan', 'marianna', 'nikola', 'pepi', 'swan'];
  const consultantFiles = inventory.filter(i =>
    i.type === 'file' &&
    consultantNames.some(name => i.name.toLowerCase().includes(name) || i.path.toLowerCase().includes(name))
  );

  if (consultantFiles.length > 0) {
    consultantFiles.forEach(f => {
      console.log(`\n   📄 ${f.path}`);
      console.log(`      📅 Modified: ${new Date(f.modified).toLocaleDateString()}`);
      console.log(`      👤 By: ${f.modifiedBy}`);
    });
  } else {
    console.log('   ℹ️  No files with consultant names found');
  }

  // Search for project-related files
  console.log('\n🏢 FILES RELATED TO PROJECTS (Laurel/Metropolitan):');
  const projectFiles = inventory.filter(i =>
    i.type === 'file' &&
    (i.name.toLowerCase().includes('laurel') ||
     i.name.toLowerCase().includes('metropolitan') ||
     i.path.toLowerCase().includes('laurel') ||
     i.path.toLowerCase().includes('metropolitan'))
  );

  if (projectFiles.length > 0) {
    projectFiles.forEach(f => {
      console.log(`\n   📄 ${f.path}`);
      console.log(`      📅 Modified: ${new Date(f.modified).toLocaleDateString()}`);
    });
  } else {
    console.log('   ℹ️  No files with "Laurel" or "Metropolitan" found');
  }

  console.log('\n' + '='.repeat(80));
}

async function main() {
  console.log('\n📁 SHAREPOINT COMPLETE INVENTORY');
  console.log('Site: Markman Associates');
  console.log('Using Azure Service Principal Authentication');
  console.log('='.repeat(80) + '\n');

  try {
    // Get access token
    console.log('🔐 Authenticating with Azure...');
    await getAccessToken();
    console.log('✅ Authentication successful\n');

    // Get site and drive info
    const siteInfo = await getSiteInfo();
    const driveId = await getDocumentLibrary(siteInfo.id);

    // Get full inventory
    console.log('\n🔄 Scanning all folders and files...\n');
    const inventory = await listFolderContents(driveId);

    // Save to files
    const timestamp = new Date().toISOString().split('T')[0];

    // Full JSON inventory
    const jsonPath = `./data/sharepoint-inventory-${timestamp}.json`;
    fs.writeFileSync(jsonPath, JSON.stringify(inventory, null, 2));
    console.log(`\n✅ Full inventory saved to: ${jsonPath}`);

    // CSV format for easy viewing
    const csvPath = `./data/sharepoint-inventory-${timestamp}.csv`;
    const csvHeader = 'Type,Name,Path,Size (bytes),Modified,Modified By,Extension,URL\n';
    const csvRows = inventory.map(i =>
      `${i.type},"${i.name}","${i.path}",${i.size},"${i.modified}","${i.modifiedBy}","${i.extension || ''}","${i.webUrl}"`
    ).join('\n');
    fs.writeFileSync(csvPath, csvHeader + csvRows);
    console.log(`✅ CSV inventory saved to: ${csvPath}`);

    // Generate summary report
    generateReport(inventory);

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n🔧 PERMISSION ISSUE DETECTED\n');
      console.log('Your Azure App Registration needs these Microsoft Graph API permissions:');
      console.log('  - Sites.Read.All (to read SharePoint sites)');
      console.log('  - Files.Read.All (to read files)');
      console.log('\nTo add permissions:');
      console.log('1. Go to: https://portal.azure.com');
      console.log('2. Navigate to: Azure Active Directory → App registrations');
      console.log('3. Find your app (Client ID: ' + CLIENT_ID + ')');
      console.log('4. Go to: API permissions → Add a permission → Microsoft Graph');
      console.log('5. Choose "Application permissions" (not Delegated)');
      console.log('6. Add: Sites.Read.All and Files.Read.All');
      console.log('7. Click "Grant admin consent" at the top\n');
    }

    process.exit(1);
  }
}

main().catch(console.error);
