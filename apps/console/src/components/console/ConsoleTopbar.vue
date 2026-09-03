<template>
  <header class="flex h-14 min-w-0 shrink-0 items-center gap-2 overflow-hidden border-b border-white/10 bg-gray-950/90 px-4 backdrop-blur sm:gap-4">
    <button
      type="button"
      class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-300 hover:bg-white/5 hover:text-white lg:hidden"
      :aria-label="t('console.nav.menu')"
      @click="$emit('toggle-sidebar')"
    >
      <MenuIcon class="h-5 w-5" />
    </button>

    <div class="min-w-0 flex-1">
      <ConsoleSearch />
    </div>

    <a
      :href="SITE_HOME"
      class="hidden min-h-[44px] shrink-0 items-center gap-2 rounded-md border border-white/15 px-3 text-sm text-gray-200 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white lg:inline-flex"
    >
      <ArrowLeftIcon class="h-4 w-4" />
      <span>{{ t('console.nav.backToSite') }}</span>
    </a>

    <div class="hidden items-center gap-2 lg:flex">
      <span
        class="rounded border border-white/10 px-2 py-1 font-mono text-[11px] uppercase tracking-wide text-gray-400"
        :title="t('console.regionHint')"
      >
        {{ t('console.region') }}
      </span>
      <span class="rounded border border-white/10 px-2 py-1 text-[11px] uppercase tracking-wide text-gray-400">
        {{ planLabel }}
      </span>
    </div>

    <div class="hidden lg:block">
      <LanguageSelector />
    </div>

    <router-link
      to="/notifications"
      class="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
      :aria-label="t('console.nav.notifications')"
    >
      <BellIcon class="h-5 w-5" />
      <span
        v-if="noteCount"
        class="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-medium text-white"
      >
        {{ noteCount }}
      </span>
    </router-link>

    <div class="relative" ref="menuRoot">
      <button
        type="button"
        class="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-white/10 px-2 py-1 text-sm text-gray-200 transition-colors hover:border-white/20 hover:text-white"
        :aria-label="t('console.nav.sessionMenu')"
        :aria-expanded="menuOpen"
        aria-haspopup="menu"
        @click.stop="menuOpen = !menuOpen"
      >
        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300">
          {{ initials }}
        </span>
        <span class="hidden max-w-[9rem] truncate lg:inline">{{ auth.displayName }}</span>
      </button>
      <div
        v-if="menuOpen"
        class="absolute right-0 z-50 mt-2 w-56 rounded-md border border-white/10 bg-gray-900 py-1 shadow-xl"
        role="menu"
      >
        <div class="border-b border-white/10 px-3 py-2">
          <p class="truncate text-sm text-white">{{ auth.displayName }}</p>
          <p class="truncate font-mono text-xs text-gray-500">{{ auth.email }}</p>
        </div>
        <router-link
          to="/account"
          class="flex min-h-[44px] items-center px-3 text-sm text-gray-200 hover:bg-white/5"
          role="menuitem"
          @click="menuOpen = false"
        >
          {{ t('console.nav.account') }}
        </router-link>
        <router-link
          to="/billing"
          class="flex min-h-[44px] items-center px-3 text-sm text-gray-200 hover:bg-white/5"
          role="menuitem"
          @click="menuOpen = false"
        >
          {{ t('console.nav.billing') }}
        </router-link>
        <button
          type="button"
          class="flex min-h-[44px] w-full items-center px-3 text-left text-sm text-gray-400 hover:bg-white/5 hover:text-white"
          role="menuitem"
          @click="auth.logout()"
        >
          {{ t('navbar.logout') }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { SITE_HOME } from '../../config/console-paths.mjs'
import { useAuthStore } from '../../stores/authStore'
import { useConsoleStore } from '../../stores/consoleStore'
import { displayPlan } from '../../config/console-taxonomy.mjs'
import { useEntitlementStore } from '../../stores/entitlementStore'
import { buildNotifications } from '../../config/console-overview.mjs'
import { unreadNotifications } from '../../config/console-prefs.mjs'
import { useConsoleUi } from '../../composables/useConsoleUi'
import LanguageSelector from '../ui/LanguageSelector.vue'
import ConsoleSearch from './ConsoleSearch.vue'
import { ArrowLeftIcon, BellIcon, MenuIcon } from '../icons/Icons.js'

defineEmits(['toggle-sidebar'])

const { t, te } = useI18n()
const auth = useAuthStore()
const catalog = useConsoleStore()
const entitlement = useEntitlementStore()
const { initials } = useConsoleUi()
const menuOpen = ref(false)
const menuRoot = ref(null)

const planLabel = computed(() => {
  const plan = displayPlan(auth.groups, entitlement.billing)
  const key = `console.plan.${plan}`
  return te(key) ? t(key) : plan
})

const noteCount = computed(
  () =>
    unreadNotifications(
      buildNotifications({ catalogOffline: Boolean(catalog.error), groups: auth.groups }),
      catalog.readNotificationIds
    ).length
)

const onDocClick = (event) => {
  if (!menuRoot.value?.contains(event.target)) menuOpen.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>
