<template>
  <p class="p-8 text-center text-gray-300">{{ t('auth.continuing') }}</p>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/authStore'
import { PATHS } from '../config/console-paths.mjs'

const { t } = useI18n()
const auth = useAuthStore()

onMounted(() => {
  auth.login(PATHS.overview)
})
</script>
