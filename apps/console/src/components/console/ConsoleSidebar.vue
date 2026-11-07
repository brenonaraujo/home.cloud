<template>
  <div class="min-h-0 lg:flex lg:h-full lg:w-60 lg:min-h-0 lg:shrink-0 lg:flex-col">
    <transition name="console-drawer">
      <button
        v-if="open"
        type="button"
        class="fixed inset-0 z-40 bg-black/60 lg:hidden"
        :aria-label="t('console.nav.closeMenu')"
        @click="$emit('close')"
      />
    </transition>

    <aside
      class="fixed inset-y-0 left-0 z-50 flex h-full min-h-0 w-60 shrink-0 flex-col overflow-hidden border-r border-line bg-surface transition-transform duration-base lg:static lg:h-full lg:translate-x-0"
      :class="open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div class="flex h-14 shrink-0 items-center gap-2 border-b border-line px-4">
        <router-link to="/" class="flex min-h-target min-w-0 items-center gap-2 rounded-control" @click="$emit('close')">
          <img src="/brenon-cloud-logo.png" alt="" class="h-8 w-8" />
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-fg">Brenon Cloud</p>
            <p class="truncate text-eyebrow uppercase text-fg-subtle">
              {{ t('console.title') }}
            </p>
          </div>
        </router-link>
      </div>

      <nav class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-2 py-4" :aria-label="t('console.title')">
        <ul class="flex flex-col gap-1">
          <li>
            <router-link
              to="/"
              class="console-nav-link"
              :class="exactActive('/')"
              :aria-current="route.path === '/' ? 'page' : undefined"
              @click="$emit('close')"
            >
              <HomeIcon class="h-4 w-4" />
              {{ t('console.nav.home') }}
            </router-link>
          </li>
          <li>
            <router-link
              to="/services"
              class="console-nav-link"
              :class="sectionActive('/services')"
              :aria-current="route.path === '/services' ? 'page' : undefined"
              @click="$emit('close')"
            >
              <GridIcon class="h-4 w-4" />
              {{ t('console.nav.services') }}
            </router-link>
          </li>
        </ul>

        <p class="console-nav-label">{{ t('console.nav.products') }}</p>
        <ul class="flex flex-col gap-1">
          <li>
            <router-link
              to="/hermes"
              class="console-nav-link"
              :class="exactActive('/hermes')"
              :aria-current="route.path === '/hermes' ? 'page' : undefined"
              @click="$emit('close')"
            >
              <BoltIcon class="h-4 w-4" />
              <span class="flex-1">{{ t('console.nav.hermes') }}</span>
              <BcBadge :tone="hermesBadgeTone">{{ hermesBadge }}</BcBadge>
            </router-link>
          </li>
        </ul>

        <div v-if="favorites.length">
          <button
            type="button"
            class="console-nav-label flex min-h-target w-full cursor-pointer items-center justify-between gap-2 rounded-control bg-transparent text-left hover:text-fg"
            :aria-expanded="!catalog.sidebarFavoritesHidden"
            aria-controls="console-sidebar-favorites"
            :aria-label="
              catalog.sidebarFavoritesHidden
                ? t('console.nav.showFavorites')
                : t('console.nav.hideFavorites')
            "
            @click="toggleFavoritesHidden"
          >
            <span>{{ t('console.nav.favorites') }}</span>
            <ChevronRightIcon
              class="h-3 w-3 shrink-0 transition-transform duration-150"
              :class="catalog.sidebarFavoritesHidden ? '' : 'rotate-90'"
            />
          </button>
          <ul
            v-show="!catalog.sidebarFavoritesHidden"
            id="console-sidebar-favorites"
            class="flex flex-col gap-1"
          >
            <li v-for="app in favorites" :key="'fav-' + app.id">
              <router-link
                :to="'/services/' + app.id"
                class="console-nav-link"
                :class="exactActive('/services/' + app.id)"
                :aria-current="route.path === '/services/' + app.id ? 'page' : undefined"
                @click="$emit('close')"
              >
                <StarSolidIcon class="h-4 w-4 shrink-0 text-warning-400" />
                <span class="truncate">{{ label(app.title) }}</span>
              </router-link>
            </li>
          </ul>
        </div>

        <p v-if="applications.length" class="console-nav-label">{{ t('console.nav.applications') }}</p>
        <ul v-if="applications.length" class="flex flex-col gap-1">
          <li v-for="app in applications" :key="'app-' + app.id">
            <router-link
              :to="'/services/' + app.id"
              class="console-nav-link"
              :class="exactActive('/services/' + app.id)"
                :aria-current="route.path === '/services/' + app.id ? 'page' : undefined"
              @click="$emit('close')"
            >
              <component :is="iconOf(app.icon)" class="h-4 w-4" :class="iconColor(app.color)" />
              <span class="truncate">{{ label(app.title) }}</span>
            </router-link>
          </li>
        </ul>

        <p v-if="platform.length" class="console-nav-label">{{ t('console.nav.platform') }}</p>
        <ul v-if="platform.length" class="flex flex-col gap-1">
          <li v-for="app in platform" :key="'plat-' + app.id">
            <router-link
              :to="'/services/' + app.id"
              class="console-nav-link"
              :class="exactActive('/services/' + app.id)"
                :aria-current="route.path === '/services/' + app.id ? 'page' : undefined"
              @click="$emit('close')"
            >
              <component :is="iconOf(app.icon)" class="h-4 w-4" :class="iconColor(app.color)" />
              <span class="truncate">{{ label(app.title) }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="shrink-0 border-t border-line px-2 py-4">
        <ul class="flex flex-col gap-1">
          <li>
            <a
              :href="HOUSE_STATUS"
              target="_blank"
              rel="noopener noreferrer"
              class="console-nav-link"
            >
              <ChartIcon class="h-4 w-4" />
              {{ t('console.nav.status') }}
              <ExternalIcon class="ml-auto h-4 w-4 text-fg-subtle" />
              <span class="sr-only">{{ t('bc.newTab') }}</span>
            </a>
          </li>
          <li>
            <a :href="SITE_HOME" class="console-nav-link" @click="$emit('close')">
              <ArrowLeftIcon class="h-4 w-4" />
              {{ t('console.nav.backToSite') }}
            </a>
          </li>
        </ul>
        <div class="mt-4 px-1 lg:hidden">
          <LanguageSelector />
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { HOUSE_STATUS, SITE_HOME } from '../../config/console-paths.mjs'
import { useAuthStore } from '../../stores/authStore'
import { useConsoleStore } from '../../stores/consoleStore'
import { useConsoleUi } from '../../composables/useConsoleUi'
import {
  canManageHermes,
  isHermesSubscriber
} from '../../config/console-taxonomy.mjs'
import LanguageSelector from '../ui/LanguageSelector.vue'
import BcBadge from '../bc/BcBadge.vue'
import {
  ArrowLeftIcon,
  BoltIcon,
  ChartIcon,
  ChevronRightIcon,
  ExternalIcon,
  GridIcon,
  HomeIcon,
  StarSolidIcon
} from '../icons/Icons.js'

defineProps({
  open: { type: Boolean, default: false }
})
defineEmits(['close'])

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const catalog = useConsoleStore()
const { label, iconOf, iconColor } = useConsoleUi()

const grouped = computed(() => catalog.groupedFor(auth.groups))
const applications = computed(() => grouped.value.applications)
const platform = computed(() => grouped.value.platform)
const favorites = computed(() => catalog.favoriteApps(auth.groups))

const toggleFavoritesHidden = () => {
  catalog.hideSidebarFavorites(!catalog.sidebarFavoritesHidden, auth.email)
}

const hermesBadge = computed(() => {
  if (isHermesSubscriber(auth.groups)) return t('console.hermes.badgePlan')
  if (canManageHermes(auth.groups)) return t('console.hermes.badgeOperator')
  return t('console.hermes.badgeSoon')
})

const hermesBadgeTone = computed(() => (canManageHermes(auth.groups) ? 'brand' : 'neutral'))

const ACTIVE = 'bg-white/10 font-medium text-fg shadow-[inset_2px_0_0_theme(colors.brand.400)]'
const IDLE = 'text-fg-muted hover:bg-white/5 hover:text-fg'

// Only the most specific item is active; a section parent (All services while a
// service page is open) keeps a subtle "you are inside" tint instead.
const exactActive = (path) => (route.path === path ? ACTIVE : IDLE)

const sectionActive = (path) => {
  if (route.path === path) return ACTIVE
  if (route.path.startsWith(path + '/')) return 'text-fg hover:bg-white/5'
  return IDLE
}
</script>
