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
      title="Aantal koeien"
      icon="mdi:cow"
      :ui="ui"
    >
      <span class="text-2xl font-semibold text-highlighted">
        {{ todayStats ? todayStats.cowCount : '…' }}
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
  () => supabase
    .from('milkings')
    .select('milk_weight_kg, cow_number')
    .gte('milked_at', props.fromDate.toISOString())
    .lt('milked_at', props.toDate.toISOString())
    .then(({ data }) => ({
      totalKg: data?.reduce((sum, r) => sum + r.milk_weight_kg, 0) ?? 0,
      cowCount: new Set(data?.map(r => r.cow_number)).size
    })),
  { watch: [() => props.fromDate, () => props.toDate] }
)

const ui = {
  container: 'gap-y-1.5',
  leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
  title: 'font-normal text-muted text-xs uppercase'
}
</script>
