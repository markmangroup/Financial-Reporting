/**
 * Quick test script for email analysis API
 * Run with: node test-email-api.js
 */

const fetch = require('node-fetch')

async function testEmailAnalysis() {
  console.log('🧪 Testing Email Analysis API...\n')

  try {
    const consultantName = 'Swan'
    const url = `http://localhost:3003/api/consultant-work-history?name=${encodeURIComponent(consultantName)}&email=contact@swansoftweb.com&userEmail=mike@markmanassociates.com`

    console.log(`📧 Fetching emails for: ${consultantName}`)
    console.log(`🔗 URL: ${url}\n`)

    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Error:', data.error)
      if (data.error.includes('authenticate')) {
        console.log('\n💡 Tip: Make sure Mail.Read permission is granted and admin consent is given')
      }
      return
    }

    console.log('✅ Success!\n')
    console.log('📊 Results:')
    console.log(`   Emails found: ${data.emailCount}`)
    console.log(`   Projects: ${data.projects.length}`)
    console.log(`   Deliverables: ${data.deliverables.length}`)
    console.log('')

    if (data.projects.length > 0) {
      console.log('📁 Projects Found:')
      data.projects.forEach((p, i) => console.log(`   ${i + 1}. ${p}`))
      console.log('')
    }

    if (data.deliverables.length > 0) {
      console.log('✅ Deliverables Found:')
      data.deliverables.forEach((d, i) => console.log(`   ${i + 1}. ${d}`))
      console.log('')
    }

    if (data.timeline && data.timeline.length > 0) {
      console.log('📅 Recent Communications:')
      data.timeline.slice(0, 5).forEach((t, i) => {
        console.log(`   ${i + 1}. [${t.date}] ${t.subject}`)
      })
    }

    console.log('\n✅ Data cached to: public/data/consultant-work-history/swan.json')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testEmailAnalysis()
