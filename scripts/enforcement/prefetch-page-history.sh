#!/usr/bin/env bash
set -euo pipefail

# Eleventy reads earlier versions of these inputs for per-page dates. Fetch
# those blobs together so a cold partial checkout doesn't fetch them one by one.
missing_blobs=$(
  git rev-list --objects --missing=print --no-object-names HEAD -- \
    src/_data/seoPages.json src/_data/seoGovernance.js |
    sed -n 's/^?//p'
)

if [[ -n "$missing_blobs" ]]; then
  git -c fetch.negotiationAlgorithm=noop fetch --no-tags --no-write-fetch-head \
    --recurse-submodules=no --filter=blob:none --stdin origin <<< "$missing_blobs"
fi
