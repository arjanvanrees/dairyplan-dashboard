<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <DateRangePicker
            v-model="dateRange"
            class="-ml-1"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UPageHeader
        title="Fa. van Rees-Verhoef"
        description="Brandwijk"
      />

      <ProductionSummary
        :from-date="dateRange.start"
        :to-date="toDate"
      />

      <ProductionChart
        :from-date="dateRange.start"
        :to-date="toDate"
      />

      <ProductionTable
        :from-date="dateRange.start"
        :to-date="toDate"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup>
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
thirtyDaysAgo.setHours(0, 0, 0, 0)

const today = new Date()
today.setHours(0, 0, 0, 0)

const dateRange = ref({ start: thirtyDaysAgo, end: today })

const toDate = computed(() => {
  const d = new Date(dateRange.value.end)
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
