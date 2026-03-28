import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '../../../app/types/database.types'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)

  const { data, error } = await supabase
    .from('chats')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
