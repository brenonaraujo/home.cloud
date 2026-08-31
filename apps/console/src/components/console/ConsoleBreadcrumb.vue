<template>
  <nav aria-label="breadcrumb" class="mb-6 text-sm">
    <ol class="flex flex-wrap items-center gap-2 text-gray-500">
      <li>
        <router-link to="/" class="transition-colors hover:text-gray-200">
          {{ t('console.title') }}
        </router-link>
      </li>
      <template v-for="(item, index) in items" :key="index">
        <li aria-hidden="true" class="text-gray-600">/</li>
        <li>
          <router-link
            v-if="item.to && index < items.length - 1"
            :to="item.to"
            class="transition-colors hover:text-gray-200"
          >
            {{ item.label }}
          </router-link>
          <span v-else aria-current="page" class="text-gray-200">{{ item.label }}</span>
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
