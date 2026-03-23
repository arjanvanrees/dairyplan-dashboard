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

const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
thirtyDaysAgo.setHours(0, 0, 0, 0)

const { data: dailyProduction } = useLazyAsyncData(
  'daily-production',
  async () => {
    const { data, error } = await supabase.rpc('daily_milk_production', {
      from_date: thirtyDaysAgo.toISOString(),
      to_date: new Date().toISOString()
    })

    if (error) {
      console.error('[daily-production] error:', error)
      return []
    }

    return data ?? []
  }
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
    header: 'Aantal koeien'
  }
]
</script>
