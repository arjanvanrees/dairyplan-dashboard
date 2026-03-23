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
      <UPageHeader title="Fa. van Rees-Verhoef" description="Brandwijk" />

      <USeparator label="Vandaag" />
      <ProductionSummary
        :from-date="today"
        :to-date="tomorrow"
      />

      <USeparator label="Afgelopen 30 dagen" />
      <ProductionChart />

      <ProductionTable />
    </template>
  </UDashboardPanel>
</template>

<script setup>
const supabase = useSupabaseClient()

const today = ref(new Date())
today.value.setHours(0, 0, 0, 0)
const tomorrow = computed(() => {
  const d = new Date(today.value)
  d.setDate(d.getDate() + 1)
  return d
})

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

useHead({
  title: 'Dashboard - DairyPlan Dashboard'
})
</script>
