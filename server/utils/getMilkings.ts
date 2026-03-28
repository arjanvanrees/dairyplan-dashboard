import { tool } from 'ai'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database.types'

export const getMilkings = (supabase: SupabaseClient<Database>) => tool({
  description: 'Get individual milking records. Use this to calculate how much a cow (or all cows) produced on a specific date or in a date range.',
  inputSchema: z.object({
    cow_number: z.number().optional().describe('Filter by cow number. Omit for all cows.'),
    date: z.string().optional().describe('A single date (YYYY-MM-DD). Returns all milkings that day.'),
    date_from: z.string().optional().describe('Start of date range (YYYY-MM-DD, inclusive).'),
    date_to: z.string().optional().describe('End of date range (YYYY-MM-DD, inclusive).')
  }),
  execute: async ({ cow_number, date, date_from, date_to }) => {
    let query = supabase.from('milkings').select('cow_number, milk_weight_kg, milked_at')
    if (cow_number !== undefined) query = query.eq('cow_number', cow_number)
    if (date) {
      query = query
        .gte('milked_at', `${date}T00:00:00`)
        .lte('milked_at', `${date}T23:59:59`)
    } else {
      if (date_from) query = query.gte('milked_at', `${date_from}T00:00:00`)
      if (date_to) query = query.lte('milked_at', `${date_to}T23:59:59`)
    }
    const { data, error } = await query.order('milked_at', { ascending: false }).limit(500)
    if (error) throw new Error(error.message)
    const total_kg = data?.reduce((sum, m) => sum + m.milk_weight_kg, 0) ?? 0
    return { milkings: data, total_kg: Math.round(total_kg * 100) / 100, count: data?.length ?? 0 }
  }
})
