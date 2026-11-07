<template>
  <!-- Dev-only (import.meta.env.DEV): every bc-ui component and state. Copy is
       deliberately literal, this page never ships to members. -->
  <div class="space-y-12">
    <BcPageHeader
      :crumbs="[{ label: 'Design kit' }]"
      eyebrow="bc-ui"
      title="Design kit"
      subtitle="Tokens and components for the Brenon Cloud console. See docs/design-kit.md."
    >
      <template #actions>
        <BcButton variant="primary">Primary</BcButton>
        <BcButton>Secondary</BcButton>
      </template>
    </BcPageHeader>

    <section>
      <h2 class="text-section-title text-fg">Colour tokens</h2>
      <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <div v-for="swatch in swatches" :key="swatch.name" class="rounded-card border border-line p-3">
          <div class="h-10 rounded-control border border-line" :class="swatch.cls" />
          <p class="mt-2 font-mono text-xs text-fg-muted">{{ swatch.name }}</p>
        </div>
      </div>
      <div class="mt-4 rounded-card border border-line bg-surface-raised p-4 text-sm">
        <p class="text-fg">fg — primary text</p>
        <p class="text-fg-muted">fg-muted — secondary text (6.99:1 on raised)</p>
        <p class="text-fg-subtle">fg-subtle — hints, hosts (5.73:1 on raised)</p>
        <p class="text-eyebrow-label mt-2">eyebrow — 12px uppercase</p>
      </div>
    </section>

    <section>
      <h2 class="text-section-title text-fg">BcButton</h2>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <BcButton variant="primary">Primary</BcButton>
        <BcButton>Secondary</BcButton>
        <BcButton variant="ghost">Ghost</BcButton>
        <BcButton variant="danger">Danger</BcButton>
        <BcButton variant="danger-ghost">Danger ghost</BcButton>
        <BcButton variant="primary" loading>Loading</BcButton>
        <BcButton disabled>Disabled</BcButton>
        <BcButton size="sm">Small</BcButton>
        <BcButton href="https://brenon.cloud" target="_blank">External</BcButton>
        <BcButton to="/services" variant="ghost">Router link</BcButton>
        <BcButton icon-only variant="ghost">
          <template #icon><DotsIcon class="h-5 w-5" /></template>
          Icon only
        </BcButton>
      </div>
    </section>

    <section>
      <h2 class="text-section-title text-fg">BcBadge · BcStatus</h2>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <BcBadge v-for="tone in tones" :key="tone" :tone="tone">{{ tone }}</BcBadge>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-6">
        <BcStatus v-for="s in ['starting', 'active', 'stopped', 'error']" :key="s" :status="s" />
      </div>
    </section>

    <section>
      <h2 class="text-section-title text-fg">BcAlert</h2>
      <div class="mt-4 flex flex-col gap-3">
        <BcAlert tone="info" title="Info" :live="false">Something worth knowing.</BcAlert>
        <BcAlert tone="success" title="Success" :live="false">Saved.</BcAlert>
        <BcAlert tone="warning" title="Warning" :live="false">
          Check this before continuing.
          <template #actions><BcButton size="sm">Retry</BcButton></template>
        </BcAlert>
        <BcAlert tone="danger" :live="false">Could not save right now.</BcAlert>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <BcPanel title="BcPanel" subtitle="Header, subtitle and an action slot.">
        <template #action><BcButton size="sm">Action</BcButton></template>
        <BcDescriptionList :items="dl" />
      </BcPanel>
      <BcPanel flush title="BcPanel flush (lists)">
        <ul>
          <li v-for="n in 3" :key="n" class="border-b border-line px-4 py-3 text-sm text-fg last:border-0">Row {{ n }}</li>
        </ul>
      </BcPanel>
      <BcPanel tone="danger" title="Danger zone" subtitle="Destructive actions live here.">
        <div><BcButton variant="danger" @click="dialog = true">Delete…</BcButton></div>
      </BcPanel>
      <BcEmptyState :icon="InboxIcon" title="BcEmptyState" body="Nothing here yet.">
        <template #actions><BcButton size="sm">Do something</BcButton></template>
      </BcEmptyState>
    </section>

    <section>
      <h2 class="text-section-title text-fg">Fields</h2>
      <div class="mt-4 grid max-w-lg gap-6">
        <BcField id="kit-name" label="BcInput with prefix" hint="Hint text." note="Small note under the field.">
          <template #default="{ id, describedby }">
            <BcInput :id="id" v-model="name" prefix="agent-" :describedby="describedby" />
          </template>
        </BcField>
        <BcField id="kit-error" label="With error" error="That name is already taken.">
          <template #default="{ id, describedby, invalid }">
            <BcInput :id="id" v-model="name" :describedby="describedby" :invalid="invalid" />
          </template>
        </BcField>
        <BcField id="kit-select" label="BcSelect">
          <template #default="{ id }">
            <BcSelect :id="id" v-model="choice" :options="[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }]" />
          </template>
        </BcField>
        <BcField id="kit-text" label="BcTextarea">
          <template #default="{ id }"><BcTextarea :id="id" v-model="text" /></template>
        </BcField>
        <BcCheckbox v-model="check">BcCheckbox</BcCheckbox>
        <BcCopy value="agent-example.brenon.cloud" />
      </div>
    </section>

    <section>
      <h2 class="text-section-title text-fg">BcMenu · BcTabs · BcDialog</h2>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <BcMenu id="kit-menu" label="More actions">
          <BcMenuItem>First</BcMenuItem>
          <BcMenuItem href="https://brenon.cloud" target="_blank">External</BcMenuItem>
          <BcMenuItem danger>Delete</BcMenuItem>
        </BcMenu>
        <BcButton @click="dialog = true">Open dialog</BcButton>
      </div>
      <BcTabs id="kit-tabs" v-model="tab" class="mt-6" label="Kit tabs" :tabs="[{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }, { id: 'three', label: 'Three' }]">
        <template #one><p class="text-sm text-fg-muted">Arrow keys move between tabs.</p></template>
        <template #two><p class="text-sm text-fg-muted">Second panel.</p></template>
        <template #three><p class="text-sm text-fg-muted">Third panel.</p></template>
      </BcTabs>
      <BcDialog id="kit-dialog" :open="dialog" title="BcDialog" @close="dialog = false">
        Focus is trapped here; Esc closes and focus returns to the trigger.
        <template #actions>
          <BcButton @click="dialog = false">Cancel</BcButton>
          <BcButton variant="danger" @click="dialog = false">Confirm</BcButton>
        </template>
      </BcDialog>
    </section>

    <section>
      <h2 class="text-section-title text-fg">BcSkeleton</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-3"><BcSkeleton v-for="n in 3" :key="n" /></div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DotsIcon, InboxIcon } from '../../components/icons/Icons.js'
import {
  BcAlert,
  BcBadge,
  BcButton,
  BcCheckbox,
  BcCopy,
  BcDescriptionList,
  BcDialog,
  BcEmptyState,
  BcField,
  BcInput,
  BcMenu,
  BcMenuItem,
  BcPageHeader,
  BcPanel,
  BcSelect,
  BcSkeleton,
  BcStatus,
  BcTabs,
  BcTextarea
} from '../../components/bc/index.js'

const tones = ['neutral', 'brand', 'info', 'success', 'warning', 'danger']
const swatches = [
  { name: 'surface', cls: 'bg-surface' },
  { name: 'surface-raised', cls: 'bg-surface-raised' },
  { name: 'surface-overlay', cls: 'bg-surface-overlay' },
  { name: 'line-strong', cls: 'bg-line-strong' },
  { name: 'brand-300', cls: 'bg-brand-300' },
  { name: 'brand-500', cls: 'bg-brand-500' },
  { name: 'info-500', cls: 'bg-info-500' },
  { name: 'success-500', cls: 'bg-success-500' },
  { name: 'warning-500', cls: 'bg-warning-500' },
  { name: 'danger-500', cls: 'bg-danger-500' },
  { name: 'fg-muted', cls: 'bg-fg-muted' },
  { name: 'fg-subtle', cls: 'bg-fg-subtle' }
]
const dl = [
  { label: 'Host', value: 'draw.brenon.cloud', mono: true },
  { label: 'Plan', value: 'Basic' }
]
const name = ref('example')
const choice = ref('a')
const text = ref('')
const check = ref(true)
const dialog = ref(false)
const tab = ref('one')
</script>
