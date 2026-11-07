<template>
  <div>
    <div
      role="tablist"
      :aria-label="label"
      class="flex gap-1 overflow-x-auto border-b border-line"
      @keydown="onKey"
    >
      <button
        v-for="tab in tabs"
        :id="id + '-tab-' + tab.id"
        :key="tab.id"
        ref="buttons"
        type="button"
        role="tab"
        :aria-selected="modelValue === tab.id ? 'true' : 'false'"
        :aria-controls="id + '-panel-' + tab.id"
        :tabindex="modelValue === tab.id ? 0 : -1"
        class="-mb-px min-h-target shrink-0 whitespace-nowrap border-b-2 px-4 text-sm font-medium transition-colors duration-fast"
        :class="modelValue === tab.id ? 'border-brand-400 text-fg' : 'border-transparent text-fg-muted hover:text-fg'"
        @click="select(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      :id="id + '-panel-' + modelValue"
      role="tabpanel"
      :aria-labelledby="id + '-tab-' + modelValue"
      tabindex="0"
      class="pt-6 focus:outline-none"
    >
      <slot :name="modelValue" />
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  tabs: { type: Array, required: true }, // { id, label }
  modelValue: { type: String, required: true }
})
const emit = defineEmits(['update:modelValue'])
const buttons = ref([])

function select(id) {
  emit('update:modelValue', id)
}

async function onKey(event) {
  const index = props.tabs.findIndex((tab) => tab.id === props.modelValue)
  let next = -1
  if (event.key === 'ArrowRight') next = (index + 1) % props.tabs.length
  else if (event.key === 'ArrowLeft') next = (index - 1 + props.tabs.length) % props.tabs.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = props.tabs.length - 1
  if (next < 0) return
  event.preventDefault()
  select(props.tabs[next].id)
  await nextTick()
  buttons.value[next]?.focus()
}
</script>
