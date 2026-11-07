<template>
  <div
    class="flex flex-col gap-3 rounded-card border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    :class="toneClass.box"
    :role="live ? (assertive ? 'alert' : 'status') : undefined"
  >
    <div class="flex items-start gap-3">
      <component :is="icon" class="mt-0.5 h-5 w-5 shrink-0" :class="toneClass.icon" aria-hidden="true" />
      <div class="min-w-0 text-sm">
        <p v-if="title" class="font-medium" :class="toneClass.title">{{ title }}</p>
        <div :class="[toneClass.body, title ? 'mt-1' : '']"><slot /></div>
      </div>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { AlertIcon, CheckIcon, InfoIcon } from '../icons/Icons.js'

const props = defineProps({
  tone: { type: String, default: 'info' }, // info | success | warning | danger
  title: { type: String, default: '' },
  live: { type: Boolean, default: true }
})

const TONES = {
  info: { box: 'border-info-400/30 bg-info-500/10', icon: 'text-info-300', title: 'text-info-100', body: 'text-info-100/90' },
  success: { box: 'border-success-400/30 bg-success-500/10', icon: 'text-success-300', title: 'text-success-100', body: 'text-success-100/90' },
  warning: { box: 'border-warning-400/30 bg-warning-500/10', icon: 'text-warning-300', title: 'text-warning-100', body: 'text-warning-100/90' },
  danger: { box: 'border-danger-400/40 bg-danger-500/10', icon: 'text-danger-300', title: 'text-danger-100', body: 'text-danger-100/90' }
}

const toneClass = computed(() => TONES[props.tone] || TONES.info)
const assertive = computed(() => props.tone === 'danger' || props.tone === 'warning')
const icon = computed(() => (props.tone === 'success' ? CheckIcon : props.tone === 'info' ? InfoIcon : AlertIcon))
</script>
