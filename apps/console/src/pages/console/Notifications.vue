<template>
  <div>
    <BcPageHeader
      :crumbs="[{ label: t('console.notifications.title') }]"
      :title="t('console.notifications.title')"
      :subtitle="t('console.notifications.subtitle')"
    />

    <BcEmptyState
      v-if="!notes.length"
      class="mt-10"
      :icon="BellIcon"
      :title="t('console.notifications.emptyTitle')"
      :body="t('console.notifications.empty')"
    />

    <template v-else>
      <ul class="mt-10 divide-y divide-line rounded-card border border-line bg-surface-raised">
        <li v-for="note in page.items" :key="note.id">
          <component
            :is="note.to ? 'router-link' : 'div'"
            :to="note.to || undefined"
            class="flex items-start gap-4 px-4 py-4"
            :class="note.to ? 'transition-colors duration-fast hover:bg-white/5' : ''"
          >
            <span
              class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              :class="unread[note.id] ? (note.level === 'warning' ? 'bg-warning-400' : 'bg-brand-400') : 'bg-fg-subtle/40'"
              aria-hidden="true"
            />
            <div class="min-w-0 flex-1">
              <p class="flex flex-wrap items-center gap-2 text-sm font-medium" :class="unread[note.id] ? 'text-fg' : 'text-fg-muted'">
                {{ t('console.notifications.items.' + note.key + '.title') }}
                <BcBadge v-if="unread[note.id]" :tone="note.level === 'warning' ? 'warning' : 'brand'">
                  {{ t('console.notifications.new') }}
                </BcBadge>
              </p>
              <p class="mt-1 text-sm leading-relaxed text-fg-muted">
                {{ t('console.notifications.items.' + note.key + '.body') }}
              </p>
            </div>
            <ChevronRightIcon v-if="note.to" class="mt-1 h-4 w-4 shrink-0 text-fg-subtle" />
          </component>
        </li>
      </ul>

      <nav
        v-if="page.pages > 1"
        class="mt-6 flex flex-wrap items-center justify-between gap-4"
        :aria-label="t('console.notifications.pagination')"
      >
        <p class="text-sm text-fg-muted">
          {{ t('console.notifications.pageOf', { page: page.page, pages: page.pages, total: page.total }) }}
        </p>
        <div class="flex gap-2">
          <BcButton :to="page.page > 1 ? { query: { page: page.page - 1 } } : ''" :disabled="page.page <= 1">
            {{ t('console.notifications.prev') }}
          </BcButton>
          <BcButton :to="page.page < page.pages ? { query: { page: page.page + 1 } } : ''" :disabled="page.page >= page.pages">
            {{ t('console.notifications.next') }}
          </BcButton>
        </div>
      </nav>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useConsoleStore } from '../../stores/consoleStore'
import { useHermesInstanceStore } from '../../stores/hermesInstanceStore'
import { buildNotifications } from '../../config/console-overview.mjs'
import { paginate } from '../../config/console-prefs.mjs'
import { BellIcon, ChevronRightIcon } from '../../components/icons/Icons.js'
import { BcBadge, BcButton, BcEmptyState, BcPageHeader } from '../../components/bc/index.js'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const catalog = useConsoleStore()
const hermesInstance = useHermesInstanceStore()

const notes = computed(() =>
  buildNotifications({ catalogOffline: Boolean(catalog.error), groups: auth.groups, hermesInstance: hermesInstance.hasInstance })
)
const page = computed(() => paginate(notes.value, route.query.page))

// Snapshot "unread" before marking the page as read, so "New" stays visible
// for this visit instead of disappearing as soon as the page renders.
const unread = ref({})

watch(
  [page, () => auth.email],
  ([current, email]) => {
    const next = { ...unread.value }
    for (const note of current.items) {
      if (!(note.id in next)) next[note.id] = !catalog.isNoteRead(note.id)
    }
    unread.value = next
    if (email && current.items.length) {
      catalog.markNotesRead(current.items.map((n) => n.id), email)
    }
  },
  { immediate: true }
)
</script>
