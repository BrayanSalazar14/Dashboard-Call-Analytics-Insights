export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getMetricsFromDB } from '@/lib/supabase'
import { isCacheValid, getCachedData, updateCache } from '@/lib/cache'

export async function GET() {
  try {
    const { cachedData, lastFetch } = getCachedData()

    // Return cached data if valid
    if (isCacheValid()) {
      console.log('📦 Returning cached data')
      return NextResponse.json({
        data: cachedData,
        cached: true,
        lastUpdate: new Date(lastFetch!).toISOString(),
      })
    }

    // Fetch metrics directly from Supabase (aggregated in DB)
    console.log('🔄 Fetching metrics from Supabase...')
    const metrics = await getMetricsFromDB()

    console.log(`✅ Fetched metrics: ${metrics.total_calls} total calls`)

    // Update cache
    updateCache(metrics)
    const { lastFetch: newLastFetch } = getCachedData()

    return NextResponse.json({
      data: metrics,
      cached: false,
      lastUpdate: new Date(newLastFetch!).toISOString(),
    })
  } catch (error) {
    console.error('❌ Error fetching metrics:', error)

    const { cachedData, lastFetch } = getCachedData()
    // Return cached data if available
    if (cachedData && lastFetch) {
      return NextResponse.json({
        data: cachedData,
        cached: true,
        warning: 'Using cached data due to fetch error',
        lastUpdate: new Date(lastFetch).toISOString(),
      })
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

