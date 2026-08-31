#!/usr/bin/env bash
# Cron (no_agent): wake team-manager if it is not already running.
# Empty stdout when busy so no_agent cron delivers nothing.
set -euo pipefail
if pgrep -fl 'hermes -p team-manager' 2>/dev/null | grep -v pgrep >/dev/null; then
  exit 0
fi
ROOT=/Users/araujo/Projects/home.cloud
LOG=/tmp/home-cloud-tm.log
nohup hermes -p team-manager chat --oneshot \
  --in "$ROOT" \
  --query-file "$ROOT/harness/scripts/team-manager-tick.md" \
  >>"$LOG" 2>&1 &
echo "spawned team-manager pid $!"
