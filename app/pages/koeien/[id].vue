<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="pageTitle">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageCard title="Over">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <h3 class="text-sm font-medium text-muted">Nr.</h3>
            <p class="text-lg font-semibold">{{ cow?.cow_number ?? '…' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted">Naam</h3>
            <p class="text-lg font-semibold">{{ cow?.name ?? '…' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted">Levensnummer</h3>
            <p class="text-lg font-semibold">{{ cow?.registration_number ?? '…' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted">Geboortedatum</h3>
            <p class="text-lg font-semibold">{{ cow?.birth_date ?? '…' }}</p>
          </div>
        </div>
      </UPageCard>

      <UPageCard title="Huidige lactatie">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <h3 class="text-sm font-medium text-muted">Laatste kalf</h3>
            <p class="text-lg font-semibold">{{ cow?.calving_date ?? '…' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted">Dagen in lactatie</h3>
            <p class="text-lg font-semibold">{{ daysSinceCalving ?? '…' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted">Lactatie</h3>
            <p class="text-lg font-semibold">{{ cow?.lact_no ?? '…' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted">Status</h3>
            <p class="text-lg font-semibold">{{ cow ? getCowStatusLabel(cow.status_code) : '…' }}</p>
          </div>
        </div>
      </UPageCard>

      <UPageCard title="Productie laatste 7 dagen">
        <AreaChart
          :data="chartData ?? []"
          :categories="categories"
          :height="300"
          :x-formatter="xFormatter"
          :y-domain="[0, undefined]"
          :hide-y-axis="true"
          :hide-legend="true"
        />
      </UPageCard>

      <UPageCard title="Laatste melkcontrole">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <h3 class="text-sm font-medium text-muted">Datum</h3>
            <p class="text-lg font-semibold">{{ lastMilkTest?.test_date ?? '\u2026' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted">Vet %</h3>
            <p class="text-lg font-semibold">{{ lastMilkTest ? $n(Number(lastMilkTest.fat_pct), 'single') + ' %' : '\u2026' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted">Eiwit %</h3>
            <p class="text-lg font-semibold">{{ lastMilkTest ? $n(Number(lastMilkTest.protein_pct), 'single') + ' %' : '\u2026' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted">Celgetal</h3>
            <p class="text-lg font-semibold">{{ lastMilkTest?.scc ?? '\u2026' }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted">MUN</h3>
            <p class="text-lg font-semibold">{{ lastMilkTest?.mun ?? '\u2026' }}</p>
          </div>
        </div>
      </UPageCard>
    </template>
  </UDashboardPanel>
</template>

<script setup>
const supabase = useSupabaseClient()
const route = useRoute()
const cowNumber = Number(route.params.id)

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { getLabel: getCowStatusLabel } = useCowStatus()

const { data: cow } = useLazyAsyncData(
  `cow-${cowNumber}`,
  async () => {
    const { data, error } = await supabase
      .from('cows')
      .select('cow_number, name, responder, group_number, birth_date, calving_date, registration_number, status_code, lact_no')
      .eq('cow_number', cowNumber)
      .single()
    if (error) { console.error('[cow] error:', error); return null }
    return data
  }
)

const { data: lastMilkTest } = useLazyAsyncData(
  `milk-test-cow-${cowNumber}`,
  async () => {
    const { data, error } = await supabase
      .from('milk_tests')
      .select('test_date, fat_pct, protein_pct, lactose_pct, scc, mun')
      .eq('cow_number', cowNumber)
      .order('test_date', { ascending: false })
      .limit(1)
      .single()
    if (error) { console.error('[milk_test] error:', error); return null }
    return data
  }
)

const daysSinceCalving = computed(() => {
  if (!cow.value?.calving_date) return null
  const calving = new Date(cow.value.calving_date)
  const today = new Date()
  return Math.floor((today - calving) / (1000 * 60 * 60 * 24))
})

const oneWeekAgo = new Date()
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
oneWeekAgo.setHours(0, 0, 0, 0)

const { data: milkings, status } = useLazyAsyncData(
  `milkings-cow-${cowNumber}`,
  async () => {
    const { data, error } = await supabase
      .from('milkings')
      .select('id, milked_at, milk_weight_kg, responder')
      .eq('cow_number', cowNumber)
      .gte('milked_at', oneWeekAgo.toISOString())
      .order('milked_at', { ascending: true })
    if (error) { console.error('[milkings] error:', error); return [] }
    return data ?? []
  }
)

const chartData = computed(() => {
  if (!milkings.value) return []

  const byDay = {}
  for (const row of milkings.value) {
    const date = new Date(row.milked_at)
    const key = date.toISOString().slice(0, 10) // YYYY-MM-DD
    byDay[key] = (byDay[key] ?? 0) + Number(row.milk_weight_kg)
  }

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, production]) => {
      const date = new Date(dateStr)
      const day = date.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'numeric' })
      return { day, production: Math.round(production * 10) / 10 }
    })
})

const categories = {
  production: { name: 'Productie (kg)', color: '#22c55e' }
}

const xFormatter = (tick, _i, _ticks) => {
  return chartData.value?.[tick]?.day ?? ''
}

const pageTitle = computed(() => {
  if (!cow.value) return 'Koeien'
  return cow.value.name ? `${cow.value.cow_number} - ${cow.value.name}` : `${cow.value.cow_number}`
})

useSeoMeta({
  title: () => `${pageTitle.value} - DairyPlan Dashboard`
})
</script>
