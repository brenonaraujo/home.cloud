# Workflow 07 — Hermes profiles loop (home.cloud)

Como o loop **roda de verdade** neste runtime. Complementa
[`05-orchestration.md`](./05-orchestration.md). Não substitui labels
nem 1 issue → 1 branch → 1 PR.

## O que estava quebrado

Copiar `harness/` + abrir issues **não** dispara personas.
`hermes -p <persona> chat --oneshot` **não** pega issue sozinho.
Sem briefing + rastro na issue, o profile trabalha calado e o
orquestrador some quando a sessão acaba.

## Papéis

| Quem | Runtime | Faz |
|------|---------|-----|
| Orquestrador | profile `default` **neste** chat **ou** cron `home-cloud-loop` | Lê GitHub, comenta handoff, cria branch, `hermes -p … --oneshot`, merge quando QA ok (ambiente de teste autorizado). **Não** escreve feature. |
| Personas | `~/.hermes/profiles/<nome>` | Um recorte. Comentário **antes**, **durante**, **depois**. |

Personas: `team-manager` (só se o default estiver ausente),
`domain-expert-home-cloud`, `solutions-architect`, `frontend-engineer`,
`backend-engineer`, `devops-engineer`, `quality-assurance`.

GitHub mostra o mesmo user (`brenonaraujo`). O rastro é o **título**
do comentário, não o login.

## Rastro obrigatório (toda persona)

1. **Peguei** — primeiro `gh issue comment` **antes** de git/código.
2. **Andamento** — PR aberto, CI, bloqueio, evidência de teste.
3. **Pronto** — o que entregou + URL + “próximo: &lt;papel&gt;”.
   Não atribui a outra persona. Não fecha issue. Não mergeia.

Títulos:

- `## 🎯 team-manager → <persona>`
- `## 🎯 Refinamento — domain-expert-home-cloud`
- `## 🏛️ Definition of Done — solutions-architect`
- `## 🛠️ <builder> — in-progress` / `— PR`
- `## 🔍 Quality Assurance — Relatório`

## Dispatch

```bash
# orquestrador
git checkout main && git pull
git checkout -b feature/<id>-<slug>
git push -u origin HEAD
git checkout main

gh issue comment <id> --body-file /tmp/handoff.md   # briefing + branch

hermes -p <persona> chat --oneshot \
  --in /Users/araujo/Projects/home.cloud \
  --query-file /tmp/brief.md
```

O brief **sempre** começa com: comente “peguei” na issue, depois trabalhe.

No máximo **uma** persona `--oneshot` por vez neste repo (cwd compartilhado).

## Relógio e ganchos

Cron `home-cloud-loop` (job `7a1795d9a65d`): **a cada 2 min**.
Precisa do **Hermes gateway** (`hermes gateway install --start-now`).
Sem gateway o job não dispara.

O tick **não** chama LLM se o snapshot GitHub não mudou.
Script: [`../scripts/harness-watch.sh`](../scripts/harness-watch.sh)
(issues abertas + labels, PRs + SHA, checks, persona `--oneshot` no ar).

GitHub webhook → `localhost:8644` **não** chega da nuvem sem URL
pública. Sem túnel extra (cerca live), o poll de 2 min **é** o gancho.

Cada tick do LLM tem teto curto (~3 min): só decide e dispara
`hermes -p … --oneshot` em background. Não espera o builder.

## Tick do orquestrador (cada ciclo)

1. `gh issue list` + `gh pr list` neste repo.
2. PR aberto + CI verde + issue `in-progress` → QA.
3. Issue `qa` + PR mergeable → merge squash (cerca live abaixo) + `done`.
4. Issue `ready` sem PR → branch + builder certo (`frontend` / `devops` / `backend`).
5. Issue `refined` → architect.
6. Issue `triage` + `type/feature` → domain-expert-home-cloud.
7. Issue `triage` + `type/infra`/`type/technical` → architect (skip domain).
8. Nada a fazer → comentar nada; sair.

## Cerca live (não negociável neste GO)

Não migrar o que já funciona:

- Site `brenon.cloud` / Netlify / 301 `#8` — **não**.
- PUT túnel, CNAME de zona, ForceUpdate control, Stripe return, `GATE_URL` — **não**.
- PUT/delete stack Swarm **existente** — **não**.
- Recortes permitidos: só este git (`apps/console`, `platform/`, `deploy/` docs) e smoke **local**.

## Fim

Épico #2 `done` quando #3–#7 que forem **aditivos** estiverem `done`.
#5–#8 ficam abertas se exigirem borda live — o loop **não** as força.
