#!/usr/bin/env node

/**
 * Search Microsoft Outlook and SharePoint for Swan Softweb Solutions documentation
 *
 * This script uses Microsoft Graph API to search for:
 * - Emails from/about Swan
 * - Invoices (especially US-338)
 * - Project documents
 * - Work statements
 */

const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const SEARCH_TERMS = {
  email: ['Swan', 'Softweb', 'US-338', 'contact@swansoftweb.com'],
  sharepoint: ['Swan', 'Softweb Solutions', 'US-338', 'invoice']
};

const DATE_RANGE = {
  start: '2024-11-01',
  end: '2025-07-31'
};

const OUTPUT_DIR = './data/swan-communications';

class SwanSearcher {
  constructor() {
    this.accessToken = null;
  }

  /**
   * Get access token from environment or interactive login
   */
  async getAccessToken() {
    // Check if token is in environment
    if (process.env.MS_GRAPH_TOKEN) {
      this.accessToken = process.env.MS_GRAPH_TOKEN;
      return;
    }

    console.log('\n⚠️  No access token found.');
    console.log('To use this script, you need a Microsoft Graph API access token.\n');
    console.log('Instructions:');
    console.log('1. Go to https://developer.microsoft.com/en-us/graph/graph-explorer');
    console.log('2. Sign in with your Microsoft account');
    console.log('3. Click "Access token" in the left sidebar');
    console.log('4. Copy the token and run:');
    console.log('   export MS_GRAPH_TOKEN="your-token-here"');
    console.log('   node search-swan-communications.js\n');

    throw new Error('Access token required');
  }

  /**
   * Search Outlook emails
   */
  async searchEmails() {
    console.log('\n📧 Searching Outlook emails...\n');

    const results = [];

    for (const term of SEARCH_TERMS.email) {
      console.log(`   Searching for: "${term}"`);

      try {
        // Build Microsoft Graph query
        const query = `https://graph.microsoft.com/v1.0/me/messages?$search="${term}"&$filter=receivedDateTime ge ${DATE_RANGE.start} and receivedDateTime le ${DATE_RANGE.end}&$select=subject,from,receivedDateTime,bodyPreview,hasAttachments&$top=50`;

        const response = await fetch(query, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.log(`   ⚠️  Error: ${response.status} ${response.statusText}`);
          continue;
        }

        const data = await response.json();

        if (data.value && data.value.length > 0) {
          console.log(`   ✅ Found ${data.value.length} emails`);
          results.push(...data.value);
        } else {
          console.log(`   No results for "${term}"`);
        }

      } catch (error) {
        console.log(`   ❌ Error searching for "${term}": ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Search SharePoint documents
   */
  async searchSharePoint() {
    console.log('\n📁 Searching SharePoint documents...\n');

    const results = [];

    for (const term of SEARCH_TERMS.sharepoint) {
      console.log(`   Searching for: "${term}"`);

      try {
        // Microsoft Graph search query for SharePoint
        const query = `https://graph.microsoft.com/v1.0/search/query`;

        const response = await fetch(query, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [{
              entityTypes: ['driveItem'],
              query: {
                queryString: term
              },
              from: 0,
              size: 25
            }]
          })
        });

        if (!response.ok) {
          console.log(`   ⚠️  Error: ${response.status} ${response.statusText}`);
          continue;
        }

        const data = await response.json();

        if (data.value && data.value[0]?.hitsContainers) {
          const hits = data.value[0].hitsContainers[0].hits;
          if (hits && hits.length > 0) {
            console.log(`   ✅ Found ${hits.length} documents`);
            results.push(...hits);
          } else {
            console.log(`   No results for "${term}"`);
          }
        }

      } catch (error) {
        console.log(`   ❌ Error searching for "${term}": ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Extract project information from emails
   */
  extractProjectInfo(emails) {
    const projectKeywords = {
      'Laurel AG': ['laurel', 'laurel ag', 'laurel.ag', 'ag data'],
      'Metropolitan Partners': ['metropolitan', 'metro partners', 'mp analytics'],
      'Financial Reporting': ['financial reporting', 'finance dashboard', 'reporting system'],
      'Data Integration': ['data integration', 'integration services', 'api integration']
    };

    const projectMap = {};

    emails.forEach(email => {
      const content = `${email.subject} ${email.bodyPreview}`.toLowerCase();

      Object.entries(projectKeywords).forEach(([projectName, keywords]) => {
        if (keywords.some(kw => content.includes(kw))) {
          if (!projectMap[projectName]) {
            projectMap[projectName] = [];
          }
          projectMap[projectName].push({
            date: email.receivedDateTime,
            subject: email.subject,
            from: email.from?.emailAddress?.address,
            preview: email.bodyPreview,
            hasAttachments: email.hasAttachments
          });
        }
      });
    });

    return projectMap;
  }

  /**
   * Save results to file
   */
  async saveResults(emails, documents, projectMap) {
    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Save raw email data
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'swan-emails-raw.json'),
      JSON.stringify(emails, null, 2)
    );

    // Save raw document data
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'swan-documents-raw.json'),
      JSON.stringify(documents, null, 2)
    );

    // Save organized project map
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'swan-projects-organized.json'),
      JSON.stringify(projectMap, null, 2)
    );

    // Create summary report
    const report = this.generateReport(emails, documents, projectMap);
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'swan-search-report.md'),
      report
    );

    console.log(`\n✅ Results saved to ${OUTPUT_DIR}/`);
  }

  /**
   * Generate markdown report
   */
  generateReport(emails, documents, projectMap) {
    let report = '# Swan Softweb Solutions - Communication & Document Search\n\n';
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `**Date Range:** ${DATE_RANGE.start} to ${DATE_RANGE.end}\n\n`;
    report += '---\n\n';

    // Email summary
    report += `## Email Search Results\n\n`;
    report += `**Total Emails Found:** ${emails.length}\n\n`;

    if (emails.length > 0) {
      report += '### Recent Emails:\n\n';
      emails.slice(0, 10).forEach(email => {
        report += `- **${email.receivedDateTime?.split('T')[0]}** - ${email.subject}\n`;
        report += `  - From: ${email.from?.emailAddress?.address || 'Unknown'}\n`;
        if (email.hasAttachments) {
          report += `  - 📎 Has attachments\n`;
        }
        report += `  - Preview: ${email.bodyPreview?.substring(0, 150)}...\n\n`;
      });
    }

    // Document summary
    report += `## SharePoint Document Search Results\n\n`;
    report += `**Total Documents Found:** ${documents.length}\n\n`;

    if (documents.length > 0) {
      report += '### Documents Found:\n\n';
      documents.slice(0, 10).forEach(doc => {
        const resource = doc.resource;
        report += `- **${resource?.name || 'Unknown'}**\n`;
        report += `  - Path: ${resource?.webUrl || 'N/A'}\n`;
        report += `  - Modified: ${resource?.lastModifiedDateTime || 'N/A'}\n\n`;
      });
    }

    // Project breakdown
    report += `## Projects Identified\n\n`;

    Object.entries(projectMap).forEach(([projectName, projectEmails]) => {
      report += `### ${projectName}\n\n`;
      report += `**Emails Found:** ${projectEmails.length}\n\n`;

      projectEmails.slice(0, 5).forEach(email => {
        report += `- **${email.date?.split('T')[0]}** - ${email.subject}\n`;
        if (email.hasAttachments) {
          report += `  - 📎 Attachments included\n`;
        }
      });
      report += '\n';
    });

    return report;
  }

  /**
   * Main execution
   */
  async run() {
    console.log('🔍 Swan Softweb Solutions - Communication Search\n');
    console.log('=' .repeat(60));

    try {
      await this.getAccessToken();

      const emails = await this.searchEmails();
      const documents = await this.searchSharePoint();
      const projectMap = this.extractProjectInfo(emails);

      await this.saveResults(emails, documents, projectMap);

      console.log('\n' + '='.repeat(60));
      console.log('✅ Search complete!\n');
      console.log('Summary:');
      console.log(`   - Emails found: ${emails.length}`);
      console.log(`   - Documents found: ${documents.length}`);
      console.log(`   - Projects identified: ${Object.keys(projectMap).length}`);
      console.log(`\nView detailed report: ${OUTPUT_DIR}/swan-search-report.md\n`);

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  }
}

// Run the search
const searcher = new SwanSearcher();
searcher.run();
