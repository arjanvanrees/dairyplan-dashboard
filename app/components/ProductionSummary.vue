<template>
  <UPageGrid :ui="{ base: 'gap-6' }">
    <UPageCard
      title="Opbrengst in kg"
      icon="lucide:milk"
      :ui="{
        container: 'gap-y-1.5',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }"
    >
      <span class="text-2xl font-semibold text-highlighted">
        {{ todayStats ? $n(todayStats.totalKg, 'single') : '…' }} kg
      </span>
    </UPageCard>

    <UPageCard
      title="Aantal koeien"
      icon="mdi:cow"
      :ui="{
        container: 'gap-y-1.5',
        leading: 'p-2.5 rounded-full bg-green-500/10 ring ring-inset ring-green-500/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }">
      <span class="text-2xl font-semibold text-highlighted">
        {{ todayStats ? todayStats.cowCount : '…' }}
      </span>
    </UPageCard>
  </UPageGrid>
</template>

<script setup>
const supabase = useSupabaseClient()

const props = defineProps({
  today: {
    type: Date,
    required: true
  },
  tomorrow: {
    type: Date,
    required: true
  }
})

const { data: todayStats } = useLazyAsyncData(
  'today-stats',
  () => supabase
    .from('milkings')
    .select('milk_weight_kg, cow_number')
    .gte('milked_at', props.today.toISOString())
    .lt('milked_at', props.tomorrow.toISOString())
    .then(({ data }) => ({
      totalKg: data?.reduce((sum, r) => sum + r.milk_weight_kg, 0) ?? 0,
      cowCount: new Set(data?.map(r => r.cow_number)).size
    })),
  { watch: [() => props.today] }
)
</script>
