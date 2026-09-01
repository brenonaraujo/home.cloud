<template>
  <section v-if="instance" class="mt-10 rounded-lg border border-white/10 bg-gray-900 p-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="text-lg font-semibold text-white">{{ t('console.site.title') }}</h2>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">{{ t('console.site.subtitle') }}</p>
      </div>
      <a
        v-if="instance.hostname"
        :href="'https://' + instance.hostname + '/'"
        target="_blank"
        rel="noopener"
        class="inline-flex min-h-[44px] items-center text-sm text-blue-300 hover:text-blue-200"
      >{{ t('console.site.open') }}</a>
    </div>

    <ul class="mt-6 max-w-2xl space-y-2 text-sm leading-relaxed text-gray-300">
      <li><span class="font-mono text-blue-200">/</span> — {{ t('console.site.factApex') }}</li>
      <li><span class="font-mono text-blue-200">/hermes</span> — {{ t('console.site.factChat') }}</li>
      <li><span class="font-mono text-blue-200">/hermes/cli</span> — {{ t('console.site.factCli') }}</li>
      <li><span class="font-mono text-blue-200">/hermes/tui</span> — {{ t('console.site.factTui') }}</li>
      <li><span class="font-mono text-blue-200">/hermes/hooks</span> — {{ t('console.site.factHooks') }}</li>
    </ul>
    <p class="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400">{{ t('console.site.agentBuilds') }}</p>

    <div v-if="instance.ready && instance.hostname" class="mt-6 flex flex-wrap gap-2">
      <button
        type="button"
        class="inline-flex min-h-[44px] items-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
        @click="dock.startChat()"
      >
        {{ t('console.site.startChat') }}
      </button>
      <a
        v-if="tuiHref"
        :href="tuiHref"
        target="_blank"
        rel="noopener"
        class="inline-flex min-h-[44px] items-center rounded-md border border-white/15 px-4 text-sm text-gray-200 hover:bg-white/5"
      >{{ t('console.hermes.tuiOpen') }}</a>
      <a
        v-if="dashboardHref"
        :href="dashboardHref"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex min-h-[44px] items-center rounded-md border border-white/15 px-4 text-sm text-gray-200 hover:bg-white/5"
      >{{ t('console.hermes.openDashboard') }}</a>
    </div>
    <p v-else class="mt-6 text-sm text-gray-500">{{ t('console.hermes.starting') }}</p>

    <p v-if="error" class="mt-4 text-sm text-amber-300">{{ error }}</p>
    <p v-else-if="saved" class="mt-4 text-sm text-emerald-300">{{ t('console.site.saved') }}</p>

    <form class="mt-8 flex flex-col gap-6 border-t border-white/10 pt-8" @submit.prevent="save">
      <label class="flex items-center gap-3 text-sm text-gray-200">
        <input v-model="enabled" type="checkbox" class="h-4 w-4 rounded border-white/20 bg-gray-950">
        {{ t('console.site.enabled') }}
      </label>

      <label class="flex flex-col gap-2">
        <span class="text-sm font-medium text-gray-200">{{ t('console.site.visibility') }}</span>
        <select v-model="visibility" class="min-h-[44px] max-w-lg rounded-md border border-white/15 bg-gray-950 px-3 text-sm text-gray-100">
          <option value="public">{{ t('console.site.visPublic') }}</option>
          <option value="members">{{ t('console.site.visMembers') }}</option>
          <option value="allowlist">{{ t('console.site.visAllowlist') }}</option>
          <option value="disabled">{{ t('console.site.visDisabled') }}</option>
        </select>
        <span class="text-xs text-gray-500">{{ visHint }}</span>
      </label>

      <label v-if="visibility === 'allowlist'" class="flex flex-col gap-2">
        <span class="text-sm font-medium text-gray-200">{{ t('console.site.allowlist') }}</span>
        <textarea
          v-model="allowlistText"
          rows="3"
          class="max-w-lg rounded-md border border-white/15 bg-gray-950 px-3 py-2 text-sm text-gray-100"
          :placeholder="t('console.site.allowlistHint')"
        />
      </label>

      <div class="flex flex-wrap gap-2">
        <button
          type="submit"
          class="inline-flex min-h-[44px] w-fit items-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40"
          :disabled="saving || resetting"
        >
          {{ saving ? t('console.site.saving') : t('console.site.save') }}
        </button>
        <button
          type="button"
          class="inline-flex min-h-[44px] w-fit items-center rounded-md border border-white/15 px-4 text-sm text-gray-200 hover:bg-white/5 disabled:opacity-40"
          :disabled="saving || resetting"
          @click="reset"
        >
          {{ resetting ? t('console.site.resetting') : t('console.site.reset') }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/authStore'
import { useHermesDockStore } from '../../stores/hermesDockStore'
import { fetchHermesSite, hermesTuiUrl, humanHermesError, resetHermesSite, saveHermesSite } from '../../api/hermesApi.js'
import { hermesDashboardUrl } from '../../api/hermesSessions.js'

const props = defineProps({
  instance: { type: Object, default: null }
})

const { t } = useI18n()
const auth = useAuthStore()
const dock = useHermesDockStore()

const enabled = ref(true)
const visibility = ref('public')
const html = ref('')
const css = ref('')
const js = ref('')
const allowlistText = ref('')
const saving = ref(false)
const resetting = ref(false)
const saved = ref(false)
const error = ref('')

const tuiHref = computed(() => hermesTuiUrl(props.instance))
const dashboardHref = computed(() => hermesDashboardUrl(props.instance))

const visHint = computed(() => {
  if (visibility.value === 'members') return t('console.site.hintMembers')
  if (visibility.value === 'allowlist') return t('console.site.hintAllowlist')
  if (visibility.value === 'disabled') return t('console.site.hintDisabled')
  return t('console.site.hintPublic')
})

function apply(site) {
  enabled.value = site?.enabled !== false
  visibility.value = site?.visibility || 'public'
  html.value = site?.html || ''
  css.value = site?.css || ''
  js.value = site?.js || ''
  allowlistText.value = (site?.allowlist || []).join('\n')
}

async function load() {
  if (!auth.idToken || !props.instance?.slug) return
  error.value = ''
  try {
    const data = await fetchHermesSite(auth.idToken, props.instance.slug)
    apply(data.site)
  } catch (err) {
    error.value = humanHermesError(err, t('console.site.loadFallback'))
  }
}

async function save() {
  if (!auth.idToken || saving.value || !props.instance?.slug) return
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    const allowlist = allowlistText.value
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    const data = await saveHermesSite(
      auth.idToken,
      {
        enabled: enabled.value,
        visibility: visibility.value,
        html: html.value,
        css: css.value,
        js: js.value,
        allowlist
      },
      props.instance.slug
    )
    apply(data.site)
    saved.value = true
  } catch (err) {
    error.value = humanHermesError(err, t('console.site.saveFallback'))
  } finally {
    saving.value = false
  }
}

async function reset() {
  if (!auth.idToken || saving.value || resetting.value || !props.instance?.slug) return
  resetting.value = true
  saved.value = false
  error.value = ''
  try {
    const data = await resetHermesSite(auth.idToken, props.instance.slug)
    apply(data.site)
    saved.value = true
  } catch (err) {
    error.value = humanHermesError(err, t('console.site.resetFallback'))
  } finally {
    resetting.value = false
  }
}

onMounted(load)
watch(() => props.instance?.id, load)
</script>
