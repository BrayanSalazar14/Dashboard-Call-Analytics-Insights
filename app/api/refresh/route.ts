export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAllCalls, processCallData } from '@/lib/supabase'
import { clearCache, updateCache, getCachedData } from '@/lib/cache'

export async function POST() {
  try {
    console.log('🔄 Force refreshing data from Supabase...')
    
    // Clear the cache first
    clearCache()
    
    // Fetch fresh data
    const calls = await getAllCalls()
    const metrics = processCallData(calls)
    
    // Update cache with new data
    updateCache(metrics)
    const { lastFetch } = getCachedData()

    console.log(`✅ Cache updated at ${new Date(lastFetch!).toISOString()}`)

    return NextResponse.json({
      success: true,
      data: metrics,
      cached: false,
      lastUpdate: new Date(lastFetch!).toISOString(),
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

