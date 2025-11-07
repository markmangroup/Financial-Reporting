import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Define possible credit card file paths
    const possibleFiles = [
      'Chase8008_Activity20230929_20250929_20250929.CSV',
      'chase_credit_card.csv',
      'credit_card.csv',
      'chase.csv'
    ]

    const dataDir = join(process.cwd(), 'data')

    for (const fileName of possibleFiles) {
      const filePath = join(dataDir, fileName)

      try {
        console.log(`API: Attempting to load credit card data from: ${filePath}`)
        const csvContent = readFileSync(filePath, 'utf-8')

        if (csvContent.trim().length === 0) {
          console.warn(`API: File ${fileName} is empty`)
          continue
        }

        console.log(`API: Successfully loaded credit card data from ${fileName}`)
        return new NextResponse(csvContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Cache-Control': 'public, max-age=300' // 5 minute cache
          }
        })

      } catch (fileError) {
        console.log(`API: Could not load ${fileName}: ${fileError}`)
        continue
      }
    }

    console.warn('API: No valid credit card data files found in /data directory')
    return new NextResponse('Credit card data not found', { status: 404 })

  } catch (error) {
    console.error('API: Error loading credit card data:', error)
    return new NextResponse('Error loading credit card data', { status: 500 })
  }
}