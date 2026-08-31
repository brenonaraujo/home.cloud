#!/usr/bin/env bash
# Deterministic GitHub snapshot for home.cloud harness cron.
# Same output → skip LLM. Any issue/PR/label/CI/persona change → wake orchestrator.
set -euo pipefail
REPO=brenonaraujo/home.cloud

echo 'ISSUES'
gh issue list --repo "$REPO" --state open --limit 50 \
  --json number,title,labels \
  --jq 'sort_by(.number)[] | "#\(.number) \(.title) [\([.labels[].name] | sort | join(","))]"'

echo 'PRS'
gh pr list --repo "$REPO" --state open --limit 20 \
  --json number,title,headRefOid,isDraft \
  --jq 'sort_by(.number)[] | "PR#\(.number) \(.title) sha=\(.headRefOid[0:12]) draft=\(.isDraft)"'

echo 'CHECKS'
while read -r n; do
  [ -z "$n" ] && continue
  echo "PR#$n"
  gh pr checks "$n" --repo "$REPO" 2>/dev/null | awk '{print $1,$2}' | sort || true
done < <(gh pr list --repo "$REPO" --state open --json number --jq 'sort_by(.number)[].number')

echo 'PERSONA'
pgrep -fl 'hermes -p ' 2>/dev/null | grep -v 'pgrep' | sort || echo none
