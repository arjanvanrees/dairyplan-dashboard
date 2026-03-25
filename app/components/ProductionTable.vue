<template>
  <div class="ring ring-default rounded-lg">
    <UTable
      :data="dailyProduction ?? []"
      :columns="columns"
      :loading="status === 'pending'"
      :ui="{
        base: 'w-full min-w-xl',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'w-1/4'
      }"
      class="flex-1 !overflow-y-visible"
    >
      <!-- <template #cow_number-cell="{ row }">
        <NuxtLink :to="`/dieren/${row.original.cow_number}`" class="text-primary hover:underline">
          {{ row.original.cow_number }}
        </NuxtLink>
      </template> -->
    </UTable>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()

const props = defineProps({
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true }
})

const { data: dailyProduction, status } = useLazyAsyncData(
  'daily-production-table',
  async () => {
    const { data, error } = await supabase.rpc('daily_milk_production', {
      from_date: props.fromDate.toISOString(),
      to_date: props.toDate.toISOString()
    })
      .order('day', { ascending: false })

    if (error) {
      console.error('[daily-production] error:', error)
      return []
    }

    return data ?? []
  },
  { watch: [() => props.fromDate, () => props.toDate] }
)

const milksThreeTimes = computed(() =>
  (dailyProduction.value ?? []).some(r => r.session2_kg != null)
)

const kgCell = getValue => getValue() != null ? $n(getValue(), 'single') + ' kg' : '—'

const columns = computed(() => [
  {
    accessorKey: 'day',
    header: 'Datum',
    cell: ({ getValue }) => $d(new Date(getValue()), 'short', 'nl')
  },
  {
    accessorKey: 'session1_kg',
    header: 'Melking 1',
    cell: ({ getValue }) => kgCell(getValue)
  },
  ...(milksThreeTimes.value
    ? [{
        accessorKey: 'session2_kg',
        header: 'Melking 2',
        cell: ({ getValue }) => kgCell(getValue)
      }]
    : []),
  {
    accessorKey: 'session3_kg',
    header: milksThreeTimes.value ? 'Melking 3' : 'Melking 2',
    cell: ({ getValue }) => kgCell(getValue)
  },
  {
    accessorKey: 'total_kg',
    header: 'Totaal',
    cell: ({ getValue }) => $n(getValue(), 'single') + ' kg'
  }
])
</script>
