<template>
  <div>
    <ConsoleBreadcrumb v-if="crumbs.length" :items="crumbs" />
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <p v-if="eyebrow" class="text-eyebrow-label">{{ eyebrow }}</p>
        <h1 class="text-page-title text-fg" :class="eyebrow ? 'mt-2' : ''">
          <slot name="title">{{ title }}</slot>
        </h1>
        <p v-if="subtitle || $slots.subtitle" class="mt-2 max-w-2xl text-sm leading-relaxed text-fg-muted">
          <slot name="subtitle">{{ subtitle }}</slot>
        </p>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import ConsoleBreadcrumb from '../console/ConsoleBreadcrumb.vue'

// document.title comes from the route (meta.titleKey) or usePageTitle().
defineProps({
  crumbs: { type: Array, default: () => [] },
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' }
})
</script>
