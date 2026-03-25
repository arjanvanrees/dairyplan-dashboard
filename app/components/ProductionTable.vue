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
        td: 'w-1/3'
      }"
      class="flex-1 !overflow-y-visible"
    />
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

const columns = [
  {
    accessorKey: 'day',
    header: 'Datum',
    cell: ({ getValue }) => $d(new Date(getValue()), 'short', 'nl')
  },
  {
    accessorKey: 'total_kg',
    header: 'Opbrengst',
    cell: ({ getValue }) => { return $n(getValue(), 'single') + ' kg' }
  },
  {
    accessorKey: 'cow_count',
    header: 'Aantal dieren'
  }
]
</script>
