<template>
  <component
    :is="tag"
    v-bind="linkAttrs"
    :class="classes"
    :aria-busy="loading ? 'true' : undefined"
    :aria-disabled="isLink && disabled ? 'true' : undefined"
    @click="onClick"
  >
    <span
      v-if="loading"
      class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
      aria-hidden="true"
    />
    <slot name="icon" />
    <span v-if="$slots.default" :class="iconOnly ? 'sr-only' : ''"><slot /></span>
    <template v-if="external">
      <ExternalIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
      <span class="sr-only">{{ t('bc.newTab') }}</span>
    </template>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ExternalIcon } from '../icons/Icons.js'

const props = defineProps({
  variant: { type: String, default: 'secondary' }, // primary | secondary | ghost | danger | danger-ghost
  size: { type: String, default: 'md' }, // sm | md
  as: { type: String, default: '' }, // button | a | router-link (inferred from to/href)
  to: { type: [String, Object], default: '' },
  href: { type: String, default: '' },
  target: { type: String, default: '' },
  type: { type: String, default: 'button' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  iconOnly: { type: Boolean, default: false }
})
const emit = defineEmits(['click'])
const { t } = useI18n()

const tag = computed(() => {
  if (props.as) return props.as
  if (props.to) return 'router-link'
  if (props.href) return 'a'
  return 'button'
})
const isLink = computed(() => tag.value !== 'button')
const external = computed(() => props.target === '_blank')

const linkAttrs = computed(() => {
  if (tag.value === 'router-link') return { to: props.to }
  if (tag.value === 'a') {
    return {
      href: props.disabled ? undefined : props.href,
      target: props.target || undefined,
      rel: external.value ? 'noopener noreferrer' : undefined
    }
  }
  return { type: props.type, disabled: props.disabled || props.loading }
})

const VARIANTS = {
  primary: 'bg-brand-500 text-fg-inverse hover:bg-brand-400 font-semibold',
  secondary: 'border border-line-strong/60 text-fg hover:border-line-strong hover:bg-white/5',
  ghost: 'text-fg-muted hover:bg-white/5 hover:text-fg',
  danger: 'bg-danger-600 text-white hover:bg-danger-500 font-semibold',
  'danger-ghost': 'text-danger-300 hover:bg-danger-500/10 hover:text-danger-200'
}

const classes = computed(() => [
  'inline-flex min-h-target items-center justify-center gap-2 rounded-control text-sm transition-colors duration-fast',
  'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
  props.iconOnly ? 'min-w-target px-2' : props.size === 'sm' ? 'px-3' : 'px-4',
  props.block ? 'w-full' : '',
  VARIANTS[props.variant] || VARIANTS.secondary
])

function onClick(event) {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>
