<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body></template>
  </UDashboardPanel>
</template>

<script setup>
const supabase = useSupabaseClient()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

useHead({
  title: 'Dashboard - DairyPlan Dashboard'
})
</script>
