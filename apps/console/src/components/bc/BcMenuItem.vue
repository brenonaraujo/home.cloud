<template>
  <component
    :is="tag"
    v-bind="attrs"
    role="menuitem"
    tabindex="-1"
    class="flex min-h-target w-full items-center gap-2 px-3 text-left text-sm transition-colors duration-fast focus:bg-white/10 focus:outline-none"
    :class="danger ? 'text-danger-300 hover:bg-danger-500/10' : 'text-fg hover:bg-white/5'"
  >
    <slot name="icon" />
    <span class="flex-1"><slot /></span>
    <template v-if="target === '_blank'">
      <ExternalIcon class="h-4 w-4 shrink-0 text-fg-subtle" />
      <span class="sr-only">{{ t('bc.newTab') }}</span>
    </template>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ExternalIcon } from '../icons/Icons.js'

const props = defineProps({
  to: { type: [String, Object], default: '' },
  href: { type: String, default: '' },
  target: { type: String, default: '' },
  danger: { type: Boolean, default: false }
})
const { t } = useI18n()

const tag = computed(() => (props.to ? 'router-link' : props.href ? 'a' : 'button'))
const attrs = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) {
    return { href: props.href, target: props.target || undefined, rel: props.target === '_blank' ? 'noopener noreferrer' : undefined }
  }
  return { type: 'button' }
})
</script>
