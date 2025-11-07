#!/usr/bin/env node

/**
 * Project Profitability Analysis
 * Match client revenue to consultant costs to calculate project profitability
 */

const fs = require('fs');
const path = require('path');

// Read Chase checking data
const checkingFile = './data/Chase5939_Activity_20250929.CSV';
const checkingData = fs.readFileSync(checkingFile, 'utf-8');

// Extract all client revenue payments
const revenuePayments = [];
const lines = checkingData.split('\n');

lines.forEach(line => {
  const parts = line.split(',');
  if (parts.length < 5) return;

  const type = parts[0];
  const date = parts[1]?.replace(/"/g, '');
  const description = parts[2]?.replace(/"/g, '');
  const amount = parseFloat(parts[3]?.replace(/"/g, '')) || 0;

  if (type === 'CREDIT' && amount > 1 && (description.includes('LAUREL') || description.includes('METROPOLITAN') || description.includes('Metropolitan'))) {
    // Extract invoice number
    const invoiceMatch = description.match(/(0\d{3}|INVOICE \d+)/);
    const invoice = invoiceMatch ? invoiceMatch[0] : null;

    // Determine client
    const client = description.includes('LAUREL') ? 'Laurel AG' : 'Metropolitan Partners';

    // Extract project description
    let project = 'Unknown Project';
    if (description.includes('DESIGN AND')) project = 'Design & Development';
    if (description.includes('INITIAL DE')) project = 'Initial Design';
    if (description.includes('POST DEVEL')) project = 'Post-Development';
    if (description.includes('FINAL PAYM')) project = 'Final Payment';

    revenuePayments.push({
      date,
      client,
      amount,
      invoice,
      project,
      description
    });
  }
});

// Extract all consultant costs
const consultantCosts = [];

lines.forEach(line => {
  const parts = line.split(',');
  if (parts.length < 5) return;

  const type = parts[0];
  const date = parts[1]?.replace(/"/g, '');
  const description = parts[2]?.replace(/"/g, '');
  let amount = parseFloat(parts[3]?.replace(/"/g, '')) || 0;

  if (type === 'DEBIT' && amount < 0) {
    amount = Math.abs(amount);

    // Check if it's a consultant payment
    const consultantNames = ['SWAN', 'PEPI', 'IVANA', 'NIKI', 'JAN', 'CARMEN', 'ABRI', 'PETRANA', 'NIKOLA', 'BEATA', 'MARIANNA'];
    const isConsultant = consultantNames.some(name => description.toUpperCase().includes(name));

    if (isConsultant || description.includes('WIRE TRANSFER') && description.includes('SOFTWEB')) {
      let consultant = 'Unknown';
      if (description.includes('SWAN')) consultant = 'Swan';
      if (description.includes('PEPI')) consultant = 'Pepi';
      if (description.includes('IVANA') || description.includes('Kmecová')) consultant = 'Ivana';
      if (description.includes('NIKI') || description.includes('Nikoleta')) consultant = 'Niki';
      if (description.includes('JAN') || description.includes('Dzubak')) consultant = 'Jan';
      if (description.includes('CARMEN') || description.includes('Teiz')) consultant = 'Carmen';
      if (description.includes('ABRI')) consultant = 'Abri';
      if (description.includes('PETRANA') || description.includes('Trusted')) consultant = 'Petrana';
      if (description.includes('NIKOLA') || description.includes('Draganov')) consultant = 'Nikola';
      if (description.includes('BEATA')) consultant = 'Beata';
      if (description.includes('MARIANNA')) consultant = 'Marianna';

      consultantCosts.push({
        date,
        consultant,
        amount,
        description
      });
    }
  }
});

// Calculate totals
const totalRevenue = revenuePayments.reduce((sum, p) => sum + p.amount, 0);
const totalCosts = consultantCosts.reduce((sum, p) => sum + p.amount, 0);

// Group by client
const revenueByClient = {};
revenuePayments.forEach(p => {
  if (!revenueByClient[p.client]) revenueByClient[p.client] = 0;
  revenueByClient[p.client] += p.amount;
});

// Group costs by consultant
const costsByConsultant = {};
consultantCosts.forEach(p => {
  if (!costsByConsultant[p.consultant]) costsByConsultant[p.consultant] = 0;
  costsByConsultant[p.consultant] += p.amount;
});

// Create summary report
const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalRevenue,
    totalConsultantCosts: totalCosts,
    grossProfit: totalRevenue - totalCosts,
    grossMargin: ((totalRevenue - totalCosts) / totalRevenue * 100).toFixed(1) + '%'
  },
  revenueByClient,
  costsByConsultant,
  revenuePayments: revenuePayments.sort((a, b) => new Date(a.date) - new Date(b.date)),
  consultantPayments: consultantCosts.sort((a, b) => new Date(a.date) - new Date(b.date)),
  needsMapping: {
    message: 'We need to map consultant costs to specific client projects',
    suggestions: {
      'Swan ($47,230)': 'Which projects? Laurel? Metropolitan? Both?',
      'Niki ($15,000)': 'Which projects?',
      'Carmen ($14,342)': 'Which projects?',
      'Ivana ($11,104)': 'Which projects?',
      'Abri ($10,638)': 'Which projects?',
      'Others': 'Need allocation guidance'
    }
  }
};

// Save report
const outputPath = './data/project-profitability-analysis.json';
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

// Print summary to console
console.log('\n📊 PROJECT PROFITABILITY ANALYSIS\n');
console.log('='.repeat(60));
console.log(`\n💰 REVENUE SUMMARY:`);
console.log(`   Total Revenue: $${totalRevenue.toLocaleString()}`);
Object.entries(revenueByClient).forEach(([client, amount]) => {
  console.log(`   - ${client}: $${amount.toLocaleString()}`);
});

console.log(`\n💸 CONSULTANT COSTS:`);
console.log(`   Total Costs: $${totalCosts.toLocaleString()}`);
const topConsultants = Object.entries(costsByConsultant)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
topConsultants.forEach(([consultant, amount]) => {
  console.log(`   - ${consultant}: $${amount.toLocaleString()}`);
});

console.log(`\n📈 PROFITABILITY:`);
console.log(`   Gross Profit: $${(totalRevenue - totalCosts).toLocaleString()}`);
console.log(`   Gross Margin: ${((totalRevenue - totalCosts) / totalRevenue * 100).toFixed(1)}%`);

console.log(`\n⚠️  NEXT STEP:`);
console.log(`   We need to allocate consultant costs to specific projects.`);
console.log(`   Some consultants likely worked on both Laurel and Metropolitan.`);

console.log(`\n✅ Full report saved to: ${outputPath}\n`);
