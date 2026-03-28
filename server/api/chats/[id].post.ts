import { createUIMessageStream, streamText, convertToModelMessages, stepCountIs, createUIMessageStreamResponse } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '../../../app/types/database.types'

import { getCowInfo } from '../../utils/getCowinfo'
import { getMilkings } from '../../utils/getMilkings'
import { getMilkTests } from '../../utils/getMilkTests'
import { getTopProducers } from '../../utils/getTopProducers'

import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const openai = createOpenAI({
    apiKey: useRuntimeConfig().openaiApiKey
  })

  const { messages } = await readBody(event)
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

  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.role === 'user' && messages.length > 1) {
    await supabase.from('messages').insert({
      chat_id: id,
      role: 'user',
      parts: lastMessage.parts
    })
  }

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: openai('gpt-5.4'),
        maxOutputTokens: 10000,
        stopWhen: stepCountIs(5),
        system: system,
        messages: await convertToModelMessages(messages),
        tools: {
          getCowInfo: getCowInfo(supabase),
          getMilkings: getMilkings(supabase),
          getMilkTests: getMilkTests(supabase),
          getTopProducers: getTopProducers(supabase)
        }
      })

      writer.merge(result.toUIMessageStream({
        sendReasoning: true
      }))
    },
    onFinish: async ({ messages }) => {
      await supabase.from('messages').insert(
        messages.map(message => ({
          chat_id: id,
          role: message.role as 'user' | 'assistant',
          parts: message.parts
        }))
      )
    }
  })

  return createUIMessageStreamResponse({
    stream
  })
})

