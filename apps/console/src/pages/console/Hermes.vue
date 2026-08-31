<template>
  <div>
    <ConsoleBreadcrumb :items="[{ label: t('console.nav.hermes') }]" />

    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="text-[11px] uppercase tracking-[0.12em] text-blue-300/80">{{ t('console.hermes.eyebrow') }}</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white">{{ t('console.hermes.title') }}</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">{{ t('console.hermes.subtitle') }}</p>
        <p v-if="quota.diskGb" class="mt-3 text-sm text-blue-200">{{ t('console.hermes.quota', { ram: quota.memoryGb, cpu: quota.cpus, gb: quota.diskGb }) }}</p>
      </div>
      <span
        class="inline-flex min-h-[44px] w-fit items-center rounded-md px-3 text-[11px] font-medium uppercase tracking-wide"
        :class="canManage ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-400'"
      >
        {{ badge }}
      </span>
    </div>

    <section
      v-if="!canManage"
      class="mt-10 rounded-lg border border-white/10 bg-gray-900 px-6 py-10"
    >
      <h2 class="text-lg font-semibold text-white">{{ t('console.hermes.lockedTitle') }}</h2>
      <p class="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">{{ t('console.hermes.locked') }}</p>
      <router-link
        to="/billing"
        class="mt-6 inline-flex min-h-[44px] items-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
      >
        {{ t('console.nav.billing') }}
      </router-link>
    </section>

    <template v-else>
      <p v-if="error" class="mt-8 text-sm text-amber-300">{{ error }}</p>
      <p v-if="waiting" class="mt-8 rounded-md border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
        {{ t('console.hermes.startingHint') }}
      </p>

      <form
        v-if="!hasLive && !loading"
        class="mt-10 rounded-lg border border-white/10 bg-gray-900 p-6"
        @submit.prevent="create"
      >
        <h2 class="text-lg font-semibold text-white">{{ t('console.hermes.create') }}</h2>
        <label for="hermes-public-name" class="mt-6 block text-sm font-medium text-white">{{ t('console.hermes.publicName') }}</label>
        <p class="mt-1 text-sm leading-relaxed text-gray-400">{{ t('console.hermes.publicNameHint') }}</p>
        <div class="mt-4 flex min-h-[44px] max-w-lg overflow-hidden rounded-md border border-white/15 bg-black/30">
          <span class="flex items-center border-r border-white/10 px-3 font-mono text-sm text-gray-400">agent-</span>
          <input
            id="hermes-public-name"
            v-model="publicName"
            type="text"
            autocomplete="off"
            spellcheck="false"
            class="min-w-0 flex-1 bg-transparent px-3 text-sm text-white placeholder:text-gray-600 focus:outline-none"
            :placeholder="defaultName"
          >
        </div>
        <p v-if="previewHost" class="mt-3 font-mono text-sm text-blue-200">{{ previewHost }}</p>
        <p class="mt-2 text-xs leading-relaxed text-gray-500">{{ t('console.hermes.publicLater') }}</p>
        <button
          type="submit"
          class="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/40"
          :disabled="creating || !previewSlug"
        >
          {{ creating ? t('console.hermes.creating') : t('console.hermes.create') }}
        </button>
      </form>

      <p v-if="loading" class="mt-10 text-sm text-gray-500">{{ t('console.hermes.loading') }}</p>

      <article
        v-if="pageInstance"
        class="mt-10 rounded-lg border border-white/10 bg-gray-900 p-6"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-[11px] uppercase tracking-[0.12em] text-gray-500">{{ t('console.hermes.instances') }}</p>
            <h2 class="mt-2 font-mono text-lg font-semibold text-white">{{ pageInstance.hostname || pageInstance.slug }}</h2>
            <p class="mt-2 text-sm text-gray-400">
              {{ isStarting(pageInstance) ? t('console.hermes.starting') : pageInstance.status }}
              · {{ t('console.hermes.quotaShort', { ram: planQuota(pageInstance).memoryGb, cpu: planQuota(pageInstance).cpus, gb: pageInstance.diskGb || planQuota(pageInstance).diskGb }) }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex min-h-[44px] items-center text-sm text-red-300 hover:text-red-200 disabled:opacity-40"
            :disabled="destroying === pageInstance.id"
            @click="askDestroy(pageInstance)"
          >{{ destroying === pageInstance.id ? t('console.hermes.destroying') : t('console.hermes.destroy') }}</button>
        </div>
        <p v-if="pageInstance.error" class="mt-3 text-xs text-amber-300">{{ pageInstance.error }}</p>
        <div v-if="canOpen(pageInstance)" class="mt-6 flex flex-wrap gap-2">
          <a
            v-if="pageInstance.cliUrl"
            :href="pageInstance.cliUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex min-h-[44px] items-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
          >{{ t('console.hermes.cliOpen') }}</a>
          <a
            :href="'https://' + pageInstance.hostname + '/'"
            target="_blank"
            rel="noopener"
            class="inline-flex min-h-[44px] items-center rounded-md border border-white/15 px-4 text-sm text-gray-200 hover:bg-white/5"
          >{{ t('console.hermes.openPage') }}</a>
          <button
            type="button"
            class="inline-flex min-h-[44px] items-center rounded-md border border-white/15 px-4 text-sm text-gray-200 hover:bg-white/5"
            @click="dock.startChat()"
          >{{ t('console.hermes.openAgent') }}</button>
        </div>
        <p v-else-if="isStarting(pageInstance)" class="mt-6 text-sm text-gray-500">{{ t('console.hermes.starting') }}</p>
      </article>

      <section
        v-if="pageInstance && pageInstance.cliUrl"
        class="mt-8 rounded-lg border border-white/10 bg-gray-900 p-6"
      >
        <h2 class="text-lg font-semibold text-white">{{ t('console.hermes.cliTitle') }}</h2>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">{{ t('console.hermes.cliHint') }}</p>
        <ol class="mt-6 max-w-2xl list-decimal space-y-3 pl-5 text-sm leading-relaxed text-gray-300">
          <li>{{ t('console.hermes.cliStep1') }}</li>
          <li>{{ t('console.hermes.cliStep2') }}</li>
          <li>{{ t('console.hermes.cliStep3') }}</li>
        </ol>
        <p class="mt-6 max-w-2xl rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm leading-relaxed text-gray-400">
          {{ t('console.hermes.cliLimit') }}
        </p>
        <a
          :href="pageInstance.cliUrl"
          target="_blank"
          rel="noopener"
          class="mt-6 inline-flex min-h-[44px] items-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
        >{{ t('console.hermes.cliOpen') }}</a>
      </section>

      <section
        v-if="pageInstance"
        class="mt-8 rounded-lg border border-white/10 bg-gray-900 p-6"
      >
        <h2 class="text-lg font-semibold text-white">{{ t('console.hermes.publicTitle') }}</h2>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">{{ t('console.hermes.publicRenameHint') }}</p>
        <form class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center" @submit.prevent="rename">
          <div class="flex min-h-[44px] max-w-lg flex-1 overflow-hidden rounded-md border border-white/15 bg-black/30">
            <span class="flex items-center border-r border-white/10 px-3 font-mono text-sm text-gray-400">agent-</span>
            <input
              v-model="publicName"
              type="text"
              autocomplete="off"
              spellcheck="false"
              class="min-w-0 flex-1 bg-transparent px-3 text-sm text-white focus:outline-none"
            >
          </div>
          <button
            type="submit"
            class="inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/15 px-4 text-sm text-gray-200 hover:bg-white/5 disabled:opacity-40"
            :disabled="renaming || !previewSlug || previewSlug === pageInstance.slug"
          >
            {{ renaming ? t('console.hermes.publicSaving') : t('console.hermes.publicSave') }}
          </button>
        </form>
        <p class="mt-3 font-mono text-sm text-blue-200">{{ previewHost }}</p>
        <p v-if="pageInstance.hostname" class="mt-2 text-xs text-gray-500">{{ t('console.hermes.webhookHint', { url: 'https://' + pageInstance.hostname + '/hermes/hooks' }) }}</p>
      </section>

      <ConsoleHostPage v-if="pageInstance" :instance="pageInstance" />
    </template>

    <div
      v-if="pending"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hermes-destroy-title"
    >
      <div class="w-full max-w-md rounded-lg border border-white/10 bg-gray-900 p-6">
        <h2 id="hermes-destroy-title" class="text-lg font-semibold text-white">{{ t('console.hermes.destroyTitle') }}</h2>
        <p class="mt-3 text-sm leading-relaxed text-gray-300">{{ t('console.hermes.destroyBody', { host: pending.hostname || pending.slug }) }}</p>
        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/15 px-4 text-sm text-gray-200 hover:bg-white/5"
            :disabled="!!destroying"
            @click="pending = null"
          >{{ t('console.hermes.destroyCancel') }}</button>
          <button
            type="button"
            class="inline-flex min-h-[44px] items-center justify-center rounded-md bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-40"
            :disabled="!!destroying"
            @click="destroy"
          >{{ destroying ? t('console.hermes.destroying') : t('console.hermes.destroyConfirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/authStore'
import { useHermesDockStore } from '../../stores/hermesDockStore'
import {
  canManageHermes,
  hermesQuota,
  isHermesOperator,
  isHermesSubscriber
} from '../../config/console-taxonomy.mjs'
import {
  agentSlug,
  createHermesInstance,
  deleteHermesInstance,
  fetchHermesInstances,
  humanHermesError,
  renameHermesInstance,
  stripAgentPrefix
} from '../../api/hermesApi.js'
import ConsoleBreadcrumb from '../../components/console/ConsoleBreadcrumb.vue'
import ConsoleHostPage from '../../components/console/ConsoleHostPage.vue'

const { t } = useI18n()
const auth = useAuthStore()
const dock = useHermesDockStore()

const canManage = computed(() => canManageHermes(auth.groups))
const operator = computed(() => isHermesOperator(auth.groups))
const quota = computed(() => hermesQuota(auth.groups))
const badge = computed(() => {
  if (isHermesSubscriber(auth.groups)) return t('console.hermes.badgePlan')
  if (operator.value) return t('console.hermes.badgeOperator')
  return t('console.hermes.badgeSoon')
})

const instances = ref([])
const loading = ref(false)
const creating = ref(false)
const renaming = ref(false)
const destroying = ref('')
const pending = ref(null)
const error = ref('')
const publicName = ref('')

const defaultName = computed(() => {
  const fromUser = stripAgentPrefix(String(auth.username || '').trim())
  if (fromUser) return slugify(fromUser)
  const local = String(auth.email || '').split('@')[0]
  return slugify(local)
})

const hasLive = computed(() =>
  instances.value.some((row) => ['pending', 'provisioning', 'running', 'stopped'].includes(row.status))
)
const pageInstance = computed(() => {
  const live = instances.value.filter((row) =>
    ['running', 'provisioning', 'pending', 'stopped'].includes(row.status)
  )
  return live.find((row) => row.email === auth.email) || live[0] || null
})
const previewSlug = computed(() => agentSlug(publicName.value || defaultName.value))
const previewHost = computed(() => (previewSlug.value ? `${previewSlug.value}.brenon.cloud` : ''))
const waiting = computed(() => instances.value.some(isStarting))

function canOpen(row) {
  return Boolean(row?.ready && row.hostname)
}
function isStarting(row) {
  return Boolean(row) && !row.ready && ['pending', 'provisioning', 'running'].includes(row.status)
}

function slugify(raw) {
  return String(raw || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function mapSlugError(err, fallback) {
  const msg = humanHermesError(err, fallback)
  if (/subdomain taken/i.test(msg)) return t('console.hermes.publicTaken')
  if (/reserved/i.test(msg)) return t('console.hermes.publicReserved')
  if (/too short/i.test(msg)) return t('console.hermes.publicShort')
  if (/invalid public name/i.test(msg)) return t('console.hermes.publicInvalid')
  return msg
}

function syncPublicName() {
  if (pageInstance.value?.slug) {
    publicName.value = stripAgentPrefix(pageInstance.value.slug)
    return
  }
  if (!publicName.value) publicName.value = defaultName.value
}

async function load(quiet = false) {
  if (!canManage.value || !auth.idToken) return
  if (!quiet) loading.value = true
  if (!quiet) error.value = ''
  try {
    const data = await fetchHermesInstances(auth.idToken)
    instances.value = Array.isArray(data.instances) ? data.instances : []
    syncPublicName()
  } catch (err) {
    if (!quiet) {
      error.value = humanHermesError(err, t('console.hermes.loadFallback'))
      instances.value = []
    }
  } finally {
    if (!quiet) loading.value = false
  }
}

async function create() {
  if (!auth.idToken || creating.value || hasLive.value) return
  creating.value = true
  error.value = ''
  try {
    const row = await createHermesInstance(auth.idToken, previewSlug.value)
    if (row?.id) {
      instances.value = [row, ...instances.value.filter((x) => x.id !== row.id)]
      syncPublicName()
    } else {
      await load()
    }
  } catch (err) {
    error.value = mapSlugError(err, t('console.hermes.createFallback'))
  } finally {
    creating.value = false
  }
}

async function rename() {
  const row = pageInstance.value
  if (!auth.idToken || !row?.id || renaming.value) return
  if (previewSlug.value === row.slug) return
  renaming.value = true
  error.value = ''
  try {
    const updated = await renameHermesInstance(auth.idToken, row.id, previewSlug.value)
    instances.value = instances.value.map((x) => (x.id === row.id ? { ...x, ...updated } : x))
    syncPublicName()
  } catch (err) {
    error.value = mapSlugError(err, t('console.hermes.publicSaveFallback'))
  } finally {
    renaming.value = false
  }
}

function askDestroy(row) {
  if (!row?.id || destroying.value) return
  pending.value = row
}

async function destroy() {
  const row = pending.value
  if (!auth.idToken || !row?.id || destroying.value) return
  destroying.value = row.id
  error.value = ''
  try {
    await deleteHermesInstance(auth.idToken, row.id)
    pending.value = null
    instances.value = instances.value.filter((x) => x.id !== row.id)
    publicName.value = defaultName.value
  } catch (err) {
    error.value = humanHermesError(err, t('console.hermes.destroyFallback'))
  } finally {
    destroying.value = ''
  }
}

let waitTimer = 0
function stopWait() {
  if (waitTimer) {
    clearInterval(waitTimer)
    waitTimer = 0
  }
}
function startWait() {
  if (waitTimer) return
  waitTimer = setInterval(() => {
    load(true)
  }, 2500)
}

watch(waiting, (on) => {
  if (on) startWait()
  else stopWait()
}, { immediate: true })

watch(defaultName, (name) => {
  if (!hasLive.value && !publicName.value && name) publicName.value = name
})

function planQuota(row) {
  const plan = String(row?.plan || '').toLowerCase()
  if (plan === 'pro') return { diskGb: 20, memoryGb: 4, cpus: 2 }
  return { diskGb: 5, memoryGb: 2, cpus: 1 }
}

onMounted(load)
onUnmounted(stopWait)
</script>
