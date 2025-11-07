// Final comprehensive contractor reconciliation: SharePoint + Chase + Bill.com + Upwork contracts
// Goal: Validate all contractor data and resolve payment discrepancies

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('🎯 FINAL CONTRACTOR RECONCILIATION');
console.log('='.repeat(80));

// Helper function to parse CSV (handles quoted fields with commas and BOM)
const parseCSV = (csv) => {
  // Remove BOM if present
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

  // Convert to objects
  const headers = result[0];
  return result.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
};

// 1. Load SharePoint contractor data
console.log('\n📊 Loading SharePoint Contractor Data...');
const accountingPath = path.join(__dirname, 'data', 'accounting-master.xlsx');
const workbook = XLSX.readFile(accountingPath);

// Extract Upwork contractors
const upworkSheet = workbook.Sheets['Upwork'];
const upworkData = XLSX.utils.sheet_to_json(upworkSheet, { header: 1 });
const upworkContractors = [];

if (upworkData.length > 1) {
  const headers = upworkData[0];
  for (let i = 1; i < upworkData.length; i++) {
    const row = upworkData[i];
    if (row[0] && row[1]) {
      const totalIndex = headers.findIndex(h => h === 'TOTAL');
      upworkContractors.push({
        name: row[0],
        hourlyRate: parseFloat(row[1]) || 0,
        project: row[2],
        role: row[3],
        total: totalIndex !== -1 ? parseFloat(row[totalIndex]) || 0 : 0,
        source: 'Upwork'
      });
    }
  }
}

// Extract Freelance contractors
const freelanceSheet = workbook.Sheets['Freelance charges'];
const freelanceData = XLSX.utils.sheet_to_json(freelanceSheet, { header: 1 });
const freelanceContractors = [];

if (freelanceData.length > 1) {
  for (let i = 1; i < freelanceData.length; i++) {
    const row = freelanceData[i];
    if (row[0] && row[1]) {
      let total = 0;
      for (let j = 2; j < row.length; j++) {
        total += parseFloat(row[j]) || 0;
      }
      freelanceContractors.push({
        name: row[0],
        hourlyRate: parseFloat(row[1]) || 0,
        total,
        source: 'Freelance'
      });
    }
  }
}

const allContractors = [...upworkContractors, ...freelanceContractors];
console.log(`✓ Found ${allContractors.length} contractors (${upworkContractors.length} Upwork, ${freelanceContractors.length} Freelance)`);

// 2. Load Upwork contracts CSV
console.log('\n📝 Loading Upwork Contracts Data...');
const upworkContractsRaw = fs.readFileSync(path.join(__dirname, 'contracts.csv'), 'utf-8');
const upworkContracts = parseCSV(upworkContractsRaw);
console.log(`✓ Loaded ${upworkContracts.length} Upwork contracts`);

// 3. Load Chase transaction data
console.log('\n💳 Loading Chase Transaction Data...');
const chase5939 = fs.readFileSync(path.join(__dirname, 'data/Chase5939_Activity_20250929.CSV'), 'utf-8');
const chase8008 = fs.readFileSync(path.join(__dirname, 'data/Chase8008_Activity20230929_20250929_20250929.CSV'), 'utf-8');
const chase5939Txns = parseCSV(chase5939);
const chase8008Txns = parseCSV(chase8008);
const allChaseTxns = [...chase5939Txns, ...chase8008Txns];
console.log(`✓ Loaded ${allChaseTxns.length} Chase transactions`);

// 4. Load Bill.com data
console.log('\n💼 Loading Bill.com Data...');
const billcomBills = parseCSV(fs.readFileSync(path.join(__dirname, 'data/bill-com-bills.csv'), 'utf-8'));
console.log(`✓ Loaded ${billcomBills.length} Bill.com bills`);

// 5. Reconcile each contractor
console.log('\n\n🔍 COMPREHENSIVE RECONCILIATION:');
console.log('='.repeat(80));

allContractors.forEach(contractor => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📌 ${contractor.name} (${contractor.source})`);
  console.log(`${'='.repeat(80)}`);

  console.log(`\n💰 SharePoint Data:`);
  console.log(`   Hourly Rate: $${contractor.hourlyRate}`);
  console.log(`   Total Amount: $${contractor.total.toLocaleString()}`);
  if (contractor.project) console.log(`   Project: ${contractor.project}`);
  if (contractor.role) console.log(`   Role: ${contractor.role}`);

  // Check Upwork contract data
  const upworkContract = upworkContracts.find(contract => {
    const contractName = (contract['Freelancer Name'] || '').toLowerCase();
    const name = contractor.name.toLowerCase();
    return contractName.includes(name.split(/[\s-]/)[0]) || name.includes(contractName.split(/[\s-]/)[0]);
  });

  if (upworkContract) {
    console.log(`\n📋 Upwork Contract:`);
    console.log(`   Upwork ID: ${upworkContract['Freelancer User ID']}`);
    console.log(`   Contract Rate: $${upworkContract['Hourly Rate']}/hr`);
    console.log(`   Start Date: ${upworkContract['Start Date']?.substring(0, 10)}`);
    console.log(`   End Date: ${upworkContract['End Date']?.substring(0, 10)}`);
    console.log(`   Status: ${upworkContract['Status']}`);
    console.log(`   Weekly Limit: ${upworkContract['Weekly Limit']} hours`);

    const upworkRate = parseFloat(upworkContract['Hourly Rate']) || 0;
    if (Math.abs(upworkRate - contractor.hourlyRate) > 0.5) {
      console.log(`   ⚠️  RATE MISMATCH: Upwork $${upworkRate}/hr vs SharePoint $${contractor.hourlyRate}/hr`);
    } else {
      console.log(`   ✓ Rate validated`);
    }
  }

  // Search for payments in Chase (with improved matching)
  const chaseMatches = allChaseTxns.filter(txn => {
    const description = (txn.Description || '').toLowerCase();
    const name = contractor.name.toLowerCase();

    // Exact contractor name variations
    const nameVariants = [
      name,
      name.replace(/\s+/g, ' '),
      // Special cases
      contractor.name === 'Niki' ? 'nikoleta notova' : null,
      contractor.name === 'Niki' ? 'niki payment' : null,
      contractor.name === 'Abri' ? 'abri (' : null,
      contractor.name === 'Jan' ? 'jan dzubak' : null,
      contractor.name === 'Carmen' ? 'carmen ' : null,
      contractor.name === 'Petrana' ? 'petrana georgieva petrova' : null,
      contractor.name === 'Beata' ? 'beata troppova' : null
    ].filter(Boolean);

    // Check if any variant matches
    return nameVariants.some(variant => description.includes(variant));
  });

  let chaseTotal = 0;
  if (chaseMatches.length > 0) {
    console.log(`\n💳 Chase Payments:`);
    chaseMatches.forEach(match => {
      const amount = Math.abs(parseFloat(match.Amount) || 0);
      chaseTotal += amount;
      console.log(`   ${match['Posting Date']}: $${amount.toFixed(2)} - ${match.Description}`);
    });
    console.log(`   Total: $${chaseTotal.toLocaleString()}`);
  }

  // Search for payments in Bill.com (with improved matching)
  const billcomMatches = billcomBills.filter(bill => {
    const vendorName = (bill['Vendor'] || '').toLowerCase(); // Column name is "Vendor" not "Vendor Name"
    const name = contractor.name.toLowerCase();

    // Exact contractor name variations
    const nameVariants = [
      name,
      // Special cases for Bill.com vendor names
      contractor.name === 'Niki' ? 'nikoleta nôtová' : null,
      contractor.name === 'Niki' ? 'nikyn' : null,
      contractor.name === 'Jan' ? 'jan dzubak' : null,
      contractor.name === 'Carmen' ? 'carmen ' : null
    ].filter(Boolean);

    // Check if any variant matches
    return nameVariants.some(variant => vendorName.includes(variant));
  });

  let billcomTotal = 0;
  let billcomUnpaid = 0;
  if (billcomMatches.length > 0) {
    console.log(`\n💼 Bill.com Bills:`);
    billcomMatches.forEach(match => {
      const amount = Math.abs(parseFloat(match['Invoice amount']) || 0); // After BOM removal, no trailing space
      const status = match['Payment status'] || '';

      if (status.toLowerCase() === 'paid') {
        billcomTotal += amount;
        console.log(`   ${match['Due date']}: $${amount.toFixed(2)} - ${match['Description']} - ✓ PAID`);
      } else {
        billcomUnpaid += amount;
        console.log(`   ${match['Due date']}: $${amount.toFixed(2)} - ${match['Description']} - ⏳ ${status.toUpperCase()}`);
      }
    });
    console.log(`   Paid Total: $${billcomTotal.toLocaleString()}`);
    if (billcomUnpaid > 0) {
      console.log(`   Unpaid Total: $${billcomUnpaid.toLocaleString()}`);
    }
  }

  // Calculate total payments across all sources
  const totalPayments = chaseTotal + billcomTotal;

  console.log(`\n📊 RECONCILIATION SUMMARY:`);
  console.log(`   SharePoint Total: $${contractor.total.toLocaleString()}`);
  console.log(`   Chase Payments: $${chaseTotal.toLocaleString()}`);
  console.log(`   Bill.com Paid: $${billcomTotal.toLocaleString()}`);
  if (billcomUnpaid > 0) {
    console.log(`   Bill.com Unpaid: $${billcomUnpaid.toLocaleString()}`);
  }
  console.log(`   Total Verified Payments: $${totalPayments.toLocaleString()}`);

  // Analyze discrepancy
  const diff = contractor.total - totalPayments;
  if (chaseMatches.length === 0 && billcomMatches.length === 0) {
    console.log(`\n   ℹ️  NO DIRECT PAYMENTS FOUND`);
    if (contractor.source === 'Upwork') {
      console.log(`   → Likely paid through Upwork platform (not visible in Chase/Bill.com)`);
    } else {
      console.log(`   → Check for: wire transfer, ACH, or other payment method`);
    }
  } else if (Math.abs(diff) < 1) {
    console.log(`\n   ✅ RECONCILED! Perfect match.`);
  } else if (diff > 0) {
    console.log(`\n   ⚠️  DISCREPANCY: $${Math.abs(diff).toFixed(2)} MISSING`);
    if (billcomUnpaid > 0) {
      const withUnpaid = totalPayments + billcomUnpaid;
      const diffWithUnpaid = contractor.total - withUnpaid;
      console.log(`   → If Bill.com unpaid is included: $${withUnpaid.toLocaleString()} (diff: $${Math.abs(diffWithUnpaid).toFixed(2)})`);
    }
  } else {
    console.log(`\n   ⚠️  DISCREPANCY: $${Math.abs(diff).toFixed(2)} EXTRA in payments`);
    console.log(`   → Payments exceed SharePoint total - may include work not recorded in SharePoint`);
  }
});

// 6. Summary Report
console.log('\n\n');
console.log('='.repeat(80));
console.log('📊 FINAL RECONCILIATION SUMMARY');
console.log('='.repeat(80));

const totalSharePoint = allContractors.reduce((sum, c) => sum + c.total, 0);
console.log(`\nTotal from SharePoint: $${totalSharePoint.toLocaleString()}`);

let totalChase = 0;
let totalBillcom = 0;
let reconciledCount = 0;
let discrepancyCount = 0;
let noPaymentsCount = 0;

allContractors.forEach(contractor => {
  const name = contractor.name.toLowerCase();

  // Chase name variants
  const chaseVariants = [
    name,
    contractor.name === 'Niki' ? 'nikoleta notova' : null,
    contractor.name === 'Niki' ? 'niki payment' : null,
    contractor.name === 'Abri' ? 'abri (' : null,
    contractor.name === 'Jan' ? 'jan dzubak' : null,
    contractor.name === 'Carmen' ? 'carmen ' : null,
    contractor.name === 'Petrana' ? 'petrana georgieva petrova' : null,
    contractor.name === 'Beata' ? 'beata troppova' : null
  ].filter(Boolean);

  // Calculate Chase total
  const chaseMatches = allChaseTxns.filter(txn => {
    const desc = (txn.Description || '').toLowerCase();
    return chaseVariants.some(variant => desc.includes(variant));
  });
  const chaseTotal = chaseMatches.reduce((sum, m) => sum + Math.abs(parseFloat(m.Amount) || 0), 0);
  totalChase += chaseTotal;

  // Bill.com name variants
  const billcomVariants = [
    name,
    contractor.name === 'Niki' ? 'nikoleta nôtová' : null,
    contractor.name === 'Niki' ? 'nikyn' : null,
    contractor.name === 'Jan' ? 'jan dzubak' : null,
    contractor.name === 'Carmen' ? 'carmen ' : null
  ].filter(Boolean);

  // Calculate Bill.com total (paid only)
  const billcomMatches = billcomBills.filter(bill => {
    const vendor = (bill['Vendor'] || '').toLowerCase();
    const status = (bill['Payment status'] || '').toLowerCase();
    return status === 'paid' && billcomVariants.some(variant => vendor.includes(variant));
  });
  const billcomTotal = billcomMatches.reduce((sum, m) => sum + Math.abs(parseFloat(m['Invoice amount']) || 0), 0);
  totalBillcom += billcomTotal;

  // Categorize
  const totalPayments = chaseTotal + billcomTotal;
  const diff = Math.abs(contractor.total - totalPayments);

  if (chaseTotal === 0 && billcomTotal === 0) {
    noPaymentsCount++;
  } else if (diff < 1) {
    reconciledCount++;
  } else {
    discrepancyCount++;
  }
});

console.log(`\nTotal Chase Payments (matched): $${totalChase.toLocaleString()}`);
console.log(`Total Bill.com Payments (matched): $${totalBillcom.toLocaleString()}`);
console.log(`Total Verified Payments: $${(totalChase + totalBillcom).toLocaleString()}`);

console.log(`\n✅ Reconciled Contractors: ${reconciledCount}`);
console.log(`⚠️  Contractors with Discrepancies: ${discrepancyCount}`);
console.log(`ℹ️  Contractors with No Direct Payments: ${noPaymentsCount} (likely Upwork platform)`);

console.log('\n' + '='.repeat(80));
console.log('✅ Final Reconciliation Complete');
console.log('='.repeat(80));
