---
schema_version: meta-harness/v1alpha1
meta_harness_version: "1.15.0"
project:
  name: home.cloud
  github: brenonaraujo/home.cloud
  kind: landing-zone
stack:
  console: Vue 3 + Vite + Tailwind + vue-i18n + Pinia + oidc-client-ts
  control: Go (existing lab service; absorbed in phase 5)
  identity: Authentik as-code (existing; absorbed in phase 5)
  deploy_now: Docker Swarm + Cloudflare Tunnel (same rite as oficina)
  deploy_later: Cloudflare Pages/Workers for console HTML + status pages
  site_company: brenon.cloud on Netlify — NOT this repo
runtime_adapters:
  - hermes
personas:
  - team-manager
  - domain-expert-home-cloud
  - solutions-architect
  - frontend-engineer
  - backend-engineer
  - devops-engineer
  - quality-assurance
github:
  labels: harness/AGENTS.md §4 + type/* + domain/home-cloud
  default_branch: main
quality:
  i18n: [en, pt]
  snapshot: vite preview / swarm smoke — not Nuxt
  function_line_budget: 35
  file_line_budget: 150
security:
  secrets: ~/.hermes/secrets — never this git
  oidc_clients: [brenon-cloud, console]
---

# home.cloud — project overlay on git-meta-harness

Processo canônico: [`AGENTS.md`](./AGENTS.md) + [`bootstrap.md`](./bootstrap.md) (framework).  
**O quê** deste projeto: [`../SPEC.md`](../SPEC.md), [`../ARCHITECTURE.md`](../ARCHITECTURE.md), [`../FOUNDATIONS.md`](../FOUNDATIONS.md).

Este arquivo calibra o harness. Não substitui os invariantes de processo (1 issue → 1 branch → 1 PR, sensores, rastro no GitHub). Substitui **stack default Nuxt/Gin** e **i18n es**.

## Mission

Landing zone de uma home cloud (control plane ≠ data plane). Console do membro em `console.brenon.cloud`, no lab, rito oficina. Empresa (blog) fora deste git.

## Spec gate

- Functional spec: `SPEC.md` (raiz) e cópia `docs/SPEC.md`
- Architecture: `ARCHITECTURE.md` §9 deve estar **concordada** antes de código em `apps/`
- Taxonomy: `docs/taxonomy.md`
- Roadmap: `docs/roadmap.md`

## Stack (não o default do framework)

| Superfície | Stack | Notas |
|------------|--------|--------|
| `apps/console` | Vue 3 + Vite + Tailwind + vue-i18n + Pinia | Extraído de `brenon.cloud`. **Não** Nuxt. |
| `apps/control` | Go (lab já no ar) | Move na Fase 5 |
| `apps/identity` | Python as-code Authentik | Move na Fase 5 |
| Deploy console agora | Swarm + nginx SPA + túnel `home-server` | [`docs/add-a-service.md`](../docs/add-a-service.md) |
| Deploy console depois | Cloudflare Pages + `apps/status` | Fase 7 |
| Snapshot local | `npm run build && vite preview` no console; smoke `curl` público depois do túnel | Compose PG+Nuxt **não** se aplica |

## i18n

- Obrigatório: `en` e `pt` (vue-i18n). Sem `@` nem `|` em strings de `t()`.
- `es` **não** é idioma deste produto. Waiver: [docs/adr/0001-i18n-en-pt.md](../docs/adr/0001-i18n-en-pt.md).
- Sensor 08: paridade en/pt nas chaves do console. Não exigir `es`.

## Routing extra

| Tipo | Persona de domínio |
|------|-------------------|
| `type/feature` + `domain/home-cloud` | `domain-expert-home-cloud` |
| `type/infra` (túnel, Swarm, CNAME) | skip domain-expert → architect → devops |
| `type/docs` | architect review only |

## Fora de escopo (builders recusam)

- Workloads (Oficina, TibiaPixel, …) neste git
- Blog Netlify neste git
- `--wave 9` no IdP
- PUT compose git do control com senha mascarada
- Um OIDC client para site e console
- Prometer que o console não cai

## Definition of Ready (este projeto)

- [ ] SPEC/ARCHITECTURE cobrem o comportamento
- [ ] Issue tem `type/*` e `domain/home-cloud` quando for feature
- [ ] ACs observáveis, sem nome de botão como único critério
- [ ] Architect registrou blast radius (control vs data)

## Definition of Done (este projeto)

- [ ] ACs da issue
- [ ] Testes do recorte (Vue: `node --test`; Go: `go test` quando control entrar)
- [ ] Sem segredo no git
- [ ] Smoke alinhado ao recorte (LAN então público, nessa ordem)
- [ ] Comentário de rastro no issue
- [ ] Humano validou (invariante 10)

## Human approval

Sempre: DNS de zona, túnel PUT, Stripe live, `--wave` IdP, merge em `main` com cutover 301, criar tenant de verdade.

## Backlog v0.1.0

Marco: https://github.com/brenonaraujo/home.cloud/milestone/1

| Issue | Recorte |
|-------|---------|
| [#2](https://github.com/brenonaraujo/home.cloud/issues/2) | Épico F1 console no lab |
| [#3](https://github.com/brenonaraujo/home.cloud/issues/3) | F1.1 extrair Vue → `apps/console` |
| [#4](https://github.com/brenonaraujo/home.cloud/issues/4) | F1.2 nginx + Swarm |
| [#5](https://github.com/brenonaraujo/home.cloud/issues/5) | F1.3 túnel + CNAME |
| [#6](https://github.com/brenonaraujo/home.cloud/issues/6) | F1.4 OIDC `console` |
| [#7](https://github.com/brenonaraujo/home.cloud/issues/7) | F1.5 CORS / Stripe / GATE_URL |
| [#8](https://github.com/brenonaraujo/home.cloud/issues/8) | F1.6 301 no site |

Cadeia: #3 bloqueia #4 bloqueia #5 bloqueia #6 bloqueia #7 bloqueia #8. Sem GO em `apps/` até ARCHITECTURE.md §9.
