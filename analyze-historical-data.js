// Analyze historical SharePoint data to understand structure and reconcile with existing records

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('📊 Analyzing Historical Financial Data from SharePoint\n');
console.log('='.repeat(80));

// Parse accounting master file
console.log('\n🔍 ACCOUNTING MASTER FILE:');
console.log('-'.repeat(80));

try {
  const accountingPath = path.join(__dirname, 'data', 'accounting-master.xlsx');
  const workbook = XLSX.readFile(accountingPath);

  console.log(`\n📋 Sheet Names: ${workbook.SheetNames.join(', ')}`);

  // Analyze each sheet
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n[Sheet ${index + 1}] ${sheetName}:`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length > 0) {
      console.log(`  Rows: ${data.length}`);
      console.log(`  Headers: ${JSON.stringify(data[0])}`);

      // Show sample data (first 3 rows after header)
      if (data.length > 1) {
        console.log(`  Sample data (first 3 rows):`);
        for (let i = 1; i <= Math.min(3, data.length - 1); i++) {
          console.log(`    Row ${i}: ${JSON.stringify(data[i])}`);
        }
      }
    } else {
      console.log(`  (Empty sheet)`);
    }
  });
} catch (error) {
  console.error(`Error reading accounting-master.xlsx: ${error.message}`);
}

// Parse Laurel forecast
console.log('\n\n🔍 LAUREL FORECAST FILE:');
console.log('-'.repeat(80));

try {
  const laurelPath = path.join(__dirname, 'data', 'laurel-forecast.xlsx');
  const workbook = XLSX.readFile(laurelPath);

  console.log(`\n📋 Sheet Names: ${workbook.SheetNames.join(', ')}`);

  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n[Sheet ${index + 1}] ${sheetName}:`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length > 0) {
      console.log(`  Rows: ${data.length}`);
      console.log(`  Headers: ${JSON.stringify(data[0])}`);

      if (data.length > 1) {
        console.log(`  Sample data (first 3 rows):`);
        for (let i = 1; i <= Math.min(3, data.length - 1); i++) {
          console.log(`    Row ${i}: ${JSON.stringify(data[i])}`);
        }
      }
    } else {
      console.log(`  (Empty sheet)`);
    }
  });
} catch (error) {
  console.error(`Error reading laurel-forecast.xlsx: ${error.message}`);
}

// Parse Metropolitan forecast
console.log('\n\n🔍 METROPOLITAN FORECAST FILE:');
console.log('-'.repeat(80));

try {
  const metroPath = path.join(__dirname, 'data', 'metropolitan-forecast.xlsx');
  const workbook = XLSX.readFile(metroPath);

  console.log(`\n📋 Sheet Names: ${workbook.SheetNames.join(', ')}`);

  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n[Sheet ${index + 1}] ${sheetName}:`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length > 0) {
      console.log(`  Rows: ${data.length}`);
      console.log(`  Headers: ${JSON.stringify(data[0])}`);

      if (data.length > 1) {
        console.log(`  Sample data (first 3 rows):`);
        for (let i = 1; i <= Math.min(3, data.length - 1); i++) {
          console.log(`    Row ${i}: ${JSON.stringify(data[i])}`);
        }
      }
    } else {
      console.log(`  (Empty sheet)`);
    }
  });
} catch (error) {
  console.error(`Error reading metropolitan-forecast.xlsx: ${error.message}`);
}

// Parse Laurel master data (limit output as it's large)
console.log('\n\n🔍 LAUREL MASTER DATA FILE:');
console.log('-'.repeat(80));

try {
  const masterPath = path.join(__dirname, 'data', 'laurel-master-data.xlsx');
  const workbook = XLSX.readFile(masterPath);

  console.log(`\n📋 Sheet Names (${workbook.SheetNames.length} sheets): ${workbook.SheetNames.slice(0, 10).join(', ')}${workbook.SheetNames.length > 10 ? '...' : ''}`);

  // Only show first 3 sheets to avoid overwhelming output
  workbook.SheetNames.slice(0, 3).forEach((sheetName, index) => {
    console.log(`\n[Sheet ${index + 1}] ${sheetName}:`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length > 0) {
      console.log(`  Rows: ${data.length}`);
      console.log(`  Headers: ${JSON.stringify(data[0])}`);

      if (data.length > 1) {
        console.log(`  Sample data (first 2 rows):`);
        for (let i = 1; i <= Math.min(2, data.length - 1); i++) {
          console.log(`    Row ${i}: ${JSON.stringify(data[i])}`);
        }
      }
    } else {
      console.log(`  (Empty sheet)`);
    }
  });

  if (workbook.SheetNames.length > 3) {
    console.log(`\n  ... and ${workbook.SheetNames.length - 3} more sheets`);
  }
} catch (error) {
  console.error(`Error reading laurel-master-data.xlsx: ${error.message}`);
}

console.log('\n\n' + '='.repeat(80));
console.log('✅ Analysis Complete');
console.log('='.repeat(80));
