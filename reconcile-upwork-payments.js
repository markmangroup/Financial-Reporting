// Reconcile Upwork payments in Chase against Upwork contract data
// Goal: Match total Upwork payments to individual contractor work

const fs = require('fs');
const path = require('path');

console.log('🔄 UPWORK PAYMENT RECONCILIATION');
console.log('='.repeat(80));

// Parse CSV with BOM handling
const parseCSV = (csv) => {
  csv = csv.replace(/^\uFEFF/, '');
  const lines = csv.trim().split('\n');
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const row = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    result.push(row);
  }

  const headers = result[0];
  return result.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
};

// 1. Load Chase transactions
console.log('\n💳 Loading Chase Transactions...');
const chase5939 = fs.readFileSync(path.join(__dirname, 'data/Chase5939_Activity_20250929.CSV'), 'utf-8');
const chase8008 = fs.readFileSync(path.join(__dirname, 'data/Chase8008_Activity20230929_20250929_20250929.CSV'), 'utf-8');
const chase5939Txns = parseCSV(chase5939);
const chase8008Txns = parseCSV(chase8008);
const allChaseTxns = [...chase5939Txns, ...chase8008Txns];

// Find all Upwork payments
const upworkPayments = allChaseTxns.filter(txn => {
  const desc = (txn.Description || '').toLowerCase();
  return desc.includes('upwork');
});

console.log(`✓ Found ${upworkPayments.length} Upwork payments in Chase`);

// Calculate total Upwork payments
const totalUpworkPaid = upworkPayments.reduce((sum, txn) => {
  return sum + Math.abs(parseFloat(txn.Amount) || 0);
}, 0);

console.log(`✓ Total paid to Upwork: $${totalUpworkPaid.toLocaleString()}`);

// 2. Load Upwork contracts
console.log('\n📋 Loading Upwork Contracts...');
const upworkContractsRaw = fs.readFileSync(path.join(__dirname, 'contracts.csv'), 'utf-8');
const upworkContracts = parseCSV(upworkContractsRaw);
console.log(`✓ Loaded ${upworkContracts.length} Upwork contracts`);

// 3. Show payment timeline
console.log('\n\n📅 UPWORK PAYMENT TIMELINE:');
console.log('='.repeat(80));

// Sort by posting date
const sortedPayments = upworkPayments.sort((a, b) => {
  const dateA = new Date(a['Posting Date']);
  const dateB = new Date(b['Posting Date']);
  return dateA - dateB;
});

let runningTotal = 0;
sortedPayments.forEach(payment => {
  const amount = Math.abs(parseFloat(payment.Amount) || 0);
  runningTotal += amount;
  console.log(`${payment['Posting Date']}: $${amount.toFixed(2).padStart(10)} (Running: $${runningTotal.toFixed(2).padStart(12)}) - ${payment.Description}`);
});

// 4. Group by month
console.log('\n\n📊 UPWORK PAYMENTS BY MONTH:');
console.log('='.repeat(80));

const paymentsByMonth = {};
upworkPayments.forEach(payment => {
  const date = new Date(payment['Posting Date']);
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  if (!paymentsByMonth[monthKey]) {
    paymentsByMonth[monthKey] = {
      count: 0,
      total: 0,
      payments: []
    };
  }

  const amount = Math.abs(parseFloat(payment.Amount) || 0);
  paymentsByMonth[monthKey].count++;
  paymentsByMonth[monthKey].total += amount;
  paymentsByMonth[monthKey].payments.push(payment);
});

Object.keys(paymentsByMonth).sort().forEach(month => {
  const data = paymentsByMonth[month];
  console.log(`\n${month}: ${data.count} payments, $${data.total.toLocaleString()}`);
});

// 5. Show active contractors by period
console.log('\n\n👥 UPWORK CONTRACTORS BY CONTRACT PERIOD:');
console.log('='.repeat(80));

upworkContracts.forEach(contract => {
  const name = contract['Freelancer Name'];
  const rate = parseFloat(contract['Hourly Rate']) || 0;
  const startDate = contract['Start Date'] ? contract['Start Date'].substring(0, 10) : 'Unknown';
  const endDate = contract['End Date'] ? contract['End Date'].substring(0, 10) : 'Active';
  const status = contract['Status'];
  const weeklyLimit = contract['Weekly Limit'];

  console.log(`\n${name}:`);
  console.log(`   Rate: $${rate}/hr`);
  console.log(`   Period: ${startDate} → ${endDate}`);
  console.log(`   Status: ${status}`);
  console.log(`   Weekly Limit: ${weeklyLimit} hours`);

  // Calculate max potential earnings if worked full hours
  const start = new Date(startDate);
  const end = status === 'Ended' ? new Date(endDate) : new Date();
  const weeks = Math.ceil((end - start) / (7 * 24 * 60 * 60 * 1000));
  const maxEarnings = weeks * parseFloat(weeklyLimit || 0) * rate;

  if (maxEarnings > 0) {
    console.log(`   Max Potential (${weeks} weeks × ${weeklyLimit}hr × $${rate}): $${maxEarnings.toLocaleString()}`);
  }
});

// 6. Summary
console.log('\n\n📈 RECONCILIATION SUMMARY:');
console.log('='.repeat(80));

console.log(`\nTotal Chase Payments to Upwork: $${totalUpworkPaid.toLocaleString()}`);
console.log(`Number of Payments: ${upworkPayments.length}`);
console.log(`Active Contracts: ${upworkContracts.filter(c => c.Status === 'Active').length}`);
console.log(`Ended Contracts: ${upworkContracts.filter(c => c.Status === 'Ended').length}`);

const avgPayment = totalUpworkPaid / upworkPayments.length;
console.log(`\nAverage Payment: $${avgPayment.toFixed(2)}`);

const firstPayment = sortedPayments[0];
const lastPayment = sortedPayments[sortedPayments.length - 1];
console.log(`First Payment: ${firstPayment['Posting Date']}`);
console.log(`Last Payment: ${lastPayment['Posting Date']}`);

console.log('\n' + '='.repeat(80));
console.log('✅ Upwork Payment Analysis Complete');
console.log('='.repeat(80));
console.log('\n💡 NOTE: Upwork payments represent total amounts paid to Upwork platform.');
console.log('   Individual contractor breakdowns are managed within Upwork.');
console.log('   Use Upwork\'s reporting for detailed contractor-level reconciliation.');
