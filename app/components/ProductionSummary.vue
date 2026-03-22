<template>
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

<style>

</style>
