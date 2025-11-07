#!/usr/bin/env node

/**
 * Analyze All Project Codebases
 * Extracts meaningful data from all cloned GitHub repos and updates project metadata
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPOS_DIR = './data/github-repos';
const PROJECTS_DIR = './data/projects';

// Map repos to projects
const REPO_TO_PROJECT = {
  'braindead': 'braindead-portal',
  'metropolitan-partners-portal': 'metropolitan-current-state',
  'LaurelAG-app': 'laurel-ag-proposal-tools',
  'Rental-Platform': 'laurel-ag-proposal-tools',
  'Estimation-Platform': 'laurel-ag-proposal-tools',
  'mdl': 'mdl-pitch',
  'notice-board': 'notice-board',
  'mike-os': 'siguler-guff', // Already done
  'siguler-finance-hub': 'siguler-guff',
  'pe-command': 'markman-internal',
  'retail-command': 'markman-internal'
};

console.log('🔍 Analyzing All Project Codebases...\n');

// Get all cloned repos
const repos = fs.readdirSync(REPOS_DIR).filter(item => {
  const itemPath = path.join(REPOS_DIR, item);
  return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
});

console.log(`Found ${repos.length} repositories\n`);

const projectCodebases = {};

for (const repo of repos) {
  const repoPath = path.join(REPOS_DIR, repo);
  const projectId = REPO_TO_PROJECT[repo];

  if (!projectId) {
    console.log(`⏭️  Skipping ${repo} (not mapped to project)`);
    continue;
  }

  console.log(`📊 Analyzing ${repo} → ${projectId}...`);

  try {
    // Get basic repo stats
    const stats = {
      name: repo,
      path: repoPath.replace('./', ''),
      files: 0,
      size: 0,
      lastCommit: null,
      primaryLanguage: null,
      hasPackageJson: false,
      hasReadme: false
    };

    // Count files (excluding .git and node_modules)
    try {
      const fileCount = execSync(
        `find "${repoPath}" -type f ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/build/*" | wc -l`,
        { encoding: 'utf8' }
      );
      stats.files = parseInt(fileCount.trim());
    } catch (e) {
      stats.files = 0;
    }

    // Get size (in KB)
    try {
      const size = execSync(`du -sk "${repoPath}" | cut -f1`, { encoding: 'utf8' });
      stats.size = parseInt(size.trim());
    } catch (e) {
      stats.size = 0;
    }

    // Get last commit date
    try {
      const lastCommit = execSync(
        `cd "${repoPath}" && git log -1 --format=%ci 2>/dev/null || echo "unknown"`,
        { encoding: 'utf8' }
      );
      stats.lastCommit = lastCommit.trim();
    } catch (e) {
      stats.lastCommit = 'unknown';
    }

    // Check for package.json
    if (fs.existsSync(path.join(repoPath, 'package.json'))) {
      stats.hasPackageJson = true;
      const pkg = JSON.parse(fs.readFileSync(path.join(repoPath, 'package.json'), 'utf8'));
      stats.packageName = pkg.name;
      stats.description = pkg.description;

      // Determine primary language from dependencies
      if (pkg.dependencies) {
        if (pkg.dependencies.react || pkg.dependencies['next']) {
          stats.primaryLanguage = 'React/Next.js';
        } else if (pkg.dependencies.vue) {
          stats.primaryLanguage = 'Vue.js';
        } else {
          stats.primaryLanguage = 'JavaScript/Node.js';
        }
      }
    }

    // Check for README
    const readmeFiles = ['README.md', 'readme.md', 'README', 'readme.txt'];
    for (const readmeFile of readmeFiles) {
      if (fs.existsSync(path.join(repoPath, readmeFile))) {
        stats.hasReadme = true;
        stats.readme = fs.readFileSync(path.join(repoPath, readmeFile), 'utf8').substring(0, 500);
        break;
      }
    }

    // Get directory structure (top-level only)
    const topLevelDirs = fs.readdirSync(repoPath)
      .filter(item => {
        const itemPath = path.join(repoPath, item);
        return fs.statSync(itemPath).isDirectory() &&
               !item.startsWith('.') &&
               item !== 'node_modules';
      });
    stats.directories = topLevelDirs;

    // Initialize project codebase if not exists
    if (!projectCodebases[projectId]) {
      projectCodebases[projectId] = {
        repos: [],
        totalFiles: 0,
        totalSize: 0,
        technologies: new Set()
      };
    }

    // Add to project
    projectCodebases[projectId].repos.push(stats);
    projectCodebases[projectId].totalFiles += stats.files;
    projectCodebases[projectId].totalSize += stats.size;
    if (stats.primaryLanguage) {
      projectCodebases[projectId].technologies.add(stats.primaryLanguage);
    }

    console.log(`   ✅ ${stats.files} files, ${(stats.size / 1024).toFixed(1)} MB`);

  } catch (error) {
    console.error(`   ❌ Error analyzing ${repo}:`, error.message);
  }
}

console.log('\n📦 Updating Project Metadata...\n');

// Update each project's metadata
for (const [projectId, codebase] of Object.entries(projectCodebases)) {
  const metadataPath = path.join(PROJECTS_DIR, projectId, 'metadata.json');

  if (!fs.existsSync(metadataPath)) {
    console.log(`⚠️  ${projectId}: metadata.json not found, skipping`);
    continue;
  }

  try {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    // Convert Set to Array
    const technologies = Array.from(codebase.technologies);

    // Add codebase section
    metadata.codebase = {
      repos: codebase.repos.map(repo => ({
        name: repo.name,
        url: `https://github.com/markmangroup/${repo.name}.git`,
        path: repo.path,
        files: repo.files,
        size: repo.size,
        lastCommit: repo.lastCommit,
        primaryLanguage: repo.primaryLanguage,
        description: repo.description || null
      })),
      totalFiles: codebase.totalFiles,
      totalSizeKB: codebase.totalSize,
      technologies: technologies,
      analyzedAt: new Date().toISOString()
    };

    // Write back
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ ${projectId}: Updated with ${codebase.repos.length} repo(s), ${codebase.totalFiles} files`);

  } catch (error) {
    console.error(`❌ ${projectId}: Error updating metadata:`, error.message);
  }
}

console.log('\n✅ All projects analyzed!\n');
console.log('📊 Summary:');
console.log(`   Projects updated: ${Object.keys(projectCodebases).length}`);
console.log(`   Total repos analyzed: ${repos.length}`);
console.log(`   Total files: ${Object.values(projectCodebases).reduce((sum, p) => sum + p.totalFiles, 0)}`);
console.log(`   Total size: ${(Object.values(projectCodebases).reduce((sum, p) => sum + p.totalSize, 0) / 1024).toFixed(1)} MB`);
