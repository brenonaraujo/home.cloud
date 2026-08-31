<template>
  <li class="flex items-center border-b border-white/5 last:border-0">
    <router-link
      :to="detailTo"
      class="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 px-3 py-2"
    >
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        :class="iconWrap(app.color)"
      >
        <component :is="iconOf(app.icon)" class="h-4 w-4" :class="iconColor(app.color)" />
      </div>
      <span class="min-w-0 truncate text-sm font-medium text-white">{{ label(app.title) }}</span>
      <span class="hidden min-w-0 truncate font-mono text-xs text-gray-500 sm:block">{{ host(app.url) }}</span>
    </router-link>
    <button
      type="button"
      class="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-gray-500 transition-colors hover:text-amber-300"
      :aria-pressed="starred"
      :aria-label="starred ? t('console.unstar') : t('console.star')"
      @click="onStar"
    >
      <StarSolidIcon v-if="starred" class="h-4 w-4 text-amber-400" />
      <StarIcon v-else class="h-4 w-4" />
    </button>
    <a
      :href="app.url"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex min-h-[44px] shrink-0 items-center gap-1 px-2 text-xs font-medium text-gray-500 transition-colors hover:text-gray-200"
      @click="onOpen"
    >
      {{ t('console.open') }}
      <ExternalIcon class="h-3.5 w-3.5" />
    </a>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/authStore'
import { useConsoleStore } from '../../stores/consoleStore'
import { useConsoleUi } from '../../composables/useConsoleUi'
import { ExternalIcon, StarIcon, StarSolidIcon } from '../icons/Icons.js'

const props = defineProps({
  app: { type: Object, required: true }
})

const { t } = useI18n()
const auth = useAuthStore()
const catalog = useConsoleStore()
const { label, host, iconOf, iconWrap, iconColor } = useConsoleUi()

const detailTo = computed(() => `/services/${props.app.id}`)
const starred = computed(() => catalog.isFavorite(props.app.id))

const onStar = () => catalog.star(props.app.id, auth.email)
const onOpen = () => catalog.visit(props.app.id, auth.email)
</script>
