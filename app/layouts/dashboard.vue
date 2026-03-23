<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible>
      <template #default="{ collapsed }">
        <UNavigationMenu
          :items="items"
          :collapsed="collapsed"
          orientation="vertical"
        />
      </template>

      <template #footer="{ collapsed }">
        <UDropdownMenu
          :items="userDropdownItems"
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

    <slot />
  </UDashboardGroup>
</template>

<script lang="ts" setup>
const client = useSupabaseClient()
const user = useSupabaseUser()

const colorMode = useColorMode()

const logout = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}

const items = [
  { label: 'Koeien', icon: 'mdi:cow', to: '/koeien' },
  { label: 'Productie', icon: 'i-heroicons-chart-bar-20-solid', to: '/productie' }
]

const userDropdownItems = [
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
