# platform/spa-nginx

Canonical SPA → nginx image for foundation shells (console Fase 1–2, copies later).

Not a product. Workloads stay in their own repos and copy the rite (`docs/add-a-service.md`).

## Contract

- Multi-stage: Node 22 builds the Vite SPA; runtime is `nginxinc/nginx-unprivileged`.
- Listen **8080** (non-root). Health `GET /health` → `200` + `ok`.
- Client-side routes: `try_files` → `index.html` (no server 404).
- Process in **foreground** (`daemon off`). Access/error logs on stdout/stderr of the image.
- Same image for local smoke and later Swarm (#5). Do not apply this image to the lab in #4.

## Build context

Directory of a Vue 3 + Vite app (example: `apps/console`):

- `package.json` + `package-lock.json`
- `index.html`, `*.config.js`
- `public/`, `src/`

Host `node_modules/` and `dist/` are **not** copied (darwin binaries would break the Linux build).

## Smoke (LAN / this machine only)

```bash
docker build -f platform/spa-nginx/Dockerfile \
  --build-context spa=apps/console \
  -t home-cloud-console:local \
  platform/spa-nginx

bash platform/spa-nginx/smoke.sh
# curl evidence is printed: /health, /, /account on 127.0.0.1:<free-port>
```

HTTPS `console.brenon.cloud` is **not** an AC of this blueprint (issue #5).

## Console stack

Versioned Swarm contract: `deploy/console/stack.yml`. Replica 1, healthcheck, placement by node **label**, no host IP as the happy path. Do not `docker stack deploy` / Portainer PUT from this issue.
