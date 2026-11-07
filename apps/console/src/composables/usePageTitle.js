import { onBeforeUnmount, ref, watchEffect } from 'vue'

// Pages whose title depends on data (e.g. a service name) override the
// route's meta.titleKey through this ref; main.js renders document.title.
export const pageTitleOverride = ref('')

export function usePageTitle(getter) {
  watchEffect(() => {
    pageTitleOverride.value = String(getter() || '')
  })
  onBeforeUnmount(() => {
    pageTitleOverride.value = ''
  })
}
