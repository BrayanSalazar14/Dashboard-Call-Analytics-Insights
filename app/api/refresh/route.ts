import { NextResponse } from 'next/server'
import { getAllCalls, processCallData } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔄 Force refreshing data from Supabase...')
    
    const calls = await getAllCalls()
    const metrics = processCallData(calls)

    return NextResponse.json({
      success: true,
      data: metrics,
      lastUpdate: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Error refreshing metrics:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to refresh metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

