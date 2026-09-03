<template>
  <div>
    <ConsoleBreadcrumb :items="[{ label: t('console.nav.services') }]" />

    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-white">{{ t('console.services.title') }}</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
          {{ t('console.services.subtitle') }}
        </p>
      </div>
      <p v-if="!catalog.loading" class="text-sm text-gray-500">
        {{ t('console.services.count', { n: apps.length }) }}
      </p>
    </div>

    <label class="mt-8 block">
      <span class="sr-only">{{ t('console.services.filter') }}</span>
      <input
        v-model="query"
        type="search"
        :placeholder="t('console.search.placeholder')"
        class="h-11 w-full max-w-md rounded-md border border-white/10 bg-gray-900 px-4 text-sm text-white placeholder:text-gray-500 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      />
    </label>

    <div v-if="catalog.loading" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 6" :key="n" class="h-36 animate-pulse rounded-lg border border-white/10 bg-gray-900" />
    </div>

    <div v-else-if="filtered.length" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ConsoleServiceCard v-for="app in filtered" :key="app.id" :app="app" />
    </div>

    <div v-else class="mt-8 rounded-lg border border-dashed border-white/15 px-6 py-12 text-center">
      <InboxIcon class="mx-auto h-8 w-8 text-gray-600" />
      <h2 class="mt-4 text-lg font-semibold text-white">{{ t('console.emptyTitle') }}</h2>
      <p class="mt-2 text-sm text-gray-400">
        {{ query.trim() ? t('console.search.empty') : t('console.empty') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/authStore'
import { useConsoleStore } from '../../stores/consoleStore'
import ConsoleBreadcrumb from '../../components/console/ConsoleBreadcrumb.vue'
import ConsoleServiceCard from '../../components/console/ConsoleServiceCard.vue'
import { InboxIcon } from '../../components/icons/Icons.js'

const { t, locale } = useI18n()
const auth = useAuthStore()
const catalog = useConsoleStore()
const { searchQuery: query } = storeToRefs(catalog)

const apps = computed(() => catalog.appsFor(auth.groups))
const filtered = computed(() => catalog.searchFor(auth.groups, query.value, locale.value))
</script>
