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
      <ProductionSummary
        :today="today"
        :tomorrow="tomorrow"
      />

      <!-- <HomeChart /> -->

      <UTable
        :data="milkings ?? []"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r'
        }"
        class="flex-1 mt-10 !overflow-visible"
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

const columns = [
  {
    accessorKey: 'cow_number',
    header: 'Dier Nr.'
  },
  {
    accessorKey: 'cows.name',
    header: 'Naam'
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
