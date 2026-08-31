#!/usr/bin/env bash
# Conventional Commits → Semver GitHub Release on the current HEAD (or $GITHUB_SHA).
# feat → minor, fix|perf → patch, type! or BREAKING CHANGE → major.
# docs|chore|ci|test|style|refactor without ! → skip (no tag).
#
# Baseline is the last tag that is EXACTLY vMAJOR.MINOR.PATCH.
# Do not feed v0.4.0.0.0 into the parser: bash `read` assigns leftover
# fields to the last variable, so `"${ver}.0.0"` turned v0.4.0 into
# pa=0.0.0 and cut tags v0.4.0.0.0 / v0.4.0.0.0.0.0.
set -euo pipefail

sha="${GITHUB_SHA:-$(git rev-parse HEAD)}"
msg="$(git log -1 --pretty=%s "$sha")"
body="$(git log -1 --pretty=%b "$sha")"

skip() {
  echo "release skip: $*"
  exit 0
}

if git describe --exact-match --tags "$sha" >/dev/null 2>&1; then
  skip "commit already tagged ($(git describe --exact-match --tags "$sha"))"
fi

type="$(printf '%s' "$msg" | sed -nE 's/^([a-z]+)(\([^)]+\))?(!)?:.*/\1/p')"
[ -n "$type" ] || skip "not a conventional commit: $msg"

breaking=0
printf '%s' "$msg" | grep -qE '^[a-z]+(\([^)]+\))?!:' && breaking=1
printf '%s' "$body" | grep -q 'BREAKING CHANGE' && breaking=1

bump=skip
case "$type" in
  feat) bump=minor ;;
  fix|perf) bump=patch ;;
esac
[ "$breaking" = 1 ] && bump=major
[ "$bump" = skip ] && skip "type=$type (no version bump)"

last="$(git tag -l 'v[0-9]*' --sort=v:refname | awk '/^v[0-9]+\.[0-9]+\.[0-9]+$/' | tail -1 || true)"
[ -z "$last" ] && last=v0.0.0
ver="${last#v}"
ma=0
mi=0
pa=0
IFS=. read -r ma mi pa _ <<<"$ver"
ma="${ma:-0}"
mi="${mi:-0}"
pa="${pa:-0}"

case "$bump" in
  major) ma=$((ma + 1)); mi=0; pa=0 ;;
  minor) mi=$((mi + 1)); pa=0 ;;
  patch) pa=$((pa + 1)) ;;
esac
tag="v${ma}.${mi}.${pa}"

if ! [[ "$tag" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "refusing malformed tag: $tag" >&2
  exit 1
fi

if git rev-parse "$tag" >/dev/null 2>&1; then
  skip "tag $tag already exists"
fi

echo "release $tag ($bump) ← $msg  (from $last)"

if [ "${DRY_RUN:-}" = 1 ]; then
  echo "DRY_RUN=1; not creating tag"
  exit 0
fi

notes="$(git log -1 --pretty=format:'%s%n%n%b' "$sha")"
gh release create "$tag" \
  --target "$sha" \
  --title "$tag" \
  --notes "$notes"
echo "created $tag"
