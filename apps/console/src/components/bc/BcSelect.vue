<template>
  <select
    :id="id"
    :value="modelValue"
    :aria-describedby="describedby"
    class="min-h-target w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-fg focus:border-brand-400"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
  </select>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, default: undefined },
  options: { type: Array, default: () => [] }, // { value, label }
  describedby: { type: String, default: undefined }
})
defineEmits(['update:modelValue'])
</script>
