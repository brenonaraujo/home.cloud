<template>
  <div>
    <BcPageHeader
      :crumbs="[{ label: t('console.services.title') }]"
      :title="t('console.services.title')"
      :subtitle="t('console.services.subtitle')"
    >
      <template #actions>
        <p v-if="!catalog.loading" class="text-sm text-fg-muted" aria-live="polite">
          {{ q ? t('console.services.matches', { n: filtered.length, total: apps.length }) : t('console.services.count', { n: apps.length }) }}
        </p>
      </template>
    </BcPageHeader>

    <!-- Same state as the topbar search (catalog.searchQuery): one query, two entry points. -->
    <div class="mt-8 max-w-md">
      <label for="services-filter" class="sr-only">{{ t('console.services.filter') }}</label>
      <BcInput id="services-filter" v-model="query" type="search" :placeholder="t('console.services.filterPlaceholder')">
        <template #leading>
          <SearchIcon class="ml-3 h-4 w-4 shrink-0 self-center text-fg-subtle" />
        </template>
      </BcInput>
    </div>

    <div v-if="catalog.loading" class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <BcSkeleton v-for="n in 6" :key="n" />
    </div>

    <div v-else-if="filtered.length" class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <BcServiceCard v-for="app in filtered" :key="app.id" :app="app" />
    </div>

    <BcEmptyState
      v-else
      class="mt-8"
      :icon="InboxIcon"
      :title="t('console.emptyTitle')"
      :body="q ? t('console.search.empty') : t('console.empty')"
    >
      <template v-if="q" #actions>
        <BcButton size="sm" @click="query = ''">{{ t('console.search.clear') }}</BcButton>
      </template>
    </BcEmptyState>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/authStore'
import { useConsoleStore } from '../../stores/consoleStore'
import { InboxIcon, SearchIcon } from '../../components/icons/Icons.js'
import { BcButton, BcEmptyState, BcInput, BcPageHeader, BcServiceCard, BcSkeleton } from '../../components/bc/index.js'

const { t, locale } = useI18n()
const auth = useAuthStore()
const catalog = useConsoleStore()
const { searchQuery: query } = storeToRefs(catalog)

const q = computed(() => String(query.value || '').trim())
const apps = computed(() => catalog.appsFor(auth.groups))
const filtered = computed(() => catalog.searchFor(auth.groups, query.value, locale.value))
</script>
