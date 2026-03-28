import { streamText, convertToModelMessages, stepCountIs } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database, Json } from '../../app/types/database.types'

import { getCowInfo } from '../utils/getCowinfo'
import { getMilkings } from '../utils/getMilkings'
import { getMilkTests } from '../utils/getMilkTests'
import { getTopProducers } from '../utils/getTopProducers'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const openai = createOpenAI({
    apiKey: useRuntimeConfig().openaiApiKey
  })

  const { messages, chatId: incomingChatId } = await readBody(event)
  const supabase = serverSupabaseServiceRole<Database>(event)

  // Create a new chat if none was provided
  let chatId: string = incomingChatId
  if (!chatId) {
    const firstUserMessage = (messages as { role: string; parts?: { type: string; text?: string }[] }[]).find(m => m.role === 'user')
    const title: string = firstUserMessage?.parts?.find(p => p.type === 'text')?.text?.slice(0, 100) ?? 'Nieuw gesprek'
    const { data: newChat, error } = await supabase
      .from('chats')
      .insert({ user_id: user.id, title })
      .select('id')
      .single()
    if (error) throw createError({ statusCode: 500, message: error.message })
    chatId = newChat.id
  }

  // Persist the latest user message (last element of the messages array)
  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.role === 'user') {
    await supabase.from('messages').insert({
      chat_id: chatId,
      role: 'user',
      parts: lastMessage.parts ?? []
    })
  }
  const today = new Date().toISOString().split('T')[0]

  const system = `
    Je bent een behulpzame assistent voor een melkveebedrijf met toegang tot de Supabase database van het bedrijf.
    De datum van vandaag is ${today}.
    Je hebt toegang tot tools om informatie op te vragen over koeien, melkproductie en melkkwaliteitsmetingen.
    Melkproductie wordt gemeten in kilogram (kg). Tel individuele melkbeurten altijd op bij het rapporteren van dagelijkse totalen.
    Wees beknopt en specifiek bij het rapporteren van cijfers. Is een resultaat een lijst, presenteer deze dan in een tabel waar mogelijk.
    Antwoord in het Nederlands, tenzij specifiek gevraagd om in een andere taal te antwoorden.
    Als je informatie uit een tool krijgt, maak dan direct daarna een analyse daarop.
    Als je een datum en/of tijd presenteert, gebruik het juiste format voor de taal. Reken het om naar de juiste tijdzone van het bedrijf (Nederlandse tijd).

    Dit is wat de status_code betekenen in de database:
    0. Geen
    1. Kalf
    2. Vaars (kalf)
    3. Vaars
    4. Vers
    5. Vroeg
    6. Geaborteerd
    7. Insemineren
    8. Gust
    9. Geïnsemineerd
    10. Drachtig
    11. Drachtig 2
    12. Droog
    13. Lead
    14. Gebruiker
    15. Niet insemineren
    16. Afstoten

    Als je gevraagd wordt om de opbrengst van een koe of groep koeien te berekenen, gebruik dan de getMilkings tool om de individuele melkbeurten op te halen en tel deze bij elkaar op. Geef altijd het totale aantal kilogram melk dat geproduceerd is, afgerond op 2 decimalen. Als je een lijst van melkbeurten presenteert, geef dan ook de datum/tijd van elke melkbeurt. Vraag om de actuele melkprijs om de actuele opbrengst in euro's te berekenen.
  `

  return streamText({
    model: openai('gpt-5.1'),
    maxOutputTokens: 10000,
    stopWhen: stepCountIs(5),
    system: system,
    messages: await convertToModelMessages(messages),
    tools: {
      getCowInfo: getCowInfo(supabase),
      getMilkings: getMilkings(supabase),
      getMilkTests: getMilkTests(supabase),
      getTopProducers: getTopProducers(supabase)
    },
    onFinish: async ({ response }) => {
      // Save every assistant message produced during the (possibly multi-step) run
      for (const msg of response.messages) {
        if (msg.role !== 'assistant') continue
        const content = msg.content
        type CP = { type: string; text?: string; toolCallId?: string; toolName?: string; args?: unknown }
        const parts = (typeof content === 'string'
          ? [{ type: 'text', text: content }]
          : (content as CP[]).flatMap((part): CP[] => {
              if (part.type === 'text') return [{ type: 'text', text: part.text }]
              if (part.type === 'tool-call') {
                return [{ type: 'tool-call', toolCallId: part.toolCallId, toolName: part.toolName, args: part.args }]
              }
              return []
            })) as Json
        await supabase.from('messages').insert({ chat_id: chatId, role: 'assistant', parts })
      }
    }
  }).toUIMessageStreamResponse({
    headers: { 'X-Chat-Id': chatId }
  })
})
