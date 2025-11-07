#!/usr/bin/env node

/**
 * Map consultants to projects based on SharePoint file activity
 */

const fs = require('fs');

// Load the inventory
const inventory = JSON.parse(fs.readFileSync('./data/sharepoint-inventory-2025-11-07.json', 'utf8'));

// Consultant names to track
const consultantNames = [
  'Niki', 'Nikoleta',
  'Carmen',
  'Ivana',
  'Abri',
  'Petrana',
  'Beata',
  'Jan',
  'Marianna',
  'Nikola',
  'Pepi'
];

// Project paths
const projects = {
  'Laurel AG - Proposal and Rental Tools': '/General/Offerings & Projects/1. Tailored Application Development/Laurel_AG - Proposal and Rental Tools',
  'Laurel AG - BID Calculator': '/General/Offerings & Projects/1. Tailored Application Development/Laurel AG - BID Calculator',
  'Metropolitan - Current State Assessment': '/General/Offerings & Projects/2. Process Discovery & Strategy/Metropolitan - Current State Assessment',
  'Metropolitan - Co-investor Dashboard': '/General/Offerings & Projects/3. Data Engineering & Infrastructure/Metropolitan - Co-investor Dashboard demo',
  'Metropolitan - Deal Cloud Quick Wins': '/General/Offerings & Projects/3. Data Engineering & Infrastructure/Metropolitan - Deal Cloud Quick Wins',
  'Dittmar - AP Automation': '/General/Offerings & Projects/5. Process Automation/Dittmar - AP Automation',
  'BrainDead - Data & Reporting': '/General/Offerings & Projects/3. Data Engineering & Infrastructure/BrainDead - Data & Reporting Solution',
  'Markman Group - Reporting Package': '/General/Offerings & Projects/4. Reporting & Analytics/Markman Group - Reporting Package',
  'Markman Group - Strategic & Operational Review': '/General/Offerings & Projects/4. Reporting & Analytics/Markman Group - Strategic & Operational Review'
};

// Map consultant activity to projects
const consultantProjects = {};

consultantNames.forEach(name => {
  consultantProjects[name] = {};
  Object.keys(projects).forEach(project => {
    consultantProjects[name][project] = 0;
  });
});

// Count file modifications per consultant per project
inventory.forEach(item => {
  if (item.type !== 'file') return;

  const modifiedBy = item.modifiedBy;

  // Check if this is one of our consultants
  const consultant = consultantNames.find(name =>
    modifiedBy && modifiedBy.toLowerCase().includes(name.toLowerCase())
  );

  if (!consultant) return;

  // Check which project this file belongs to
  Object.entries(projects).forEach(([projectName, projectPath]) => {
    if (item.path.startsWith(projectPath)) {
      consultantProjects[consultant][projectName]++;
    }
  });
});

// Generate report
console.log('\n' + '='.repeat(80));
console.log('CONSULTANT TO PROJECT MAPPING');
console.log('Based on SharePoint file modification activity');
console.log('='.repeat(80) + '\n');

consultantNames.forEach(consultant => {
  const activity = consultantProjects[consultant];
  const totalFiles = Object.values(activity).reduce((sum, count) => sum + count, 0);

  if (totalFiles === 0) {
    console.log(`${consultant}: No SharePoint activity found`);
    return;
  }

  console.log(`\n${consultant.toUpperCase()}: ${totalFiles} files modified`);
  console.log('-'.repeat(60));

  Object.entries(activity)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .forEach(([project, count]) => {
      const percentage = ((count / totalFiles) * 100).toFixed(1);
      console.log(`  ${project}: ${count} files (${percentage}%)`);
    });
});

// Project summary
console.log('\n\n' + '='.repeat(80));
console.log('PROJECT SUMMARY');
console.log('='.repeat(80) + '\n');

Object.keys(projects).forEach(projectName => {
  console.log(`\n${projectName}:`);
  console.log('-'.repeat(60));

  const contributors = [];
  consultantNames.forEach(consultant => {
    const fileCount = consultantProjects[consultant][projectName];
    if (fileCount > 0) {
      contributors.push({ consultant, fileCount });
    }
  });

  if (contributors.length === 0) {
    console.log('  No consultant activity found');
    return;
  }

  contributors
    .sort((a, b) => b.fileCount - a.fileCount)
    .forEach(({ consultant, fileCount }) => {
      console.log(`  ${consultant}: ${fileCount} files`);
    });
});

// Save detailed JSON
const outputPath = './data/consultant-project-mapping.json';
fs.writeFileSync(outputPath, JSON.stringify({
  consultantProjects,
  summary: Object.keys(projects).map(projectName => ({
    project: projectName,
    contributors: consultantNames
      .map(consultant => ({
        consultant,
        fileCount: consultantProjects[consultant][projectName]
      }))
      .filter(c => c.fileCount > 0)
      .sort((a, b) => b.fileCount - a.fileCount)
  }))
}, null, 2));

console.log(`\n\n✅ Detailed mapping saved to: ${outputPath}\n`);
