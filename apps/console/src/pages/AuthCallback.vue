<template>
  <p class="p-8 text-center text-gray-300">{{ t('auth.completing') }}</p>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
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
