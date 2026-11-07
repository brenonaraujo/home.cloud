<template>
  <li class="flex items-center gap-1 border-b border-line pr-2 last:border-0">
    <router-link :to="detailTo" class="flex min-h-target min-w-0 flex-1 items-center gap-3 px-3 py-2 hover:bg-white/5">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-control" :class="iconWrap(app.color)">
        <component :is="iconOf(app.icon)" class="h-4 w-4" :class="iconColor(app.color)" />
      </div>
      <span class="min-w-0 truncate text-sm font-medium text-fg">{{ label(app.title) }}</span>
      <span class="hidden min-w-0 truncate font-mono text-xs text-fg-subtle sm:block">{{ host(app.url) }}</span>
    </router-link>
    <BcButton variant="ghost" icon-only :aria-pressed="starred ? 'true' : 'false'" @click="onStar">
      <template #icon>
        <StarSolidIcon v-if="starred" class="h-4 w-4 text-warning-400" />
        <StarIcon v-else class="h-4 w-4" />
      </template>
      {{ starred ? t('console.unstar') : t('console.star') }}
    </BcButton>
    <BcButton :href="app.url" target="_blank" size="sm" variant="ghost" @click="onOpen">
      {{ t('console.open') }}
    </BcButton>
  </li>
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
