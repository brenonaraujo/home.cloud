import { createApp, watchEffect } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { useAuthStore } from './stores/authStore'
import { AUTH_CALLBACK_PATH, AUTH_CONTINUE_PATH, isLiveOidc } from './config/auth.js'
import { PATHS } from './config/console-paths.mjs'
import { htmlLang, pageTitle } from './config/console-title.mjs'
import { pageTitleOverride } from './composables/usePageTitle.js'
import App from './App.vue'
import './style.css'

import ConsoleLayout from './layouts/ConsoleLayout.vue'
import AuthCallback from './pages/AuthCallback.vue'
import AuthContinue from './pages/AuthContinue.vue'
import ConsoleHome from './pages/console/Home.vue'
import ConsoleServices from './pages/console/Services.vue'
import ConsoleService from './pages/console/Service.vue'
import ConsoleHermes from './pages/console/Hermes.vue'
import ConsoleHostAuth from './pages/console/HostAuth.vue'
import ConsoleAccount from './pages/console/Account.vue'
import ConsoleBilling from './pages/console/Billing.vue'
import ConsoleNotifications from './pages/console/Notifications.vue'
import ConsoleNotFound from './pages/console/NotFound.vue'

import en from './locales/en.json'
import pt from './locales/pt.json'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: AUTH_CALLBACK_PATH, name: 'auth-callback', component: AuthCallback },
    { path: AUTH_CONTINUE_PATH, name: 'auth-continue', component: AuthContinue },
    {
      path: PATHS.hostAuth,
      name: 'console-host-auth',
      component: ConsoleHostAuth
    },
    {
      // Old bookmarks from when the console lived under brenon.cloud/console.
      path: '/console/:rest(.*)*',
      redirect: (to) => ({
        path: `/${[].concat(to.params.rest || []).join('/')}`,
        query: to.query,
        hash: to.hash
      })
    },
    {
      path: '/',
      component: ConsoleLayout,
      children: [
        { path: '', name: 'overview', component: ConsoleHome, meta: { titleKey: 'console.nav.home' } },
        { path: 'services', name: 'console-services', component: ConsoleServices, meta: { titleKey: 'console.services.title' } },
        { path: 'services/:id', name: 'console-service', component: ConsoleService, meta: { titleKey: 'console.services.title' } },
        { path: 'hermes', name: 'console-hermes', component: ConsoleHermes, meta: { titleKey: 'console.hermes.title' } },
        { path: 'account', name: 'console-account', component: ConsoleAccount, meta: { titleKey: 'console.account.title' } },
        { path: 'billing', name: 'console-billing', component: ConsoleBilling, meta: { titleKey: 'console.billing.title' } },
        { path: 'notifications', name: 'console-notifications', component: ConsoleNotifications, meta: { titleKey: 'console.notifications.title' } },
        // Dev-only design kit; the import is dropped from production builds.
        ...(import.meta.env.DEV
          ? [{ path: '_kit', name: 'console-kit', component: () => import('./pages/console/Kit.vue'), meta: { title: 'Design kit' } }]
          : []),
        { path: ':pathMatch(.*)*', name: 'console-not-found', component: ConsoleNotFound, meta: { titleKey: 'console.notFound.title' } }
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

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.ready) await auth.hydrate()
  if (!isLiveOidc()) return true
  if (to.path === AUTH_CALLBACK_PATH || to.path === AUTH_CONTINUE_PATH) return true
  if (auth.isAuthenticated) return true
  await auth.login(to.fullPath)
  return false
})

watchEffect(() => {
  const route = router.currentRoute.value
  const key = route.meta?.titleKey
  const label = pageTitleOverride.value || (key ? i18n.global.t(key) : route.meta?.title || '')
  document.title = pageTitle(label)
  document.documentElement.lang = htmlLang(i18n.global.locale.value)
})

useAuthStore().hydrate()
app.mount('#app')
