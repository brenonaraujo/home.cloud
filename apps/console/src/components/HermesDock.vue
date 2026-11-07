<template>
  <div
    v-if="showDock"
    class="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
  >
    <div
      class="hermes-panel absolute bottom-[calc(3.5rem+0.75rem)] right-0 flex h-[min(42rem,calc(100vh-5.5rem))] w-[min(36rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-overlay border border-line bg-surface"
      :class="dock.open ? 'is-open pointer-events-auto' : 'is-hidden'"
      role="dialog"
      aria-modal="false"
      :aria-hidden="dock.open ? 'false' : 'true'"
      :inert="!dock.open"
      :aria-label="t('console.site.dockTitle')"
      @keydown.esc.stop.prevent="closeAndReturn"
    >
        <div class="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-fg">{{ t('console.site.dockTitle') }}</p>
            <p class="truncate text-xs text-fg-muted">{{ t('console.site.dockHint') }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <HermesDockSessions :instance="instance" />
            <button
              ref="closeBtn"
              type="button"
              class="hermes-x"
              :aria-label="t('console.site.dockClose')"
              @click="closeAndReturn"
            >
              <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <iframe
          v-if="tuiSrc"
          :key="dock.nonce"
          class="min-h-0 w-full flex-1 border-0 bg-black"
          :src="tuiSrc"
          :title="t('console.site.dockTitle')"
        />
        <p v-else class="px-4 py-4 text-sm leading-relaxed text-warning-300" role="alert">
          {{ panelError || t('console.site.dockNotReady') }}
        </p>
    </div>

    <button
      ref="fab"
      type="button"
      class="hermes-fab pointer-events-auto"
      :class="{ 'is-open': dock.open }"
      :aria-label="dock.open ? t('console.site.dockClose') : t('console.site.startChat')"
      :aria-expanded="dock.open ? 'true' : 'false'"
      @click="dock.toggle()"
    >
      <span class="hermes-fab__glow" aria-hidden="true" />
      <span class="hermes-fab__face">
        <svg v-if="!dock.open" viewBox="0 0 32 32" class="h-6 w-6" fill="none" aria-hidden="true">
          <path
            d="M16 5l2.1 6.6L25 14l-6.9 2.4L16 23l-2.1-6.6L7 14l6.9-2.4L16 5Z"
            fill="currentColor"
          />
          <path
            d="M24.5 20.5l.9 2.8 2.8.9-2.8.9-.9 2.8-.9-2.8-2.8-.9 2.8-.9.9-2.8Z"
            fill="currentColor"
          />
        </svg>
        <svg v-else viewBox="0 0 16 16" class="h-4 w-4" fill="none" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/authStore'
import { useHermesDockStore } from '../stores/hermesDockStore'
import { canManageHermes } from '../config/console-taxonomy.mjs'
import {
  fetchHermesInstances,
  hermesTuiUrl,
  humanHermesError,
  pickReadyHermesInstance,
  retainLiveInstance
} from '../api/hermesApi.js'
import HermesDockSessions from './HermesDockSessions.vue'

const { t } = useI18n()
const auth = useAuthStore()
const dock = useHermesDockStore()
const instance = ref(null)
const panelError = ref('')
const fab = ref(null)
const closeBtn = ref(null)

function closeAndReturn() {
  dock.close()
  fab.value?.focus()
}

// Move focus into the panel when it opens so keyboard users land in it.
watch(
  () => dock.open,
  async (on) => {
    if (!on) return
    await nextTick()
    closeBtn.value?.focus()
  }
)

const canChat = computed(() => Boolean(instance.value?.ready && instance.value?.hostname))
const showDock = computed(() => !dock.suppressed && (dock.open || canChat.value))
const tuiSrc = computed(() => {
  const url = hermesTuiUrl(instance.value)
  return url.includes('/hermes/tui') ? url : ''
})

async function load() {
  if (!auth.isAuthenticated || !auth.idToken || !canManageHermes(auth.groups)) {
    instance.value = null
    dock.close()
    return
  }
  try {
    const data = await fetchHermesInstances(auth.idToken)
    const rows = Array.isArray(data.instances) ? data.instances : []
    instance.value = retainLiveInstance(
      instance.value,
      pickReadyHermesInstance(rows, auth.email),
      true
    )
    if (dock.open && !tuiSrc.value) panelError.value = t('console.site.dockNotReady')
    else panelError.value = ''
  } catch (err) {
    instance.value = retainLiveInstance(instance.value, null, false)
    if (dock.open) panelError.value = humanHermesError(err, t('console.site.dockError'))
  }
}

watch(
  () => [auth.ready, auth.isAuthenticated, auth.idToken, auth.email],
  () => {
    if (auth.ready) load()
  },
  { immediate: true }
)

watch(
  () => dock.nonce,
  () => {
    panelError.value = tuiSrc.value ? '' : t('console.site.dockNotReady')
  }
)

watch(showDock, (on) => {
  dock.visible = on
}, { immediate: true })

watch(tuiSrc, (url) => {
  if (url) panelError.value = ''
})

onMounted(load)
</script>

<style scoped>
.hermes-fab {
  position: relative;
  display: flex;
  height: 3.5rem;
  width: 3.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: theme('colors.brand.500');
  color: rgb(var(--bc-fg-inverse));
  border: 0;
  cursor: pointer;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.35), 0 0 0 1px rgb(118 185 0 / 0.35);
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 280ms ease;
}
.hermes-fab:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 12px 28px rgb(0 0 0 / 0.4), 0 0 0 1px rgb(118 185 0 / 0.5);
}
.hermes-fab:active {
  transform: scale(0.96);
}
.hermes-fab.is-open {
  transform: rotate(90deg);
  box-shadow: 0 6px 16px rgb(0 0 0 / 0.3);
}
.hermes-fab__face {
  position: relative;
  z-index: 1;
  display: flex;
}
.hermes-fab__glow {
  position: absolute;
  inset: -6px;
  border-radius: inherit;
  background: rgb(118 185 0 / 0.28);
  filter: blur(8px);
  animation: hermes-pulse 2.8s ease-in-out infinite;
}
.hermes-panel {
  box-shadow: 0 24px 64px rgb(0 0 0 / 0.45);
  transform-origin: bottom right;
  transition: opacity 280ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.hermes-panel.is-hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px) scale(0.94);
}
.hermes-panel.is-open {
  opacity: 1;
}
.hermes-x {
  display: flex;
  height: 2.75rem;
  width: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  color: rgb(var(--bc-fg-muted));
  transition: background 150ms ease, color 150ms ease;
}
.hermes-x:hover {
  background: rgb(var(--bc-surface-overlay));
  color: rgb(var(--bc-fg));
}
@media (max-width: 639px) {
  .hermes-fab {
    height: 3rem;
    width: 3rem;
  }
}

@keyframes hermes-pulse {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.08); }
}
@media (prefers-reduced-motion: reduce) {
  .hermes-fab,
  .hermes-fab__glow,
  .hermes-panel {
    animation: none;
    transition: none;
  }
}
</style>
