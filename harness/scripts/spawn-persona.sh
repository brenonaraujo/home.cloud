#!/usr/bin/env bash
# Detached persona spawn (not tracked by the parent Hermes chat).
set -euo pipefail
profile="${1:?profile}"
brief="${2:?brief file}"
repo="${3:-/Users/araujo/Projects/home.cloud}"
id="$(basename "$brief" .md)"
log="/tmp/${id}.log"
if pgrep -fl "hermes -p ${profile} " 2>/dev/null | grep -v pgrep | grep -F -- "--in $repo" >/dev/null; then
  echo "busy: $profile"
  exit 0
fi
nohup hermes -p "$profile" chat --oneshot --in "$repo" --query-file "$brief" >>"$log" 2>&1 &
echo "spawned $profile pid $! log=$log"
