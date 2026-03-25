<template>
  <UPageGrid :ui="{ base: 'gap-6' }">
    <UPageCard
      title="Actieve koeien"
      :ui="ui"
    >
      <span class="text-2xl font-semibold text-highlighted">
        {{ stats ? stats.active : '…' }}
      </span>
    </UPageCard>

    <UPageCard
      title="Kalveren"
      :ui="ui"
    >
      <span class="text-2xl font-semibold text-highlighted">
        {{ stats ? stats.calfs : '…' }}
      </span>
    </UPageCard>

    <UPageCard
      title="Droogstaand"
      :ui="ui"
    >
      <span class="text-2xl font-semibold text-highlighted">
        {{ stats ? stats.dry : '…' }}
      </span>
    </UPageCard>
  </UPageGrid>
</template>

<script setup>
const supabase = useSupabaseClient()

const KALF_STATUSES = [1, 2]
const DRY_STATUS = 12
const INACTIVE_STATUSES = [16]

const { data: stats } = useLazyAsyncData('animal-summary', async () => {
  const { data, error } = await supabase
    .from('cows')
    .select('status_code')

  if (error) {
    console.error('[animal-summary] error:', error)
    return { active: 0, calfs: 0, dry: 0 }
  }

  const rows = data ?? []
  return {
    calfs: rows.filter(r => KALF_STATUSES.includes(Number(r.status_code))).length,
    dry: rows.filter(r => Number(r.status_code) === DRY_STATUS).length,
    active: rows.filter(r =>
      !KALF_STATUSES.includes(Number(r.status_code)) &&
      Number(r.status_code) !== DRY_STATUS &&
      !INACTIVE_STATUSES.includes(Number(r.status_code))
    ).length
  }
})

const ui = {
  container: 'gap-y-1.5',
  leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
  title: 'font-normal text-muted text-xs uppercase'
}
</script>
