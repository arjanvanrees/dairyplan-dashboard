import { tool } from '@ai-sdk/provider-utils'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database.types'

export const getMilkTests = (supabase: SupabaseClient<Database>) => tool({
  description: 'Get milk quality test results for a cow, including fat %, protein %, lactose %, SCC, and MUN.',
  inputSchema: z.object({
    cow_number: z.number().optional().describe('Filter by cow number. Omit for all cows.'),
    date_from: z.string().optional().describe('Start date (YYYY-MM-DD).'),
    date_to: z.string().optional().describe('End date (YYYY-MM-DD).')
  }),
  execute: async ({ cow_number, date_from, date_to }) => {
    let query = supabase.from('milk_tests').select('*')
    if (cow_number !== undefined) query = query.eq('cow_number', cow_number)
    if (date_from) query = query.gte('test_date', date_from)
    if (date_to) query = query.lte('test_date', date_to)
    const { data, error } = await query.order('test_date', { ascending: false }).limit(100)
    if (error) throw new Error(error.message)
    return data
  }
})
