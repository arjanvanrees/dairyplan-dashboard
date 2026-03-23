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
    if (error) { console.error('[daily-production] error:', error); return [] }
    return data ?? []
  }
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

const dailyXFormatter = (tick) =>
  dailyChartData.value?.[tick]?.day ?? ''
</script>
