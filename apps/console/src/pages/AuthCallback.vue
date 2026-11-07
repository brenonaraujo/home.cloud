<template>
  <BcSplash :message="t('auth.completing')" />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BcSplash from '../components/bc/BcSplash.vue'
import { useAuthStore } from '../stores/authStore'
import { PATHS } from '../config/console-paths.mjs'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  try {
    const to = await auth.completeLogin()
    router.replace(to)
  } catch {
    router.replace(PATHS.overview)
  }
})
</script>
