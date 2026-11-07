<template>
  <BcAlert v-if="catalog.offline" tone="warning" class="mb-6" :title="t('console.offlineTitle')">
    {{ t('console.offline') }}
    <template #actions>
      <BcButton size="sm" @click="catalog.load(true)">
        <template #icon><RefreshIcon class="h-4 w-4" /></template>
        {{ t('console.retry') }}
      </BcButton>
    </template>
  </BcAlert>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useConsoleStore } from '../../stores/consoleStore'
import { RefreshIcon } from '../icons/Icons.js'
import BcAlert from '../bc/BcAlert.vue'
import BcButton from '../bc/BcButton.vue'

const { t } = useI18n()
const catalog = useConsoleStore()
</script>
