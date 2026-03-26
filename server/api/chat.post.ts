import { streamText, convertToModelMessages } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export default defineEventHandler(async (event) => {
  const openai = createOpenAI({
    apiKey: useRuntimeConfig().openaiApiKey
  })

  const { messages } = await readBody(event)

  return streamText({
    model: openai('gpt-5.1'),
    maxOutputTokens: 10000,
    system: 'You are a helpful assistant.',
    messages: await convertToModelMessages(messages)
  }).toUIMessageStreamResponse()
})
