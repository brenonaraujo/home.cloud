<template>
  <div>
    <p class="text-[11px] uppercase tracking-[0.12em] text-gray-500">{{ t('console.home.overview') }}</p>
    <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white">
      {{ t('console.home.greeting', { name: firstName }) }}
    </h1>
    <p class="mt-2 text-sm text-gray-400">
      <span class="font-mono">{{ auth.email }}</span>
      <span class="text-gray-600"> · </span>
      {{ planLabel }}
      <span class="text-gray-600"> · </span>
      {{ t('console.region') }}
    </p>

    <div v-if="!auth.ready || catalog.loading" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 6" :key="n" class="h-36 animate-pulse rounded-lg border border-white/10 bg-gray-900" />
    </div>

    <template v-else>
      <section
        v-if="!searching && favorites.length"
        class="mt-8 flex min-h-0 flex-col rounded-lg border border-white/10 bg-gray-900"
      >
        <h2 class="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
          {{ t('console.home.favorites') }}
        </h2>
        <ul>
          <ConsoleServiceRow v-for="app in favorites" :key="'f-' + app.id" :app="app" />
        </ul>
      </section>

      <section
        v-if="!searching && recent.length"
        class="mt-6 flex min-h-0 flex-col rounded-lg border border-white/10 bg-gray-900"
      >
        <h2 class="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
          {{ t('console.home.recent') }}
        </h2>
        <ul>
          <ConsoleServiceRow v-for="app in recent" :key="'r-' + app.id" :app="app" />
        </ul>
      </section>

      <div v-if="filtered.length" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ConsoleServiceCard v-for="app in filtered" :key="app.id" :app="app" />
      </div>

      <div
        v-else
        class="mt-8 rounded-lg border border-dashed border-white/15 px-6 py-12 text-center"
      >
        <h2 class="text-lg font-semibold text-white">{{ t('console.emptyTitle') }}</h2>
        <p class="mt-2 text-sm text-gray-400">
          {{ searching ? t('console.search.empty') : t('console.empty') }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/authStore'
import { useConsoleStore } from '../../stores/consoleStore'
import { useEntitlementStore } from '../../stores/entitlementStore'
import { displayPlan } from '../../config/console-taxonomy.mjs'
import ConsoleServiceCard from '../../components/console/ConsoleServiceCard.vue'
import ConsoleServiceRow from '../../components/console/ConsoleServiceRow.vue'

const { t, te, locale } = useI18n()
const auth = useAuthStore()
const catalog = useConsoleStore()
const { searchQuery } = storeToRefs(catalog)
const entitlement = useEntitlementStore()

const firstName = computed(() => {
  const name = auth.displayName || auth.email || ''
  return String(name).trim().split(/\s+/)[0] || '—'
})

const planLabel = computed(() => {
  const plan = displayPlan(auth.groups, entitlement.billing)
  const key = `console.plan.${plan}`
  return te(key) ? t(key) : plan
})

const searching = computed(() => String(searchQuery.value || '').trim().length > 0)
const filtered = computed(() => catalog.searchFor(auth.groups, searchQuery.value, locale.value))
const recent = computed(() => catalog.recentApps(auth.groups).slice(0, 8))
const favorites = computed(() => catalog.favoriteApps(auth.groups))
</script>
