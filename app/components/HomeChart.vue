<script setup>
const supabase = useSupabaseClient()

const now = new Date()
const weekStart = new Date(now)
weekStart.setDate(now.getDate() - 2)
weekStart.setHours(0, 0, 0, 0)
const weekEnd = new Date(now)
weekEnd.setHours(23, 59, 59, 999)

const { data: chartData } = useLazyAsyncData('milkings-weekly', () =>
  supabase
    .from('milkings')
    .select('milked_at, milk_weight_kg')
    .gte('milked_at', weekStart.toISOString())
    .lte('milked_at', weekEnd.toISOString())
    .then(({ data }) => {
      const byDay = {}
      for (const row of data ?? []) {
        const day = new Date(row.milked_at).getDate()
        byDay[day] = (byDay[day] ?? 0) + row.milk_weight_kg
      }
      return Object.entries(byDay)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([day, production]) => ({ day: Number(day), production }))
    })
)

const categories = {
  production: { name: 'Productie (kg)', color: '#22c55e' }
}

const xFormatter = (tick, _i, _ticks) => {
  return chartData.value?.[tick]?.day ?? ''
}
</script>

<template>
  <UCard>
    <LineChart
      :data="chartData ?? []"
      :categories="categories"
      :height="300"
      :x-formatter="xFormatter"
      :hide-y-axis="true"
      :hide-legend="true"
    />
  </UCard>
</template>
