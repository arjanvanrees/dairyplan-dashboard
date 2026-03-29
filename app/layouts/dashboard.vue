<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible>
      <template #header="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :items="menuItems"
          :collapsed="collapsed"
          orientation="vertical"
        />
      </template>

      <template #footer="{ collapsed }">
        <UDropdownMenu
          :items="userItems"
          :content="{ align: 'center', collisionPadding: 12 }"
          :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
        >
          <UButton
            :label="collapsed ? undefined : user?.email"
            icon="i-lucide-user"
            color="neutral"
            variant="ghost"
            class="w-full"
            :square="collapsed"
            :trailing-icon="collapsed ? undefined : 'i-lucide-chevron-up'"
            :ui="{
              trailingIcon: 'ml-auto'
            }"
          />
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <UDashboardSearch
      placeholder="Zoek chats..."
      :groups="[{
        id: 'links',
        items: [{
          label: 'Nieuwe chat',
          to: '/chat',
          icon: 'i-lucide-square-pen'
        }]
      }, ...chatItems]"
    />

    <slot />
  </UDashboardGroup>
</template>

<script lang="ts" setup>
const client = useSupabaseClient()
const user = useSupabaseUser()

const colorMode = useColorMode()

interface ChatData {
  id: string
  title: string
}

const chats = await $fetch<ChatData[]>('/api/chats')

const chatItems = computed(() => {
  return [{
    id: 'recent-chats',
    label: 'Recente chats',
    type: 'label' as const,
    items: chats.map(chat => ({
      slot: 'chat' as const,
      label: chat.title,
      to: `/chat/${chat.id}`,
      icon: 'eva:clock-outline'
    }))
  }]
})

const menuItems = [
  { label: 'Dashboard', icon: 'i-heroicons-home-20-solid', to: '/' },
  { label: 'Dieren', icon: 'mdi:cow', to: '/dieren' },
  { label: 'Productie', icon: 'i-heroicons-chart-bar-20-solid', to: '/productie' },
  { label: 'Chat', icon: 'i-heroicons-chat-bubble-oval-left-solid', to: '/chat' }
]

const logout = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}

const userItems = [
  {
    label: 'Kleurmodus',
    icon: 'i-lucide-sun-moon',
    children: [
      {
        label: 'Licht',
        icon: 'i-lucide-sun',
        type: 'checkbox',
        checked: colorMode.value === 'light',
        onUpdateChecked(checked: boolean) {
          if (checked) {
            colorMode.preference = 'light'
          }
        },
        onSelect(e: Event) {
          e.preventDefault()

          colorMode.preference = 'light'
        }
      },
      {
        label: 'Donker',
        icon: 'i-lucide-moon',
        type: 'checkbox',
        checked: colorMode.value === 'dark',
        onUpdateChecked(checked: boolean) {
          if (checked) {
            colorMode.preference = 'dark'
          }
        },
        onSelect(e: Event) {
          e.preventDefault()

          colorMode.preference = 'dark'
        }
      }
    ]
  },
  {
    label: 'Uitloggen',
    icon: 'i-lucide-log-out',
    onSelect: logout
  }
]
</script>
