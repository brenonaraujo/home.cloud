<template>
  <a
    v-if="allowed"
    :href="dashboardHref"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex min-h-[44px] items-center rounded-control px-2 text-xs text-fg-muted hover:bg-white/5 hover:text-fg"
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
