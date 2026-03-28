import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '../../../app/types/database.types'

import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { data, error } = await supabase
    .from('chats')
    .select('id, title, created_at, messages(*)')
    .eq('id', id)
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
