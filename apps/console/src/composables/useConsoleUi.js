import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/authStore'
import {
  BoltIcon,
  ChartIcon,
  CloudStorageIcon,
  CubeIcon,
  DrawIcon,
  SettingsIcon,
  WorkflowIcon
} from '../components/icons/Icons.js'

const ICONS = {
  draw: DrawIcon,
  chart: ChartIcon,
  workflow: WorkflowIcon,
  cloudstorage: CloudStorageIcon,
  settings: SettingsIcon,
  cube: CubeIcon,
  bolt: BoltIcon
}

const WRAP = {
  blue: 'bg-blue-500/15',
  green: 'bg-emerald-500/15',
  cyan: 'bg-cyan-500/15',
  orange: 'bg-orange-500/15',
  purple: 'bg-purple-500/15',
  red: 'bg-red-500/15'
}

const TINT = {
  blue: 'text-blue-400',
  green: 'text-emerald-400',
  cyan: 'text-cyan-400',
  orange: 'text-orange-400',
  purple: 'text-purple-400',
  red: 'text-red-400'
}

export function useConsoleUi() {
  const { locale } = useI18n()
  const auth = useAuthStore()

  const label = (obj) => obj?.[locale.value] || obj?.en || ''

  const host = (url) => {
    try {
      return new URL(url).host
    } catch {
      return url || ''
    }
  }

  const iconOf = (key) => ICONS[key] || CubeIcon
  const iconWrap = (color) => WRAP[color] || WRAP.blue
  const iconColor = (color) => TINT[color] || TINT.blue

  const initials = computed(() => {
    const name = auth.displayName || auth.email || '?'
    const parts = String(name).trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return String(name).slice(0, 2).toUpperCase()
  })

  return { label, host, iconOf, iconWrap, iconColor, initials }
}
