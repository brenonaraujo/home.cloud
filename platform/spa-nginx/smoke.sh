#!/usr/bin/env bash
# Local / CI smoke for the canonical SPA nginx image.
# Does not talk to Swarm, Portainer, tunnel, or DNS.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
IMAGE="${IMAGE:-home-cloud-console:local}"
NAME="${NAME:-home-cloud-console-smoke}"
SPA_CONTEXT="${SPA_CONTEXT:-$ROOT/apps/console}"
DOCKERFILE="${DOCKERFILE:-$ROOT/platform/spa-nginx/Dockerfile}"
SKIP_BUILD=0
HOST_PORT="${HOST_PORT:-}"
EXPECT_TITLE="${EXPECT_TITLE:-Brenon Cloud Console}"
SPA_PATH="${SPA_PATH:-/account}"

usage() {
  cat <<'EOF'
Usage: platform/spa-nginx/smoke.sh [--skip-build] [--image NAME] [--port N]
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-build) SKIP_BUILD=1; shift ;;
    --image) IMAGE="$2"; shift 2 ;;
    --port) HOST_PORT="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown arg: $1" >&2; usage; exit 2 ;;
  esac
done

pick_port() {
  local p
  for p in 18082 18083 18084 18085 18086 18087 18088; do
    if ! lsof -nP -iTCP:"$p" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "$p"
      return 0
    fi
  done
  echo "no free port in 18082-18088" >&2
  return 1
}

if [[ -z "$HOST_PORT" ]]; then
  HOST_PORT="$(pick_port)"
fi

cleanup() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

if [[ "$SKIP_BUILD" -eq 0 ]]; then
  docker build \
    -f "$DOCKERFILE" \
    --build-context spa="$SPA_CONTEXT" \
    -t "$IMAGE" \
    "$ROOT/platform/spa-nginx"
fi

cleanup
docker run -d --name "$NAME" \
  -p "127.0.0.1:${HOST_PORT}:8080" \
  "$IMAGE" >/dev/null

USER_ID="$(docker exec "$NAME" id -u)"
if [[ "$USER_ID" == "0" ]]; then
  echo "FAIL: container is running as root" >&2
  exit 1
fi

ok=0
for _ in 1 2 3 4 5 6 7 8 9 10 11 12; do
  if curl -fsS "http://127.0.0.1:${HOST_PORT}/health" >/dev/null; then
    ok=1
    break
  fi
  sleep 1
done
if [[ "$ok" -ne 1 ]]; then
  echo "FAIL: health did not become ready on :${HOST_PORT}" >&2
  docker logs "$NAME" >&2 || true
  exit 1
fi

HEALTH_BODY="$(curl -fsS "http://127.0.0.1:${HOST_PORT}/health")"
HEALTH_CODE="$(curl -fsS -o /dev/null -w '%{http_code}' "http://127.0.0.1:${HOST_PORT}/health")"
ROOT_CODE="$(curl -fsS -o /tmp/spa-root.html -w '%{http_code}' "http://127.0.0.1:${HOST_PORT}/")"
SPA_CODE="$(curl -fsS -o /tmp/spa-route.html -w '%{http_code}' "http://127.0.0.1:${HOST_PORT}${SPA_PATH}")"

echo "user_id=${USER_ID}"
echo "health ${HEALTH_CODE} body=$(printf '%s' "$HEALTH_BODY" | tr -d '\n')"
echo "/ ${ROOT_CODE} url=http://127.0.0.1:${HOST_PORT}/"
echo "${SPA_PATH} ${SPA_CODE} (SPA fallback)"

if [[ "$HEALTH_CODE" != "200" || "$HEALTH_BODY" != $'ok\n' && "$HEALTH_BODY" != "ok" ]]; then
  echo "FAIL: /health expected 200 ok, got ${HEALTH_CODE} ${HEALTH_BODY}" >&2
  exit 1
fi
if [[ "$ROOT_CODE" != "200" ]]; then
  echo "FAIL: / expected 200, got ${ROOT_CODE}" >&2
  exit 1
fi
if ! grep -F -q "$EXPECT_TITLE" /tmp/spa-root.html; then
  echo "FAIL: / HTML is not the console shell (missing ${EXPECT_TITLE})" >&2
  exit 1
fi
if [[ "$SPA_CODE" != "200" ]]; then
  echo "FAIL: ${SPA_PATH} expected 200 fallback, got ${SPA_CODE}" >&2
  exit 1
fi
if ! grep -F -q "$EXPECT_TITLE" /tmp/spa-route.html; then
  echo "FAIL: ${SPA_PATH} did not fall back to index.html" >&2
  exit 1
fi

echo "SMOKE_OK port=${HOST_PORT} image=${IMAGE}"
