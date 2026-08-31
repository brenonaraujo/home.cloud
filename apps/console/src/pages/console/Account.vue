<template>
  <div>
    <ConsoleBreadcrumb :items="[{ label: t('console.nav.account') }]" />

    <h1 class="text-3xl font-semibold tracking-tight text-white">{{ t('console.account.title') }}</h1>
    <p class="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">{{ t('console.account.subtitle') }}</p>

    <section class="mt-10 rounded-lg border border-white/10 bg-gray-900 p-6">
      <h2 class="text-lg font-semibold text-white">{{ t('console.account.profile') }}</h2>
      <dl class="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <dt class="text-xs uppercase tracking-[0.12em] text-gray-500">{{ t('console.account.name') }}</dt>
          <dd class="mt-2 text-sm text-white">{{ auth.displayName || '—' }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-[0.12em] text-gray-500">{{ t('console.account.email') }}</dt>
          <dd class="mt-2 font-mono text-sm text-white">{{ auth.email || '—' }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-[0.12em] text-gray-500">{{ t('console.account.plan') }}</dt>
          <dd class="mt-2 text-sm text-white">{{ planLabel }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-[0.12em] text-gray-500">{{ t('console.account.role') }}</dt>
          <dd class="mt-2 text-sm text-white">
            {{ staff ? t('console.account.staff') : t('console.account.customer') }}
          </dd>
        </div>
      </dl>
    </section>

    <section class="mt-8 rounded-lg border border-white/10 bg-gray-900 p-6">
      <h2 class="text-lg font-semibold text-white">{{ t('console.account.groups') }}</h2>
      <p class="mt-2 text-sm text-gray-400">{{ t('console.account.groupsHint') }}</p>
      <ul v-if="auth.groups.length" class="mt-4 flex flex-wrap gap-2">
        <li
          v-for="group in auth.groups"
          :key="group"
          class="rounded-md border border-white/10 bg-gray-950 px-2 py-1 font-mono text-xs text-gray-300"
        >
          {{ group }}
        </li>
      </ul>
      <p v-else class="mt-4 text-sm text-gray-500">{{ t('console.account.noGroups') }}</p>
    </section>

    <div class="mt-8 flex flex-wrap gap-2">
      <button
        type="button"
        class="inline-flex min-h-[44px] items-center rounded-md border border-white/15 px-4 text-sm text-gray-200 hover:bg-white/5"
        @click="auth.login(route.fullPath)"
      >
        {{ t('console.account.refreshSession') }}
      </button>
      <button
        type="button"
        class="inline-flex min-h-[44px] items-center rounded-md border border-white/15 px-4 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
        @click="auth.logout()"
      >
        {{ t('navbar.logout') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { displayPlan, isStaff } from '../../config/console-taxonomy.mjs'
import { useEntitlementStore } from '../../stores/entitlementStore'
import ConsoleBreadcrumb from '../../components/console/ConsoleBreadcrumb.vue'

const { t, te } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const entitlement = useEntitlementStore()

const staff = computed(() => isStaff(auth.groups))
const planLabel = computed(() => {
  const plan = displayPlan(auth.groups, entitlement.billing)
  const key = `console.plan.${plan}`
  return te(key) ? t(key) : plan
})
</script>
