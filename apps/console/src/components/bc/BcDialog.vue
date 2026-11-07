<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      @mousedown.self="dismissable && $emit('close')"
    >
      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="id + '-title'"
        :aria-describedby="$slots.default ? id + '-body' : undefined"
        class="w-full max-w-md rounded-overlay border border-line bg-surface-raised p-6 shadow-2xl"
      >
        <h2 :id="id + '-title'" class="text-section-title text-fg">{{ title }}</h2>
        <div :id="id + '-body'" class="mt-3 text-sm leading-relaxed text-fg-muted">
          <slot />
        </div>
        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useFocusTrap } from '../../composables/useFocusTrap.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  id: { type: String, required: true },
  title: { type: String, required: true },
  dismissable: { type: Boolean, default: true }
})
const emit = defineEmits(['close'])

const panel = ref(null)
const active = computed(() => props.open)
useFocusTrap(panel, active, {
  onEscape: () => {
    if (props.dismissable) emit('close')
  }
})
</script>
