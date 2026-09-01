<template>
  <div v-if="allowed" class="flex min-h-0 flex-col border-b border-white/10 px-4 py-4">
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="inline-flex min-h-[44px] items-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
        @click="startNew"
      >
        {{ t('console.site.dockNew') }}
      </button>
      <a
        :href="dashboardHref"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex min-h-[44px] items-center rounded-md border border-white/15 px-4 text-sm text-gray-200 hover:bg-white/5"
        @click.prevent="openDashboard"
      >
        {{ t('console.site.dockOpenDashboard') }}
      </a>
    </div>

    <p class="mt-4 text-[11px] uppercase tracking-[0.12em] text-gray-500">
      {{ t('console.site.dockSessions') }}
    </p>

    <p v-if="loading" class="mt-2 text-sm text-gray-500">{{ t('console.hermes.loading') }}</p>
    <p v-else-if="failureCopy" class="mt-2 text-sm text-amber-300" role="alert">{{ failureCopy }}</p>
    <p v-else-if="!sessions.length" class="mt-2 text-sm text-gray-500">{{ t('console.site.dockSessionsEmpty') }}</p>
    <ul v-else class="mt-2 flex max-h-40 flex-col gap-2 overflow-y-auto">
      <li v-for="row in sessions" :key="row.id">
        <button
          type="button"
          class="flex min-h-[44px] w-full flex-col items-start rounded-md px-2 py-2 text-left hover:bg-white/5"
          @click="resume(row.id)"
        >
          <span class="truncate text-sm text-white">{{ row.title }}</span>
          <span class="text-xs text-gray-500">{{ recency(row.lastActive) }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  canUseHermesSessions,
  fetchHermesNativeSessions,
  hermesDashboardChatUrl,
  hermesDashboardUrl,
  hermesSurfaceLog,
  noteHermesMetric,
  openNativeSurface
} from '../api/hermesSessions.js'

const props = defineProps({
  instance: { type: Object, default: null }
})

const { t } = useI18n()
const sessions = ref([])
const kind = ref('')
const loading = ref(false)

const allowed = computed(() => canUseHermesSessions(props.instance))
const dashboardHref = computed(() => hermesDashboardUrl(props.instance))
const failureCopy = computed(() => {
  if (kind.value === 'console') return t('console.site.failureConsole')
  if (kind.value === 'edge') return t('console.site.failureEdge')
  if (kind.value === 'instance') return t('console.site.failureInstance')
  if (kind.value === 'tenant') return t('console.site.failureTenant')
  return ''
})

async function load() {
  if (!allowed.value) {
    sessions.value = []
    kind.value = 'instance'
    return
  }
  loading.value = true
  const out = await fetchHermesNativeSessions(props.instance)
  sessions.value = out.sessions
  kind.value = out.kind
  if (out.kind) hermesSurfaceLog('list', out.kind)
  loading.value = false
}

function resume(id) {
  noteHermesMetric('resume')
  openNativeSurface(hermesDashboardChatUrl(props.instance, id))
}

function startNew() {
  openNativeSurface(hermesDashboardChatUrl(props.instance))
}

function openDashboard() {
  openNativeSurface(dashboardHref.value)
}

function recency(ts) {
  const n = Number(ts)
  if (!n) return ''
  const ms = n > 1e12 ? n : n * 1000
  return new Date(ms).toLocaleString()
}

watch(
  () => [props.instance?.hostname, props.instance?.ready],
  () => load(),
  { immediate: true }
)
</script>
