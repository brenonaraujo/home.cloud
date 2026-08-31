<template>
  <section class="flex min-h-[14rem] flex-col rounded-lg border border-white/10 bg-gray-900">
    <header class="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
      <h2 class="text-sm font-semibold text-white">{{ title }}</h2>
      <router-link
        v-if="to"
        :to="to"
        class="text-xs text-gray-400 transition-colors hover:text-white"
      >
        {{ action }}
      </router-link>
      <a
        v-else-if="href"
        :href="href"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs text-gray-400 transition-colors hover:text-white"
      >
        {{ action }}
      </a>
    </header>
    <div class="flex flex-1 flex-col p-4">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  action: { type: String, default: '' },
  to: { type: String, default: '' },
  href: { type: String, default: '' }
})
</script>
