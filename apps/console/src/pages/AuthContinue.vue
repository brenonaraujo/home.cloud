<template>
  <BcSplash :message="t('auth.continuing')" />
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BcSplash from '../components/bc/BcSplash.vue'
import { useAuthStore } from '../stores/authStore'
import { PATHS } from '../config/console-paths.mjs'

const { t } = useI18n()
const auth = useAuthStore()

onMounted(() => {
  auth.login(PATHS.overview)
})
</script>
