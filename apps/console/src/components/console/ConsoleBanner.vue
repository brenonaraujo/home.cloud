<template>
  <div
    v-if="catalog.offline"
    class="mb-6 flex flex-col gap-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <AlertIcon class="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
      <div>
        <p class="text-sm font-medium text-amber-100">{{ t('console.offlineTitle') }}</p>
        <p class="mt-1 text-sm text-amber-200/80">{{ t('console.offline') }}</p>
      </div>
    </div>
    <button
      type="button"
      class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-amber-400/40 px-4 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-500/20"
      @click="catalog.load(true)"
    >
      <RefreshIcon class="h-4 w-4" />
      {{ t('console.retry') }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useConsoleStore } from '../../stores/consoleStore'
import { AlertIcon, RefreshIcon } from '../icons/Icons.js'

const { t } = useI18n()
const catalog = useConsoleStore()
</script>
