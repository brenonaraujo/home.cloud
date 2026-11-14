#!/usr/bin/env bash
# Cria a stack `analytics` (Umami) no Portainer do lab pela API, ou, com
# UPDATE=1, reaplica o stack.yml do repo na stack existente.
#
# Lê tudo de arquivos fora do git (modo 600), nunca de argumento:
#   ~/.hermes/secrets/portainer.token          access token do Portainer
#   ~/.hermes/secrets/umami-postgres.password  senha do PostgreSQL
#   ~/.hermes/secrets/umami-app.secret         APP_SECRET do Umami
#   ~/.hermes/secrets/umami-oidc.secret        client secret do provider `analytics`
#   ~/.hermes/secrets/umami-sso-cookie.secret  segredo do cookie do oauth2-proxy
#   ~/.hermes/secrets/umami-admin.password     senha de máquina do admin (set-admin-password.sh)
#
# Uso: deploy/analytics/create-stack.sh            cria (uma vez)
#      UPDATE=1 deploy/analytics/create-stack.sh   reaplica o stack.yml
set -euo pipefail

SECRETS="${SECRETS_DIR:-$HOME/.hermes/secrets}"
export PORTAINER_URL="${PORTAINER_URL:-https://portainer.brenon.cloud}"
export ENDPOINT_ID="${ENDPOINT_ID:-3}"
export STACK_FILE SECRETS UPDATE="${UPDATE:-0}"
STACK_FILE="$(cd "$(dirname "$0")" && pwd)/stack.yml"

for f in portainer.token umami-postgres.password umami-app.secret umami-oidc.secret umami-sso-cookie.secret umami-admin.password; do
  [ -s "$SECRETS/$f" ] || { echo "faltando: $SECRETS/$f" >&2; exit 1; }
done

python3 - <<'PY'
import json, os, socket, ssl, sys, urllib.request
from pathlib import Path

# Sem rota IPv6 na máquina, cada chamada esperaria o timeout do IPv6
# (~40s) antes de cair no IPv4.
_gai = socket.getaddrinfo
socket.getaddrinfo = lambda h, p, f=0, *a, **k: _gai(h, p, socket.AF_INET, *a, **k)

base = os.environ["PORTAINER_URL"].rstrip("/")
endpoint = os.environ["ENDPOINT_ID"]
secrets = Path(os.environ["SECRETS"])
token = (secrets / "portainer.token").read_text().strip()
ctx = ssl.create_default_context()  # TLS verificado: usar o hostname público

def call(method, path, body=None):
    req = urllib.request.Request(
        base + path, method=method,
        data=None if body is None else json.dumps(body).encode(),
        # O Cloudflare barra o User-Agent padrão do urllib (403).
        headers={"X-API-Key": token, "Content-Type": "application/json", "User-Agent": "home-cloud-deploy/1"},
    )
    with urllib.request.urlopen(req, timeout=300, context=ctx) as r:
        return json.loads(r.read() or b"null")

existing = [s for s in call("GET", "/api/stacks") if s["Name"] == "analytics"]
env = [
    {"name": "POSTGRES_PASSWORD", "value": (secrets / "umami-postgres.password").read_text().strip()},
    {"name": "APP_SECRET", "value": (secrets / "umami-app.secret").read_text().strip()},
    {"name": "OIDC_CLIENT_SECRET", "value": (secrets / "umami-oidc.secret").read_text().strip()},
    {"name": "COOKIE_SECRET", "value": (secrets / "umami-sso-cookie.secret").read_text().strip()},
    {"name": "UMAMI_ADMIN_PASSWORD", "value": (secrets / "umami-admin.password").read_text().strip()},
]
content = Path(os.environ["STACK_FILE"]).read_text()

if existing:
    if os.environ["UPDATE"] != "1":
        sys.exit("a stack analytics já existe; use UPDATE=1")
    stack = existing[0]
    call("PUT", f"/api/stacks/{stack['Id']}?endpointId={endpoint}", {
        "StackFileContent": content, "Env": env, "Prune": False, "PullImage": True,
    })
    print(f"stack atualizada: id={stack['Id']}")
    sys.exit(0)

swarm_id = call("GET", f"/api/endpoints/{endpoint}/docker/swarm")["ID"]
stack = call("POST", f"/api/stacks/create/swarm/string?endpointId={endpoint}", {
    "Name": "analytics",
    "SwarmID": swarm_id,
    "StackFileContent": content,
    "Env": env,
})
print(f"stack criada: id={stack['Id']}")
PY
