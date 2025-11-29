import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseTable = process.env.SUPABASE_TABLE || 'retell_calls'

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey)
export const SUPABASE_TABLE = supabaseTable

export interface RetellCall {
  id?: number
  call_id: string
  from_number: string
  to_number: string
  direction: 'inbound' | 'outbound' | null
  call_status: string | null
  disconnection_reason: string | null
  created_at?: string
}

export interface CallMetrics {
  total_calls: number
  inbound: number
  outbound: number
  by_status: Record<string, number>
  by_disconnection_reason: Record<string, number>
}

export async function getAllCalls(): Promise<RetellCall[]> {
  let allCalls: RetellCall[] = []
  let from = 0
  const pageSize = 1000
  let hasMore = true

  console.log('📊 Starting to fetch all calls from Supabase...')

  while (hasMore) {
    const to = from + pageSize - 1
    
    const { data, error, count } = await supabase
      .from(supabaseTable)
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('id', { ascending: true })

    if (error) {
      console.error('❌ Error fetching calls:', error)
      throw new Error(`Supabase error: ${error.message}`)
    }

    if (count !== null && from === 0) {
      console.log(`📈 Total records in database: ${count}`)
    }

    if (data && data.length > 0) {
      allCalls = allCalls.concat(data)
      
      if (data.length < pageSize) {
        hasMore = false
        console.log('   ℹ️ Last page reached')
      } else {
        from += pageSize
      }
    } else {
      hasMore = false
      console.log('   ℹ️ No more data')
    }
  }

  console.log(`✅ Finished fetching. Total calls retrieved: ${allCalls.length}`)
  return allCalls
}

export function processCallData(calls: RetellCall[]): CallMetrics {
  const metrics: CallMetrics = {
    total_calls: calls.length,
    inbound: 0,
    outbound: 0,
    by_status: {},
    by_disconnection_reason: {},
  }

  calls.forEach((call) => {
    if (call.direction === 'inbound') {
      metrics.inbound++
    } else if (call.direction === 'outbound') {
      metrics.outbound++
    }

    const status = call.call_status || 'sin_status'
    metrics.by_status[status] = (metrics.by_status[status] || 0) + 1

    const reason = call.disconnection_reason || 'sin_razon'
    metrics.by_disconnection_reason[reason] = (metrics.by_disconnection_reason[reason] || 0) + 1
  })

  return metrics
}

