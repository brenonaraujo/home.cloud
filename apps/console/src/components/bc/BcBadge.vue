<template>
  <span
    class="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium"
    :class="TONES[tone] || TONES.neutral"
  >
    <slot />
  </span>
</template>

<script setup>
defineProps({
  tone: { type: String, default: 'neutral' } // neutral | brand | info | success | warning | danger
})

const TONES = {
  neutral: 'border-line bg-white/5 text-fg-muted',
  brand: 'border-brand-400/40 bg-brand-500/15 text-brand-200',
  info: 'border-info-400/30 bg-info-500/10 text-info-200',
  success: 'border-success-400/30 bg-success-500/10 text-success-200',
  warning: 'border-warning-400/30 bg-warning-500/10 text-warning-200',
  danger: 'border-danger-400/30 bg-danger-500/10 text-danger-200'
}
</script>
