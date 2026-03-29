import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '../../../app/types/database.types'

import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  console.log('hit')

  return await supabase
    .from('chats')
    .delete()
    .eq('id', id)
})
