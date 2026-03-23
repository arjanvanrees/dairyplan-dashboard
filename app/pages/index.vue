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

      <div class="ring ring-default rounded-lg">
        <div class="flex px-4 py-3.5">
          <UInput
            v-model="globalFilter"
            class="max-w-sm"
            placeholder="Filter..."
            icon="eva:search-outline"
          />
        </div>

        <UTable
          ref="table"
          v-model:pagination="pagination"
          v-model:global-filter="globalFilter"
          :data="milkings ?? []"
          :columns="columns"
          :loading="status === 'pending'"
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel()
          }"
          :ui="{
            base: 'w-full min-w-xl',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'w-1/5'
          }"
          class="flex-1 !overflow-y-visible"
        />

        <div class="flex justify-end border-t border-default py-4 px-4">
          <UPagination
            :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="filteredCount"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup>
import { getPaginationRowModel } from '@tanstack/vue-table'

const supabase = useSupabaseClient()

const globalFilter = ref('')
const table = useTemplateRef('table')
const filteredCount = computed(() => table.value?.tableApi?.getFilteredRowModel().rows.length ?? 0)

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Dagproductie - DairyPlan Dashboard'
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
    .order('milked_at', { ascending: true })
    .then(({ data }) => {
      const byCoW = (data ?? []).reduce((acc, row) => {
        if (!acc[row.cow_number]) {
          acc[row.cow_number] = {
            cow_number: row.cow_number,
            name: row.cows?.name ?? null,
            milk_weight_kg: 0,
            milk_weight_kg_session_1: 0,
            milk_weight_kg_session_2: 0,
            sessions: 0
          }
        }
        const cow = acc[row.cow_number]
        cow[`milk_weight_kg_session_${cow.sessions + 1}`] += row.milk_weight_kg
        cow.milk_weight_kg += row.milk_weight_kg
        cow.sessions += 1
        return acc
      }, {})
      return Object.values(byCoW).sort((a, b) => a.cow_number - b.cow_number)
    }),
  { watch: [today] }
)

const columns = [
  {
    accessorKey: 'cow_number',
    header: 'Nr.'
  },
  {
    accessorKey: 'name',
    header: 'Naam'
  },
  {
    accessorKey: 'milk_weight_kg_session_1',
    header: '\'s ochtends',
    cell: ({ getValue }) => { return $n(getValue(), 'single') + 'kg' }
  },
  {
    accessorKey: 'milk_weight_kg_session_2',
    header: '\'s avonds',
    cell: ({ getValue }) => { return $n(getValue(), 'single') + 'kg' }
  },
  {
    accessorKey: 'milk_weight_kg',
    header: 'Totaal',
    cell: ({ getValue }) => { return $n(getValue(), 'single') + 'kg' }
  }
]

const pagination = ref({
  pageIndex: 0,
  pageSize: 50
})
</script>
