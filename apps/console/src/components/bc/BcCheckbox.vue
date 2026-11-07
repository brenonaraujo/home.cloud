<template>
  <label class="flex min-h-target cursor-pointer items-center gap-3 text-sm text-fg">
    <input
      :checked="modelValue"
      type="checkbox"
      class="h-4 w-4 rounded border-line-strong bg-surface accent-brand-500"
      @change="$emit('update:modelValue', $event.target.checked)"
    >
    <span><slot /></span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])
</script>
