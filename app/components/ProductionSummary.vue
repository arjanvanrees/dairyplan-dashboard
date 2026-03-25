<template>
  <UPageGrid :ui="{ base: 'gap-6' }">
    <UPageCard
      title="Opbrengst"
      icon="lucide:milk"
      :ui="ui"
    >
      <span class="text-2xl font-semibold text-highlighted">
        {{ todayStats ? $n(todayStats.totalKg, 'single') : '…' }} kg
      </span>
    </UPageCard>

    <UPageCard
      title="Aantal dieren"
      icon="mdi:cow"
      :ui="ui"
    >
      <span class="text-2xl font-semibold text-highlighted">
        {{ todayStats ? todayStats.cowMin === todayStats.cowMax ? todayStats.cowMin : `${todayStats.cowMin}–${todayStats.cowMax}` : '…' }}
      </span>
    </UPageCard>
  </UPageGrid>
</template>

<script setup>
const supabase = useSupabaseClient()

const props = defineProps({
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  }
})

const { data: todayStats } = useLazyAsyncData(
  'today-stats-' + props.fromDate.toISOString(),
  async () => {
    const { data, error } = await supabase.rpc('daily_milk_production', {
      from_date: props.fromDate.toISOString(),
      to_date: props.toDate.toISOString()
    })
    if (error || !data?.length) return { totalKg: 0, cowMin: 0, cowMax: 0 }
    return {
      totalKg: data.reduce((sum, r) => sum + r.total_kg, 0),
      cowMin: Math.min(...data.map(r => r.cow_count)),
      cowMax: Math.max(...data.map(r => r.cow_count))
    }
  },
  { watch: [() => props.fromDate, () => props.toDate] }
)

const ui = {
  container: 'gap-y-1.5',
  leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
  title: 'font-normal text-muted text-xs uppercase'
}
</script>
