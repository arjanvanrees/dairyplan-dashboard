<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, CalendarDate } from '@internationalized/date'

type DateRangeModel = { start: Date, end: Date }
type CalendarDateRange = { start: CalendarDate, end: CalendarDate }

const df = new DateFormatter('nl-NL', { dateStyle: 'medium' })

const selected = defineModel<DateRangeModel>({ required: true })

const calendarRange = computed({
  get: (): CalendarDateRange => ({
    start: new CalendarDate(
      selected.value.start.getFullYear(),
      selected.value.start.getMonth() + 1,
      selected.value.start.getDate()
    ),
    end: new CalendarDate(
      selected.value.end.getFullYear(),
      selected.value.end.getMonth() + 1,
      selected.value.end.getDate()
    )
  }),
  set: (newValue: CalendarDateRange) => {
    if (newValue.start && newValue.end) {
      const startDate = newValue.start.toDate(getLocalTimeZone())
      startDate.setHours(0, 0, 0, 0)
      const endDate = newValue.end.toDate(getLocalTimeZone())
      endDate.setHours(0, 0, 0, 0)
      selected.value = { start: startDate, end: endDate }
    }
  }
})

const isSingleDay = computed(() =>
  selected.value.start.toDateString() === selected.value.end.toDateString()
)
</script>

<template>
  <UPopover
    :content="{ align: 'start' }"
    :modal="true"
  >
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-calendar"
      class="data-[state=open]:bg-elevated group"
    >
      <span class="truncate">
        <template v-if="isSingleDay">
          {{ df.format(selected.start) }}
        </template>
        <template v-else>
          {{ df.format(selected.start) }} – {{ df.format(selected.end) }}
        </template>
      </span>

      <template #trailing>
        <UIcon
          name="i-lucide-chevron-down"
          class="shrink-0 text-dimmed size-5 group-data-[state=open]:rotate-180 transition-transform duration-200"
        />
      </template>
    </UButton>

    <template #content>
      <div class="flex items-stretch sm:divide-x divide-default">
        <UCalendar
          v-model="calendarRange"
          range
          :number-of-months="2"
          class="p-2"
        />
      </div>
    </template>
  </UPopover>
</template>
