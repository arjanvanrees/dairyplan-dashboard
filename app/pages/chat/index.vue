<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Chat">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 flex-1 justify-center">
        <UChatPrompt
          v-model="input"
          :status="loading ? 'streaming' : 'ready'"
          placeholder="Stel je vraag &hellip;"
          @submit="onSubmit"
        >
          <UChatPromptSubmit :status="loading ? 'streaming' : 'ready'" />
        </UChatPrompt>

        <div class="flex flex-col gap-2">
          <h4 class="font-semibold">
            Of ga verder
          </h4>

          <ULink
            v-for="chat in chats"
            :key="chat.id"
            :to="`/chat/${chat.id}`"
            class="flex gap-2"
          >
            <Icon name="eva:clock-outline" class="size-6" />

            {{ chat.title }}
          </ULink>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const input = ref('')
const loading = ref(false)

interface ChatData {
  id: string
  title: string
}

const chats = await $fetch<ChatData[]>('/api/chats')

async function createChat() {
  loading.value = true

  const chat = await $fetch<ChatData>('/api/chats', {
    method: 'POST',
    body: { prompt: input.value }
  })

  navigateTo(`/chat/${chat?.id}`)
}

function onSubmit() {
  createChat()
}

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

useHead({
  title: 'Chat - DairyPlan Dashboard'
})
</script>
