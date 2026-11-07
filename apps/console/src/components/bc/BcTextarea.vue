<template>
  <textarea
    :id="id"
    :value="modelValue"
    :rows="rows"
    :placeholder="placeholder"
    :aria-describedby="describedby"
    class="w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-brand-400"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, default: undefined },
  rows: { type: Number, default: 3 },
  placeholder: { type: String, default: '' },
  describedby: { type: String, default: undefined }
})
defineEmits(['update:modelValue'])
</script>
