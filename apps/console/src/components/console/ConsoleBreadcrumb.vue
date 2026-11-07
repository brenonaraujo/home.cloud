<template>
  <nav :aria-label="t('console.nav.breadcrumb')" class="mb-6 text-sm">
    <ol class="flex flex-wrap items-center gap-2 text-fg-muted">
      <li>
        <router-link to="/" class="rounded-control transition-colors duration-fast hover:text-fg">
          {{ t('console.title') }}
        </router-link>
      </li>
      <template v-for="(item, index) in items" :key="index">
        <li aria-hidden="true" class="text-fg-subtle">/</li>
        <li>
          <router-link
            v-if="item.to && index < items.length - 1"
            :to="item.to"
            class="rounded-control transition-colors duration-fast hover:text-fg"
          >
            {{ item.label }}
          </router-link>
          <span v-else aria-current="page" class="text-fg">{{ item.label }}</span>
        </li>
      </template>
    </ol>
  </nav>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  items: { type: Array, default: () => [] }
})

const { t } = useI18n()
</script>
