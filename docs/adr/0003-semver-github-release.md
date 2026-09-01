# ADR-0003 — Semver GitHub Release on merge to main

**Status:** accepted (amended 2026-08-31, #26)  
**Date:** 2026-08-31  
**Context:** git-meta-harness descreve Conventional Commits + Semver e sugere `release-please` (PR de release) **ou** tag manual + `release.yml` com GHCR. Este repo é landing zone (Vue + stack no git). `VERSION` na raiz é a versão do **harness** (1.15.x), não do produto. O recorte inicial adiou GHCR enquanto o shell vivia no site. O console já é Swarm (`brenon-console`); CI ainda descartava `home-cloud-console:ci`. Deploy live por `docker save` / ForceUpdate deixou de ser o rito.

**Decision:** cada merge na `main` cujo squash é `feat` / `fix` / `perf` (ou `!` / `BREAKING CHANGE`) cria **tag `vX.Y.Z` (três números) + GitHub Release** no mesmo commit. Baseline = última tag que casa `^v[0-9]+.[0-9]+.[0-9]+$` — tags `v0.4.0.0.0` não entram na conta. `docs` / `chore` / `ci` / `test` / `style` / `refactor` sem `!` não geram release. Sem release-please (a release é o merge, não um PR extra).

**Recorte GHCR do console = sim.** A mesma tag dispara publish de `ghcr.io/brenonaraujo/home-cloud-console` (`linux/amd64`; tags `vX.Y.Z` + `sha-<commit>` + `latest` só em tag estável). Digest real no registry é obrigatório **antes** do POST no webhook Portainer (`PORTAINER_WEBHOOK_CONSOLE`, URL só em GitHub Secrets). GitHub Release permanece. Sem GHCR para outros deployables. harness `VERSION` continua 1.15.x.

**Consequences:** entrega versionada + imagem pullável pelo Portainer `github-registry`. Roll do shell é control plane (pode 502); data plane intocado. Reverter o recorte GHCR quando Pages servir o HTML (Fase 7) ou o registry deixar de ser o contrato do Swarm.
