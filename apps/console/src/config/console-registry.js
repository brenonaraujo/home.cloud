/**
 * Offline fallback for the member console.
 * Live catalog: GET https://control.brenon.cloud/api/v1/catalog
 * Do not add tiles here to ship a service — register it on the control plane.
 */
import { visibleForGroups } from './console-acl.mjs'

export const CONSOLE_SERVICES = [
  {
    id: 'draw',
    title: { en: 'Draw', pt: 'Draw' },
    description: {
      en: 'Shared whiteboard. Any Brenon Cloud account.',
      pt: 'Quadro compartilhado. Qualquer conta Brenon Cloud.'
    },
    url: 'https://draw.brenon.cloud',
    groups: ['*'],
    icon: 'draw',
    color: 'blue'
  },
  {
    id: 'console-air',
    title: { en: 'Akash Console Air', pt: 'Akash Console Air' },
    description: {
      en: 'Self-custodial Akash deployments. Any signed-in account, including Free.',
      pt: 'Deployments self-custodial na Akash. Qualquer conta logada, inclusive Free.'
    },
    url: 'https://akash.brenon.cloud',
    groups: ['*'],
    icon: 'bolt',
    color: 'red'
  },
  {
    id: 'grafana',
    title: { en: 'Grafana', pt: 'Grafana' },
    description: {
      en: 'Metrics and dashboards for the lab.',
      pt: 'Métricas e dashboards do lab.'
    },
    url: 'https://grafana.brenon.cloud',
    groups: ['brenon-admins', 'brenon-ops', 'brenon-viewers'],
    icon: 'chart',
    color: 'orange'
  },
  {
    id: 'n8n',
    title: { en: 'n8n', pt: 'n8n' },
    description: {
      en: 'Workflow automation.',
      pt: 'Automação de fluxos.'
    },
    url: 'https://n8n.brenon.cloud',
    groups: ['brenon-admins', 'brenon-ops', 'brenon-builders'],
    icon: 'workflow',
    color: 'purple'
  },
  {
    id: 'minio',
    title: { en: 'MinIO', pt: 'MinIO' },
    description: {
      en: 'Object storage console. S3 stays on the API.',
      pt: 'Console do object storage. S3 continua na API.'
    },
    url: 'https://minio-console.brenon.cloud',
    groups: ['brenon-admins', 'brenon-ops'],
    icon: 'cloudstorage',
    color: 'cyan'
  },
  {
    id: 'portainer',
    title: { en: 'Portainer', pt: 'Portainer' },
    description: {
      en: 'Swarm. Staff only. Local login stays as break-glass.',
      pt: 'Swarm. Só staff. Login local continua como break-glass.'
    },
    url: 'https://portainer.brenon.cloud',
    groups: ['brenon-admins'],
    icon: 'settings',
    color: 'green'
  },
  {
    id: 'konga',
    title: { en: 'Konga', pt: 'Konga' },
    description: {
      en: 'Kong API gateway admin UI. api-owner only.',
      pt: 'UI de administracao do Kong API gateway. So api-owner.'
    },
    url: 'https://konga.brenon.cloud',
    groups: ['api-owner'],
    icon: 'settings',
    color: 'purple'
  },
  {
    id: 'authentik',
    title: { en: 'Authentik', pt: 'Authentik' },
    description: {
      en: 'Identity provider admin. Brenon admins only.',
      pt: 'Admin do provedor de identidade. Só admins Brenon.'
    },
    url: 'https://auth.brenon.cloud/if/admin/',
    groups: ['brenon-admins'],
    icon: 'settings',
    color: 'orange'
  }
]

export function listForGroups(userGroups) {
  return visibleForGroups(CONSOLE_SERVICES, userGroups)
}

export { visibleForGroups }
