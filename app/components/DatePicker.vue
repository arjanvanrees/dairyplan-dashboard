<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, CalendarDate } from '@internationalized/date'

const df = new DateFormatter('en-US', {
  dateStyle: 'medium'
})

const selected = defineModel<Date>({ required: true })

const calendarDate = computed({
  get: () => new CalendarDate(
    selected.value.getFullYear(),
    selected.value.getMonth() + 1,
    selected.value.getDate()
  ),
  set: (newValue: CalendarDate) => {
    selected.value = newValue.toDate(getLocalTimeZone())
  }
})
</script>

<template>
  <UPopover :content="{ align: 'start' }" :modal="true">
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-calendar"
      class="data-[state=open]:bg-elevated group"
    >
      <span class="truncate">
        {{ df.format(selected) }}
      </span>

      <template #trailing>
        <UIcon name="i-lucide-chevron-down" class="shrink-0 text-dimmed size-5 group-data-[state=open]:rotate-180 transition-transform duration-200" />
      </template>
    </UButton>

    <template #content>
      <div class="flex items-stretch sm:divide-x divide-default">
        <UCalendar
          v-model="calendarDate"
          class="p-2"
        />
      </div>
    </template>
  </UPopover>
</template>
