# ADR-0003 — Semver GitHub Release on merge to main

**Status:** accepted  
**Date:** 2026-08-31  
**Context:** git-meta-harness descreve Conventional Commits + Semver e sugere `release-please` (PR de release) **ou** tag manual + `release.yml` com GHCR. Este repo é landing zone (Vue + stack no git). Não vamos publicar GHCR a cada merge enquanto o console live continua no site. `VERSION` na raiz é a versão do **harness** (1.15.x), não do produto.

**Decision:** cada merge na `main` cujo squash é `feat` / `fix` / `perf` (ou `!` / `BREAKING CHANGE`) cria **tag `vX.Y.Z` + GitHub Release** no mesmo commit. `docs` / `chore` / `ci` / `test` / `style` / `refactor` sem `!` não geram release. Sem release-please (a release é o merge, não um PR extra). Sem imagem GHCR neste recorte.

**Consequences:** entrega versionada sem cutover live. Deploy Swarm continua issue #4+#5, não o ato de taguear.
