<template>
  <article
    class="flex flex-col rounded-lg border border-white/10 bg-gray-900 p-4 transition-colors duration-150 hover:border-white/20 hover:bg-gray-800/80"
  >
    <div class="flex items-start justify-between gap-4">
      <router-link :to="detailTo" class="flex min-w-0 flex-1 items-start gap-4">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
          :class="iconWrap(app.color)"
        >
          <component :is="iconOf(app.icon)" class="h-5 w-5" :class="iconColor(app.color)" />
        </div>
        <div class="min-w-0">
          <h3 class="truncate text-base font-semibold text-white">{{ label(app.title) }}</h3>
          <p class="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-400">
            {{ label(app.description) }}
          </p>
        </div>
      </router-link>
      <div class="flex shrink-0 items-center">
        <button
          type="button"
          class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white/5 hover:text-amber-300"
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
          class="inline-flex min-h-[44px] items-center gap-1 rounded-md px-2 text-xs font-medium text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-200"
          @click="onOpen"
        >
          {{ t('console.open') }}
          <ExternalIcon class="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
    <p class="mt-4 font-mono text-xs text-gray-500">{{ host(app.url) }}</p>
  </article>
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
