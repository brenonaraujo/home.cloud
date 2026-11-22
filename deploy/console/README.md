# deploy/console

Swarm stack contract for the member console shell.

- Image built from `platform/spa-nginx` with context `apps/console`.
- Replica **1**, healthcheck on `:8080/health`, resource limits written.
- Placement (git contract): node label `vserver` — not a host IP.
- No secrets. OIDC client `console` is #6. CORS / Stripe return / `GATE_URL` live on the control plane (#7), not in this compose.
- Published port **18082** in `mode: host` on the node that runs the task is the tunnel origin (not the ingress VIP — see "Why host mode").

## Public edge (issue #5)

Additive only. Existing `home-server` hostnames/CNAME were not replaced.

| Piece | Value |
|-------|--------|
| Hostname | `https://console.brenon.cloud` |
| Tunnel | `home-server` (existing). Explicit ingress **above** `*.brenon.cloud` HaaS. Catch-all 404 last. |
| DNS | CNAME `console` → tunnel UUID, proxied. No zone wildcard. No second tunnel. |
| Origin | stack `brenon-console`, published `18082` → container `8080` |

F1.2 (#4) versioned this compose but did not apply it. F1.3 applied the stack so the public hostname had an origin, then merged **only** the `console` ingress rule (GET → merge → PUT; refuse if the previous hostname set shrank) and created the CNAME.

## Why host mode (2026-11-22)

The stack was written for the Swarm ingress VIP. On `server102`, where the task runs live, that mesh loses mid-size TCP packets:

- a segment sent alone with **1149–1398 bytes** of payload (IP packet 1201–1450) never reaches the client; 1148 passes, 1399 passes;
- so responses of about 1 kB vanish and large files stall when their last segment lands in that band. The console bundle stopped at multiples of 1398 bytes in 2 of 3 downloads, which showed up as a **blank console right after a release** until Cloudflare had a full copy.

What it is not: content (random bytes fail the same way), the client path (it fails through the tunnel too), or the whole node — on `server102` a `mode: host` port passes every size, and the ingress mesh on `home101` passes too. The shape is a 1200-MTU hop inside that node's ingress sandbox; nobody has looked at the node yet:

```bash
sudo nsenter --net=/run/docker/netns/ingress_sbox ip -d link
```

One-line check from the LAN (prints `0` while the mesh is broken, `1250` when healthy):

```bash
curl -s -m 3 -r 0-1249 -o /dev/null -w '%{size_download}\n' http://<node>:18082/assets/<bundle>.js
```

Consequences of host mode: the port only answers on the node that runs the task (the tunnel origin must point there), and updates are `stop-first`, a few seconds of 502 per release. Return to `mode: ingress` and `start-first` once the mesh is repaired.

**Applying it:** merging this file changes nothing live. The release webhook redeploys the stack text stored in Portainer, so the stored stack `brenon-console` has to be updated by hand (same two edits: `mode: host`, `order: stop-first`), keeping its live env and placement.

## F1.ci — GHCR + Portainer webhook (issue #26)

Happy path (GitHub Actions `release.yml`, after tag `vX.Y.Z`):

1. Sensors (unit, spa-nginx smoke, Trivy CRITICAL).
2. Push `ghcr.io/brenonaraujo/home-cloud-console` (`linux/amd64`; `vX.Y.Z`, `sha-<commit>`, `latest` if stable).
3. Verify digest on GHCR.
4. `curl -fsS -X POST "$PORTAINER_WEBHOOK_CONSOLE"`.

Live stack must pull that image (`CONSOLE_IMAGE_TAG` = `vX.Y.Z` or `sha-<git>`), not a load-only local tag. Git `stack.yml` keeps placement `vserver`.

**Operator (once, not in git):**

- Portainer → stack `brenon-console` (endpoint 3) → enable webhook; copy URL.
- GitHub → Settings → Secrets and variables → Actions → `PORTAINER_WEBHOOK_CONSOLE` = that URL.
- Registry Portainer `github-registry` can pull the package (public, or creds that can pull).
- Do not commit the webhook URL.

**Not the happy path:** `docker save` / `docker load`, ForceUpdate, PUT this `stack.yml` with masked secrets (`***`), PUT tunnel, `stack rm`.

Rollback: pin `CONSOLE_IMAGE_TAG` to the previous digest/tag and fire the same webhook. Do not `stack rm`.

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
