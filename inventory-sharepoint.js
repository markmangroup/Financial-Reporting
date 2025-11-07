#!/usr/bin/env node

/**
 * Complete SharePoint Inventory
 * Lists all files and folders in Markman Associates SharePoint
 * Uses Microsoft Graph API Drive/Files endpoints
 */

const https = require('https');
const fs = require('fs');

const ACCESS_TOKEN = process.env.MS_GRAPH_TOKEN;
const SITE_NAME = 'markmanassociates.sharepoint.com';
const SITE_PATH = '/sites/MarkmanAssociates';

if (!ACCESS_TOKEN) {
  console.log('\n⚠️  No Microsoft Graph access token found.\n');
  console.log('To use this script:');
  console.log('1. Go to https://developer.microsoft.com/en-us/graph/graph-explorer');
  console.log('2. Sign in and get an access token');
  console.log('3. Run: export MS_GRAPH_TOKEN="your-token"');
  console.log('4. Run: node inventory-sharepoint.js\n');
  process.exit(1);
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.microsoft.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
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

async function getSiteId() {
  console.log('🔍 Finding SharePoint site ID...');
  try {
    const siteInfo = await makeRequest(`/v1.0/sites/${SITE_NAME}:${SITE_PATH}`);
    console.log(`✅ Found site: ${siteInfo.displayName}`);
    return siteInfo.id;
  } catch (error) {
    throw new Error(`Failed to get site ID: ${error.message}`);
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

async function listFolderContents(driveId, itemId = 'root', currentPath = '/') {
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
        id: item.id
      };

      // Add file-specific info
      if (!item.folder && item.file) {
        itemInfo.mimeType = item.file.mimeType;
        itemInfo.extension = item.name.split('.').pop().toLowerCase();
      }

      results.push(itemInfo);

      // Recursively get folder contents
      if (item.folder) {
        console.log(`📁 Scanning: ${itemPath}`);
        const subItems = await listFolderContents(driveId, item.id, itemPath);
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
  console.log('\n⏰ Files Related to Timesheets:');
  const timesheetFiles = inventory.filter(i =>
    i.type === 'file' &&
    (i.name.toLowerCase().includes('timesheet') ||
     i.name.toLowerCase().includes('time sheet') ||
     i.name.toLowerCase().includes('hours') ||
     i.path.toLowerCase().includes('timesheet'))
  );

  if (timesheetFiles.length > 0) {
    timesheetFiles.forEach(f => {
      console.log(`   📄 ${f.path}`);
      console.log(`      📅 Modified: ${new Date(f.modified).toLocaleDateString()}`);
      console.log(`      🔗 ${f.webUrl}`);
    });
  } else {
    console.log('   ℹ️  No files with "timesheet" or "hours" in name found');
  }

  // Search for consultant names
  console.log('\n👥 Files Related to Consultants:');
  const consultantNames = ['niki', 'carmen', 'ivana', 'abri', 'petrana', 'beata', 'jan', 'marianna', 'nikola', 'pepi', 'swan'];
  const consultantFiles = inventory.filter(i =>
    i.type === 'file' &&
    consultantNames.some(name => i.name.toLowerCase().includes(name) || i.path.toLowerCase().includes(name))
  );

  if (consultantFiles.length > 0) {
    consultantFiles.forEach(f => {
      console.log(`   📄 ${f.path}`);
      console.log(`      📅 Modified: ${new Date(f.modified).toLocaleDateString()}`);
    });
  } else {
    console.log('   ℹ️  No files with consultant names found');
  }

  console.log('\n' + '='.repeat(80));
}

async function main() {
  console.log('\n📁 SHAREPOINT COMPLETE INVENTORY');
  console.log('Site: Markman Associates');
  console.log('='.repeat(80) + '\n');

  try {
    // Get site and drive IDs
    const siteId = await getSiteId();
    const driveId = await getDocumentLibrary(siteId);

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
    process.exit(1);
  }
}

main().catch(console.error);
