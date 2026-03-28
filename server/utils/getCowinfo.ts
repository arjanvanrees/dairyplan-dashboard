import { tool } from '@ai-sdk/provider-utils'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database.types'

export const getCowInfo = (supabase: SupabaseClient<Database>) => tool({
  description: 'Get details about one or more cows (birth date, calving date, group, lactation number, status).',
  inputSchema: z.object({
    cow_number: z.number().optional().describe('The cow number to look up. Omit to list all cows.'),
    status_code: z.string().optional().describe('Filter cows by status code.')
  }),
  execute: async ({ cow_number }) => {
    let query = supabase.from('cows').select('*')
    if (cow_number !== undefined) query = query.eq('cow_number', cow_number)
    const { data, error } = await query.order('cow_number').limit(100)
    if (error) throw new Error(error.message)
    return { data }
  }
})
