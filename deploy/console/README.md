# deploy/console

Swarm stack contract for the member console shell.

- Image built from `platform/spa-nginx` with context `apps/console`.
- Replica **1**, healthcheck on `:8080/health`, resource limits written.
- Placement (git contract): node label `vserver` — not a host IP.
- No secrets. OIDC client `console` is #6. CORS / Stripe return / `GATE_URL` live on the control plane (#7), not in this compose.
- Published port **18082** (Swarm ingress VIP) is the tunnel origin.

## Public edge (issue #5)

Additive only. Existing `home-server` hostnames/CNAME were not replaced.

| Piece | Value |
|-------|--------|
| Hostname | `https://console.brenon.cloud` |
| Tunnel | `home-server` (existing). Explicit ingress **above** `*.brenon.cloud` HaaS. Catch-all 404 last. |
| DNS | CNAME `console` → tunnel UUID, proxied. No zone wildcard. No second tunnel. |
| Origin | stack `brenon-console`, published `18082` → container `8080` |

F1.2 (#4) versioned this compose but did not apply it. F1.3 applied the stack so the public hostname had an origin, then merged **only** the `console` ingress rule (GET → merge → PUT; refuse if the previous hostname set shrank) and created the CNAME.

Live placement is currently `node.role == manager` because the operator token cannot push GHCR (`packages` scope missing); the amd64 image was loaded on the manager. Git `stack.yml` still documents `vserver` as the contract once the image is in GHCR.

### Smoke (public — this is the DoD)

```bash
curl -sSI https://console.brenon.cloud/
# 200 text/html, <title>Brenon Cloud Console</title>
curl -sS https://console.brenon.cloud/health
# 200 ok
```

LAN-only / Kong-only checks do not count. Do not 301 Netlify `/console`. Do not PUT control compose from git when the live env is masked (`***`).

## F1.5 — CORS / Stripe / GATE_URL (issue #7)

Contract only. Mutation is the control-plane git + live ForceUpdate:

| Surface | New host (no `/console` prefix) |
|---------|----------------------------------|
| CORS Origin | echo `https://console.brenon.cloud` (keep `https://brenon.cloud`) |
| Stripe success | `https://console.brenon.cloud/billing?checkout=success` |
| Stripe cancel | `https://console.brenon.cloud/billing?checkout=cancel` |
| Portal return | `https://console.brenon.cloud/billing` |
| `GATE_URL` | `https://console.brenon.cloud/host-auth` |
| Mail / member footer | `https://console.brenon.cloud` |
