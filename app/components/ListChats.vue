<template>
  <div class="flex flex-col gap-2">
    <h4 class="px-2.5 font-semibold">
      Of ga verder
    </h4>

    <UNavigationMenu
      :items="items"
      orientation="vertical"
    >
      <template #chat-trailing="{ item }">
        <UButton
          icon="i-lucide-trash-2"
          color="neutral"
          variant="ghost"
          size="xs"
          class="text-muted transition-opacity opacity-0 group-hover:opacity-100"
          tabindex="-1"
          @click.stop="deleteChat(item.id)"
        />
      </template>
    </UNavigationMenu>
  </div>
</template>

<script lang="ts" setup>
import ModalConfirm from './ModalConfirm.vue'

const overlay = useOverlay()
const toast = useToast()

interface ChatData {
  id: string
  title: string
}

const { data: chats, refresh: refreshChats } = await useAsyncData('chats', () => $fetch<ChatData[]>('/api/chats'))

const items = chats.value?.map(chat => ({
  label: chat.title,
  to: `/chat/${chat.id}`,
  slot: 'chat' as const,
  icon: 'eva:clock-outline'
}))

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
</script>
