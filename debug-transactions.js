// Quick debug script to check transaction categorization
const { parseChaseCheckingCSV } = require('./src/lib/csvParser')
const { loadRealCheckingData } = require('./src/lib/loadRealData')

const data = loadRealCheckingData()

console.log('=== TRANSACTION BREAKDOWN ===')
console.log(`Total transactions: ${data.transactions.length}`)
console.log(`\nSUMMARY:`)
console.log(`Business Revenue: $${data.summary.businessRevenue}`)
console.log(`Owner Equity: $${data.summary.ownerEquity}`)
console.log(`Total Debits: $${data.summary.totalDebits}`)
console.log(`Net Amount: $${data.summary.netAmount}`)
console.log(`Other Credits: $${data.summary.otherCredits}`)

console.log('\n=== POSITIVE TRANSACTIONS (INCOME) ===')
data.transactions.filter(t => t.amount > 0).forEach(t => {
  console.log(`${t.date}: ${t.category} - $${t.amount} (${t.description.substring(0,50)}...)`)
})

console.log('\n=== NEGATIVE TRANSACTIONS (EXPENSES) ===')
data.transactions.filter(t => t.amount < 0).forEach(t => {
  console.log(`${t.date}: ${t.category} - $${Math.abs(t.amount)} (${t.description.substring(0,50)}...)`)
})

console.log('\n=== CATEGORIES SUMMARY ===')
data.categories.forEach(cat => {
  console.log(`${cat.category}: $${cat.amount} (${cat.count} transactions)`)
})