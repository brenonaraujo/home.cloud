#!/usr/bin/env bash
# Grava no banco a senha de máquina do usuário `admin` do Umami.
#
# Ninguém digita essa senha: quem entra no painel passa pelo SSO da casa
# e a `bridge` da stack abre a sessão no Umami com ela. Por isso ela é
# gerada aqui, uma vez, e fica só em arquivo (modo 600):
#   ~/.hermes/secrets/umami-admin.password
#
# O script grava só o hash bcrypt, por um job one-off do Swarm ao lado do
# banco (a overlay do lab não cruza nós e o banco não é publicado).
# Trocar a senha: apagar o arquivo, rodar este script e reaplicar a stack
# (UPDATE=1 create-stack.sh). As sessões abertas caem na troca.
#
# Uso: deploy/analytics/set-admin-password.sh
set -euo pipefail

SECRETS="${SECRETS_DIR:-$HOME/.hermes/secrets}"
for f in portainer.token umami-postgres.password; do
  [ -s "$SECRETS/$f" ] || { echo "faltando: $SECRETS/$f" >&2; exit 1; }
done
command -v htpasswd >/dev/null || { echo "htpasswd não encontrado (pacote apache2-utils)" >&2; exit 1; }

PW_FILE="$SECRETS/umami-admin.password"
if [ ! -s "$PW_FILE" ]; then
  (umask 077; openssl rand -base64 36 | tr -d '\n' > "$PW_FILE")
  echo "senha de máquina gerada em $PW_FILE"
fi

HASH="$(htpasswd -niBC 10 admin < "$PW_FILE" | head -1 | cut -d: -f2-)"
case "$HASH" in '$2'*) ;; *) echo "hash bcrypt inesperado" >&2; exit 1 ;; esac

export SECRETS HASH
python3 - <<'PY'
import json, os, socket, sys, time, urllib.request
from pathlib import Path

# Sem rota IPv6 na máquina, cada chamada esperaria o timeout do IPv6.
_gai = socket.getaddrinfo
socket.getaddrinfo = lambda h, p, f=0, *a, **k: _gai(h, p, socket.AF_INET, *a, **k)

secrets = Path(os.environ["SECRETS"])
token = (secrets / "portainer.token").read_text().strip()
pgpass = (secrets / "umami-postgres.password").read_text().strip()
base = "https://portainer.brenon.cloud/api/endpoints/3/docker"
# O hash bcrypt só tem [./A-Za-z0-9$]: não precisa de escape no SQL.
sql = f"""update "user" set password='{os.environ["HASH"]}', updated_at=now() where username='admin'"""

def call(method, path, body=None):
    req = urllib.request.Request(
        base + path, method=method,
        data=None if body is None else json.dumps(body).encode(),
        headers={"X-API-Key": token, "Content-Type": "application/json", "User-Agent": "home-cloud-deploy/1"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read() or b"null")

name = f"analytics-job-{int(time.time())}"
sid = call("POST", "/services/create", {
    "Name": name,
    "TaskTemplate": {
        "ContainerSpec": {
            "Image": "postgres:18.4-alpine",
            "Command": ["psql", "-v", "ON_ERROR_STOP=1", "-h", "postgres", "-U", "umami", "-d", "umami", "-c", sql],
            "Env": [f"PGPASSWORD={pgpass}"],
        },
        # Mesmo nó do banco: no lab a overlay não cruza nós.
        "Placement": {"Constraints": ["node.labels.vserver == true"]},
        "RestartPolicy": {"Condition": "none"},
        "Networks": [{"Target": "analytics_internal"}],
    },
    "Mode": {"ReplicatedJob": {"MaxConcurrent": 1, "TotalCompletions": 1}},
})["ID"]
state = "sem task"
try:
    for _ in range(60):
        time.sleep(2)
        tasks = call("GET", "/tasks?filters=" + urllib.request.quote(json.dumps({"service": [name]})))
        if tasks:
            state = tasks[0]["Status"]["State"]
            if state in ("complete", "failed", "rejected"):
                break
finally:
    call("DELETE", f"/services/{sid}")
if state != "complete":
    sys.exit(f"o job terminou em '{state}': a senha NÃO foi alterada")
print("senha de máquina do admin gravada no banco.")
PY
