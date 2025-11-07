#!/usr/bin/env node

/**
 * Audit GitHub Repositories
 * Finds all related project repos (BrainDead, Metropolitan, Laurel AG, etc.)
 * Creates inventory for consolidation
 */

const https = require('https');
const fs = require('fs');

// Known repos to search for
const knownRepos = [
  'braindead-portal',
  'braindead',
  'metropolitan',
  'laurel',
  'markman',
  'financial-reporting'
];

// GitHub organization/user to search
const GITHUB_USER = 'markmanassociates'; // Update with actual GitHub username/org

console.log('\n' + '='.repeat(80));
console.log('GITHUB REPOSITORY AUDIT');
console.log('Searching for project-related repositories');
console.log('='.repeat(80) + '\n');

// Check if we have a GitHub token
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.log('⚠️  No GITHUB_TOKEN found in environment');
  console.log('\nTo search GitHub automatically, set your token:');
  console.log('  export GITHUB_TOKEN="your-github-personal-access-token"\n');
  console.log('Or manually provide repo URLs below:\n');
}

// Manual inventory (to be filled in by user or automated search)
const repoInventory = {
  knownRepos: [
    {
      name: 'braindead-portal',
      url: 'https://github.com/[user]/braindead-portal', // Update with actual URL
      localPath: null,
      projectId: 'braindead-data-reporting',
      description: 'BrainDead data and reporting solution codebase',
      status: 'active', // active, archived, or merged
      lastCommit: null,
      language: 'TypeScript/React',
      notes: 'Seen earlier in session, needs to be cloned and reviewed'
    },
    {
      name: 'metropolitan-[something]',
      url: null,
      localPath: null,
      projectId: 'metropolitan-current-state',
      description: 'Metropolitan Partners related codebase',
      status: 'unknown',
      lastCommit: null,
      language: null,
      notes: 'User mentioned this exists but needs to be found'
    },
    {
      name: 'laurel-ag-[something]',
      url: null,
      localPath: null,
      projectId: 'laurel-ag-proposal-tools',
      description: 'Laurel AG application codebase',
      status: 'unknown',
      lastCommit: null,
      language: null,
      notes: 'User mentioned this exists but needs to be found'
    }
  ],
  searchResults: [],
  consolidationPlan: {
    toMerge: [],
    toArchive: [],
    toLink: []
  }
};

console.log('📋 KNOWN REPOSITORIES TO FIND:\n');
repoInventory.knownRepos.forEach((repo, i) => {
  console.log(`${i + 1}. ${repo.name}`);
  console.log(`   Project: ${repo.projectId}`);
  console.log(`   Status: ${repo.status}`);
  console.log(`   ${repo.notes}\n`);
});

console.log('='.repeat(80));
console.log('\n🔍 NEXT STEPS:\n');
console.log('1. **Manual Search**:');
console.log('   - Search your GitHub account for "braindead", "metropolitan", "laurel"');
console.log('   - Check your local ~/Projects or ~/Code directory');
console.log('   - Look in recent git clones\n');

console.log('2. **Add Repos to Inventory**:');
console.log('   - Edit audit-github-repos.js with actual repo URLs');
console.log('   - Re-run this script to validate\n');

console.log('3. **Clone for Analysis**:');
console.log('   - Clone each repo to: ./data/github-repos/[repo-name]');
console.log('   - Extract README, docs, and key code artifacts');
console.log('   - Link to project metadata\n');

console.log('4. **Consolidation Decision**:');
console.log('   - Archive if no longer active');
console.log('   - Merge code/docs into this financial reporting codebase');
console.log('   - Or keep separate and add reference links\n');

// Check local directories for clues
console.log('='.repeat(80));
console.log('\n🔎 CHECKING LOCAL SYSTEM:\n');

const homeDir = process.env.HOME || process.env.USERPROFILE;
const commonPaths = [
  `${homeDir}/Projects`,
  `${homeDir}/Code`,
  `${homeDir}/Documents/GitHub`,
  `${homeDir}/Desktop`,
  '/tmp'
];

console.log('Looking for git repositories in common directories...\n');

commonPaths.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      const items = fs.readdirSync(dir);
      const gitRepos = items.filter(item => {
        const itemPath = `${dir}/${item}`;
        return fs.existsSync(`${itemPath}/.git`);
      });

      if (gitRepos.length > 0) {
        console.log(`📁 ${dir}:`);
        gitRepos.forEach(repo => {
          const repoPath = `${dir}/${repo}`;
          // Try to get remote URL
          try {
            const {execSync} = require('child_process');
            const remoteUrl = execSync('git remote get-url origin', {
              cwd: repoPath,
              encoding: 'utf8'
            }).trim();

            const repoName = repo.toLowerCase();
            const isRelevant = knownRepos.some(known => repoName.includes(known));

            if (isRelevant) {
              console.log(`   ✅ ${repo} (RELEVANT)`);
              console.log(`      URL: ${remoteUrl}`);
              console.log(`      Path: ${repoPath}`);
            } else {
              console.log(`   • ${repo}`);
            }
          } catch (e) {
            console.log(`   • ${repo}`);
          }
        });
        console.log('');
      }
    } catch (e) {
      // Skip if can't read directory
    }
  }
});

// Save inventory
const inventoryPath = './data/github-repos/inventory.json';
fs.mkdirSync('./data/github-repos', { recursive: true });
fs.writeFileSync(inventoryPath, JSON.stringify(repoInventory, null, 2));

console.log('='.repeat(80));
console.log(`\n✅ Inventory template saved to: ${inventoryPath}`);
console.log('\n📝 ACTION REQUIRED:');
console.log('   1. Review the inventory file');
console.log('   2. Add actual repo URLs');
console.log('   3. Run: node clone-and-consolidate-repos.js (to be created)\n');
