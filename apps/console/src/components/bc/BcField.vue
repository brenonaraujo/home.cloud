<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" :for="id" class="text-sm font-medium text-fg">{{ label }}</label>
    <p v-if="hint" :id="id + '-hint'" class="text-sm leading-relaxed text-fg-muted">{{ hint }}</p>
    <slot :id="id" :describedby="describedby" :invalid="Boolean(error)" />
    <p v-if="error" :id="id + '-error'" class="text-sm text-danger-300" role="alert">{{ error }}</p>
    <p v-if="note" class="text-xs leading-relaxed text-fg-subtle">{{ note }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  note: { type: String, default: '' }
})

const describedby = computed(
  () => [props.hint ? `${props.id}-hint` : '', props.error ? `${props.id}-error` : ''].filter(Boolean).join(' ') || undefined
)
</script>
