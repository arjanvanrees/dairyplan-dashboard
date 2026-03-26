<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Dashboard">
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
              <!-- {{ part }} -->
              <pre>
                {{ JSON.stringify(part.output, null, 2) }}
              </pre>
              <!-- <pre
                v-if="part.toolInvocation.state === 'output-available'"
                class="mt-1 overflow-x-auto rounded bg-gray-100 p-3 text-sm dark:bg-gray-800"
              >{{ JSON.stringify(part.toolInvocation.output, null, 2) }}</pre> -->
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
import { isReasoningUIPart, isTextUIPart, isToolUIPart, getToolName } from 'ai'
import { Chat } from '@ai-sdk/vue'
import { isReasoningStreaming, isToolStreaming } from '@nuxt/ui/utils/ai'

import { ref } from 'vue'

const input = ref('')
const chat = new Chat({})

function onSubmit() {
  chat.sendMessage({ text: input.value })

  input.value = ''
}

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>
