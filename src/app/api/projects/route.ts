import { NextResponse } from 'next/server'
import { loadAllProjects } from '@/lib/projectDataLoader'

export async function GET() {
  try {
    const projects = loadAllProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error loading projects:', error)
    return NextResponse.json([], { status: 500 })
  }
}
