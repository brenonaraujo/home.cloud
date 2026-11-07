<template>
  <article
    class="group relative flex flex-col rounded-card border border-line bg-surface-raised p-4 transition-colors duration-fast hover:border-line-strong/60 hover:bg-surface-overlay/60"
  >
    <div class="flex min-w-0 items-start gap-4">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-control" :class="iconWrap(app.color)">
        <component :is="iconOf(app.icon)" class="h-5 w-5" :class="iconColor(app.color)" />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-base font-semibold leading-snug text-fg">
          <!-- Stretched link: the whole card opens the detail page. -->
          <router-link :to="detailTo" class="break-words after:absolute after:inset-0 after:rounded-card after:content-['']">
            {{ label(app.title) }}
          </router-link>
        </h3>
        <p class="mt-1 line-clamp-3 text-sm leading-relaxed text-fg-muted">{{ label(app.description) }}</p>
      </div>
    </div>
    <div class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
      <p class="min-w-0 truncate font-mono text-xs text-fg-subtle">{{ host(app.url) }}</p>
      <div class="relative z-10 flex shrink-0 items-center gap-1">
        <BcButton
          variant="ghost"
          icon-only
          :aria-pressed="starred ? 'true' : 'false'"
          @click="onStar"
        >
          <template #icon>
            <StarSolidIcon v-if="starred" class="h-4 w-4 text-warning-400" />
            <StarIcon v-else class="h-4 w-4" />
          </template>
          {{ starred ? t('console.unstar') : t('console.star') }}
        </BcButton>
        <BcButton :href="app.url" target="_blank" size="sm" @click="onOpen">
          {{ t('console.open') }}
        </BcButton>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/authStore'
import { useConsoleStore } from '../../stores/consoleStore'
import { useConsoleUi } from '../../composables/useConsoleUi'
import { StarIcon, StarSolidIcon } from '../icons/Icons.js'
import BcButton from './BcButton.vue'

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
