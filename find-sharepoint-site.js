#!/usr/bin/env node

/**
 * Find Markman Associates SharePoint Site
 * Lists all available SharePoint sites to find the correct one
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

async function main() {
  console.log('\n🔍 FINDING MARKMAN ASSOCIATES SHAREPOINT SITE');
  console.log('='.repeat(80) + '\n');

  try {
    console.log('🔐 Authenticating...');
    await getAccessToken();
    console.log('✅ Authenticated\n');

    // Method 1: Search for site by name
    console.log('🔍 Searching for "Markman Associates" site...\n');
    try {
      const searchResults = await makeRequest('/v1.0/sites?search=markman');

      if (searchResults.value && searchResults.value.length > 0) {
        console.log(`✅ Found ${searchResults.value.length} site(s):\n`);

        searchResults.value.forEach((site, index) => {
          console.log(`${index + 1}. ${site.displayName}`);
          console.log(`   ID: ${site.id}`);
          console.log(`   URL: ${site.webUrl}`);
          console.log(`   Description: ${site.description || 'N/A'}`);
          console.log('');
        });

        // Try to find team site specifically
        const teamSite = searchResults.value.find(s =>
          s.webUrl.includes('/sites/') &&
          !s.webUrl.includes('-my.sharepoint') &&
          (s.displayName.toLowerCase().includes('markman') ||
           s.displayName.toLowerCase().includes('associates'))
        );

        if (teamSite) {
          console.log('🎯 RECOMMENDED SITE (Team Site):');
          console.log(`   Name: ${teamSite.displayName}`);
          console.log(`   ID: ${teamSite.id}`);
          console.log(`   URL: ${teamSite.webUrl}`);
          console.log('\n💡 Update your .env.local with:');
          console.log(`   SHAREPOINT_SITE_ID=${teamSite.id}`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Search error: ${error.message}`);
    }

    // Method 2: Try direct URL
    console.log('\n🔍 Trying direct URL: markmanassociates.sharepoint.com:/sites/MarkmanAssociates\n');
    try {
      const directSite = await makeRequest('/v1.0/sites/markmanassociates.sharepoint.com:/sites/MarkmanAssociates');
      console.log('✅ Found via direct URL!');
      console.log(`   Name: ${directSite.displayName}`);
      console.log(`   ID: ${directSite.id}`);
      console.log(`   URL: ${directSite.webUrl}`);
      console.log('\n💡 Update your .env.local with:');
      console.log(`   SHAREPOINT_SITE_ID=${directSite.id}`);
    } catch (error) {
      console.log(`⚠️  Direct URL not found: ${error.message}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n🔧 PERMISSION ISSUE\n');
      console.log('Your Azure App needs these permissions:');
      console.log('  - Sites.Read.All');
      console.log('  - Files.Read.All');
      console.log('\nAdd them at: https://portal.azure.com → App registrations → API permissions');
    }
  }
}

main().catch(console.error);
