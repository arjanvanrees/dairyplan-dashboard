import { streamText, convertToModelMessages, stepCountIs } from 'ai'
import { tool } from '@ai-sdk/provider-utils'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '../../app/types/database.types'

export default defineEventHandler(async (event) => {
  const openai = createOpenAI({
    apiKey: useRuntimeConfig().openaiApiKey
  })

  const { messages } = await readBody(event)
  const supabase = serverSupabaseServiceRole<Database>(event)
  const today = new Date().toISOString().split('T')[0]

  const system = `
    Je bent een behulpzame assistent voor een melkveebedrijf met toegang tot de Supabase database van het bedrijf.
    De datum van vandaag is ${today}.
    Je hebt toegang tot tools om informatie op te vragen over koeien, melkproductie en melkkwaliteitsmetingen.
    Melkproductie wordt gemeten in kilogram (kg). Tel individuele melkbeurten altijd op bij het rapporteren van dagelijkse totalen.
    Wees beknopt en specifiek bij het rapporteren van cijfers. Is een resultaat een lijst, presenteer deze dan in een tabel waar mogelijk.
    Antwoord in het Nederlands, tenzij specifiek gevraagd om in een andere taal te antwoorden.
    Als je informatie uit een tool krijgt, maak dan direct daarna een analyse daarop.
  `


  return streamText({
    model: openai('gpt-5.1'),
    maxOutputTokens: 10000,
    stopWhen: stepCountIs(5),
    system: system,
    messages: await convertToModelMessages(messages),
    tools: {
      getCowInfo: tool({
        description: 'Get details about one or more cows (birth date, calving date, group, lactation number, status).',
        inputSchema: z.object({
          cow_number: z.number().optional().describe('The cow number to look up. Omit to list all cows.'),
          status_code: z.string().optional().describe('Filter cows by status code.')
        }),
        execute: async ({ cow_number, status_code }) => {
          let query = supabase.from('cows').select('*')
          if (cow_number !== undefined) query = query.eq('cow_number', cow_number)
          // if (status_code !== undefined) query = query.eq('status_code', status_code)
          const { data, error } = await query.order('cow_number').limit(100)
          if (error) throw new Error(error.message)
          return { data }
        }
      }),

      getMilkings: tool({
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
      }),

      getMilkTests: tool({
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
      }),

      getTopProducers: tool({
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
    }
  }).toUIMessageStreamResponse()
})
