<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-4 text-fg">
    <img src="/brenon-cloud-logo.png" alt="Brenon Cloud" class="h-16 w-16" />
    <div role="status" class="flex max-w-md flex-col items-center gap-3 text-center">
      <span
        v-if="!error"
        class="h-5 w-5 animate-spin rounded-full border-2 border-brand-400 border-r-transparent"
        aria-hidden="true"
      />
      <p class="text-sm text-fg-muted">{{ message }}</p>
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, required: true },
  error: { type: Boolean, default: false }
})
</script>
