<template>
  <header class="relative z-30 flex h-14 min-w-0 shrink-0 items-center gap-2 border-b border-line bg-surface/90 px-4 backdrop-blur sm:gap-4">
    <button
      type="button"
      class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-control text-fg-muted hover:bg-white/5 hover:text-fg lg:hidden"
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
      class="hidden min-h-[44px] shrink-0 items-center gap-2 rounded-control border border-line-strong/60 px-3 text-sm text-fg transition-colors duration-fast hover:border-line-strong hover:bg-white/5 lg:inline-flex"
    >
      <ArrowLeftIcon class="h-4 w-4" />
      <span>{{ t('console.nav.backToSite') }}</span>
    </a>

    <div class="hidden items-center gap-2 lg:flex">
      <router-link
        to="/billing"
        class="inline-flex min-h-[44px] items-center rounded-control"
        :aria-label="t('console.nav.planLink', { plan: planLabel })"
      >
        <BcBadge :tone="isPaid ? 'brand' : 'neutral'">{{ planLabel }}</BcBadge>
      </router-link>
    </div>

    <div class="hidden lg:block">
      <LanguageSelector />
    </div>

    <router-link
      to="/notifications"
      class="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-control text-fg-muted transition-colors duration-fast hover:bg-white/5 hover:text-fg"
      :aria-label="noteCount ? t('console.nav.notificationsUnread', { n: noteCount }) : t('console.nav.notifications')"
    >
      <BellIcon class="h-5 w-5" />
      <span
        v-if="noteCount"
        class="absolute right-0.5 top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-500 px-1 text-xs font-semibold text-fg-inverse"
        aria-hidden="true"
      >
        {{ noteCount }}
      </span>
    </router-link>

    <div class="relative shrink-0" ref="menuRoot">
      <button
        ref="menuTrigger"
        type="button"
        class="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-control border border-line px-2 py-1 text-sm text-fg transition-colors duration-fast hover:border-line-strong"
        :aria-label="t('console.nav.sessionMenu')"
        :aria-expanded="menuOpen"
        aria-haspopup="menu"
        aria-controls="console-session-menu"
        @click.stop="toggleMenu"
        @keydown="onTriggerKey"
      >
        <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-200">
          {{ initials }}
        </span>
        <span class="max-w-[7rem] truncate lg:max-w-[9rem]">{{ sessionLabel }}</span>
      </button>
      <div
        v-if="menuOpen"
        id="console-session-menu"
        ref="menuList"
        class="absolute right-0 z-50 mt-2 w-60 rounded-overlay border border-line bg-surface-overlay py-1 shadow-xl"
        role="menu"
        :aria-label="t('console.nav.sessionMenu')"
        @keydown="onMenuKey"
      >
        <div class="border-b border-line px-3 py-2" role="none">
          <p class="truncate text-sm text-fg">{{ sessionLabel }}</p>
          <p v-if="auth.email && auth.email !== sessionLabel" class="truncate font-mono text-xs text-fg-muted">
            {{ auth.email }}
          </p>
        </div>
        <router-link
          to="/account"
          class="flex min-h-[44px] items-center px-3 text-sm text-fg hover:bg-white/5 focus:bg-white/10 focus:outline-none"
          role="menuitem"
          tabindex="-1"
          @click="closeMenu()"
        >
          {{ t('console.nav.account') }}
        </router-link>
        <router-link
          to="/billing"
          class="flex min-h-[44px] items-center px-3 text-sm text-fg hover:bg-white/5 focus:bg-white/10 focus:outline-none"
          role="menuitem"
          tabindex="-1"
          @click="closeMenu()"
        >
          {{ t('console.nav.billing') }}
        </router-link>
        <div class="my-1 border-t border-line" role="none" />
        <button
          type="button"
          class="flex min-h-[44px] w-full items-center px-3 text-left text-sm text-fg-muted hover:bg-white/5 hover:text-fg focus:bg-white/10 focus:outline-none"
          role="menuitem"
          tabindex="-1"
          @click="auth.logout()"
        >
          {{ t('navbar.logout') }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { SITE_HOME } from '../../config/console-paths.mjs'
import { useAuthStore } from '../../stores/authStore'
import { useConsoleStore } from '../../stores/consoleStore'
import { useHermesInstanceStore } from '../../stores/hermesInstanceStore'
import { buildNotifications } from '../../config/console-overview.mjs'
import { unreadNotifications } from '../../config/console-prefs.mjs'
import { useConsoleUi } from '../../composables/useConsoleUi'
import { useMenu } from '../../composables/useMenu.js'
import { usePlan } from '../../composables/usePlan.js'
import LanguageSelector from '../ui/LanguageSelector.vue'
import BcBadge from '../bc/BcBadge.vue'
import ConsoleSearch from './ConsoleSearch.vue'
import { ArrowLeftIcon, BellIcon, MenuIcon } from '../icons/Icons.js'

defineEmits(['toggle-sidebar'])

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const catalog = useConsoleStore()
const hermesInstance = useHermesInstanceStore()
const { initials, sessionLabel } = useConsoleUi()
const { label: planLabel, isPaid } = usePlan()

// Session menu: WAI-ARIA menu button (arrows, Home/End, Esc back to trigger).
const {
  open: menuOpen,
  root: menuRoot,
  trigger: menuTrigger,
  list: menuList,
  closeMenu,
  toggleMenu,
  onMenuKey,
  onTriggerKey
} = useMenu()

const noteCount = computed(() => unreadNotifications(
  buildNotifications({ catalogOffline: Boolean(catalog.error), groups: auth.groups, hermesInstance: hermesInstance.hasInstance }),
  catalog.readNotificationIds
).length)

watch(() => route.fullPath, () => closeMenu())
</script>
