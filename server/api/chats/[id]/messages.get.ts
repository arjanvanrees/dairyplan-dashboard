import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '../../../../app/types/database.types'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const id = getRouterParam(event, 'id')

  const { data, error } = await supabase
    .from('messages')
    .select('id, role, parts, created_at')
    .eq('chat_id', id as string)
    .order('created_at', { ascending: true })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
