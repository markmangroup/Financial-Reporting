#!/usr/bin/env node

/**
 * Extract Siguler Guff Code Structure from mike-os repo
 * Analyzes the siguler-guff directory and extracts meaningful metadata
 */

const fs = require('fs');
const path = require('path');

const MIKE_OS_PATH = './data/github-repos/mike-os';
const SIGULER_PATH = path.join(MIKE_OS_PATH, 'src/app/siguler-guff');

console.log('🔍 Extracting Siguler Guff Code Structure...\n');

// Check if path exists
if (!fs.existsSync(SIGULER_PATH)) {
  console.error('❌ Siguler Guff directory not found at:', SIGULER_PATH);
  process.exit(1);
}

// Get all subdirectories in siguler-guff
function getDirectoryStructure(dirPath) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  const structure = [];

  for (const item of items) {
    if (item.isDirectory()) {
      const fullPath = path.join(dirPath, item.name);
      const files = fs.readdirSync(fullPath, { withFileTypes: true })
        .filter(f => f.isFile() && (f.name.endsWith('.tsx') || f.name.endsWith('.ts') || f.name.endsWith('.jsx') || f.name.endsWith('.js')))
        .map(f => f.name);

      structure.push({
        name: item.name,
        path: fullPath.replace(MIKE_OS_PATH + '/', ''),
        files: files,
        fileCount: files.length
      });
    }
  }

  return structure.sort((a, b) => b.fileCount - a.fileCount); // Sort by file count descending
}

// Get main page file
const mainPage = path.join(SIGULER_PATH, 'page.tsx');
let mainPageContent = null;
if (fs.existsSync(mainPage)) {
  mainPageContent = fs.readFileSync(mainPage, 'utf8').substring(0, 500);
}

// Extract structure
const structure = getDirectoryStructure(SIGULER_PATH);

// Count total files
const totalFiles = structure.reduce((sum, dir) => sum + dir.fileCount, 0);

// Categorize components
const categories = {
  dataSystems: [],
  presentations: [],
  dashboards: [],
  tools: []
};

for (const dir of structure) {
  const name = dir.name.toLowerCase();
  if (name.includes('data') || name.includes('vault')) {
    categories.dataSystems.push(dir);
  } else if (name.includes('presentation') || name.includes('vision') || name.includes('demo')) {
    categories.presentations.push(dir);
  } else if (name.includes('dashboard') || name.includes('roster') || name.includes('news')) {
    categories.dashboards.push(dir);
  } else {
    categories.tools.push(dir);
  }
}

const codeAnalysis = {
  totalComponents: structure.length,
  totalFiles: totalFiles,
  categories: {
    dataSystems: {
      count: categories.dataSystems.length,
      components: categories.dataSystems.map(d => ({
        name: d.name,
        path: d.path,
        description: inferDescription(d.name)
      }))
    },
    presentations: {
      count: categories.presentations.length,
      components: categories.presentations.map(d => ({
        name: d.name,
        path: d.path,
        description: inferDescription(d.name)
      }))
    },
    dashboards: {
      count: categories.dashboards.length,
      components: categories.dashboards.map(d => ({
        name: d.name,
        path: d.path,
        description: inferDescription(d.name)
      }))
    },
    tools: {
      count: categories.tools.length,
      components: categories.tools.map(d => ({
        name: d.name,
        path: d.path,
        description: inferDescription(d.name)
      }))
    }
  },
  mainEntryPoint: mainPage.replace(MIKE_OS_PATH + '/', ''),
  extractedAt: new Date().toISOString()
};

function inferDescription(name) {
  const descriptions = {
    'data-vault': 'Centralized data repository for funds, employees, news, and company data',
    'presentation': 'Main presentation orchestrator with scenes and transitions',
    'presentation-v2': 'Updated presentation system (version 2)',
    'sbof-presentation': 'SBOF-specific presentation module',
    'team-roster': 'Team member profiles and organizational structure',
    'news': 'Company news and updates feed',
    'vision-demo': 'Vision presentation demo',
    'vision-viewer': 'Interactive vision presentation viewer',
    'vision-viewer-v2': 'Updated vision viewer (version 2)',
    'operator': 'Demo operation controls and coordinator',
    'drew': 'Drew-specific dashboard or profile',
    'ken': 'Ken-specific dashboard or profile',
    'ken-countdown': 'Countdown timer for Ken-related event'
  };

  return descriptions[name] || `${name.replace(/-/g, ' ')} component`;
}

console.log('✅ Code Analysis Complete\n');
console.log('📊 Summary:');
console.log(`   Total Components: ${codeAnalysis.totalComponents}`);
console.log(`   Total Files: ${codeAnalysis.totalFiles}`);
console.log(`   Data Systems: ${categories.dataSystems.length}`);
console.log(`   Presentations: ${categories.presentations.length}`);
console.log(`   Dashboards: ${categories.dashboards.length}`);
console.log(`   Tools: ${categories.tools.length}`);

// Save to file
const outputPath = './data/projects/siguler-guff/code-analysis.json';
fs.writeFileSync(outputPath, JSON.stringify(codeAnalysis, null, 2));
console.log(`\n💾 Saved to: ${outputPath}`);

// Also output the formatted structure for readme
console.log('\n📁 Component Structure:');
for (const dir of structure) {
  console.log(`   • ${dir.name} (${dir.fileCount} files)`);
}

console.log('\n✅ Done!');
