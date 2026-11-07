<template>
  <div>
    <BcPageHeader
      :crumbs="[{ label: t('console.nav.hermes') }]"
      :eyebrow="t('console.hermes.eyebrow')"
      :title="t('console.hermes.title')"
      :subtitle="t('console.hermes.subtitleShort')"
    />

    <BcPanel v-if="!canManage" class="mt-10" :title="t('console.hermes.lockedTitle')" :subtitle="t('console.hermes.locked')">
      <div>
        <BcButton variant="primary" to="/billing">{{ t('console.hermes.seePlans') }}</BcButton>
      </div>
    </BcPanel>

    <template v-else>
      <div v-if="error || waiting" class="mt-6 flex flex-col gap-3">
        <BcAlert v-if="error" tone="danger">{{ error }}</BcAlert>
        <BcAlert v-if="waiting" tone="info">{{ t('console.hermes.startingHint') }}</BcAlert>
      </div>

      <BcSkeleton v-if="loading && !pageInstance" class="mt-8" height-class="h-40" />

      <!-- No instance yet: one form, one primary action. -->
      <BcPanel v-else-if="!hasLive" class="mt-8" tag="form" :title="t('console.hermes.create')" :subtitle="t('console.hermes.createIntro', quotaParams)" @submit.prevent="create">
        <BcField
          id="hermes-public-name"
          class="max-w-lg"
          :label="t('console.hermes.publicName')"
          :hint="t('console.hermes.publicNameHint')"
          :note="t('console.hermes.publicLater')"
        >
          <template #default="{ id, describedby }">
            <BcInput :id="id" v-model="publicName" prefix="agent-" :describedby="describedby" autocomplete="off" spellcheck="false" :placeholder="defaultName" />
          </template>
        </BcField>
        <p v-if="previewHost" class="mt-3 break-all font-mono text-sm text-brand-300">{{ previewHost }}</p>
        <div class="mt-6">
          <BcButton type="submit" variant="primary" :loading="creating" :disabled="!previewSlug">
            {{ creating ? t('console.hermes.creating') : t('console.hermes.create') }}
          </BcButton>
        </div>
      </BcPanel>

      <template v-if="pageInstance">
        <!-- Instance card: status, address and a clear action hierarchy. -->
        <BcPanel class="mt-8" tag="article">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <BcStatus :status="statusOf(pageInstance)" />
                <BcBadge :tone="operator ? 'info' : 'brand'">{{ badge }}</BcBadge>
              </div>
              <h2 class="mt-3">
                <span class="sr-only">{{ t('console.hermes.address') }}: </span>
                <BcCopy :value="pageInstance.hostname || pageInstance.slug" text-class="text-lg font-semibold text-fg" />
              </h2>
              <p class="mt-1 text-sm text-fg-muted">{{ t('console.hermes.quotaShort', instanceQuota) }}</p>
              <p v-if="pageInstance.error" class="mt-2 text-sm text-warning-300">{{ pageInstance.error }}</p>
            </div>
            <div v-if="canOpen(pageInstance)" class="flex flex-wrap items-center gap-2">
              <BcButton variant="primary" @click="dock.startChat()">
                <template #icon><ChatIcon class="h-4 w-4" /></template>
                {{ t('console.hermes.chat') }}
              </BcButton>
              <BcButton v-if="pageInstance.cliUrl" :href="pageInstance.cliUrl" target="_blank">
                <template #icon><TerminalIcon class="h-4 w-4" /></template>
                {{ t('console.hermes.cliOpen') }}
              </BcButton>
              <BcMenu id="hermes-more" :label="t('console.hermes.moreActions')" icon-only variant="ghost">
                <template #icon><DotsIcon class="h-5 w-5" /></template>
                <BcMenuItem v-if="tuiHref" :href="tuiHref" target="_blank">{{ t('console.hermes.tuiOpen') }}</BcMenuItem>
                <BcMenuItem v-if="dashboardHref" :href="dashboardHref" target="_blank">{{ t('console.hermes.openDashboard') }}</BcMenuItem>
                <BcMenuItem :href="'https://' + pageInstance.hostname + '/'" target="_blank">{{ t('console.hermes.openPage') }}</BcMenuItem>
              </BcMenu>
            </div>
            <p v-else-if="isStarting(pageInstance)" class="text-sm text-fg-muted">{{ t('console.hermes.starting') }}</p>
          </div>
        </BcPanel>

        <BcTabs id="hermes" v-model="tab" class="mt-8" :label="t('console.hermes.sections')" :tabs="tabs">
          <template #overview>
            <BcDescriptionList :items="overviewItems" columns="sm:grid-cols-2 lg:grid-cols-3" boxed />

            <details class="mt-6 rounded-card border border-line bg-surface-raised">
              <summary class="flex min-h-[44px] cursor-pointer items-center px-4 text-sm font-medium text-fg-muted hover:text-fg">
                {{ t('console.hermes.technical') }}
              </summary>
              <ul class="space-y-2 border-t border-line p-4 text-sm leading-relaxed text-fg">
                <li v-for="fact in facts" :key="fact.path">
                  <span class="font-mono text-brand-300">{{ fact.path }}</span> — {{ t(fact.key) }}
                </li>
              </ul>
            </details>

            <!-- Danger zone: destructive actions live at the end, behind a typed confirmation. -->
            <BcPanel class="mt-10" tone="danger" :title="t('console.hermes.dangerTitle')" :subtitle="t('console.hermes.dangerBody')">
              <div>
                <BcButton variant="danger" :loading="destroying === pageInstance.id" @click="askDestroy(pageInstance)">
                  {{ t('console.hermes.destroy') }}
                </BcButton>
              </div>
            </BcPanel>
          </template>

          <template #access>
            <BcPanel v-if="pageInstance.cliUrl" :title="t('console.hermes.cliTitle')" :subtitle="t('console.hermes.cliHint')">
              <ol class="max-w-2xl list-decimal space-y-3 pl-5 text-sm leading-relaxed text-fg">
                <li>{{ t('console.hermes.cliStep1') }}</li>
                <li>{{ t('console.hermes.cliStep2') }}</li>
                <li>{{ t('console.hermes.cliStep3') }}</li>
              </ol>
              <p class="mt-6 max-w-2xl rounded-control border border-line bg-surface-sunken/30 px-4 py-3 text-sm leading-relaxed text-fg-muted">
                {{ t('console.hermes.cliLimit') }}
              </p>
              <div class="mt-6 flex flex-wrap gap-2">
                <BcButton variant="primary" :href="pageInstance.cliUrl" target="_blank">{{ t('console.hermes.cliOpen') }}</BcButton>
                <BcButton v-if="tuiHref" :href="tuiHref" target="_blank">{{ t('console.hermes.tuiOpen') }}</BcButton>
              </div>
            </BcPanel>
            <p v-else class="text-sm text-fg-muted">{{ t('console.hermes.starting') }}</p>
          </template>

          <template #address>
            <BcPanel tag="form" :title="t('console.hermes.publicTitle')" :subtitle="t('console.hermes.publicRenameHint')" @submit.prevent="rename">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div class="max-w-lg flex-1">
                  <label for="hermes-rename" class="sr-only">{{ t('console.hermes.publicName') }}</label>
                  <BcInput id="hermes-rename" v-model="publicName" prefix="agent-" autocomplete="off" spellcheck="false" />
                </div>
                <BcButton type="submit" :loading="renaming" :disabled="!previewSlug || previewSlug === pageInstance.slug">
                  {{ renaming ? t('console.hermes.publicSaving') : t('console.hermes.publicSave') }}
                </BcButton>
              </div>
              <p class="mt-3 break-all font-mono text-sm text-brand-300">{{ previewHost }}</p>
              <p v-if="pageInstance.hostname" class="mt-4 text-sm text-fg-muted">
                {{ t('console.hermes.webhookLabel') }}
              </p>
              <BcCopy v-if="pageInstance.hostname" :value="'https://' + pageInstance.hostname + '/hermes/hooks'" text-class="text-sm text-fg" />
            </BcPanel>
          </template>

          <template #page>
            <ConsoleHostPage :instance="pageInstance" />
          </template>
        </BcTabs>
      </template>
    </template>

    <BcDialog
      id="hermes-destroy"
      :open="Boolean(pending)"
      :title="t('console.hermes.destroyTitle')"
      :dismissable="!destroying"
      @close="cancelDestroy"
    >
      <p>{{ t('console.hermes.destroyBody', { host: pendingName }) }}</p>
      <BcField id="hermes-destroy-confirm" class="mt-4" :label="t('console.hermes.destroyType', { name: pendingName })">
        <template #default="{ id }">
          <BcInput :id="id" v-model="confirmText" autocomplete="off" spellcheck="false" />
        </template>
      </BcField>
      <template #actions>
        <BcButton :disabled="Boolean(destroying)" @click="cancelDestroy">{{ t('console.hermes.destroyCancel') }}</BcButton>
        <BcButton variant="danger" :loading="Boolean(destroying)" :disabled="confirmText.trim() !== pendingName" @click="destroy">
          {{ destroying ? t('console.hermes.destroying') : t('console.hermes.destroyConfirm') }}
        </BcButton>
      </template>
    </BcDialog>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  hermesTuiUrl,
  humanHermesError,
  renameHermesInstance,
  stripAgentPrefix
} from '../../api/hermesApi.js'
import { hermesDashboardUrl } from '../../api/hermesSessions.js'
import { hasLiveHermesInstance, isLiveHermesInstance } from '../../config/console-overview.mjs'
import { useHermesInstanceStore } from '../../stores/hermesInstanceStore'
import ConsoleHostPage from '../../components/console/ConsoleHostPage.vue'
import { ChatIcon, DotsIcon, TerminalIcon } from '../../components/icons/Icons.js'
import { instanceStatus } from '../../config/console-plans.mjs'
import {
  BcAlert,
  BcBadge,
  BcButton,
  BcCopy,
  BcDescriptionList,
  BcDialog,
  BcField,
  BcInput,
  BcMenu,
  BcMenuItem,
  BcPageHeader,
  BcPanel,
  BcSkeleton,
  BcStatus,
  BcTabs
} from '../../components/bc/index.js'

const { t } = useI18n()
const auth = useAuthStore()
const dock = useHermesDockStore()
const hermesInstance = useHermesInstanceStore()

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

const hasLive = computed(() => hasLiveHermesInstance(instances.value))
const pageInstance = computed(() => {
  const live = instances.value.filter(isLiveHermesInstance)
  return live.find((row) => row.email === auth.email) || live[0] || null
})
const previewSlug = computed(() => agentSlug(publicName.value || defaultName.value))
const previewHost = computed(() => (previewSlug.value ? `${previewSlug.value}.brenon.cloud` : ''))
const waiting = computed(() => instances.value.some(isStarting))
const tuiHref = computed(() => hermesTuiUrl(pageInstance.value))
const dashboardHref = computed(() => hermesDashboardUrl(pageInstance.value))

const route = useRoute()
const router = useRouter()
const TAB_IDS = ['overview', 'access', 'address', 'page']
const tabs = computed(() => TAB_IDS.map((id) => ({ id, label: t('console.hermes.tabs.' + id) })))
// The active tab lives in ?tab= so it survives reloads and can be linked.
const tab = computed({
  get: () => (TAB_IDS.includes(route.query.tab) ? route.query.tab : 'overview'),
  set: (id) => router.replace({ query: { ...route.query, tab: id === 'overview' ? undefined : id } })
})

const facts = [
  { path: '/', key: 'console.site.factApex' },
  { path: '/hermes', key: 'console.site.factChat' },
  { path: '/hermes/cli', key: 'console.site.factCli' },
  { path: '/hermes/tui', key: 'console.site.factTui' },
  { path: '/hermes/hooks', key: 'console.site.factHooks' }
]

const quotaParams = computed(() => ({ ram: quota.value.memoryGb, cpu: quota.value.cpus, gb: quota.value.diskGb }))
const instanceQuota = computed(() => {
  const row = pageInstance.value
  const q = planQuota(row)
  return { ram: q.memoryGb, cpu: q.cpus, gb: row?.diskGb || q.diskGb }
})
const overviewItems = computed(() => {
  const row = pageInstance.value
  if (!row) return []
  return [
    { label: t('console.hermes.colStatus'), value: t('bc.status.' + statusOf(row)) },
    { label: t('console.hermes.colPlan'), value: t('console.hermes.quotaShort', instanceQuota.value) },
    { label: t('console.hermes.address'), value: row.hostname || row.slug, mono: true }
  ]
})

const confirmText = ref('')
const pendingName = computed(() => pending.value?.hostname || pending.value?.slug || '')

function statusOf(row) {
  return instanceStatus(row)
}

function cancelDestroy() {
  if (destroying.value) return
  pending.value = null
  confirmText.value = ''
}

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
    hermesInstance.sync(instances.value, auth.email)
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
      hermesInstance.sync(instances.value, auth.email)
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
  if (confirmText.value.trim() !== pendingName.value) return
  destroying.value = row.id
  error.value = ''
  try {
    await deleteHermesInstance(auth.idToken, row.id)
    pending.value = null
    confirmText.value = ''
    instances.value = instances.value.filter((x) => x.id !== row.id)
    hermesInstance.sync(instances.value, auth.email)
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
