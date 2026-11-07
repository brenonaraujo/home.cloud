<template>
  <div class="min-h-screen bg-surface text-fg">
    <div v-if="auth.isAuthenticated" class="mx-auto max-w-lg px-4 py-16">
      <img src="/brenon-cloud-logo.png" alt="" class="h-10 w-10" />
      <p class="mt-4 text-eyebrow-label">Brenon Cloud</p>
      <h1 class="mt-2 text-2xl font-semibold text-fg">{{ t('console.site.gateTitle') }}</h1>
      <p class="mt-3 text-sm leading-relaxed text-fg-muted" role="status">{{ message }}</p>
    </div>
    <BcSplash v-else :message="t('auth.signingIn')" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import BcSplash from '../../components/bc/BcSplash.vue'
import { grantHostSession, humanHermesError } from '../../api/hermesApi.js'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const error = ref('')
const busy = ref(false)

const host = computed(() => String(route.query.host || '').trim())
const message = computed(() => error.value || t('console.site.gateWait'))

async function grant() {
  if (!host.value) {
    error.value = t('console.site.gateMissing')
    return
  }
  if (!auth.idToken || busy.value) return
  busy.value = true
  error.value = ''
  try {
    await grantHostSession(auth.idToken, host.value)
    const next = host.value.replace(/^https?:\/\//, '')
    window.location.href = 'https://' + next
  } catch (err) {
    error.value = humanHermesError(err, t('console.site.gateDenied'))
  } finally {
    busy.value = false
  }
}

watch(
  () => [auth.ready, auth.isAuthenticated, auth.idToken, host.value],
  () => {
    if (!auth.ready) return
    if (!auth.isAuthenticated) return
    grant()
  },
  { immediate: true }
)
</script>
