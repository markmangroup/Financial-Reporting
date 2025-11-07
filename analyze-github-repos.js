#!/usr/bin/env node

/**
 * Analyze GitHub Repositories
 * Extract README, package.json, and key metadata from all cloned repos
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPOS_DIR = './data/github-repos';

function getRepoInfo(repoPath) {
  const info = {
    name: path.basename(repoPath),
    path: repoPath,
    size: 0,
    files: 0,
    commits: 0,
    lastCommit: null,
    branches: [],
    language: null,
    hasReadme: false,
    hasPackageJson: false,
    hasSrc: false,
    hasBackend: false,
    readmeContent: null,
    packageJson: null,
    isEmpty: false
  };

  try {
    // Check if git repo
    const gitDir = path.join(repoPath, '.git');
    if (!fs.existsSync(gitDir)) {
      info.isEmpty = true;
      return info;
    }

    // Get commit count
    try {
      const commits = execSync('git rev-list --count HEAD', { cwd: repoPath, encoding: 'utf8' });
      info.commits = parseInt(commits.trim());
    } catch (e) {
      info.commits = 0;
      info.isEmpty = true;
    }

    if (info.commits === 0) {
      info.isEmpty = true;
      return info;
    }

    // Get last commit date
    try {
      const lastCommit = execSync('git log -1 --format=%ci', { cwd: repoPath, encoding: 'utf8' });
      info.lastCommit = lastCommit.trim();
    } catch (e) {}

    // Get branches
    try {
      const branches = execSync('git branch -a', { cwd: repoPath, encoding: 'utf8' });
      info.branches = branches.split('\n').filter(b => b.trim()).map(b => b.replace(/^\*?\s+/, '').replace(/^remotes\/origin\//, ''));
    } catch (e) {}

    // Count files (exclude .git)
    const countFiles = (dir) => {
      let count = 0;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        if (item === '.git' || item === 'node_modules') continue;
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
          count += countFiles(itemPath);
        } else {
          count++;
          info.size += stats.size;
        }
      }
      return count;
    };

    info.files = countFiles(repoPath);

    // Check for key files and directories
    info.hasReadme = fs.existsSync(path.join(repoPath, 'README.md'));
    info.hasPackageJson = fs.existsSync(path.join(repoPath, 'package.json'));
    info.hasSrc = fs.existsSync(path.join(repoPath, 'src'));
    info.hasBackend = fs.existsSync(path.join(repoPath, 'backend'));

    // Read README
    if (info.hasReadme) {
      try {
        info.readmeContent = fs.readFileSync(path.join(repoPath, 'README.md'), 'utf8').substring(0, 2000);
      } catch (e) {}
    }

    // Read package.json
    if (info.hasPackageJson) {
      try {
        info.packageJson = JSON.parse(fs.readFileSync(path.join(repoPath, 'package.json'), 'utf8'));
        info.language = 'JavaScript/TypeScript';
      } catch (e) {}
    }

    // Detect language from files
    if (!info.language) {
      const hasGo = fs.existsSync(path.join(repoPath, 'go.mod'));
      const hasPython = fs.existsSync(path.join(repoPath, 'requirements.txt')) || fs.existsSync(path.join(repoPath, 'setup.py'));
      const hasRuby = fs.existsSync(path.join(repoPath, 'Gemfile'));
      const hasTerraform = fs.readdirSync(repoPath).some(f => f.endsWith('.tf'));

      if (hasGo) info.language = 'Go';
      else if (hasPython) info.language = 'Python';
      else if (hasRuby) info.language = 'Ruby';
      else if (hasTerraform) info.language = 'Terraform/HCL';
      else info.language = 'Unknown';
    }

  } catch (error) {
    console.error(`Error analyzing ${repoPath}:`, error.message);
  }

  return info;
}

function main() {
  console.log('\n' + '='.repeat(80));
  console.log('GITHUB REPOSITORY ANALYSIS');
  console.log('Analyzing all cloned repositories');
  console.log('='.repeat(80) + '\n');

  const repos = [];
  const reposDirs = fs.readdirSync(REPOS_DIR);

  for (const dir of reposDirs) {
    if (dir.startsWith('.') || dir === 'inventory.json') continue;

    const repoPath = path.join(REPOS_DIR, dir);
    const stats = fs.statSync(repoPath);

    if (!stats.isDirectory()) continue;

    console.log(`\n📁 Analyzing: ${dir}`);
    const info = getRepoInfo(repoPath);

    if (info.isEmpty) {
      console.log(`   ⚠️  Empty repository (no commits)`);
    } else {
      console.log(`   📊 ${info.files} files, ${(info.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   🔄 ${info.commits} commits, last: ${info.lastCommit || 'unknown'}`);
      console.log(`   💻 Language: ${info.language}`);
      if (info.hasPackageJson) console.log(`   📦 ${info.packageJson.name || 'unnamed'} v${info.packageJson.version || '?'}`);
    }

    repos.push(info);
  }

  // Generate summary report
  const report = {
    generatedAt: new Date().toISOString(),
    totalRepos: repos.length,
    repositories: repos,
    summary: {
      totalFiles: repos.reduce((sum, r) => sum + r.files, 0),
      totalSize: repos.reduce((sum, r) => sum + r.size, 0),
      totalCommits: repos.reduce((sum, r) => sum + r.commits, 0),
      byLanguage: {},
      emptyRepos: repos.filter(r => r.isEmpty).length,
      activeRepos: repos.filter(r => !r.isEmpty).length
    }
  };

  // Count by language
  repos.forEach(r => {
    const lang = r.language || 'Unknown';
    report.summary.byLanguage[lang] = (report.summary.byLanguage[lang] || 0) + 1;
  });

  // Save report
  fs.writeFileSync('./data/github-repos/analysis-report.json', JSON.stringify(report, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log('ANALYSIS SUMMARY');
  console.log('='.repeat(80));
  console.log(`📊 Total repositories: ${report.totalRepos}`);
  console.log(`✅ Active repositories: ${report.summary.activeRepos}`);
  console.log(`⚠️  Empty repositories: ${report.summary.emptyRepos}`);
  console.log(`📁 Total files: ${report.summary.totalFiles.toLocaleString()}`);
  console.log(`💾 Total size: ${(report.summary.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🔄 Total commits: ${report.summary.totalCommits.toLocaleString()}`);
  console.log('\n📊 By Language:');
  Object.entries(report.summary.byLanguage).sort((a, b) => b[1] - a[1]).forEach(([lang, count]) => {
    console.log(`   ${lang}: ${count} repos`);
  });
  console.log(`\n📄 Report saved to: ./data/github-repos/analysis-report.json\n`);
}

main().catch(console.error);
