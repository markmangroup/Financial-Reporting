// Reconcile SharePoint contractor data with our consultant subledger template

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('👥 CONSULTANT DATA RECONCILIATION');
console.log('='.repeat(80));

// Parse existing consultant template
console.log('\n📋 Current Consultant Subledger:');
console.log('-'.repeat(80));

const consultantCSV = fs.readFileSync(
  path.join(__dirname, 'consultant-subledger-template.csv'),
  'utf-8'
);

const consultantLines = consultantCSV.trim().split('\n');
const consultantHeader = consultantLines[0].split(',');
const existingConsultants = consultantLines.slice(1).map(line => {
  const values = line.split(',');
  return {
    id: values[0],
    name: values[1],
    country: values[2],
    role: values[3],
    specialization: values[4],
    hourlyRate: parseFloat(values[5]) || 0,
    contractType: values[6],
    status: values[10]
  };
});

console.log(`Found ${existingConsultants.length} existing consultants:`);
existingConsultants.forEach(c => {
  console.log(`  - ${c.name}: $${c.hourlyRate}/hr (${c.role}) - ${c.status}`);
});

// Parse SharePoint contractor data
console.log('\n\n📊 SharePoint Contractor Data:');
console.log('-'.repeat(80));

const accountingPath = path.join(__dirname, 'data', 'accounting-master.xlsx');
const workbook = XLSX.readFile(accountingPath);

// Extract Upwork contractors
console.log('\n🔹 Upwork Contractors:');
const upworkSheet = workbook.Sheets['Upwork'];
const upworkData = XLSX.utils.sheet_to_json(upworkSheet, { header: 1 });

const upworkContractors = [];
if (upworkData.length > 1) {
  const headers = upworkData[0];

  for (let i = 1; i < upworkData.length; i++) {
    const row = upworkData[i];
    if (row[0] && row[1]) { // Has name and hourly rate
      const name = row[0];
      const hourlyRate = parseFloat(row[1]) || 0;
      const project = row[2];
      const role = row[3];

      // Calculate total from the row
      const totalIndex = headers.findIndex(h => h === 'TOTAL');
      const total = totalIndex !== -1 ? parseFloat(row[totalIndex]) || 0 : 0;

      upworkContractors.push({
        name,
        hourlyRate,
        project,
        role,
        total,
        source: 'Upwork'
      });

      console.log(`  ${name}:`);
      console.log(`    Role: ${role || 'N/A'}`);
      console.log(`    Project: ${project || 'N/A'}`);
      console.log(`    Hourly Rate: $${hourlyRate}`);
      console.log(`    Total Paid: $${total.toLocaleString()}`);
    }
  }
}

// Extract Freelance contractors
console.log('\n\n🔹 Freelance Contractors:');
const freelanceSheet = workbook.Sheets['Freelance charges'];
const freelanceData = XLSX.utils.sheet_to_json(freelanceSheet, { header: 1 });

const freelanceContractors = [];
if (freelanceData.length > 1) {
  const headers = freelanceData[0];

  for (let i = 1; i < freelanceData.length; i++) {
    const row = freelanceData[i];
    if (row[0] && row[1]) { // Has name and hourly rate
      const name = row[0];
      const hourlyRate = parseFloat(row[1]) || 0;

      // Sum all payments (columns 2+)
      let total = 0;
      for (let j = 2; j < row.length; j++) {
        const val = parseFloat(row[j]) || 0;
        total += val;
      }

      freelanceContractors.push({
        name,
        hourlyRate,
        total,
        source: 'Freelance'
      });

      console.log(`  ${name}:`);
      console.log(`    Hourly Rate: $${hourlyRate}`);
      console.log(`    Total Paid: $${total.toLocaleString()}`);
    }
  }
}

// Reconciliation
console.log('\n\n🔍 RECONCILIATION ANALYSIS:');
console.log('='.repeat(80));

const allSharePointContractors = [...upworkContractors, ...freelanceContractors];

console.log('\n📌 Contractors in SharePoint but NOT in our Subledger:');
console.log('-'.repeat(80));

const missingFromSubledger = allSharePointContractors.filter(sp => {
  const normalized = sp.name.toLowerCase().trim();
  return !existingConsultants.some(ec =>
    ec.name.toLowerCase().includes(normalized.split(/[\s-]/)[0]) ||
    normalized.includes(ec.name.toLowerCase().split(/[\s-]/)[0])
  );
});

if (missingFromSubledger.length === 0) {
  console.log('✅ All SharePoint contractors are in the subledger!');
} else {
  missingFromSubledger.forEach(c => {
    console.log(`\n  ❌ ${c.name} (${c.source}):`);
    console.log(`     Hourly Rate: $${c.hourlyRate}`);
    console.log(`     Total Paid: $${c.total.toLocaleString()}`);
    console.log(`     Role: ${c.role || 'Unknown'}`);
    console.log(`     Project: ${c.project || 'N/A'}`);
  });
}

console.log('\n\n📌 Consultants in Subledger with SharePoint data:');
console.log('-'.repeat(80));

existingConsultants.forEach(ec => {
  const matches = allSharePointContractors.filter(sp => {
    const normalized = sp.name.toLowerCase().trim();
    const ecName = ec.name.toLowerCase().trim();
    return ecName.includes(normalized.split(/[\s-]/)[0]) ||
           normalized.includes(ecName.split(/[\s-]/)[0]);
  });

  if (matches.length > 0) {
    console.log(`\n  ✓ ${ec.name} (${ec.status}):`);
    console.log(`    Current Subledger Rate: $${ec.hourlyRate}/hr`);

    matches.forEach(m => {
      console.log(`    SharePoint Rate: $${m.hourlyRate}/hr (${m.source})`);
      console.log(`    Total Paid: $${m.total.toLocaleString()}`);

      if (ec.hourlyRate !== m.hourlyRate) {
        console.log(`    ⚠️  RATE MISMATCH! Subledger: $${ec.hourlyRate} vs SharePoint: $${m.hourlyRate}`);
      }
    });
  }
});

console.log('\n\n📌 Consultants in Subledger with NO SharePoint data:');
console.log('-'.repeat(80));

const noSharePointData = existingConsultants.filter(ec => {
  return !allSharePointContractors.some(sp => {
    const normalized = sp.name.toLowerCase().trim();
    const ecName = ec.name.toLowerCase().trim();
    return ecName.includes(normalized.split(/[\s-]/)[0]) ||
           normalized.includes(ecName.split(/[\s-]/)[0]);
  });
});

if (noSharePointData.length === 0) {
  console.log('✅ All subledger consultants have SharePoint data!');
} else {
  noSharePointData.forEach(c => {
    console.log(`  ℹ️  ${c.name}: $${c.hourlyRate}/hr (${c.role}) - ${c.status}`);
    console.log(`     Note: May be new hire or different tracking method`);
  });
}

// Summary statistics
console.log('\n\n📊 SUMMARY STATISTICS:');
console.log('='.repeat(80));

const totalSharePointPaid = allSharePointContractors.reduce((sum, c) => sum + c.total, 0);
console.log(`\nTotal paid to contractors (from SharePoint): $${totalSharePointPaid.toLocaleString()}`);
console.log(`Upwork contractors: ${upworkContractors.length}`);
console.log(`Freelance contractors: ${freelanceContractors.length}`);
console.log(`Total in subledger: ${existingConsultants.length}`);
console.log(`Active in subledger: ${existingConsultants.filter(c => c.status === 'Active').length}`);
console.log(`Missing from subledger: ${missingFromSubledger.length}`);
console.log(`No SharePoint data: ${noSharePointData.length}`);

// Generate suggested CSV additions
console.log('\n\n💡 SUGGESTED CONSULTANT SUBLEDGER ADDITIONS:');
console.log('='.repeat(80));

if (missingFromSubledger.length > 0) {
  console.log('\nCopy these lines to add missing contractors:\n');

  let nextId = existingConsultants.length + 1;
  missingFromSubledger.forEach(c => {
    const id = `CONS-${String(nextId).padStart(3, '0')}`;
    const name = c.name;
    const role = c.role || 'Developer';
    const specialization = c.project || 'General Development';
    const hourlyRate = c.hourlyRate;
    const contractType = c.source === 'Upwork' ? 'Hourly' : 'Hourly';
    const paymentMethod = c.source === 'Upwork' ? 'Upwork' : 'Wire Transfer';
    const startDate = '2024-05-01'; // Estimate
    const status = 'Active';

    console.log(`${id},${name},Unknown,${role},${specialization},${hourlyRate},${contractType},${paymentMethod},${startDate},,${status},${name.toLowerCase().replace(/\s/g, '')}@example.com,,,Historical contractor from SharePoint`);
    nextId++;
  });
}

console.log('\n' + '='.repeat(80));
console.log('✅ Reconciliation Complete');
console.log('='.repeat(80));
