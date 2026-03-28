import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '../../../app/types/database.types'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { title } = await readBody<{ title?: string }>(event)

  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: user.id, title: title ?? 'Nieuw gesprek' })
    .select('id, title, created_at')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
