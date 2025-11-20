import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import path from 'path'
import fs from 'fs'

export async function GET(request: NextRequest) {
  let browser
  try {
    // Get the base URL from the request
    const baseUrl = request.nextUrl.origin
    const resumeUrl = `${baseUrl}/resume`

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    // Navigate to the resume page
    await page.goto(resumeUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    })

    // Wait a bit for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in'
      },
      printBackground: true,
      preferCSSPageSize: true
    })

    // Save to public folder
    const publicDir = path.join(process.cwd(), 'public')
    const pdfPath = path.join(publicDir, 'resume-generated.pdf')

    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    // Write the PDF file
    fs.writeFileSync(pdfPath, pdfBuffer)

    await browser.close()

    return NextResponse.json({
      success: true,
      message: 'PDF generated successfully',
      path: '/resume-generated.pdf',
      downloadUrl: `${baseUrl}/resume-generated.pdf`
    })
  } catch (error) {
    if (browser) {
      await browser.close()
    }
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

