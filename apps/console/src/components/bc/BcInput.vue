<template>
  <div
    class="flex min-h-target w-full overflow-hidden rounded-control border bg-surface-sunken/30 focus-within:border-brand-400"
    :class="invalid ? 'border-danger-400' : 'border-line-strong'"
  >
    <span v-if="prefix" class="flex items-center border-r border-line-strong/60 px-3 font-mono text-sm text-fg-muted" aria-hidden="true">{{ prefix }}</span>
    <slot name="leading" />
    <input
      v-bind="$attrs"
      :id="id"
      :value="modelValue"
      :type="type"
      :aria-describedby="describedby"
      :aria-invalid="invalid ? 'true' : undefined"
      class="min-w-0 flex-1 bg-transparent px-3 text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
      @input="$emit('update:modelValue', $event.target.value)"
    >
    <slot name="trailing" />
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })
defineProps({
  modelValue: { type: [String, Number], default: '' },
  id: { type: String, default: undefined },
  type: { type: String, default: 'text' },
  prefix: { type: String, default: '' },
  describedby: { type: String, default: undefined },
  invalid: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])
</script>
