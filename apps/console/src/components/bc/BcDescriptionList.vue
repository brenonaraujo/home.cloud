<template>
  <dl class="grid gap-4" :class="columns">
    <div
      v-for="item in items.filter(Boolean)"
      :key="item.label"
      :class="boxed ? 'rounded-card border border-line bg-surface-raised p-4' : ''"
    >
      <dt class="text-eyebrow-label">{{ item.label }}</dt>
      <dd class="mt-2 break-words text-sm text-fg" :class="item.mono ? 'font-mono' : ''" :title="item.title || undefined">
        <slot :name="item.slot || 'value'" :item="item">
          <a v-if="item.href" :href="item.href" target="_blank" rel="noopener noreferrer" class="hover:text-brand-300">
            {{ item.value }}<span class="sr-only"> {{ t('bc.newTab') }}</span>
          </a>
          <template v-else>{{ item.value || '—' }}</template>
        </slot>
      </dd>
      <p v-if="item.hint" class="mt-1 text-xs text-fg-subtle">{{ item.hint }}</p>
    </div>
  </dl>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  items: { type: Array, default: () => [] }, // { label, value, mono?, href?, hint?, title?, slot? }
  columns: { type: String, default: 'sm:grid-cols-2' },
  boxed: { type: Boolean, default: false }
})
const { t } = useI18n()
</script>
