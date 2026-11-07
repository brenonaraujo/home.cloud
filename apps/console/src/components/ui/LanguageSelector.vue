<template>
  <div ref="root" class="relative inline-block text-left">
    <button
      ref="trigger"
      type="button"
      class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control px-3 text-sm font-medium text-fg-muted transition-colors duration-fast hover:bg-white/5 hover:text-fg"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="menu"
      aria-controls="console-language-menu"
      :aria-label="t('console.nav.language', { lang: current.name })"
      @click.stop="toggleMenu"
      @keydown="onTriggerKey"
    >
      <span aria-hidden="true">{{ current.flag }}</span>
      <span>{{ current.name }}</span>
      <ChevronRightIcon class="h-4 w-4 transition-transform duration-fast" :class="open ? '-rotate-90' : 'rotate-90'" />
    </button>

    <div
      v-if="open"
      id="console-language-menu"
      ref="list"
      class="absolute bottom-full right-0 z-50 mb-2 w-40 rounded-overlay border border-line bg-surface-overlay py-1 shadow-lg lg:bottom-auto lg:top-full lg:mb-0 lg:mt-2"
      role="menu"
      :aria-label="t('console.nav.languageMenu')"
      @keydown="onMenuKey"
    >
      <button
        v-for="language in LANGUAGES"
        :key="language.code"
        type="button"
        role="menuitemradio"
        :aria-checked="locale === language.code ? 'true' : 'false'"
        tabindex="-1"
        class="flex min-h-[44px] w-full items-center gap-3 px-4 text-sm text-fg hover:bg-white/5 focus:bg-white/10 focus:outline-none"
        @click="select(language.code)"
      >
        <span aria-hidden="true">{{ language.flag }}</span>
        <span>{{ language.name }}</span>
        <CheckIcon v-if="locale === language.code" class="ml-auto h-4 w-4 text-brand-300" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMenu } from '../../composables/useMenu.js'
import { CheckIcon, ChevronRightIcon } from '../icons/Icons.js'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' }
]

const { t, locale } = useI18n()
const { open, root, trigger, list, closeMenu, toggleMenu, onMenuKey, onTriggerKey } = useMenu({
  itemSelector: '[role="menuitemradio"]'
})

const current = computed(() => LANGUAGES.find((lang) => lang.code === locale.value) || LANGUAGES[0])

function select(code) {
  locale.value = code
  try {
    localStorage.setItem('preferred-language', code)
  } catch {
    /* private mode: the choice still applies to this tab */
  }
  closeMenu({ restoreFocus: true })
}
</script>
