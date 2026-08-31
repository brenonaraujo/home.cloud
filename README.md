# home.cloud

Landing zone de uma **home cloud** no espírito da AWS: control plane separado de data plane, plataforma separada de produto, empresa (blog) separada do console.

Este repositório, neste momento, é **só especificação e arquitetura**. Não há código de aplicação. O objetivo é estudar se o caminho está certo **antes** de implementar.

Implementação de referência em produção (lab Brenon): identidade, catálogo, billing e workloads já existem em outros repositórios. Aqui documentamos o *modelo* para evoluir esse lab — e para outra pessoa montar o dela.

## Como ler (nessa ordem)

| # | Documento | Pergunta que responde |
|---|-----------|------------------------|
| 1 | [SPEC.md](./SPEC.md) | O que o produto *é* e o que cada pessoa consegue fazer. Sem stack. |
| 2 | [FOUNDATIONS.md](./FOUNDATIONS.md) | Quais papers da AWS viraram invariantes nossas. |
| 3 | [ARCHITECTURE.md](./ARCHITECTURE.md) | Como as peças se encaixam no lab. Hosts, planos de deploy, blast radius. |
| 4 | [docs/taxonomy.md](./docs/taxonomy.md) | O que é plataforma, o que é produto, o que é a empresa. |
| 5 | [docs/control-data-plane.md](./docs/control-data-plane.md) | Por que o console pode cair e o tenant já criado não deveria. |
| 6 | [docs/landing-zone.md](./docs/landing-zone.md) | Analogia Organizations / OUs → stacks, grupos, hostnames. |
| 7 | [docs/roadmap.md](./docs/roadmap.md) | Fases. O que *não* fazer agora. |
| 8 | [docs/add-a-service.md](./docs/add-a-service.md) | Blueprint do próximo hostname (quando formos implementar). |
| 9 | [docs/papers.md](./docs/papers.md) | Bibliografia. |

Se só tiver dois minutos: leia o diagrama em [ARCHITECTURE.md](./ARCHITECTURE.md) e a tabela de taxonomia.

**Implementação** é orquestrada pelo [git-meta-harness](https://github.com/brenonaraujo/git-meta-harness) (v1.15). Overlay: [harness/PROJECT.md](./harness/PROJECT.md). Não comece código em `apps/` sem issue `ready`.

## O que este repo é

- A **fundação** (Control Tower / landing zone), não o universo de produtos.
- Um lugar para concordar em linguagem: control plane, data plane, plataforma, produto, empresa.
- Um contrato para quando o código nascer em `apps/`.

## O que este repo não é

- Não é o blog pessoal (`brenon.cloud` no Netlify).
- Não é Oficina, TibiaPixel, BRNN AI, nem qualquer workload.
- Não é um Kubernetes em casa.
- Não promete 99.99%. O lab vai cair. Isso está no contrato de confiabilidade.

## Árvore (alvo)

```
home.cloud/
├── SPEC.md
├── FOUNDATIONS.md
├── ARCHITECTURE.md
├── docs/
├── apps/          # vazio de código até o GO de implementação
│   ├── console/   # shell do membro
│   ├── control/   # catálogo, billing glue, provision
│   ├── identity/  # IdP as-code
│   └── status/    # páginas de downtime (fase posterior)
├── platform/      # blueprints reutilizáveis (SPA nginx, oauth2-proxy, swarm)
└── deploy/
```

## Analogia rápida

| AWS | home.cloud |
|-----|------------|
| amazon.com | site da empresa (blog) |
| aws.amazon.com | marca `brnn.cloud` |
| console.aws.amazon.com | `console.brenon.cloud` |
| IAM / Organizations / Control Tower | identidade + catálogo + este repo |
| Conta de workload | um produto / um tenant já provisionado |

## Status

**Fase 0 — documentação.** Nada em `apps/` além de README de intenção.

Quando a leitura estiver alinhada, a construção começa pela extração do console (ver [docs/roadmap.md](./docs/roadmap.md)).
