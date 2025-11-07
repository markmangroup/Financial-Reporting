#!/usr/bin/env node

/**
 * Download Critical SharePoint Documents
 * Downloads SOWs, proposals, contracts, and key deliverables with validation
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load .env.local
function loadEnv() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  return env;
}

const env = loadEnv();
const TENANT_ID = env.AZURE_TENANT_ID;
const CLIENT_ID = env.AZURE_CLIENT_ID;
const CLIENT_SECRET = env.AZURE_CLIENT_SECRET;
const SITE_ID = env.SHAREPOINT_SITE_ID;

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
          accessToken = JSON.parse(data).access_token;
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

async function downloadFile(fileId, localPath) {
  const token = await getAccessToken();

  return new Promise((resolve, reject) => {
    const downloadUrl = `/v1.0/sites/${SITE_ID}/drive/items/${fileId}/content`;

    const options = {
      hostname: 'graph.microsoft.com',
      path: downloadUrl,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        const redirectUrl = res.headers.location;
        https.get(redirectUrl, (redirectRes) => {
          const fileStream = fs.createWriteStream(localPath);
          redirectRes.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            resolve(localPath);
          });

          fileStream.on('error', (err) => {
            fs.unlink(localPath, () => {});
            reject(err);
          });
        });
      } else if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(localPath);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve(localPath);
        });

        fileStream.on('error', (err) => {
          fs.unlink(localPath, () => {});
          reject(err);
        });
      } else {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => reject(new Error(`Download failed (${res.statusCode}): ${data}`)));
      }
    });

    req.on('error', reject);
    req.end();
  });
}

function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// Load inventory
const inventory = JSON.parse(fs.readFileSync('./data/sharepoint-inventory-2025-11-07.json', 'utf8'));

// Define critical documents to download - EXPANDED for next migration batch
const criticalDocuments = [
  // ==== LAUREL AG PROJECT ====
  // Contracts & SOWs
  { pattern: /SOW Swan.*\.docx$/i, projectId: 'laurel-ag-proposal-tools', category: 'contracts' },
  { pattern: /Licensing and Maintenance SOW.*Laurel.*\.docx$/i, projectId: 'laurel-ag-proposal-tools', category: 'contracts' },
  { pattern: /Statement of Work.*Laurel.*\.(docx|pdf)$/i, projectId: 'laurel-ag-proposal-tools', category: 'contracts' },

  // Proposals
  { pattern: /Laurel.*Proposal.*\.(docx|pdf)$/i, projectId: 'laurel-ag-proposal-tools', category: 'proposals' },
  { pattern: /Proposal.*Laurel.*\.(docx|pdf)$/i, projectId: 'laurel-ag-proposal-tools', category: 'proposals' },

  // Technical Documentation
  { pattern: /Technical Specification.*Rental.*\.docx$/i, projectId: 'laurel-ag-proposal-tools', category: 'documentation' },
  { pattern: /Technical Specification.*Proposal.*\.docx$/i, projectId: 'laurel-ag-proposal-tools', category: 'documentation' },
  { pattern: /.*Technical Documentation.*Laurel.*\.(docx|pdf)$/i, projectId: 'laurel-ag-proposal-tools', category: 'documentation' },
  { pattern: /User Guide.*Laurel.*\.(docx|pdf)$/i, projectId: 'laurel-ag-proposal-tools', category: 'documentation' },
  { pattern: /Requirements.*Laurel.*\.(docx|xlsx)$/i, projectId: 'laurel-ag-proposal-tools', category: 'documentation' },

  // Deliverables
  { pattern: /.*Proposal Application.*\.xlsx$/i, projectId: 'laurel-ag-proposal-tools', category: 'deliverables' },
  { pattern: /.*Rental.*\.xlsx$/i, projectId: 'laurel-ag-proposal-tools', category: 'deliverables' },
  { pattern: /Design Document.*Laurel.*\.(docx|pdf)$/i, projectId: 'laurel-ag-proposal-tools', category: 'deliverables' },

  // ==== METROPOLITAN PROJECT ====
  // Proposals
  { pattern: /Metropolitan.*Proposal.*\.(docx|pdf)$/i, projectId: 'metropolitan-current-state', category: 'proposals' },
  { pattern: /.*Quick Wins.*Metropolitan.*\.(docx|pdf)$/i, projectId: 'metropolitan-current-state', category: 'proposals' },

  // Documentation
  { pattern: /Current State Overview.*\.docx$/i, projectId: 'metropolitan-current-state', category: 'documentation' },
  { pattern: /Current State.*Metropolitan.*\.(docx|pdf)$/i, projectId: 'metropolitan-current-state', category: 'documentation' },
  { pattern: /Process.*Map.*Metropolitan.*\.(docx|pdf|vsdx)$/i, projectId: 'metropolitan-current-state', category: 'documentation' },
  { pattern: /Discovery.*Session.*Metropolitan.*\.(docx|pdf)$/i, projectId: 'metropolitan-current-state', category: 'documentation' },
  { pattern: /Meeting Notes.*Metropolitan.*\.(docx|pdf)$/i, projectId: 'metropolitan-current-state', category: 'documentation' },
  { pattern: /Findings.*Metropolitan.*\.(docx|pdf)$/i, projectId: 'metropolitan-current-state', category: 'documentation' },
  { pattern: /Recommendations.*Metropolitan.*\.(docx|pdf)$/i, projectId: 'metropolitan-current-state', category: 'documentation' },

  // Deliverables
  { pattern: /Final Report.*Metropolitan.*\.(docx|pdf)$/i, projectId: 'metropolitan-current-state', category: 'deliverables' },
  { pattern: /.*Assessment.*Metropolitan.*\.(docx|pdf|pptx)$/i, projectId: 'metropolitan-current-state', category: 'deliverables' },

  // ==== DITTMAR PROJECT ====
  // Proposals & Contracts
  { pattern: /Dittmar.*Proposal.*\.(docx|pdf)$/i, projectId: 'dittmar-ap-automation', category: 'proposals' },
  { pattern: /.*AP Automation.*Proposal.*\.(docx|pdf)$/i, projectId: 'dittmar-ap-automation', category: 'proposals' },
  { pattern: /SOW.*Dittmar.*\.(docx|pdf)$/i, projectId: 'dittmar-ap-automation', category: 'contracts' },

  // Documentation
  { pattern: /.*Dittmar.*Requirements.*\.(docx|xlsx)$/i, projectId: 'dittmar-ap-automation', category: 'documentation' },
  { pattern: /.*Dittmar.*Process.*\.(docx|pdf|vsdx)$/i, projectId: 'dittmar-ap-automation', category: 'documentation' },
  { pattern: /Technical.*Dittmar.*\.(docx|pdf)$/i, projectId: 'dittmar-ap-automation', category: 'documentation' },

  // ==== BRAINDEAD PROJECT ====
  // Any BrainDead related docs
  { pattern: /BrainDead.*\.(docx|pdf|xlsx)$/i, projectId: 'braindead-portal', category: 'documentation' },
  { pattern: /.*BrainDead.*Proposal.*\.(docx|pdf)$/i, projectId: 'braindead-portal', category: 'proposals' },
  { pattern: /.*BrainDead.*SOW.*\.(docx|pdf)$/i, projectId: 'braindead-portal', category: 'contracts' },

  // ==== MARKMAN INTERNAL ====
  // PowerBI and internal docs
  { pattern: /Strategic & Operational Overview\.pbix$/i, projectId: 'markman-internal', category: 'deliverables' },
  { pattern: /Markman.*Overview.*\.(pptx|pdf)$/i, projectId: 'markman-internal', category: 'deliverables' },
  { pattern: /Offering.*Catalogue.*\.(pptx|pdf)$/i, projectId: 'markman-internal', category: 'documentation' },
  { pattern: /Time Sheet Template.*\.xlsx$/i, projectId: 'markman-internal', category: 'documentation' },
  { pattern: /Roles.*Responsibilities.*\.(pptx|pdf|docx)$/i, projectId: 'markman-internal', category: 'documentation' },

  // ==== GENERIC HIGH-VALUE DOCS ====
  // Any proposals in the Proposals folder
  { pattern: /^Proposal.*\.(docx|pdf)$/i, projectId: 'markman-internal', category: 'proposals', pathContains: '/General/Proposals/' },

  // Key deliverables
  { pattern: /Final.*Deliverable.*\.(docx|pdf|pptx)$/i, projectId: 'markman-internal', category: 'deliverables', pathContains: '/Deliverable' },
  { pattern: /.*Presentation.*\.(pptx|pdf)$/i, projectId: 'markman-internal', category: 'deliverables', pathContains: '/Deliverable' }
];

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('SHAREPOINT DOCUMENT MIGRATION');
  console.log('Downloading critical project documents');
  console.log('='.repeat(80) + '\n');

  await getAccessToken();
  console.log('✅ Authenticated\n');

  const downloadResults = [];
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const doc of criticalDocuments) {
    console.log(`\n🔍 Searching for: ${doc.pattern}`);

    const matchingFiles = inventory.filter(item => {
      if (item.type !== 'file') return false;
      if (!doc.pattern.test(item.name)) return false;
      if (doc.pathContains && !item.path.includes(doc.pathContains)) return false;
      return true;
    });

    if (matchingFiles.length === 0) {
      console.log(`   ⚠️  No files found matching pattern`);
      skipped++;
      continue;
    }

    for (const file of matchingFiles) {
      const projectDir = `./data/projects/${doc.projectId}/${doc.category}`;
      const localPath = path.join(projectDir, file.name);

      // Check if already downloaded
      if (fs.existsSync(localPath)) {
        console.log(`   ℹ️  Already exists: ${file.name}`);
        skipped++;
        continue;
      }

      console.log(`   📥 Downloading: ${file.name}`);
      console.log(`      From: ${file.path}`);

      try {
        // Ensure directory exists
        fs.mkdirSync(projectDir, { recursive: true });

        // Download file
        await downloadFile(file.id, localPath);

        // Calculate hash
        const fileHash = await calculateFileHash(localPath);
        const fileSize = fs.statSync(localPath).size;

        const result = {
          filename: file.name,
          localPath: localPath,
          sharepointUrl: file.webUrl,
          sharepointPath: file.path,
          downloadedAt: new Date().toISOString(),
          fileHash: fileHash,
          fileSize: fileSize,
          modifiedBy: file.modifiedBy,
          modifiedDate: file.modified,
          projectId: doc.projectId,
          category: doc.category
        };

        downloadResults.push(result);

        console.log(`      ✅ Downloaded: ${(fileSize / 1024).toFixed(1)} KB`);
        console.log(`      🔒 Hash: ${fileHash.substring(0, 16)}...`);

        downloaded++;

        // Update project metadata
        const metadataPath = `./data/projects/${doc.projectId}/metadata.json`;
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          metadata.documents[doc.category].push(result);
          metadata.migrationStatus.lastUpdated = new Date().toISOString();
          fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log(`      ❌ Failed: ${error.message}`);
        failed++;
      }
    }
  }

  // Save download log
  const logPath = './data/document-downloads-log.json';
  const log = {
    timestamp: new Date().toISOString(),
    summary: {
      downloaded,
      skipped,
      failed,
      total: downloaded + skipped + failed
    },
    downloads: downloadResults
  };
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log('DOWNLOAD SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Downloaded: ${downloaded} files`);
  console.log(`ℹ️  Skipped: ${skipped} files (already exist)`);
  console.log(`❌ Failed: ${failed} files`);
  console.log(`\n📋 Log saved to: ${logPath}\n`);
}

main().catch(console.error);
