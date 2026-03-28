import { tool } from '@ai-sdk/provider-utils'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database.types'

export const getTopProducers = (supabase: SupabaseClient<Database>) => tool({
  description: 'Get the top milk-producing cows for a given date or date range, ranked by total production.',
  inputSchema: z.object({
    date: z.string().optional().describe('A single date (YYYY-MM-DD).'),
    date_from: z.string().optional().describe('Start of date range (YYYY-MM-DD).'),
    date_to: z.string().optional().describe('End of date range (YYYY-MM-DD).'),
    limit: z.number().optional().default(10).describe('How many top cows to return (default 10).')
  }),
  execute: async ({ date, date_from, date_to, limit }) => {
    let query = supabase.from('milkings').select('cow_number, milk_weight_kg')
    if (date) {
      query = query
        .gte('milked_at', `${date}T00:00:00`)
        .lte('milked_at', `${date}T23:59:59`)
    } else {
      if (date_from) query = query.gte('milked_at', `${date_from}T00:00:00`)
      if (date_to) query = query.lte('milked_at', `${date_to}T23:59:59`)
    }
    const { data, error } = await query
    if (error) throw new Error(error.message)
    const totals: Record<number, number> = {}
    for (const m of data ?? []) {
      totals[m.cow_number] = (totals[m.cow_number] ?? 0) + m.milk_weight_kg
    }
    return Object.entries(totals)
      .map(([cow_number, total_kg]) => ({ cow_number: Number(cow_number), total_kg: Math.round(total_kg * 100) / 100 }))
      .sort((a, b) => b.total_kg - a.total_kg)
      .slice(0, limit ?? 10)
  }
})
