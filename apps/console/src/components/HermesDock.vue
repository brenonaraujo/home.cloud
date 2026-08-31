<template>
  <div
    v-if="showDock"
    class="pointer-events-none fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3"
  >
    <transition name="hermes-panel">
      <div
        v-if="dock.open"
        class="hermes-panel pointer-events-auto flex h-[min(42rem,calc(100vh-5.5rem))] w-[min(36rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-gray-950"
        role="dialog"
        aria-modal="true"
        :aria-label="t('console.site.dockTitle')"
      >
        <div class="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-white">{{ t('console.site.dockTitle') }}</p>
            <p class="truncate text-xs text-gray-400">{{ t('console.site.dockHint') }}</p>
          </div>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="rounded-full px-2.5 py-1 text-[11px] text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-40"
              :disabled="sending"
              @click="restart"
            >
              {{ t('console.site.dockNew') }}
            </button>
            <button
              type="button"
              class="hermes-x"
              :aria-label="t('console.site.dockClose')"
              @click="dock.close()"
            >
              <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div ref="scroller" class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
          <p v-if="!thread.length && !sending" class="text-sm leading-relaxed text-gray-400">
            {{ t('console.site.dockEmpty') }}
          </p>
          <div
            v-for="(m, i) in thread"
            :key="i"
            class="flex"
            :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
              :class="m.role === 'user' ? 'bg-[#f4911e] text-gray-950' : 'bg-gray-900 text-gray-100'"
            >{{ m.content }}</div>
          </div>
          <p v-if="sending" class="text-xs text-gray-500">{{ t('console.site.dockTyping') }}</p>
          <p v-if="chatError" class="text-sm text-amber-300" role="alert">{{ chatError }}</p>
        </div>

        <form class="flex gap-2 border-t border-white/10 p-3" @submit.prevent="send">
          <input
            v-model="draft"
            class="h-11 flex-1 rounded-2xl border border-white/15 bg-gray-900 px-3 text-sm text-white outline-none focus:border-[#f4911e] disabled:opacity-60"
            :placeholder="t('console.site.dockPlaceholder')"
            :disabled="sending"
          >
          <button
            type="submit"
            class="h-11 min-w-[5.5rem] rounded-2xl bg-[#f4911e] px-4 text-sm font-semibold text-gray-950 disabled:opacity-70"
            :disabled="sending || !draft.trim()"
          >
            {{ sending ? '…' : t('console.site.dockSend') }}
          </button>
        </form>
      </div>
    </transition>

    <button
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
            fill="#111827"
          />
          <path
            d="M24.5 20.5l.9 2.8 2.8.9-2.8.9-.9 2.8-.9-2.8-2.8-.9 2.8-.9.9-2.8Z"
            fill="#111827"
          />
        </svg>
        <svg v-else viewBox="0 0 16 16" class="h-4 w-4" fill="none" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" stroke="#111827" stroke-width="1.8" stroke-linecap="round" />
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
  humanHermesError,
  pickReadyHermesInstance,
  sendHermesChat
} from '../api/hermesApi.js'

const { t } = useI18n()
const auth = useAuthStore()
const dock = useHermesDockStore()
const instance = ref(null)
const draft = ref('')
const thread = ref([])
const sending = ref(false)
const chatError = ref('')
const scroller = ref(null)
const fresh = ref(true)

const canChat = computed(() => Boolean(instance.value?.ready && instance.value?.hostname))
const showDock = computed(() => dock.open || canChat.value)

function scrollEnd() {
  nextTick(() => {
    const el = scroller.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

function restart() {
  if (sending.value) return
  thread.value = []
  chatError.value = ''
  fresh.value = true
  dock.restart()
}

async function send() {
  const text = draft.value.trim()
  if (!text || sending.value) return
  if (!auth.idToken) {
    chatError.value = t('console.site.dockError')
    return
  }
  draft.value = ''
  thread.value = [...thread.value, { role: 'user', content: text }]
  sending.value = true
  chatError.value = ''
  scrollEnd()
  try {
    const data = await sendHermesChat(auth.idToken, text, { fresh: fresh.value })
    fresh.value = false
    const reply = String(data.reply || '').trim()
    if (reply) thread.value = [...thread.value, { role: 'assistant', content: reply }]
    else chatError.value = t('console.site.dockEmptyReply')
  } catch (err) {
    chatError.value = humanHermesError(err, t('console.site.dockError'))
  } finally {
    sending.value = false
    scrollEnd()
  }
}

async function load() {
  if (!auth.isAuthenticated || !auth.idToken || !canManageHermes(auth.groups)) {
    instance.value = null
    dock.close()
    return
  }
  try {
    const data = await fetchHermesInstances(auth.idToken)
    const rows = Array.isArray(data.instances) ? data.instances : []
    instance.value = pickReadyHermesInstance(rows, auth.email)
    if (dock.open && !canChat.value) chatError.value = t('console.site.dockNotReady')
  } catch {
    instance.value = null
    if (dock.open) chatError.value = t('console.site.dockError')
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
    thread.value = []
    chatError.value = canChat.value ? '' : t('console.site.dockNotReady')
    fresh.value = true
  }
)

watch(canChat, (ok) => {
  if (ok && chatError.value === t('console.site.dockNotReady')) chatError.value = ''
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
  background: #f4911e;
  color: #111827;
  border: 0;
  cursor: pointer;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.35), 0 0 0 1px rgb(244 145 30 / 0.35);
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 280ms ease;
}
.hermes-fab:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 12px 28px rgb(0 0 0 / 0.4), 0 0 0 1px rgb(244 145 30 / 0.5);
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
  background: rgb(244 145 30 / 0.28);
  filter: blur(8px);
  animation: hermes-pulse 2.8s ease-in-out infinite;
}
.hermes-panel {
  box-shadow: 0 24px 64px rgb(0 0 0 / 0.45);
  transform-origin: bottom right;
}
.hermes-x {
  display: flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  color: #9ca3af;
  transition: background 150ms ease, color 150ms ease;
}
.hermes-x:hover {
  background: #1f2937;
  color: #f9fafb;
}
.hermes-panel-enter-active {
  transition: opacity 280ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.hermes-panel-leave-active {
  transition: opacity 180ms cubic-bezier(0.4, 0, 1, 1), transform 180ms cubic-bezier(0.4, 0, 1, 1);
}
.hermes-panel-enter-from,
.hermes-panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.94);
}
@keyframes hermes-pulse {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.08); }
}
@media (prefers-reduced-motion: reduce) {
  .hermes-fab,
  .hermes-fab__glow,
  .hermes-panel-enter-active,
  .hermes-panel-leave-active {
    animation: none;
    transition: none;
  }
}
</style>
