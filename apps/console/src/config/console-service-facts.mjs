/**
 * Real operational facts for console service pages.
 * Copy is from live hosts / published Brenon Cloud pages — not invented SKUs.
 */
export const SERVICE_FACTS = {
  draw: {
    plan: 'free',
    statusUrl: 'https://status.brenon.cloud',
    docsUrl: 'https://brenon.cloud/service?service=draw',
    facts: {
      en: [
        'Self-hosted Excalidraw we operate at draw.brenon.cloud.',
        'Any signed-in Brenon Cloud account can open it (Authentik SSO).',
        'Opens in a new tab. The whiteboard is not a public landing.'
      ],
      pt: [
        'Excalidraw self-hosted em draw.brenon.cloud.',
        'Qualquer conta Brenon Cloud logada abre (SSO Authentik).',
        'Abre em nova aba. O quadro não é landing pública.'
      ]
    }
  },
  grafana: {
    plan: 'staff',
    statusUrl: 'https://status.brenon.cloud',
    docsUrl: 'https://brenon.cloud/service?service=grafana',
    facts: {
      en: [
        'Metrics and dashboards for the lab at grafana.brenon.cloud.',
        'Staff groups only (admins, ops, viewers).',
        'SSO is Authentik OIDC, not a separate Grafana password.'
      ],
      pt: [
        'Métricas e dashboards do lab em grafana.brenon.cloud.',
        'Só grupos de staff (admins, ops, viewers).',
        'SSO é OIDC Authentik, não uma senha extra do Grafana.'
      ]
    }
  },
  n8n: {
    plan: 'staff',
    statusUrl: 'https://status.brenon.cloud',
    docsUrl: 'https://brenon.cloud/service?service=n8n',
    facts: {
      en: [
        'Workflow automation at n8n.brenon.cloud.',
        'Staff builders and ops. n8n CE has no native OIDC — tile + proxy.',
        'Public webhook paths stay skip-auth; the editor does not.'
      ],
      pt: [
        'Automação de fluxos em n8n.brenon.cloud.',
        'Staff builders e ops. n8n CE não tem OIDC nativo — tile + proxy.',
        'Webhooks públicos ficam skip-auth; o editor não.'
      ]
    }
  },
  minio: {
    plan: 'staff',
    statusUrl: 'https://status.brenon.cloud',
    docsUrl: 'https://brenon.cloud/service?service=minio',
    facts: {
      en: [
        'Object storage console at minio-console.brenon.cloud.',
        'S3 API stays on the Kong API plane, not this console.',
        'Staff ops. Authentik OIDC on the console.'
      ],
      pt: [
        'Console de object storage em minio-console.brenon.cloud.',
        'A API S3 continua no plano Kong, não neste console.',
        'Staff ops. OIDC Authentik no console.'
      ]
    }
  },
  portainer: {
    plan: 'staff',
    statusUrl: 'https://status.brenon.cloud',
    docsUrl: 'https://brenon.cloud/service?service=portainer',
    facts: {
      en: [
        'Docker Swarm control at portainer.brenon.cloud.',
        'Brenon admins only. Local login stays as break-glass.',
        'This is the staff plane — paying customers never land here.'
      ],
      pt: [
        'Controle do Docker Swarm em portainer.brenon.cloud.',
        'Só admins Brenon. Login local continua como break-glass.',
        'Plano de staff — cliente pagante não entra aqui.'
      ]
    }
  },
  konga: {
    plan: 'staff',
    statusUrl: 'https://status.brenon.cloud',
    facts: {
      en: [
        'Kong Admin UI at konga.brenon.cloud.',
        'Needs api-owner. That group is not implied by brenon-admins.',
        'No public host for Kong Admin itself.'
      ],
      pt: [
        'UI de admin do Kong em konga.brenon.cloud.',
        'Precisa de api-owner. Esse grupo não vem com brenon-admins.',
        'O Kong Admin em si não tem host público.'
      ]
    }
  },
  authentik: {
    plan: 'staff',
    docsUrl: 'https://auth.brenon.cloud/if/user/',
    facts: {
      en: [
        'Identity provider admin at auth.brenon.cloud/if/admin/.',
        'Brenon admins only. Authentik is the IdP — not a product console.',
        'Customer sessions stay on the user library, not this admin UI.'
      ],
      pt: [
        'Admin do provedor de identidade em auth.brenon.cloud/if/admin/.',
        'Só admins Brenon. Authentik é o IdP — não um console de produto.',
        'Sessão de cliente fica na library do usuário, não neste admin.'
      ]
    }
  },
  vserver: {
    plan: 'staff',
    statusUrl: 'https://status.brenon.cloud',
    docsUrl: 'https://brenon.cloud/service?service=vserver',
    facts: {
      en: [
        'GPU machine console at vserver.brenon.cloud — local AI or mining hosts, with live monitoring.',
        'Staff only (admins and ops). Sign-in is Authentik (oauth2-proxy).',
        'Public /api/health reports vserver-brenon-cloud v2. Metrics stay Bearer-gated.'
      ],
      pt: [
        'Console de máquinas GPU em vserver.brenon.cloud — hosts de IA local ou mineração, com monitoramento ao vivo.',
        'Só staff (admins e ops). Login é Authentik (oauth2-proxy).',
        '/api/health público responde vserver-brenon-cloud v2. Métricas continuam com Bearer.'
      ]
    }
  },
  'console-air': {
    plan: 'free',
    statusUrl: 'https://status.brenon.cloud',
    docsUrl: 'https://brenon.cloud/blog/console-air-on-brenon-cloud',
    facts: {
      en: [
        'Self-hosted Akash Console Air at akash.brenon.cloud. Any plan, including Free — Brenon Cloud login required.',
        'Anonymous visitors are blocked. After Authentik, connect Keplr (or a compatible Cosmos wallet).',
        'Swap AKT for ACTs in-app (10 AKT minimum). SDL editor, bids, leases, logs.',
        'Akash split Console (managed + card) from Console Air (AEP-84). This instance is Air.'
      ],
      pt: [
        'Console Air da Akash em akash.brenon.cloud. Qualquer plano, inclusive Free — precisa estar logado na Brenon Cloud.',
        'Visitante anônimo é bloqueado. Depois do Authentik, conecte o Keplr (ou carteira Cosmos compatível).',
        'Troca AKT por ACTs no app (mínimo 10 AKT). Editor SDL, bids, leases, logs.',
        'A Akash separou Console gerenciado do Console Air (AEP-84). Esta instância é Air.'
      ]
    }
  }
}

export function factsFor(id, locale = 'en') {
  const row = SERVICE_FACTS[id]
  if (!row) return null
  const lang = locale === 'pt' ? 'pt' : 'en'
  return {
    plan: row.plan,
    statusUrl: row.statusUrl || '',
    docsUrl: row.docsUrl || '',
    bullets: row.facts[lang] || row.facts.en || []
  }
}
