import { CallMetrics } from './supabase'

export let cachedData: CallMetrics | null = null
export let lastFetch: number | null = null
export const CACHE_DURATION = 4 * 60 * 1000

export function updateCache(data: CallMetrics) {
  cachedData = data
  lastFetch = Date.now()
}

export function clearCache() {
  cachedData = null
  lastFetch = null
  console.log('🗑️ Cache cleared')
}

export function getCachedData() {
  return { cachedData, lastFetch }
}

export function isCacheValid(): boolean {
  if (!cachedData || !lastFetch) return false
  const now = Date.now()
  return (now - lastFetch) < CACHE_DURATION
}

