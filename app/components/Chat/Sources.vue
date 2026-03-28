<template>
  <button
    class="flex gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    @click="toggleExpanded"
  >
    <Icon :name="expanded ? 'eva:chevron-up-outline' : 'eva:chevron-down-outline'" class="size-5" />
    {{ expanded ? 'Verberg data uit database' : 'Toon data uit database' }}
  </button>
  <pre v-if="expanded" class="mt-1 overflow-x-auto rounded bg-gray-100 p-3 text-sm dark:bg-gray-800">
    <slot />
  </pre>
</template>

<script lang="ts" setup>
const expanded = ref(false)

const toggleExpanded = () => {
  expanded.value = !expanded.value
}
</script>
