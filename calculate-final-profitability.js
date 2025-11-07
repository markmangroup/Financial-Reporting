#!/usr/bin/env node

/**
 * Calculate Final Project Profitability
 * Merges Pepi → Petrana and allocates all consultants to projects
 */

const fs = require('fs');

// Load consultant-project mapping
const mapping = JSON.parse(fs.readFileSync('./data/consultant-project-mapping.json', 'utf8'));

// Consultant costs (from previous analysis)
const consultantCosts = {
  'Swan': { total: 47230, allocation: { 'Laurel AG': 100 } },
  'Nikoleta': { total: 15000, sharepoint: { 'Laurel AG': 79.8, 'Metropolitan': 20.1 } },
  'Carmen': { total: 14342, sharepoint: { 'Metropolitan': 56.3, 'Laurel AG': 34.1, 'Other': 8.8 } },
  'Ivana': { total: 11104, allocation: null }, // Need to determine
  'Abri': { total: 10638, sharepoint: { 'Metropolitan': 100 } },
  'Petrana': { total: 12450, sharepoint: { 'Metropolitan': 88.9, 'Markman Internal': 6.7, 'Laurel AG': 4.4 } }, // Merged Pepi ($2,460) + Petrana ($9,990)
  'Beata': { total: 7640, sharepoint: { 'Metropolitan': 100 } },
  'Jan': { total: 6630, sharepoint: { 'Metropolitan': 100 } },
  'Marianna': { total: 5360, sharepoint: { 'Laurel AG': 100 } },
  'Nikola': { total: 3870, allocation: null }, // Need to determine
};

// Revenue (verified from Chase data)
const revenue = {
  'Laurel AG': 134000,
  'Metropolitan': 47320
};

console.log('\n' + '='.repeat(80));
console.log('FINAL PROJECT PROFITABILITY CALCULATION');
console.log('='.repeat(80) + '\n');

// Calculate allocations
const projectCosts = {
  'Laurel AG': 0,
  'Metropolitan': 0,
  'Overhead': 0
};

const consultantAllocations = {};

Object.entries(consultantCosts).forEach(([consultant, data]) => {
  consultantAllocations[consultant] = { 'Laurel AG': 0, 'Metropolitan': 0, 'Overhead': 0 };

  if (data.allocation) {
    // Manual allocation
    Object.entries(data.allocation).forEach(([project, percent]) => {
      const amount = (data.total * percent) / 100;
      projectCosts[project] += amount;
      consultantAllocations[consultant][project] = amount;
    });
  } else if (data.sharepoint) {
    // SharePoint-based allocation
    Object.entries(data.sharepoint).forEach(([project, percent]) => {
      const amount = (data.total * percent) / 100;

      if (project === 'Laurel AG' || project === 'Metropolitan') {
        projectCosts[project] += amount;
        consultantAllocations[consultant][project] = amount;
      } else {
        // Dittmar, Markman Internal, etc. → Overhead
        projectCosts['Overhead'] += amount;
        consultantAllocations[consultant]['Overhead'] = amount;
      }
    });
  } else {
    // No allocation data - need manual decision
    // For now, mark as overhead
    projectCosts['Overhead'] += data.total;
    consultantAllocations[consultant]['Overhead'] = data.total;
  }
});

// Print consultant allocations
console.log('CONSULTANT COST ALLOCATIONS:\n');
console.log('Consultant'.padEnd(20) + 'Total'.padStart(12) + 'Laurel AG'.padStart(12) + 'Metropolitan'.padStart(14) + 'Overhead'.padStart(12));
console.log('-'.repeat(70));

Object.entries(consultantAllocations).forEach(([consultant, alloc]) => {
  const total = consultantCosts[consultant].total;
  console.log(
    consultant.padEnd(20) +
    `$${total.toLocaleString()}`.padStart(12) +
    `$${Math.round(alloc['Laurel AG']).toLocaleString()}`.padStart(12) +
    `$${Math.round(alloc['Metropolitan']).toLocaleString()}`.padStart(14) +
    `$${Math.round(alloc['Overhead']).toLocaleString()}`.padStart(12)
  );
});

console.log('-'.repeat(70));
const totalCosts = Object.values(consultantCosts).reduce((sum, c) => sum + c.total, 0);
console.log(
  'TOTAL'.padEnd(20) +
  `$${totalCosts.toLocaleString()}`.padStart(12) +
  `$${Math.round(projectCosts['Laurel AG']).toLocaleString()}`.padStart(12) +
  `$${Math.round(projectCosts['Metropolitan']).toLocaleString()}`.padStart(14) +
  `$${Math.round(projectCosts['Overhead']).toLocaleString()}`.padStart(12)
);

// Calculate profitability
console.log('\n\n' + '='.repeat(80));
console.log('PROJECT PROFITABILITY SUMMARY');
console.log('='.repeat(80) + '\n');

['Laurel AG', 'Metropolitan'].forEach(project => {
  const rev = revenue[project];
  const cost = projectCosts[project];
  const profit = rev - cost;
  const margin = (profit / rev) * 100;

  console.log(`${project.toUpperCase()}:`);
  console.log(`  Revenue:        $${rev.toLocaleString()}`);
  console.log(`  Consultant Costs: $${Math.round(cost).toLocaleString()}`);
  console.log(`  Gross Profit:   $${Math.round(profit).toLocaleString()}`);
  console.log(`  Gross Margin:   ${margin.toFixed(1)}%`);
  console.log('');
});

// Combined
const totalRevenue = revenue['Laurel AG'] + revenue['Metropolitan'];
const totalProjectCosts = projectCosts['Laurel AG'] + projectCosts['Metropolitan'];
const totalProfit = totalRevenue - totalProjectCosts;
const totalMargin = (totalProfit / totalRevenue) * 100;

console.log('COMBINED:');
console.log(`  Total Revenue:  $${totalRevenue.toLocaleString()}`);
console.log(`  Total Costs:    $${Math.round(totalProjectCosts).toLocaleString()}`);
console.log(`  Total Profit:   $${Math.round(totalProfit).toLocaleString()}`);
console.log(`  Overall Margin: ${totalMargin.toFixed(1)}%`);
console.log('');
console.log(`  Overhead (Non-Revenue): $${Math.round(projectCosts['Overhead']).toLocaleString()}`);

// Save detailed results
const results = {
  generatedAt: new Date().toISOString(),
  revenue,
  consultants: Object.entries(consultantCosts).map(([name, data]) => ({
    name,
    totalCost: data.total,
    allocations: consultantAllocations[name],
    allocationSource: data.allocation ? 'manual' : data.sharepoint ? 'sharepoint-activity' : 'pending'
  })),
  projectCosts,
  profitability: {
    'Laurel AG': {
      revenue: revenue['Laurel AG'],
      costs: projectCosts['Laurel AG'],
      profit: revenue['Laurel AG'] - projectCosts['Laurel AG'],
      margin: ((revenue['Laurel AG'] - projectCosts['Laurel AG']) / revenue['Laurel AG']) * 100
    },
    'Metropolitan': {
      revenue: revenue['Metropolitan'],
      costs: projectCosts['Metropolitan'],
      profit: revenue['Metropolitan'] - projectCosts['Metropolitan'],
      margin: ((revenue['Metropolitan'] - projectCosts['Metropolitan']) / revenue['Metropolitan']) * 100
    },
    'Combined': {
      revenue: totalRevenue,
      costs: totalProjectCosts,
      profit: totalProfit,
      margin: totalMargin
    }
  },
  notes: [
    'Petrana cost includes merged Pepi ($2,460) + Petrana ($9,990) = $12,450',
    'Swan allocated 100% to Laurel AG per user direction',
    'Upwork ($40K) excluded - internal R&D projects',
    'Ivana and Nikola have no SharePoint activity - allocated to overhead pending clarification',
    'Carmen, Petrana overhead includes Dittmar and Markman internal work (non-revenue projects)'
  ]
};

fs.writeFileSync('./data/project-profitability-final.json', JSON.stringify(results, null, 2));
console.log('\n✅ Detailed results saved to: ./data/project-profitability-final.json\n');

// Identify items needing clarification
console.log('⚠️  PENDING ALLOCATIONS (Need User Input):\n');
console.log('  • Ivana ($11,104): No SharePoint activity found');
console.log('  • Nikola ($3,870): No SharePoint activity found');
console.log('\nThese are currently counted as overhead. Please provide project allocations if known.\n');
