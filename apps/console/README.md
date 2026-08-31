# apps/console

Shell do membro. Control plane UI extraído de `brenon.cloud` (F1.1 / issue #3).

**Intenção:** publicar em `https://console.brenon.cloud` (Swarm + túnel, issues #4–#5). Identidade OIDC client `console` é a issue #6.

**Já roda local:** casco Vue 3 + Vite, apex = overview da conta, i18n en+pt. Preview **não** exige login (sessão fixture). Catálogo tenta o control plane e cai no fallback offline.

## Local

```bash
cd apps/console
npm install
npm test
npm run dev
# http://localhost:5173/  → overview
npm run build && npm run preview
```

Voltar ao site da empresa: https://brenon.cloud/ (link absoluto). Bookmarks `/console/...` no site **não** redirecionam neste recorte (issue #8).

## Fora deste recorte

DNS, túnel, 301, OIDC live, CORS/Stripe/GATE_URL.
