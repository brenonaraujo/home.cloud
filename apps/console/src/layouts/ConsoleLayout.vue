<template>
  <div
    v-if="auth.ready && auth.isAuthenticated"
    class="flex h-screen min-h-0 overflow-hidden overflow-x-hidden bg-surface text-fg"
  >
    <a
      href="#console-main"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-surface-raised focus:px-4 focus:py-2"
    >
      {{ t('console.skip') }}
    </a>

    <ConsoleSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <ConsoleTopbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main id="console-main" class="flex-1 overflow-y-auto outline-none" tabindex="-1">
        <div
          class="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 lg:px-8"
          :class="dock.visible ? 'pb-28' : 'pb-8'"
        >
          <ConsoleBanner />
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
        </div>
      </main>
    </div>
    <HermesDock />
    <!-- Route changes and async results are announced here (WCAG 4.1.3). -->
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ announcer.message }}</p>
  </div>
  <BcSplash v-else :message="auth.error ? t('auth.identityError') : t('auth.signingIn')" :error="Boolean(auth.error)" />
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { SITE_HOME } from '../config/console-paths.mjs'
import { useAuthStore } from '../stores/authStore'
import { useConsoleStore } from '../stores/consoleStore'
import { useEntitlementStore } from '../stores/entitlementStore'
import { useHermesInstanceStore } from '../stores/hermesInstanceStore'
import { canManageHermes } from '../config/console-taxonomy.mjs'
import ConsoleSidebar from '../components/console/ConsoleSidebar.vue'
import ConsoleTopbar from '../components/console/ConsoleTopbar.vue'
import ConsoleBanner from '../components/console/ConsoleBanner.vue'
import HermesDock from '../components/HermesDock.vue'
import BcSplash from '../components/bc/BcSplash.vue'
import { useHermesDockStore } from '../stores/hermesDockStore'
import { useAnnouncer } from '../composables/useAnnouncer.js'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const catalog = useConsoleStore()
const entitlement = useEntitlementStore()
const hermesInstance = useHermesInstanceStore()
const dock = useHermesDockStore()
const announcer = useAnnouncer()
const sidebarOpen = ref(false)

watch(sidebarOpen, (open) => {
  dock.suppressed = open
})

const onKey = (event) => {
  if (event.key === 'Escape') sidebarOpen.value = false
}

onMounted(() => {
  if (auth.isAuthenticated) catalog.load()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

watch(
  () => [auth.ready, auth.email, auth.idToken],
  () => {
    if (!auth.ready || !auth.isAuthenticated) return
    catalog.load()
    if (auth.email) {
      catalog.hydratePrefs(auth.email)
      entitlement.hydrate(auth.email)
    }
    if (auth.idToken) entitlement.load(auth.idToken, auth.email)
    if (auth.idToken && canManageHermes(auth.groups)) hermesInstance.load(auth.idToken, auth.email)
  },
  { immediate: true }
)
watch(
  () => route.path,
  async (path, previous) => {
    sidebarOpen.value = false
    if (!previous) return
    await nextTick()
    announcer.say(document.title)
  }
)
watch(
  () => auth.isAuthenticated,
  (ok, was) => {
    if (was && !ok) window.location.replace(SITE_HOME)
  }
)
</script>
