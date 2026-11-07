<template>
  <div class="rounded-lg border border-dashed border-white/15 px-6 py-12 text-center">
    <InboxIcon class="mx-auto h-8 w-8 text-gray-400" />
    <h1 class="mt-4 text-2xl font-semibold text-white">{{ t('console.notFound.title') }}</h1>
    <p class="mt-2 text-sm text-gray-400">{{ t('console.notFound.body') }}</p>
    <p class="mt-2 break-all font-mono text-xs text-gray-400">{{ route.fullPath }}</p>
    <router-link
      :to="PATHS.overview"
      class="mt-6 inline-flex min-h-[44px] items-center rounded-md border border-white/15 px-4 text-sm text-gray-200 hover:bg-white/5"
    >
      {{ t('console.notFound.back') }}
    </router-link>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { PATHS } from '../../config/console-paths.mjs'
import { InboxIcon } from '../../components/icons/Icons.js'

const { t } = useI18n()
const route = useRoute()
</script>
