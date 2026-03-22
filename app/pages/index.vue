<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Dagproductie">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <DatePicker v-model="today" class="-ml-1" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UPageGrid>
        <UPageCard title="Opbrengst in kg">
          <span class="text-2xl font-semibold text-highlighted">
            {{ todayStats ? Number(todayStats.totalKg).toFixed(2) : '…' }} kg
          </span>
        </UPageCard>

        <UPageCard title="Aantal koeien">
          <span class="text-2xl font-semibold text-highlighted">
            {{ todayStats ? todayStats.cowCount : '…' }}
          </span>
        </UPageCard>
      </UPageGrid>

      <UTable
        :data="milkings ?? []"
        :columns="columns"
        :loading="status === 'pending'"
        class="flex-1 mt-10"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup>
const supabase = useSupabaseClient()

definePageMeta({
  layout: 'dashboard'
})

const today = ref(new Date())
today.value.setHours(0, 0, 0, 0)
const tomorrow = computed(() => {
  const d = new Date(today.value)
  d.setDate(d.getDate() + 1)
  return d
})

const { data: milkings, status } = useLazyAsyncData(
  'milkings-today',
  () => supabase
    .from('milkings')
    .select('cow_number, milk_weight_kg, milked_at, cows!inner(name)')
    .gte('milked_at', today.value.toISOString())
    .lt('milked_at', tomorrow.value.toISOString())
    .then(({ data }) => data),
  { watch: [today] }
)

const { data: todayStats } = useLazyAsyncData(
  'milkings-today-kg',
  () => supabase
    .from('milkings')
    .select('milk_weight_kg, cow_number')
    .gte('milked_at', today.value.toISOString())
    .lt('milked_at', tomorrow.value.toISOString())
    .then(({ data }) => ({
      totalKg: data?.reduce((sum, r) => sum + r.milk_weight_kg, 0) ?? 0,
      cowCount: new Set(data?.map(r => r.cow_number)).size
    })),
  { watch: [today] }
)

const columns = [
  {
    accessorKey: 'cow_number',
    header: 'Dier Nr.'
  },
  {
    accessorKey: 'milk_weight_kg',
    header: 'Opbrengst',
    cell: ({ getValue }) => `${getValue()} kg`
  },
  {
    accessorKey: 'milked_at',
    header: 'Tijdstip',
    cell: ({ getValue }) => new Date(getValue()).toLocaleTimeString()
  }
]
</script>
