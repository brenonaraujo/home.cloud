<template>
  <span class="inline-flex items-center gap-2 text-sm text-fg">
    <span class="h-2 w-2 shrink-0 rounded-full" :class="[dot, status === 'starting' ? 'animate-pulse' : '']" aria-hidden="true" />
    <span>{{ t('bc.status.' + status) }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  status: { type: String, default: 'stopped' } // starting | active | stopped | error
})
const { t } = useI18n()

const dot = computed(
  () =>
    ({
      starting: 'bg-warning-400',
      active: 'bg-success-400',
      stopped: 'bg-fg-subtle',
      error: 'bg-danger-400'
    })[props.status] || 'bg-fg-subtle'
)
</script>
