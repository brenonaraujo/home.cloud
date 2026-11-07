<template>
  <div ref="root" class="relative inline-block">
    <BcButton
      :ref="setTrigger"
      :variant="variant"
      :size="size"
      :icon-only="iconOnly"
      v-bind="triggerAttrs"
      @click.stop="toggleMenu"
      @keydown="onTriggerKey"
    >
      <template #icon><slot name="icon" /></template>
      {{ label }}
    </BcButton>
    <div
      v-if="open"
      :id="menuId"
      ref="list"
      role="menu"
      :aria-label="label"
      class="absolute z-50 mt-2 min-w-[14rem] rounded-overlay border border-line bg-surface-overlay py-1 shadow-xl"
      :class="align === 'left' ? 'left-0' : 'right-0'"
      @keydown="onMenuKey"
      @click="closeMenu()"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMenu } from '../../composables/useMenu.js'
import BcButton from './BcButton.vue'

const props = defineProps({
  label: { type: String, required: true },
  id: { type: String, required: true },
  variant: { type: String, default: 'secondary' },
  size: { type: String, default: 'md' },
  iconOnly: { type: Boolean, default: false },
  align: { type: String, default: 'right' }
})

const { open, root, trigger, list, closeMenu, toggleMenu, onMenuKey, onTriggerKey } = useMenu()
const menuId = computed(() => `${props.id}-menu`)
const triggerAttrs = computed(() => ({
  'aria-haspopup': 'menu',
  'aria-expanded': open.value ? 'true' : 'false',
  'aria-controls': menuId.value
}))

function setTrigger(el) {
  trigger.value = el?.$el || el
}
</script>
