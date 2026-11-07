<template>
  <BcEmptyState heading-tag="h1" :icon="InboxIcon" :title="t('console.notFound.title')" :body="t('console.notFound.body')">
    <p class="mt-2 break-all font-mono text-xs text-fg-muted">{{ route.fullPath }}</p>
    <template #actions>
      <BcButton variant="primary" :to="PATHS.overview">{{ t('console.notFound.back') }}</BcButton>
      <BcButton :to="PATHS.services">{{ t('console.services.title') }}</BcButton>
    </template>
  </BcEmptyState>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { PATHS } from '../../config/console-paths.mjs'
import { InboxIcon } from '../../components/icons/Icons.js'
import { BcButton, BcEmptyState } from '../../components/bc/index.js'

const { t } = useI18n()
const route = useRoute()
</script>
