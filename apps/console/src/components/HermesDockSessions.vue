<template>
  <a
    v-if="allowed"
    :href="dashboardHref"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex min-h-[44px] items-center rounded-md px-2 text-xs text-gray-400 hover:bg-white/5 hover:text-gray-200"
    @click.prevent="openDashboard"
  >
    {{ t('console.site.dockOpenDashboard') }}
  </a>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  canUseHermesSessions,
  hermesDashboardUrl,
  openNativeSurface
} from '../api/hermesSessions.js'

const props = defineProps({
  instance: { type: Object, default: null }
})

const { t } = useI18n()
const allowed = computed(() => canUseHermesSessions(props.instance))
const dashboardHref = computed(() => hermesDashboardUrl(props.instance))

function openDashboard() {
  openNativeSurface(dashboardHref.value)
}
</script>
