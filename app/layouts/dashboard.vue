<template>
  <UDashboardGroup>
    <UDashboardSidebar />

    <UDashboardPanel>
      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script lang="ts" setup>

</script>

<style>

</style>
