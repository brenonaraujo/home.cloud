<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <button
      @click="toggleDropdown"
      type="button"
      class="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      :aria-expanded="isOpen"
      aria-haspopup="true"
    >
      <span class="mr-2">{{ getCurrentLanguageFlag() }}</span>
      <span>{{ getCurrentLanguageName() }}</span>
      <svg 
        class="ml-2 h-4 w-4 transition-transform duration-200" 
        :class="{ 'rotate-180': isOpen }"
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-show="isOpen"
        class="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        role="menu"
        aria-orientation="vertical"
      >
        <div class="py-1" role="none">
          <button
            v-for="language in availableLanguages"
            :key="language.code"
            @click="selectLanguage(language.code)"
            class="group flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            :class="{ 'bg-gray-700 text-white': currentLocale === language.code }"
            role="menuitem"
          >
            <span class="mr-3">{{ language.flag }}</span>
            <span>{{ language.name }}</span>
            <svg
              v-if="currentLocale === language.code"
              class="ml-auto h-4 w-4 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const isOpen = ref(false)
const dropdownRef = ref(null)

const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' }
]

const currentLocale = computed(() => locale.value)

const getCurrentLanguageFlag = () => {
  const language = availableLanguages.find(lang => lang.code === currentLocale.value)
  return language?.flag || '🌐'
}

const getCurrentLanguageName = () => {
  const language = availableLanguages.find(lang => lang.code === currentLocale.value)
  return language?.name || 'Language'
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectLanguage = (languageCode) => {
  locale.value = languageCode
  localStorage.setItem('preferred-language', languageCode)
  isOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Load saved language preference
  const savedLanguage = localStorage.getItem('preferred-language')
  if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
    locale.value = savedLanguage
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>