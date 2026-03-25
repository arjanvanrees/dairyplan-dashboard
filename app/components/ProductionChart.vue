<template>
  <UPageCard title="Productie per dag">
    <AreaChart
      :data="dailyChartData ?? []"
      :categories="dailyCategories"
      :height="250"
      :x-formatter="dailyXFormatter"
      :y-domain="[0, undefined]"
      :hide-y-axis="false"
      :hide-legend="true"
    />
  </UPageCard>
</template>

<script setup>
const supabase = useSupabaseClient()

const props = defineProps({
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true }
})

const { data: dailyProduction } = useLazyAsyncData(
  'daily-production-chart',
  async () => {
    const { data, error } = await supabase.rpc('daily_milk_production', {
      from_date: props.fromDate.toISOString(),
      to_date: props.toDate.toISOString()
    })
    if (error) {
      console.error('[daily-production] error:', error)
      return []
    }
    return data ?? []
  },
  { watch: [() => props.fromDate, () => props.toDate] }
)

const dailyChartData = computed(() =>
  (dailyProduction.value ?? []).map(row => ({
    day: new Date(row.day).toLocaleDateString('nl-NL', { day: 'numeric', month: 'numeric' }),
    production: row.total_kg
  }))
)

const dailyCategories = {
  production: { name: 'Productie (kg)', color: '#22c55e' }
}

const dailyXFormatter = tick =>
  dailyChartData.value?.[tick]?.day ?? ''
</script>
