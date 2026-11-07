<template>
  <div>
    <ConsoleBreadcrumb :items="crumbs" />

    <BcSkeleton v-if="catalog.loading" height-class="h-48" />

    <BcEmptyState
      v-else-if="!app"
      heading-tag="h1"
      :icon="InboxIcon"
      :title="t('console.services.notFoundTitle')"
      :body="t('console.services.notFound')"
    >
      <template #actions>
        <BcButton to="/services">{{ t('console.services.back') }}</BcButton>
      </template>
    </BcEmptyState>

    <template v-else>
      <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex min-w-0 items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-control" :class="iconWrap(app.color)">
            <component :is="iconOf(app.icon)" class="h-6 w-6" :class="iconColor(app.color)" />
          </div>
          <div class="min-w-0">
            <p class="text-eyebrow-label">{{ kindLabel }}</p>
            <h1 class="mt-1 break-words text-page-title text-fg">{{ label(app.title) }}</h1>
            <p class="mt-2 max-w-2xl text-sm leading-relaxed text-fg-muted">{{ label(app.description) }}</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <BcButton :aria-pressed="starred ? 'true' : 'false'" @click="catalog.star(app.id, auth.email)">
            <template #icon>
              <StarSolidIcon v-if="starred" class="h-4 w-4 text-warning-400" />
              <StarIcon v-else class="h-4 w-4" />
            </template>
            {{ starred ? t('console.unstar') : t('console.star') }}
          </BcButton>
          <BcButton variant="primary" :href="app.url" target="_blank" @click="catalog.visit(app.id, auth.email)">
            {{ t('console.openService') }}
          </BcButton>
        </div>
      </div>

      <h2 class="mt-10 text-sm font-semibold text-fg">{{ t('console.services.details') }}</h2>
      <BcDescriptionList class="mt-4" boxed columns="sm:grid-cols-2 lg:grid-cols-3" :items="detailItems" />

      <BcPanel v-if="details?.bullets?.length" class="mt-8" :title="t('console.services.about')">
        <ul class="list-disc space-y-2 pl-5 text-sm leading-relaxed text-fg">
          <li v-for="line in details.bullets" :key="line">{{ line }}</li>
        </ul>
        <div class="mt-6 flex flex-wrap gap-2">
          <BcButton v-if="details.docsUrl" :href="details.docsUrl" variant="ghost" size="sm">{{ t('console.services.docs') }}</BcButton>
          <BcButton v-if="details.statusUrl" :href="details.statusUrl" target="_blank" variant="ghost" size="sm">
            {{ t('console.services.status') }}
          </BcButton>
        </div>
      </BcPanel>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useConsoleStore } from '../../stores/consoleStore'
import { useConsoleUi } from '../../composables/useConsoleUi'
import { usePageTitle } from '../../composables/usePageTitle.js'
import { serviceKind } from '../../config/console-taxonomy.mjs'
import {
  formatAbsoluteTime,
  formatRelativeTime,
  serviceDetails
} from '../../config/console-service-details.mjs'
import ConsoleBreadcrumb from '../../components/console/ConsoleBreadcrumb.vue'
import { InboxIcon, StarIcon, StarSolidIcon } from '../../components/icons/Icons.js'
import { BcButton, BcDescriptionList, BcEmptyState, BcPanel, BcSkeleton } from '../../components/bc/index.js'

const { t, te, locale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const catalog = useConsoleStore()
const { label, iconOf, iconWrap, iconColor } = useConsoleUi()

const previousVisitAt = ref(null)

const app = computed(() => catalog.appsFor(auth.groups).find((item) => item.id === route.params.id) || null)
const starred = computed(() => app.value && catalog.isFavorite(app.value.id))
usePageTitle(() => (app.value ? label(app.value.title) : ''))
const details = computed(() => (app.value ? serviceDetails(app.value, locale.value) : null))
const kindLabel = computed(() =>
  app.value && serviceKind(app.value) === 'application'
    ? t('console.services.kindApplication')
    : t('console.services.kindPlatform')
)
const accessLabel = computed(() =>
  details.value?.access === 'any' ? t('console.services.anyAccount') : t('console.services.staffOnly')
)
const planLabel = computed(() => {
  const plan = details.value?.plan || 'staff'
  const key = plan === 'staff' ? 'console.account.staff' : `console.plan.${plan}`
  return te(key) ? t(key) : plan
})
const lastOpenedLabel = computed(() =>
  formatRelativeTime(previousVisitAt.value, Date.now(), locale.value)
)
const lastOpenedAbsolute = computed(() => formatAbsoluteTime(previousVisitAt.value, locale.value))
const detailItems = computed(() => {
  if (!app.value || !details.value) return []
  return [
    { label: t('console.services.host'), value: details.value.host, href: app.value.url, mono: true },
    { label: t('console.services.required'), value: accessLabel.value },
    { label: t('console.services.availableFrom'), value: planLabel.value },
    { label: t('console.services.identity'), value: t('console.services.identityValue') },
    lastOpenedLabel.value
      ? { label: t('console.services.lastOpened'), value: lastOpenedLabel.value, title: lastOpenedAbsolute.value, hint: t('console.services.lastOpenedHint') }
      : null
  ].filter(Boolean)
})
const crumbs = computed(() => [
  { label: t('console.services.title'), to: '/services' },
  { label: app.value ? label(app.value.title) : t('console.services.notFoundTitle') }
])

watch(
  [app, () => auth.email],
  ([svc, email]) => {
    if (!svc || !email) {
      previousVisitAt.value = null
      return
    }
    previousVisitAt.value = catalog.lastVisitAt(svc.id)
    catalog.visit(svc.id, email)
  },
  { immediate: true }
)
</script>
