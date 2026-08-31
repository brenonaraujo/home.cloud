import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { useAuthStore } from './stores/authStore'
import { isLiveOidc } from './config/auth.js'
import { PATHS } from './config/console-paths.mjs'
import App from './App.vue'
import './style.css'

import ConsoleLayout from './layouts/ConsoleLayout.vue'
import ConsoleHome from './pages/console/Home.vue'
import ConsoleServices from './pages/console/Services.vue'
import ConsoleService from './pages/console/Service.vue'
import ConsoleHermes from './pages/console/Hermes.vue'
import ConsoleHostAuth from './pages/console/HostAuth.vue'
import ConsoleAccount from './pages/console/Account.vue'
import ConsoleBilling from './pages/console/Billing.vue'
import ConsoleNotifications from './pages/console/Notifications.vue'

import en from './locales/en.json'
import pt from './locales/pt.json'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: PATHS.hostAuth,
      name: 'console-host-auth',
      component: ConsoleHostAuth
    },
    {
      path: '/',
      component: ConsoleLayout,
      children: [
        { path: '', name: 'overview', component: ConsoleHome },
        { path: 'services', name: 'console-services', component: ConsoleServices },
        { path: 'services/:id', name: 'console-service', component: ConsoleService },
        { path: 'hermes', name: 'console-hermes', component: ConsoleHermes },
        { path: 'account', name: 'console-account', component: ConsoleAccount },
        { path: 'billing', name: 'console-billing', component: ConsoleBilling },
        { path: 'notifications', name: 'console-notifications', component: ConsoleNotifications }
      ]
    }
  ]
})

const pinia = createPinia()

const getInitialLocale = () => {
  const savedLanguage = localStorage.getItem('preferred-language')
  if (savedLanguage && ['en', 'pt'].includes(savedLanguage)) {
    return savedLanguage
  }
  return navigator.language.startsWith('pt') ? 'pt' : 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, pt }
})

const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(i18n)

router.beforeEach(async () => {
  const auth = useAuthStore()
  if (!auth.ready) await auth.hydrate()
  if (!isLiveOidc()) return true
  if (auth.isAuthenticated) return true
  await auth.login()
  return false
})

useAuthStore().hydrate()
app.mount('#app')
