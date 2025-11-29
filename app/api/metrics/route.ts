import { NextResponse } from 'next/server'
import { getAllCalls, processCallData } from '@/lib/supabase'

// Cache configuration
let cachedData: any = null
let lastFetch: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET() {
  try {
    const now = Date.now()

    // Return cached data if valid
    if (cachedData && lastFetch && (now - lastFetch) < CACHE_DURATION) {
      return NextResponse.json({
        data: cachedData,
        cached: true,
        lastUpdate: new Date(lastFetch).toISOString(),
      })
    }

    // Fetch fresh data from Supabase
    console.log('🔄 Fetching fresh data from Supabase...')
    const calls = await getAllCalls()

    console.log(`✅ Fetched ${calls.length} calls`)

    if (calls.length === 0) {
      const emptyMetrics = {
        total_calls: 0,
        inbound: 0,
        outbound: 0,
        by_status: {},
        by_disconnection_reason: {},
      }

      cachedData = emptyMetrics
      lastFetch = now

      return NextResponse.json({
        data: emptyMetrics,
        cached: false,
        lastUpdate: new Date(lastFetch).toISOString(),
        warning: 'No calls found in database',
      })
    }

    // Process call data
    const metrics = processCallData(calls)

    // Update cache
    cachedData = metrics
    lastFetch = now

    return NextResponse.json({
      data: metrics,
      cached: false,
      lastUpdate: new Date(lastFetch).toISOString(),
    })
  } catch (error) {
    console.error('❌ Error fetching metrics:', error)

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

