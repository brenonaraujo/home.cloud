<template>
  <div class="relative w-full max-w-xl" ref="root">
    <label class="sr-only" for="console-search">{{ t('console.search.placeholder') }}</label>
    <div class="relative">
      <SearchIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <input
        id="console-search"
        ref="input"
        v-model="query"
        type="search"
        autocomplete="off"
        :placeholder="t('console.search.placeholder')"
        class="h-11 w-full rounded-md border border-white/10 bg-gray-900 py-2 pl-10 pr-16 text-sm text-white placeholder:text-gray-500 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="open"
        aria-controls="console-search-list"
        @focus="open = true"
        @keydown.esc.prevent="close"
        @keydown.enter.prevent="goFirst"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
      />
      <kbd
        class="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-gray-500 lg:inline"
      >
        {{ modifier }}K
      </kbd>
    </div>

    <div
      v-if="open"
      id="console-search-list"
      class="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border border-white/10 bg-gray-900 py-2 shadow-xl"
      role="listbox"
    >
      <p v-if="!hits.length" class="px-4 py-6 text-sm text-gray-500">
        {{ q ? t('console.search.empty') : t('console.empty') }}
      </p>
      <button
        v-for="(app, index) in hits"
        :key="app.id"
        type="button"
        role="option"
        :aria-selected="active === index"
        class="flex w-full items-center gap-3 px-4 py-2 text-left text-sm"
        :class="active === index ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'"
        @mouseenter="active = index"
        @click="go('/services/' + app.id)"
      >
        <component :is="iconOf(app.icon)" class="h-4 w-4 shrink-0" :class="iconColor(app.color)" />
        <span class="truncate font-medium">{{ label(app.title) }}</span>
        <span class="truncate font-mono text-xs text-gray-500">{{ host(app.url) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useConsoleStore } from '../../stores/consoleStore'
import { useConsoleUi } from '../../composables/useConsoleUi'
import { SearchIcon } from '../icons/Icons.js'

const { t, locale } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const catalog = useConsoleStore()
const { searchQuery: query } = storeToRefs(catalog)
const { label, host, iconOf, iconColor } = useConsoleUi()

const open = ref(false)
const active = ref(0)
const root = ref(null)
const input = ref(null)

const modifier = computed(() =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl+'
)

const q = computed(() => String(query.value || '').trim().toLowerCase())

const hits = computed(() => {
  if (!q.value) return catalog.recentApps(auth.groups).slice(0, 6)
  return catalog.searchFor(auth.groups, query.value, locale.value).slice(0, 8)
})

const close = () => {
  open.value = false
  active.value = 0
}

const go = (to) => {
  close()
  query.value = ''
  router.push(to)
}

const goFirst = () => {
  const app = hits.value[active.value] || hits.value[0]
  if (app) go('/services/' + app.id)
}

const move = (delta) => {
  if (!hits.value.length) return
  open.value = true
  const next = active.value + delta
  active.value = (next + hits.value.length) % hits.value.length
}

const onDocClick = (event) => {
  if (!root.value?.contains(event.target)) close()
}

const onKey = (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    open.value = true
    input.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>
