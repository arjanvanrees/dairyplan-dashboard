<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Koeien">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="ring ring-default rounded-lg">
        <div class="flex items-center gap-4 px-4 py-3.5">
          <UInput
            v-model="globalFilter"
            class="max-w-sm"
            placeholder="Filter..."
            icon="eva:search-outline"
          >
            <template v-if="globalFilter?.length" #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-circle-x"
                aria-label="Clear input"
                @click="globalFilter = ''"
              />
            </template>
          </UInput>

          <span class="text-sm text-muted">{{ $t('koe', filteredCount) }}</span>
        </div>

        <UTable
          ref="table"
          v-model:global-filter="globalFilter"
          :data="milkings ?? []"
          :columns="columns"
          :loading="status === 'pending'"
          :ui="{
            base: 'w-full min-w-xl',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'w-1/6'
          }"
          class="flex-1 !overflow-y-visible"
        >
          <template #cow_number-cell="{ row }">
            <NuxtLink :to="`/koeien/${row.original.cow_number}`" class="text-primary hover:underline">
              {{ row.original.cow_number }}
            </NuxtLink>
          </template>
        </UTable>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup>
const supabase = useSupabaseClient()

const table = useTemplateRef('table')
const filteredCount = computed(() => table.value?.tableApi?.getFilteredRowModel().rows.length ?? 0)

const globalFilter = ref('')

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

useHead({
  title: 'Koeien - DairyPlan Dashboard'
})

const { getLabel: getCowStatusLabel } = useCowStatus()

const { data: milkings, status } = useLazyAsyncData(
  'cows',
  async () => {
    const { data, error } = await supabase
      .from('cows')
      .select('cow_number, name, responder, group_number, birth_date, calving_date, registration_number, status_code, lact_no')
      .order('cow_number', { ascending: true })
    if (error) { console.error('[cows] error:', error); return [] }
    return data ?? []
  }
)

const columns = [
  {
    accessorKey: 'cow_number',
    header: 'Nr.'
  },
  {
    accessorKey: 'name',
    header: 'Naam'
  },
  {
    accessorKey: 'registration_number',
    header: 'Levensnummer'
  },
  {
    accessorKey: 'lact_no',
    header: 'Lactatie'
  },
  {
    accessorKey: 'calving_date',
    header: 'Afkalfdatum'
  },
  {
    accessorKey: 'status_code',
    header: 'Status',
    cell: ({ getValue }) => getCowStatusLabel(getValue())
  }
]
</script>
