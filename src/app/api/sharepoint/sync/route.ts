// API route to sync data from SharePoint
import { NextResponse } from 'next/server'
import { createSharePointClient } from '@/lib/sharepoint/sharepointClient'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { dataType } = await request.json()

    const client = createSharePointClient()
    if (!client) {
      return NextResponse.json(
        { error: 'SharePoint not configured. Please add credentials to .env.local' },
        { status: 500 }
      )
    }

    let result: any = {}

    switch (dataType) {
      case 'income':
        // Download financial data from SharePoint
        const financialData = await client.downloadFinancialData()

        // Save to local data folder
        const dataDir = path.join(process.cwd(), 'data')

        // Ensure data directory exists
        await fs.mkdir(dataDir, { recursive: true })

        let filesDownloaded = 0

        // Save accounting master file
        if (financialData.accountingMaster) {
          await fs.writeFile(
            path.join(dataDir, 'accounting-master.xlsx'),
            Buffer.from(financialData.accountingMaster)
          )
          filesDownloaded++
        }

        // Save Laurel forecast
        if (financialData.laurelForecast) {
          await fs.writeFile(
            path.join(dataDir, 'laurel-forecast.xlsx'),
            Buffer.from(financialData.laurelForecast)
          )
          filesDownloaded++
        }

        // Save Metropolitan forecast
        if (financialData.metroForecast) {
          await fs.writeFile(
            path.join(dataDir, 'metropolitan-forecast.xlsx'),
            Buffer.from(financialData.metroForecast)
          )
          filesDownloaded++
        }

        // Save Laurel master data
        if (financialData.laurelMasterData) {
          await fs.writeFile(
            path.join(dataDir, 'laurel-master-data.xlsx'),
            Buffer.from(financialData.laurelMasterData)
          )
          filesDownloaded++
        }

        result = {
          filesDownloaded,
          incomeFiles: financialData.incomeFiles.length,
          expenseFiles: financialData.expenseFiles.length,
          message: `Successfully synced ${filesDownloaded} financial files from SharePoint`
        }
        break

      case 'folders':
        // List available folders
        const folders = await client.getFinancialDataFolders()
        result = folders
        break

      case 'test':
        // Test connection
        const siteInfo = await client.getSiteInfo()
        result = {
          connected: true,
          siteName: siteInfo.displayName,
          siteId: siteInfo.id
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid dataType. Use: income, folders, or test' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('SharePoint sync error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync with SharePoint' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SharePoint sync endpoint',
    usage: 'POST with { dataType: "income" | "folders" | "test" }'
  })
}
