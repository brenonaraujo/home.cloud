<template>
  <BcPanel v-if="instance" tag="section" :title="t('console.site.title')" :subtitle="t('console.site.subtitle')">
    <template #action>
      <BcButton v-if="instance.hostname" :href="'https://' + instance.hostname + '/'" target="_blank" size="sm">
        {{ t('console.site.open') }}
      </BcButton>
    </template>

    <p class="max-w-2xl text-sm leading-relaxed text-fg-muted">{{ t('console.site.agentBuilds') }}</p>

    <div class="mt-4" aria-live="polite">
      <BcAlert v-if="error" tone="danger">{{ error }}</BcAlert>
      <BcAlert v-else-if="saved" tone="success">{{ t('console.site.saved') }}</BcAlert>
    </div>

    <form class="mt-6 flex max-w-lg flex-col gap-6" @submit.prevent="save">
      <BcCheckbox v-model="enabled">{{ t('console.site.enabled') }}</BcCheckbox>

      <BcField id="site-visibility" :label="t('console.site.visibility')" :note="visHint">
        <template #default="{ id }">
          <BcSelect :id="id" v-model="visibility" :options="visibilityOptions" />
        </template>
      </BcField>

      <BcField v-if="visibility === 'allowlist'" id="site-allowlist" :label="t('console.site.allowlist')" :hint="t('console.site.allowlistHint')">
        <template #default="{ id, describedby }">
          <BcTextarea :id="id" v-model="allowlistText" :rows="3" :describedby="describedby" />
        </template>
      </BcField>

      <div class="flex flex-wrap gap-2">
        <BcButton type="submit" variant="primary" :loading="saving" :disabled="resetting">
          {{ saving ? t('console.site.saving') : t('console.site.save') }}
        </BcButton>
        <BcButton :loading="resetting" :disabled="saving" @click="reset">
          {{ resetting ? t('console.site.resetting') : t('console.site.reset') }}
        </BcButton>
      </div>
    </form>
  </BcPanel>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/authStore'
import { fetchHermesSite, humanHermesError, resetHermesSite, saveHermesSite } from '../../api/hermesApi.js'
import { BcAlert, BcButton, BcCheckbox, BcField, BcPanel, BcSelect, BcTextarea } from '../bc/index.js'

const props = defineProps({
  instance: { type: Object, default: null }
})

const { t } = useI18n()
const auth = useAuthStore()

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

const visibilityOptions = computed(() => [
  { value: 'public', label: t('console.site.visPublic') },
  { value: 'members', label: t('console.site.visMembers') },
  { value: 'allowlist', label: t('console.site.visAllowlist') },
  { value: 'disabled', label: t('console.site.visDisabled') }
])

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
