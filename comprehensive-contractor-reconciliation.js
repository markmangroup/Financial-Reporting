// Comprehensive contractor reconciliation: SharePoint data + Chase payments + Bill.com

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('🔄 COMPREHENSIVE CONTRACTOR RECONCILIATION');
console.log('='.repeat(80));

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

// 2. Load Chase transaction data
console.log('\n💳 Loading Chase Transaction Data...');
const chase5939 = fs.readFileSync(path.join(__dirname, 'data/Chase5939_Activity_20250929.CSV'), 'utf-8');
const chase8008 = fs.readFileSync(path.join(__dirname, 'data/Chase8008_Activity20230929_20250929_20250929.CSV'), 'utf-8');

const parseCSV = (csv) => {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] ? values[index].trim() : '';
    });
    return obj;
  });
};

const chase5939Txns = parseCSV(chase5939);
const chase8008Txns = parseCSV(chase8008);
const allChaseTxns = [...chase5939Txns, ...chase8008Txns];

console.log(`✓ Loaded ${allChaseTxns.length} Chase transactions`);

// 3. Load Bill.com data
console.log('\n💼 Loading Bill.com Data...');
const billcomVendors = parseCSV(fs.readFileSync(path.join(__dirname, 'data/bill-com-vendors.csv'), 'utf-8'));
const billcomBills = parseCSV(fs.readFileSync(path.join(__dirname, 'data/bill-com-bills.csv'), 'utf-8'));

console.log(`✓ Loaded ${billcomBills.length} Bill.com bills from ${billcomVendors.length} vendors`);

// 4. Match contractors to payments
console.log('\n\n🔍 MATCHING CONTRACTORS TO PAYMENTS:');
console.log('='.repeat(80));

allContractors.forEach(contractor => {
  console.log(`\n📌 ${contractor.name}:`);
  console.log(`   SharePoint Total: $${contractor.total.toLocaleString()}`);
  console.log(`   Hourly Rate: $${contractor.hourlyRate}`);
  if (contractor.project) console.log(`   Project: ${contractor.project}`);

  // Search for payments in Chase
  const chaseMatches = allChaseTxns.filter(txn => {
    const description = (txn.Description || '').toLowerCase();
    const name = contractor.name.toLowerCase();
    const nameWords = name.split(/[\s-]/);

    // Check if any word from contractor name appears in transaction
    return nameWords.some(word => {
      if (word.length < 3) return false; // Skip short words
      return description.includes(word);
    });
  });

  if (chaseMatches.length > 0) {
    console.log(`   💰 Chase Payments Found: ${chaseMatches.length}`);
    let chaseTotal = 0;
    chaseMatches.forEach(match => {
      const amount = Math.abs(parseFloat(match.Amount) || 0);
      chaseTotal += amount;
      console.log(`      - ${match['Posting Date']}: $${amount.toFixed(2)} - ${match.Description}`);
    });
    console.log(`   Chase Total: $${chaseTotal.toLocaleString()}`);

    const diff = contractor.total - chaseTotal;
    if (Math.abs(diff) > 1) {
      console.log(`   ⚠️  DISCREPANCY: $${Math.abs(diff).toFixed(2)} ${diff > 0 ? 'MISSING from Chase' : 'EXTRA in Chase'}`);
    } else {
      console.log(`   ✓ RECONCILED!`);
    }
  }

  // Search for payments in Bill.com
  const billcomMatches = billcomBills.filter(bill => {
    const vendorName = (bill['Vendor Name'] || '').toLowerCase();
    const name = contractor.name.toLowerCase();
    const nameWords = name.split(/[\s-]/);

    return nameWords.some(word => {
      if (word.length < 3) return false;
      return vendorName.includes(word);
    });
  });

  if (billcomMatches.length > 0) {
    console.log(`   💼 Bill.com Payments Found: ${billcomMatches.length}`);
    let billcomTotal = 0;
    billcomMatches.forEach(match => {
      const amount = Math.abs(parseFloat(match['Amount']) || 0);
      billcomTotal += amount;
      console.log(`      - ${match['Due Date']}: $${amount.toFixed(2)} - ${match['Vendor Name']}`);
    });
    console.log(`   Bill.com Total: $${billcomTotal.toLocaleString()}`);

    const diff = contractor.total - billcomTotal;
    if (Math.abs(diff) > 1) {
      console.log(`   ⚠️  DISCREPANCY: $${Math.abs(diff).toFixed(2)} ${diff > 0 ? 'MISSING from Bill.com' : 'EXTRA in Bill.com'}`);
    } else {
      console.log(`   ✓ RECONCILED!`);
    }
  }

  if (chaseMatches.length === 0 && billcomMatches.length === 0) {
    console.log(`   ❌ NO PAYMENTS FOUND in Chase or Bill.com`);
    console.log(`   → Check for: ACH, wire transfer, Upwork platform payment, or manual entry needed`);
  }
});

// 5. Summary
console.log('\n\n📊 RECONCILIATION SUMMARY:');
console.log('='.repeat(80));

const totalSharePoint = allContractors.reduce((sum, c) => sum + c.total, 0);
console.log(`\nTotal from SharePoint: $${totalSharePoint.toLocaleString()}`);

// Count contractors by payment channel
let foundInChase = 0;
let foundInBillcom = 0;
let notFound = 0;

allContractors.forEach(contractor => {
  const name = contractor.name.toLowerCase();
  const nameWords = name.split(/[\s-]/);

  const hasChase = allChaseTxns.some(txn => {
    const desc = (txn.Description || '').toLowerCase();
    return nameWords.some(word => word.length >= 3 && desc.includes(word));
  });

  const hasBillcom = billcomBills.some(bill => {
    const vendor = (bill['Vendor Name'] || '').toLowerCase();
    return nameWords.some(word => word.length >= 3 && vendor.includes(word));
  });

  if (hasChase) foundInChase++;
  if (hasBillcom) foundInBillcom++;
  if (!hasChase && !hasBillcom) notFound++;
});

console.log(`\nContractors with Chase payments: ${foundInChase}`);
console.log(`Contractors with Bill.com payments: ${foundInBillcom}`);
console.log(`Contractors with NO matched payments: ${notFound}`);

console.log('\n' + '='.repeat(80));
console.log('✅ Reconciliation Complete');
console.log('='.repeat(80));
