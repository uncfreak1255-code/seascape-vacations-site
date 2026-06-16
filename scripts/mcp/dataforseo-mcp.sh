#!/usr/bin/env bash
set -euo pipefail

DATAFORSEO_KEYCHAIN_SERVICE="${DATAFORSEO_KEYCHAIN_SERVICE:-dataforseo}"
DATAFORSEO_USERNAME_ACCOUNT="${DATAFORSEO_USERNAME_ACCOUNT:-LOGIN}"
DATAFORSEO_PASSWORD_ACCOUNT="${DATAFORSEO_PASSWORD_ACCOUNT:-API_PASSWORD}"
DATAFORSEO_MCP_PACKAGE="${DATAFORSEO_MCP_PACKAGE:-dataforseo-mcp-server@latest}"

export ENABLED_MODULES="${ENABLED_MODULES:-SERP,KEYWORDS_DATA,DATAFORSEO_LABS,BACKLINKS,DOMAIN_ANALYTICS}"
export DATAFORSEO_FULL_RESPONSE="${DATAFORSEO_FULL_RESPONSE:-false}"
export DATAFORSEO_SIMPLE_FILTER="${DATAFORSEO_SIMPLE_FILTER:-false}"

usage() {
  cat >&2 <<'USAGE'
Usage: scripts/mcp/dataforseo-mcp.sh [--check] [dataforseo-mcp-server args...]

Starts the official DataForSEO MCP server for this project after loading
credentials from macOS Keychain. The wrapper never prints credential values.

Expected Keychain entries:
  service: dataforseo  account: LOGIN
  service: dataforseo  account: API_PASSWORD

Environment overrides:
  DATAFORSEO_USERNAME / DATAFORSEO_PASSWORD
  DATAFORSEO_KEYCHAIN_SERVICE
  DATAFORSEO_USERNAME_ACCOUNT / DATAFORSEO_PASSWORD_ACCOUNT
  ENABLED_MODULES
USAGE
}

fail_missing_secret() {
  local account="$1"
  cat >&2 <<EOF
Missing DataForSEO Keychain credential.
Expected service: ${DATAFORSEO_KEYCHAIN_SERVICE}
Expected account: ${account}
Store it locally with macOS Keychain or provide DATAFORSEO_USERNAME and DATAFORSEO_PASSWORD in the launching environment.
EOF
  exit 1
}

lookup_keychain_secret() {
  local account="$1"
  if ! command -v security >/dev/null 2>&1; then
    echo "macOS security command is not available; set DATAFORSEO_USERNAME and DATAFORSEO_PASSWORD instead." >&2
    exit 1
  fi
  security find-generic-password -s "$DATAFORSEO_KEYCHAIN_SERVICE" -a "$account" -w 2>/dev/null
}

resolve_secret() {
  local env_name="$1"
  local account="$2"
  local value

  if [ -n "${!env_name:-}" ]; then
    return 0
  fi

  if ! value="$(lookup_keychain_secret "$account")"; then
    fail_missing_secret "$account"
  fi

  export "${env_name}=${value}"
}

mode="run"
case "${1:-}" in
  --check)
    mode="check"
    shift
    ;;
  -h|--help)
    usage
    exit 0
    ;;
esac

resolve_secret DATAFORSEO_USERNAME "$DATAFORSEO_USERNAME_ACCOUNT"
resolve_secret DATAFORSEO_PASSWORD "$DATAFORSEO_PASSWORD_ACCOUNT"

if [ "$mode" = "check" ]; then
  command -v npx >/dev/null 2>&1 || {
    echo "npx is not available; install Node.js/npm before starting the DataForSEO MCP server." >&2
    exit 1
  }
  echo "DataForSEO MCP wrapper check passed: credentials available, npx available, modules=${ENABLED_MODULES}."
  exit 0
fi

exec npx -y "$DATAFORSEO_MCP_PACKAGE" "$@"
