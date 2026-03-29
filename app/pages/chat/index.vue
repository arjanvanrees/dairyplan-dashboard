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

          <div
            v-for="chat in chats"
            :key="chat.id"
            class="flex group"
          >
            <ULink
              :to="`/chat/${chat.id}`"
              class="flex gap-2"
            >
              <Icon name="eva:clock-outline" class="size-6" />

              {{ chat.title }}
            </ULink>

            <Icon
              name="eva:trash-2-outline"
              class="ml-auto size-5 text-muted transition-opacity group-hover:opacity-100 opacity-0"
              @click.stop="deleteChat(chat.id)"
            />
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import ModalConfirm from '../../components/ModalConfirm.vue'

const overlay = useOverlay()
const toast = useToast()

const input = ref('')
const loading = ref(false)

interface ChatData {
  id: string
  title: string
}

const { data: chats, refresh: refreshChats } = await useAsyncData('chats', () => $fetch<ChatData[]>('/api/chats'))

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

const deleteModal = overlay.create(ModalConfirm, {
  props: {
    title: 'Chat verwijderen',
    description: 'Weet je zeker dat je deze chat wilt verwijderen? Dit kan niet ongedaan worden gemaakt.'
  }
})

async function deleteChat(id: string) {
  const instance = deleteModal.open()
  const result = await instance.result

  if (!result) return

  await $fetch(`/api/chats/${id}`, {
    method: 'DELETE'
  })

  toast.add({
    title: 'Chat verwijderd',
    description: 'De chat is succesvol verwijderd.',
    icon: 'i-lucide-check-circle'
  })

  await refreshChats()
}

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

useHead({
  title: 'Chat - DairyPlan Dashboard'
})
</script>
