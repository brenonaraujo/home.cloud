# deploy/console

Swarm stack contract for the member console shell.

- Image built from `platform/spa-nginx` with context `apps/console`.
- Replica **1**, healthcheck on `:8080/health`, resource limits written.
- Placement: node label `vserver` — not a host IP.
- No secrets. No OIDC/Stripe/GATE_URL (issues #6/#7).
- **Do not apply** this stack in issue #4 (live `brenon.cloud/console`, tunnel, and DNS stay).

Local proof is `bash platform/spa-nginx/smoke.sh`, not `docker stack deploy`.
