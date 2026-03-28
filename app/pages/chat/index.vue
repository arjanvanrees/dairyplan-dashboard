<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="currentTitle">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex h-full overflow-hidden">
        <!-- Chat list sidebar -->
        <aside class="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-700">
            <span class="text-sm font-medium">Gesprekken</span>
            <UButton
              icon="i-heroicons-plus"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="startNewChat"
            />
          </div>
          <div class="flex flex-col gap-0.5 p-2">
            <button
              v-for="c in chats"
              :key="c.id"
              class="w-full truncate rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="currentChatId === c.id ? 'bg-gray-100 font-medium dark:bg-gray-800' : ''"
              @click="loadChat(c.id)"
            >
              {{ c.title || 'Gesprek' }}
            </button>
            <p
              v-if="chats.length === 0"
              class="px-3 py-2 text-sm text-gray-400 dark:text-gray-500"
            >
              Nog geen gesprekken
            </p>
          </div>
        </aside>

        <!-- Main chat area -->
        <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
          <UChatMessages
            :messages="currentChat.messages"
            :status="currentChat.status"
            class="flex-1 overflow-y-auto"
          >
            <template #content="{ message }">
              <template
                v-for="(part, index) in message.parts"
                :key="`${message.id}-${part.type}-${index}`"
              >
                <UChatReasoning
                  v-if="isReasoningUIPart(part)"
                  :text="part.text"
                  :streaming="isReasoningStreaming(message, index, currentChat)"
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
            class="shrink-0"
            placeholder="Stel je vraag &hellip;"
            :error="currentChat.error"
            @submit="onSubmit"
          >
            <UChatPromptSubmit
              :status="currentChat.status"
              @stop="currentChat.stop()"
              @reload="currentChat.regenerate()"
            />
          </UChatPrompt>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import {
  isReasoningUIPart,
  isTextUIPart,
  isToolUIPart,
  getToolName,
  lastAssistantMessageIsCompleteWithToolCalls,
  DefaultChatTransport
} from 'ai'
import type { UIMessage } from 'ai'
import { Chat } from '@ai-sdk/vue'
import { isReasoningStreaming, isToolStreaming } from '@nuxt/ui/utils/ai'

interface ChatListItem {
  id: string
  title: string | null
  created_at: string
}

interface MessageRow {
  id: string
  role: 'user' | 'assistant'
  parts: unknown
  created_at: string
}

const input = ref('')
const currentChatId = ref<string | null>(null)
const chats = ref<ChatListItem[]>([])

const currentTitle = computed(() =>
  chats.value.find(c => c.id === currentChatId.value)?.title ?? 'Chat'
)

function buildChat(chatId?: string, messages: UIMessage[] = []) {
  return new Chat({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    messages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: chatId ? { chatId } : undefined
    })
  })
}

const currentChat = shallowRef(buildChat())

async function fetchChats() {
  chats.value = await $fetch<ChatListItem[]>('/api/chats')
}

async function loadChat(id: string) {
  if (currentChatId.value === id) return

  const rows = await $fetch<MessageRow[]>(`/api/chats/${id}/messages`)
  currentChatId.value = id

  const uiMessages: UIMessage[] = rows.map(m => ({
    id: m.id,
    role: m.role,
    parts: (Array.isArray(m.parts) ? m.parts : []) as UIMessage['parts'],
    createdAt: new Date(m.created_at)
  }))

  currentChat.value = buildChat(id, uiMessages)
}

function startNewChat() {
  currentChatId.value = null
  currentChat.value = buildChat()
  input.value = ''
}

async function onSubmit() {
  if (!input.value.trim()) return

  if (!currentChatId.value) {
    const newChat = await $fetch<ChatListItem>('/api/chats', {
      method: 'POST',
      body: { title: input.value.slice(0, 100) }
    })
    currentChatId.value = newChat.id
    currentChat.value = buildChat(newChat.id)
    chats.value.unshift(newChat)
  }

  currentChat.value.sendMessage({ text: input.value })
  input.value = ''
}

await fetchChats()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>
