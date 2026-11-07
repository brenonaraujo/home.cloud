<template>
  <div class="rounded-card border border-dashed border-line-strong/40 px-6 py-12 text-center">
    <component :is="icon" v-if="icon" class="mx-auto h-8 w-8 text-fg-subtle" aria-hidden="true" />
    <component :is="headingTag" class="font-semibold text-fg" :class="[icon ? 'mt-4' : '', headingTag === 'h1' ? 'text-2xl' : 'text-lg']">
      {{ title }}
    </component>
    <p v-if="body" class="mx-auto mt-2 max-w-md text-sm text-fg-muted">{{ body }}</p>
    <slot />
    <div v-if="$slots.actions" class="mt-6 flex flex-wrap justify-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: [Object, Function], default: null },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  headingTag: { type: String, default: 'h2' }
})
</script>
