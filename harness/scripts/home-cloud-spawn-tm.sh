#!/usr/bin/env bash
# Cron (no_agent): wake team-manager if it is not already running.
# Always print one line so the cron UI is not "no execution".
set -euo pipefail
if pgrep -fl 'hermes -p team-manager' 2>/dev/null | grep -v pgrep | grep -F -- '--in /Users/araujo/Projects/home.cloud' >/dev/null; then
  echo "busy team-manager"
  exit 0
fi
ROOT=/Users/araujo/Projects/home.cloud
LOG=/tmp/home-cloud-tm.log
nohup hermes -p team-manager chat --oneshot \
  --in "$ROOT" \
  --query-file "$ROOT/harness/scripts/team-manager-tick.md" \
  >>"$LOG" 2>&1 &
echo "spawned team-manager pid $!"
