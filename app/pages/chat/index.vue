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

        <ListChats />
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
  layout: 'dashboard'
})

useHead({
  title: 'Chat - DairyPlan Dashboard'
})
</script>
