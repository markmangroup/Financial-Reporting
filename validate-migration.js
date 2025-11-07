#!/usr/bin/env node

/**
 * Validate Migration Completeness
 * Comprehensive validation of SharePoint → Codebase migration
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${COLORS.reset} ${message}`);
}

const validationResults = {
  passed: [],
  warnings: [],
  failed: [],
  info: []
};

// === VALIDATION CHECKS ===

function validateProjectMetadata() {
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATING PROJECT METADATA');
  console.log('='.repeat(80));

  const projectDirs = [
    'laurel-ag-proposal-tools',
    'metropolitan-current-state',
    'dittmar-ap-automation',
    'braindead-portal',
    'markman-internal'
  ];

  let allValid = true;

  for (const projectId of projectDirs) {
    const metadataPath = `./data/projects/${projectId}/metadata.json`;

    if (!fs.existsSync(metadataPath)) {
      log(COLORS.red, '❌', `Missing metadata: ${projectId}`);
      validationResults.failed.push(`Missing metadata for ${projectId}`);
      allValid = false;
      continue;
    }

    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

      // Check required fields
      const requiredFields = ['id', 'name', 'client', 'type', 'status', 'financial', 'team', 'documents'];
      const missingFields = requiredFields.filter(field => !metadata[field]);

      if (missingFields.length > 0) {
        log(COLORS.yellow, '⚠️ ', `${projectId}: Missing fields - ${missingFields.join(', ')}`);
        validationResults.warnings.push(`${projectId} missing fields: ${missingFields.join(', ')}`);
      } else {
        log(COLORS.green, '✅', `${projectId}: All required fields present`);
        validationResults.passed.push(`${projectId} metadata valid`);
      }

      // Validate financial data
      if (metadata.financial) {
        const hasRevenue = typeof metadata.financial.revenue === 'number';
        const hasCosts = metadata.financial.costs && typeof metadata.financial.costs.totalConsultantCosts === 'number';
        const hasProfit = metadata.financial.profitability && typeof metadata.financial.profitability.grossProfit === 'number';

        if (hasRevenue && hasCosts && hasProfit) {
          log(COLORS.green, '   ✅', 'Financial data complete');
        } else {
          log(COLORS.yellow, '   ⚠️ ', 'Financial data incomplete');
          validationResults.warnings.push(`${projectId} financial data incomplete`);
        }
      }

    } catch (error) {
      log(COLORS.red, '❌', `${projectId}: Invalid JSON - ${error.message}`);
      validationResults.failed.push(`${projectId} invalid JSON`);
      allValid = false;
    }
  }

  return allValid;
}

function validateDocuments() {
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATING DOCUMENTS');
  console.log('='.repeat(80));

  const projectDirs = fs.readdirSync('./data/projects').filter(d =>
    !d.startsWith('.') && !d.endsWith('.json') && fs.statSync(`./data/projects/${d}`).isDirectory()
  );

  let totalDocuments = 0;
  let existingDocuments = 0;
  let missingDocuments = 0;
  let extractedDocuments = 0;

  for (const projectId of projectDirs) {
    const metadataPath = `./data/projects/${projectId}/metadata.json`;

    if (!fs.existsSync(metadataPath)) continue;

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const categories = ['contracts', 'proposals', 'deliverables', 'documentation'];

    for (const category of categories) {
      const documents = metadata.documents[category] || [];
      totalDocuments += documents.length;

      for (const doc of documents) {
        if (fs.existsSync(doc.localPath)) {
          existingDocuments++;

          // Check if text was extracted
          if (doc.extractedText) {
            extractedDocuments++;
          }
        } else {
          missingDocuments++;
          log(COLORS.red, '❌', `Missing: ${doc.filename}`);
          validationResults.failed.push(`Missing document: ${doc.filename}`);
        }
      }
    }
  }

  log(COLORS.blue, '📊', `Total documents: ${totalDocuments}`);
  log(COLORS.green, '✅', `Existing documents: ${existingDocuments}`);
  log(COLORS.green, '📝', `Text extracted: ${extractedDocuments}`);

  if (missingDocuments > 0) {
    log(COLORS.red, '❌', `Missing documents: ${missingDocuments}`);
    validationResults.failed.push(`${missingDocuments} documents missing`);
  }

  const extractionRate = totalDocuments > 0 ? (extractedDocuments / totalDocuments * 100).toFixed(1) : 0;
  log(COLORS.blue, '📈', `Text extraction rate: ${extractionRate}%`);

  validationResults.info.push(`${totalDocuments} total documents`);
  validationResults.info.push(`${existingDocuments} documents exist`);
  validationResults.info.push(`${extractionRate}% text extraction rate`);

  return missingDocuments === 0;
}

function validateFinancialData() {
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATING FINANCIAL DATA');
  console.log('='.repeat(80));

  const profitabilityPath = './data/project-profitability-final.json';

  if (!fs.existsSync(profitabilityPath)) {
    log(COLORS.red, '❌', 'Missing project-profitability-final.json');
    validationResults.failed.push('Missing profitability data');
    return false;
  }

  const profitability = JSON.parse(fs.readFileSync(profitabilityPath, 'utf8'));

  // Check revenue totals
  const totalRevenue = Object.values(profitability.revenue || {}).reduce((sum, val) => sum + val, 0);
  log(COLORS.green, '✅', `Total revenue: $${(totalRevenue / 1000).toFixed(0)}K`);

  // Check cost allocation
  const totalCosts = Object.values(profitability.projectCosts || {}).reduce((sum, val) => sum + val, 0);
  log(COLORS.green, '✅', `Total costs: $${(totalCosts / 1000).toFixed(0)}K`);

  // Check consultant allocation
  const consultants = profitability.consultants || [];
  const unallocatedConsultants = consultants.filter(c =>
    c.allocationSource === 'pending'
  );

  if (unallocatedConsultants.length > 0) {
    log(COLORS.yellow, '⚠️ ', `Unallocated consultants: ${unallocatedConsultants.map(c => c.name).join(', ')}`);
    validationResults.warnings.push(`${unallocatedConsultants.length} unallocated consultants`);
  } else {
    log(COLORS.green, '✅', 'All consultants allocated');
    validationResults.passed.push('100% consultant allocation');
  }

  validationResults.info.push(`Total revenue: $${(totalRevenue / 1000).toFixed(0)}K`);
  validationResults.info.push(`Total costs: $${(totalCosts / 1000).toFixed(0)}K`);

  return true;
}

function validateGitHubRepos() {
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATING GITHUB REPOSITORIES');
  console.log('='.repeat(80));

  const inventoryPath = './data/github-repos/inventory.json';

  if (!fs.existsSync(inventoryPath)) {
    log(COLORS.red, '❌', 'Missing GitHub inventory');
    validationResults.failed.push('Missing GitHub inventory');
    return false;
  }

  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  const totalRepos = inventory.totalRepos || 0;

  log(COLORS.blue, '📊', `Total repos discovered: ${totalRepos}`);

  // Count cloned repos
  const reposDir = './data/github-repos';
  const clonedRepos = fs.readdirSync(reposDir).filter(item => {
    const itemPath = path.join(reposDir, item);
    return fs.statSync(itemPath).isDirectory() &&
           !item.startsWith('.') &&
           fs.existsSync(path.join(itemPath, '.git'));
  });

  log(COLORS.green, '✅', `Cloned repos: ${clonedRepos.length}`);

  // Check analysis report
  const analysisPath = './data/github-repos/analysis-report.json';
  if (fs.existsSync(analysisPath)) {
    const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
    log(COLORS.green, '✅', 'Analysis report exists');
    log(COLORS.blue, '   📊', `Total files: ${analysis.summary.totalFiles.toLocaleString()}`);
    log(COLORS.blue, '   💾', `Total size: ${(analysis.summary.totalSize / 1024 / 1024).toFixed(0)} MB`);
    log(COLORS.blue, '   🔄', `Total commits: ${analysis.summary.totalCommits.toLocaleString()}`);

    validationResults.passed.push('GitHub analysis complete');
    validationResults.info.push(`${clonedRepos.length} repos cloned`);
    validationResults.info.push(`${analysis.summary.totalFiles} files`);
  } else {
    log(COLORS.yellow, '⚠️ ', 'Analysis report missing');
    validationResults.warnings.push('GitHub analysis report missing');
  }

  return true;
}

function validateSharePointInventory() {
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATING SHAREPOINT INVENTORY');
  console.log('='.repeat(80));

  const inventoryPath = './data/sharepoint-inventory-2025-11-07.json';

  if (!fs.existsSync(inventoryPath)) {
    log(COLORS.red, '❌', 'Missing SharePoint inventory');
    validationResults.failed.push('Missing SharePoint inventory');
    return false;
  }

  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  const totalItems = inventory.length || 0;

  log(COLORS.green, '✅', `SharePoint inventory: ${totalItems.toLocaleString()} items`);
  validationResults.passed.push('SharePoint inventory complete');
  validationResults.info.push(`${totalItems} SharePoint items cataloged`);

  return true;
}

// === MAIN ===

function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(80));

  const totalChecks = validationResults.passed.length + validationResults.warnings.length + validationResults.failed.length;
  const passRate = totalChecks > 0 ? (validationResults.passed.length / totalChecks * 100).toFixed(1) : 0;

  log(COLORS.green, '✅', `Passed: ${validationResults.passed.length}`);
  log(COLORS.yellow, '⚠️ ', `Warnings: ${validationResults.warnings.length}`);
  log(COLORS.red, '❌', `Failed: ${validationResults.failed.length}`);
  log(COLORS.blue, '📊', `Pass rate: ${passRate}%`);

  console.log('\n' + '='.repeat(80));
  console.log('KEY METRICS');
  console.log('='.repeat(80));
  validationResults.info.forEach(info => {
    log(COLORS.blue, '📈', info);
  });

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalChecks,
      passed: validationResults.passed.length,
      warnings: validationResults.warnings.length,
      failed: validationResults.failed.length,
      passRate: parseFloat(passRate)
    },
    passed: validationResults.passed,
    warnings: validationResults.warnings,
    failed: validationResults.failed,
    info: validationResults.info
  };

  fs.writeFileSync('./data/validation-report.json', JSON.stringify(report, null, 2));

  console.log('\n' + '='.repeat(80));
  const status = validationResults.failed.length === 0 ? 'PASSED ✅' : 'FAILED ❌';
  console.log(`MIGRATION VALIDATION: ${status}`);
  console.log('='.repeat(80));
  console.log('📄 Report saved to: ./data/validation-report.json\n');

  return validationResults.failed.length === 0;
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('SHAREPOINT → CODEBASE MIGRATION VALIDATION');
  console.log('Comprehensive validation of all migrated data');
  console.log('='.repeat(80));

  validateProjectMetadata();
  validateDocuments();
  validateFinancialData();
  validateGitHubRepos();
  validateSharePointInventory();

  const allPassed = generateReport();

  process.exit(allPassed ? 0 : 1);
}

main();
