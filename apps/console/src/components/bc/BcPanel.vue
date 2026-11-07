<template>
  <component :is="tag" class="flex flex-col rounded-card border border-line bg-surface-raised" :class="tone === 'danger' ? 'border-danger-500/40' : ''">
    <header
      v-if="title || $slots.header || $slots.action"
      class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
      :class="flush ? 'border-b border-line px-4 py-3' : 'px-6 pt-6'"
    >
      <slot name="header">
        <div class="min-w-0">
          <component :is="headingTag" class="font-semibold text-fg" :class="flush ? 'text-sm' : 'text-section-title'" :id="headingId || undefined">
            {{ title }}
          </component>
          <p v-if="subtitle" class="mt-1 max-w-2xl text-sm leading-relaxed text-fg-muted">{{ subtitle }}</p>
        </div>
      </slot>
      <slot name="action" />
    </header>
    <div :class="flush ? '' : ['flex flex-1 flex-col px-6 pb-6', title || $slots.header || $slots.action ? 'pt-4' : 'pt-6']">
      <slot />
    </div>
  </component>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  tag: { type: String, default: 'section' },
  headingTag: { type: String, default: 'h2' },
  headingId: { type: String, default: '' },
  flush: { type: Boolean, default: false }, // list panels: compact header, no body padding
  tone: { type: String, default: '' } // '' | danger
})
</script>
