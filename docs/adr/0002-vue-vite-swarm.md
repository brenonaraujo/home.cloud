# ADR-0002 — Vue 3 + Vite, not Nuxt; Swarm, not the default compose snapshot

**Status:** accepted  
**Date:** 2026-08-30  
**Context:** bootstrap do meta-harness assume Nuxt 4 + Go/Gin + docker-compose PG como snapshot. home.cloud extrai um console **já escrito** em Vue 3 + Vite, e o deploy agora é Swarm + túnel (rito oficina).

**Decision:**
- Frontend do console = Vue 3 + Vite + Tailwind + vue-i18n + Pinia.
- Snapshot local da Fase 1 = `npm run build` + `vite preview` + testes `node --test`.
- Snapshot da Fase 2+ = stack Swarm + `curl https://console.brenon.cloud/`.
- Não scaffold Nuxt “para cumprir o harness”.

**Consequences:** CI deste repo não roda `pnpm nuxt`. Dockerfile canônico = `platform/spa-nginx` (quando nascer). Architect não pede OpenAPI novo para o shell — o contrato de catálogo já vive no control plane.
