<template>
  <div>
    <UPageGrid>
      <UPageCard title="Opbrengst vandaag in kg">
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

    <UTable :data="milkings ?? []" class="flex- mt-10" />
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()

definePageMeta({
  layout: 'dashboard'
})

const today = new Date()
today.setHours(0, 0, 0, 0)
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

const { data: milkings } = useLazyAsyncData('milkings-today', () =>
  supabase
    .from('milkings')
    .select('*')
    .gte('milked_at', today.toISOString())
    .lt('milked_at', tomorrow.toISOString())
    .then(({ data }) => data)
)

const { data: todayStats } = useLazyAsyncData('milkings-today-kg', () =>
  supabase
    .from('milkings')
    .select('milk_weight_kg, cow_number')
    .gte('milked_at', today.toISOString())
    .lt('milked_at', tomorrow.toISOString())
    .then(({ data }) => ({
      totalKg: data?.reduce((sum, r) => sum + r.milk_weight_kg, 0) ?? 0,
      cowCount: new Set(data?.map(r => r.cow_number)).size
    }))
)
</script>
