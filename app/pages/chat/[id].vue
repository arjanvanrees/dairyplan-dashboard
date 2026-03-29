<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="chatData.title">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UChatMessages
        :messages="chat.messages"
        :status="chat.status"
      >
        <template #content="{ message }">
          <template
            v-for="(part, index) in message.parts"
            :key="`${message.id}-${part.type}-${index}`"
          >
            <UChatReasoning
              v-if="isReasoningUIPart(part)"
              :text="part.text"
              :streaming="isReasoningStreaming(message, index, chat)"
            >
              <MDC
                :value="part.text"
                :cache-key="`reasoning-${message.id}-${index}`"
                class="*:first:mt-0 *:last:mb-0"
              />
            </UChatReasoning>

            <template v-else-if="isToolUIPart(part)">
              <UChatTool
                :text="getToolName(part)"
                :streaming="isToolStreaming(part)"
              />
              <ChatSources>
                {{ JSON.stringify(part.output, null, 2) }}
              </ChatSources>
            </template>

            <MDC
              v-if="isTextUIPart(part)"
              :value="part.text"
              :cache-key="`${message.id}-${index}`"
              class="*:first:mt-0 *:last:mb-0"
            />
          </template>
        </template>
      </UChatMessages>

      <UChatPrompt
        v-model="input"
        class="sticky bottom-0"
        placeholder="Stel je vraag &hellip;"
        :error="chat.error"
        @submit="onSubmit"
      >
        <UChatPromptSubmit
          :status="chat.status"
          @stop="chat.stop()"
          @reload="chat.regenerate()"
        />
      </UChatPrompt>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { UIMessage } from 'ai'
import { isReasoningUIPart, isTextUIPart, isToolUIPart, getToolName, DefaultChatTransport } from 'ai'
import { Chat } from '@ai-sdk/vue'
import { isReasoningStreaming, isToolStreaming } from '@nuxt/ui/utils/ai'

const route = useRoute()
const toast = useToast()

interface ChatData {
  id: string
  title: string
  messages: UIMessage[]
}

const chatData = await $fetch<ChatData>(`/api/chats/${route.params.id}`)

const input = ref('')

const chat = new Chat({
  id: chatData.id,
  messages: chatData.messages,
  transport: new DefaultChatTransport({
    api: `/api/chats/${chatData.id}`
  }),
  onError(error) {
    const { message } = typeof error.message === 'string' && error.message[0] === '{' ? JSON.parse(error.message) : error

    toast.add({
      description: message,
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 0
    })
  }
})

function onSubmit() {
  chat.sendMessage({ text: input.value })

  input.value = ''
}

onMounted(() => {
  if (chatData.messages?.length === 1) {
    chat.regenerate()
  }
})

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: `${chatData.title} - DairyPlan Dashboard`
})
</script>
