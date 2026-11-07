<template>
  <div>
    <BcPageHeader
      :crumbs="[{ label: t('console.account.title') }]"
      :title="t('console.account.title')"
      :subtitle="t('console.account.subtitle')"
    />

    <BcAlert v-if="staleSession" class="mt-6" tone="info" :title="t('console.billing.staleTitle')">
      {{ t('console.billing.staleBody') }}
      <template #actions>
        <BcButton size="sm" @click="auth.refreshSession(route.fullPath)">{{ t('console.billing.refreshSession') }}</BcButton>
      </template>
    </BcAlert>

    <BcPanel class="mt-8" :title="t('console.account.profile')">
      <BcDescriptionList :items="profile" />
    </BcPanel>

    <BcPanel class="mt-6" :title="t('console.account.access')" :subtitle="t('console.account.accessHint')">
      <ul v-if="access.length" class="flex flex-wrap gap-2">
        <li v-for="key in access" :key="key">
          <BcBadge :tone="key === 'staff' ? 'info' : 'brand'">{{ t('console.account.accessLabels.' + key) }}</BcBadge>
        </li>
      </ul>
      <p v-else class="text-sm text-fg-muted">{{ t('console.account.noGroups') }}</p>

      <div class="mt-6">
        <BcButton size="sm" @click="auth.refreshSession(route.fullPath)">
          <template #icon><RefreshIcon class="h-4 w-4" /></template>
          {{ t('console.account.refreshSession') }}
        </BcButton>
        <p class="mt-2 text-sm text-fg-muted">{{ t('console.account.refreshHint') }}</p>
      </div>

      <!-- Raw Authentik groups: useful for staff, noise for customers. -->
      <details v-if="staff" class="mt-6 rounded-control border border-line">
        <summary class="flex min-h-target cursor-pointer items-center px-4 text-sm text-fg-muted hover:text-fg">
          {{ t('console.account.rawGroups', { n: auth.groups.length }) }}
        </summary>
        <ul class="flex flex-wrap gap-2 border-t border-line p-4">
          <li
            v-for="group in auth.groups"
            :key="group"
            class="rounded-control border border-line bg-surface px-2 py-1 font-mono text-xs text-fg-muted"
          >
            {{ group }}
          </li>
        </ul>
      </details>
    </BcPanel>

    <BcPanel class="mt-6" :title="t('console.account.signOutTitle')" :subtitle="t('console.account.signOutHint')">
      <div>
        <BcButton variant="danger-ghost" class="-ml-3" @click="auth.logout()">{{ t('navbar.logout') }}</BcButton>
      </div>
    </BcPanel>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useEntitlementStore } from '../../stores/entitlementStore'
import { isStaff } from '../../config/console-taxonomy.mjs'
import { accessKeys, needsSessionRefresh } from '../../config/console-plans.mjs'
import { usePlan } from '../../composables/usePlan.js'
import { RefreshIcon } from '../../components/icons/Icons.js'
import { BcAlert, BcBadge, BcButton, BcDescriptionList, BcPageHeader, BcPanel } from '../../components/bc/index.js'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const entitlement = useEntitlementStore()
const { label: planLabel } = usePlan()

const staff = computed(() => isStaff(auth.groups))
const access = computed(() => accessKeys(auth.groups))
const staleSession = computed(() => needsSessionRefresh(auth.groups, entitlement.billing))

const profile = computed(() => [
  { label: t('console.account.name'), value: auth.displayName },
  { label: t('console.account.email'), value: auth.email, mono: true },
  { label: t('console.account.plan'), value: planLabel.value },
  { label: t('console.account.role'), value: staff.value ? t('console.account.staff') : t('console.account.customer') }
])
</script>
