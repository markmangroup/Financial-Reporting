#!/usr/bin/env node

/**
 * Search SharePoint for consultant timesheets
 * Uses Microsoft Graph API to find timesheet files
 */

const https = require('https');

const ACCESS_TOKEN = process.env.MS_GRAPH_TOKEN;

if (!ACCESS_TOKEN) {
  console.log('\n⚠️  No Microsoft Graph access token found.\n');
  console.log('To use this script:');
  console.log('1. Go to https://developer.microsoft.com/en-us/graph/graph-explorer');
  console.log('2. Sign in and get an access token');
  console.log('3. Run: export MS_GRAPH_TOKEN="your-token"');
  console.log('4. Run: node search-sharepoint-timesheets.js\n');
  process.exit(1);
}

async function searchSharePoint(query) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      requests: [{
        entityTypes: ['driveItem'],
        query: {
          queryString: query
        },
        from: 0,
        size: 50
      }]
    });

    const options = {
      hostname: 'graph.microsoft.com',
      path: '/v1.0/search/query',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
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
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('\n📁 Searching SharePoint for Consultant Timesheets\n');
  console.log('='.repeat(60));

  const searchTerms = [
    'timesheet',
    'time sheet',
    'hours worked',
    'consultant hours',
    'Niki timesheet',
    'Carmen timesheet',
    'Upwork timesheet',
    'Ivana timesheet'
  ];

  const allResults = [];

  for (const term of searchTerms) {
    process.stdout.write(`\n🔍 Searching for: "${term}"...`);

    try {
      const results = await searchSharePoint(term);

      if (results.value && results.value[0]?.hitsContainers) {
        const hits = results.value[0].hitsContainers[0]?.hits || [];

        if (hits.length > 0) {
          console.log(` ✅ Found ${hits.length} documents`);

          hits.forEach(hit => {
            const resource = hit.resource;
            allResults.push({
              searchTerm: term,
              name: resource.name,
              webUrl: resource.webUrl,
              lastModified: resource.lastModifiedDateTime,
              size: resource.size,
              summary: hit.summary || ''
            });

            console.log(`   📄 ${resource.name}`);
            console.log(`      📍 ${resource.webUrl}`);
            console.log(`      📅 Modified: ${resource.lastModifiedDateTime}`);
          });
        } else {
          console.log(` ℹ️  No results`);
        }
      } else {
        console.log(` ℹ️  No results`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.log(` ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Search complete! Found ${allResults.length} total documents`);

  if (allResults.length > 0) {
    const fs = require('fs');
    const outputPath = './data/sharepoint-timesheets-found.json';
    fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
    console.log(`📊 Results saved to: ${outputPath}`);

    // Print summary
    console.log('\n📋 Summary:');
    const filesByType = {};
    allResults.forEach(result => {
      const ext = result.name.split('.').pop().toLowerCase();
      if (!filesByType[ext]) filesByType[ext] = 0;
      filesByType[ext]++;
    });

    Object.entries(filesByType).forEach(([ext, count]) => {
      console.log(`   ${ext}: ${count} files`);
    });
  } else {
    console.log('\n💡 No timesheet files found in SharePoint.');
    console.log('   They might be named differently or stored elsewhere.');
    console.log('   Try searching SharePoint manually for:');
    console.log('   - Excel files with consultant names');
    console.log('   - "Hours" or "Time tracking" documents');
    console.log('   - Project folder structures');
  }

  console.log('');
}

main().catch(console.error);
