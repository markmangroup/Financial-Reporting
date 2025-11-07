import { NextResponse } from 'next/server'
import { loadConsultantData, getConsultantSummary } from '@/lib/consultantDataLoader'

export async function GET() {
  try {
    const consultants = loadConsultantData()
    const summary = getConsultantSummary(consultants)

    return NextResponse.json({
      consultants,
      summary
    })
  } catch (error: any) {
    console.error('Error loading consultant data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to load consultant data' },
      { status: 500 }
    )
  }
}
