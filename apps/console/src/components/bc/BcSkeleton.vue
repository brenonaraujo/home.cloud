<template>
  <div class="animate-pulse rounded-card border border-line bg-surface-raised" :class="heightClass" aria-hidden="true" />
</template>

<script setup>
defineProps({
  heightClass: { type: String, default: 'h-36' }
})
</script>
