<template>
  <div class="relative w-full max-w-xl" ref="root">
    <!-- Phones: an icon button opens the field as a sheet over the topbar. -->
    <button
      v-if="!sheet"
      type="button"
      class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-control text-fg-muted hover:bg-white/5 hover:text-fg sm:hidden"
      :aria-label="t('console.search.open')"
      aria-controls="console-search"
      @click="openSheet"
    >
      <SearchIcon class="h-5 w-5" />
    </button>

    <div
      :class="sheet
        ? 'fixed inset-x-0 top-0 z-50 flex items-center gap-2 border-b border-line bg-surface px-4 py-2 shadow-xl'
        : 'hidden sm:block'"
    >
      <label class="sr-only" for="console-search">{{ t('console.search.placeholder') }}</label>
      <div class="relative min-w-0 flex-1">
        <SearchIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
        <input
          id="console-search"
          ref="input"
          v-model="query"
          type="search"
          autocomplete="off"
          :placeholder="t('console.search.placeholder')"
          class="h-11 w-full rounded-control border border-line-strong/70 bg-surface-raised py-2 pl-10 pr-16 text-sm text-fg placeholder:text-fg-subtle focus:border-brand-400"
          role="combobox"
          aria-autocomplete="list"
          :aria-expanded="open ? 'true' : 'false'"
          aria-controls="console-search-list"
          :aria-activedescendant="open && hits.length ? optionId(active) : undefined"
          @focus="open = true"
          @input="onInput"
          @keydown.esc.prevent="onEscape"
          @keydown.enter.prevent="goActive"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
        />
        <kbd
          class="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-line-strong/60 px-1.5 py-0.5 font-mono text-xs text-fg-subtle lg:inline"
          aria-hidden="true"
        >
          {{ modifier }}K
        </kbd>

        <div
          v-if="open"
          id="console-search-list"
          class="absolute left-0 z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-overlay border border-line bg-surface-overlay py-2 shadow-xl sm:w-[max(100%,24rem)]"
          role="listbox"
          :aria-label="q ? t('console.search.results') : t('console.home.recent')"
        >
          <p v-if="!hits.length" class="px-4 py-6 text-sm text-fg-muted" role="presentation">
            {{ q ? t('console.search.empty') : t('console.empty') }}
          </p>
          <div
            v-for="(app, index) in hits"
            :id="optionId(index)"
            :key="app.id"
            role="option"
            :aria-selected="active === index ? 'true' : 'false'"
            class="flex min-h-[44px] w-full cursor-pointer items-center gap-3 px-4 py-2 text-left text-sm"
            :class="active === index ? 'bg-white/10 text-fg' : 'text-fg-muted hover:bg-white/5'"
            @mouseenter="active = index"
            @mousedown.prevent
            @click="go('/services/' + app.id)"
          >
            <component :is="iconOf(app.icon)" class="h-4 w-4 shrink-0" :class="iconColor(app.color)" />
            <span class="shrink-0 font-medium">{{ label(app.title) }}</span>
            <span class="min-w-0 truncate font-mono text-xs text-fg-subtle">{{ host(app.url) }}</span>
          </div>
        </div>
      </div>
      <button
        v-if="sheet"
        type="button"
        class="inline-flex min-h-[44px] shrink-0 items-center rounded-control px-3 text-sm text-fg-muted hover:bg-white/5 hover:text-fg"
        @click="closeSheet"
      >
        {{ t('console.search.cancel') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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
const sheet = ref(false)
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

const optionId = (index) => `console-search-opt-${index}`

const close = () => {
  open.value = false
  active.value = 0
}

async function openSheet() {
  sheet.value = true
  open.value = true
  await nextTick()
  input.value?.focus()
}

function closeSheet() {
  sheet.value = false
  close()
}

const go = (to) => {
  closeSheet()
  query.value = ''
  router.push(to)
}

const onInput = () => {
  open.value = true
  active.value = 0
}

// APG combobox: Esc closes the list first; a second Esc clears the text.
const onEscape = () => {
  if (open.value) {
    close()
    if (sheet.value && !q.value) closeSheet()
    return
  }
  if (query.value) query.value = ''
  else if (sheet.value) closeSheet()
}

const goActive = () => {
  const app = hits.value[active.value]
  if (app) go('/services/' + app.id)
}

const move = (delta) => {
  if (!hits.value.length) return
  if (!open.value) {
    open.value = true
    return
  }
  const next = active.value + delta
  active.value = (next + hits.value.length) % hits.value.length
}

const onDocClick = (event) => {
  if (!root.value?.contains(event.target)) {
    close()
    sheet.value = false
  }
}

const onKey = (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (window.matchMedia('(max-width: 639px)').matches) {
      openSheet()
      return
    }
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
