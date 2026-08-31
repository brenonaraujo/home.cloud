# Adopt Report — Harness Calibration

> Gerado por `gmh adopt` (v1.14.0+, ADR-0027).
> Project: `/Users/araujo/Projects/home.cloud`

## 1. Stack detectado

| Aspecto | Valor |
|---|---|
| Linguagem primária | `unknown` (repo ainda é docs-only) |
| Stack **intencional** | Vue 3 + Vite (console); Go control (fase 5); Swarm + túnel agora |
| Docker | false |
| Docker Compose | false |
| i18n setup | false |

## 2. Domínio inferido

- **Domínio:** `home-cloud`
- **Confiança:** 100/100
- **Sinais (top 10):**
  - AGENTS.md: 1 matches
  - AGENTS.md: 1 matches
  - ARCHITECTURE.md: 5 matches
  - ARCHITECTURE.md: 6 matches
  - ARCHITECTURE.md: 3 matches
  - ARCHITECTURE.md: 1 matches
  - FOUNDATIONS.md: 4 matches
  - FOUNDATIONS.md: 5 matches
  - FOUNDATIONS.md: 2 matches
  - README.md: 2 matches

## 3. Arquivos detectados

_Nenhum arquivo de detecção encontrado._

## 4. Adaptações aplicadas

- Persona `domain-expert-home-cloud.md` criada.
- ⚠️ i18n setup NÃO detectado. Sensor 08 (i18n-audit) pode bloquear PRs.
  Recomendado: skill `i18n` (genérica) — escolha a lib que faz sentido no seu stack.
  ⚠️ NÃO forcei `@nuxtjs/i18n` (seria stack-swap; seu stack é diferente).

## 4b. Adaptações NÃO aplicadas (com justificativa)

- **i18n setup forçado** — i18n é uma decisão de arquitetura. Sugerimos `i18n` skill (genérica), mas o time escolhe a lib.

## 5. Próximos passos sugeridos

1. **Revise** este relatório. Confirme que o stack detectado está correto.
2. **Customize** a persona `domain-expert-home-cloud.md` (seções Comportamento, Edge cases).
3. **Rode** `gmh doctor --json` pra ver o novo health score.
4. **Rode** `gmh agents sync` pra instalar skills em todos os profiles.
5. **Considere** `gmh new --spec` (ADR-0028) pra gerar TODO list a partir de uma spec.
6. **Considere** `gmh metrics` (ADR-0029) pra dashboard contínuo.
