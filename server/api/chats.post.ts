import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '../../app/types/database.types'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)

  const openai = createOpenAI({
    apiKey: useRuntimeConfig().openaiApiKey
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { prompt } = await readBody<{ prompt?: string }>(event)

  const system = `
    Je bent een titlegenerator voor een chat van een melkveebedrijf:
    - Genereer een korte titel op basis van het eerste bericht van de gebruiker
    - De titel moet in het Nederlands zijn
    - Doorgaans gaan de vragen over koeien, melkproductie, melkkwaliteit of andere gerelateerde onderwerpen
    - De titel moet minder dan 30 tekens lang zijn
    - De titel moet een samenvatting zijn van het bericht van de gebruiker
    - Gebruik geen aanhalingstekens (\' of ") of dubbele punten (:) of andere leestekens
    - Gebruik geen markdown, alleen platte tekst
  `

  const { text: title } = await generateText({
    model: openai('gpt-4o-mini'),
    system: system,
    messages: [{ role: 'user', content: prompt }]
  })

  const { data: chat, error } = await supabase
    .from('chats')
    .insert({ user_id: user.id, title: title ?? 'Nieuw gesprek' })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  await supabase
    .from('messages')
    .insert({
      chat_id: chat.id,
      role: 'user',
      parts: [{ type: 'text', text: prompt }]
    })

  return chat
})
