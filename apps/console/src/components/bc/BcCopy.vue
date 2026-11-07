<template>
  <span class="inline-flex min-w-0 max-w-full items-center gap-1">
    <span class="min-w-0 break-all font-mono" :class="textClass">{{ value }}</span>
    <button
      type="button"
      class="inline-flex min-h-target min-w-target shrink-0 items-center justify-center rounded-control text-fg-muted hover:bg-white/5 hover:text-fg"
      :aria-label="t('bc.copy', { value })"
      @click="copy"
    >
      <CheckIcon v-if="copied" class="h-4 w-4 text-success-300" />
      <CopyIcon v-else class="h-4 w-4" />
    </button>
    <span class="sr-only" aria-live="polite">{{ copied ? t('bc.copied') : '' }}</span>
  </span>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckIcon, CopyIcon } from '../icons/Icons.js'

const props = defineProps({
  value: { type: String, required: true },
  textClass: { type: String, default: 'text-sm text-fg' }
})
const { t } = useI18n()
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    copied.value = false
  }
}
</script>
