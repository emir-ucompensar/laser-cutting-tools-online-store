#!/usr/bin/env bash

# ─────────────────────────────────────────────
#  compile.sh — Ionic + Capacitor + Android Build
# ─────────────────────────────────────────────

set -euo pipefail

# ── Colors ───────────────────────────────────
RESET="\033[0m"
BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
WHITE="\033[0;37m"

# ── Helpers ───────────────────────────────────
pass()  { echo -e "${GREEN}${BOLD}[PASS]${RESET} $1"; }
fail()  { echo -e "${RED}${BOLD}[FAIL]${RESET} $1"; }
warn()  { echo -e "${YELLOW}${BOLD}[WARN]${RESET} $1"; }
info()  { echo -e "${CYAN}${BOLD}[INFO]${RESET} $1"; }
step()  { echo -e "\n${BOLD}${WHITE}──── $1 ────${RESET}"; }
banner(){
  echo -e "${CYAN}${BOLD}"
  echo "  ╔══════════════════════════════════════════╗"
  echo "  ║       Ionic Hybrid App — Build Tool      ║"
  echo "  ║     Laser Cutting Tools Online Store     ║"
  echo "  ╚══════════════════════════════════════════╝"
  echo -e "${RESET}"
}

# ── Config ────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ANDROID_DIR="$PROJECT_ROOT/android"
WEB_PORT=4200
WEB_URL="http://localhost:$WEB_PORT"

APK_DEBUG="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
APK_RELEASE="$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"

# ── Run a step and report PASS/FAIL ───────────
run_step() {
  local label="$1"
  shift
  local log_file
  log_file="$(mktemp)"

  info "Running: $label..."

  if "$@" > "$log_file" 2>&1; then
    pass "$label"
    rm -f "$log_file"
    return 0
  else
    fail "$label"
    echo -e "${RED}── Error output ──────────────────────────────${RESET}"
    tail -20 "$log_file"
    echo -e "${RED}──────────────────────────────────────────────${RESET}"
    rm -f "$log_file"
    return 1
  fi
}

# ── Check required tools ──────────────────────
check_dependencies() {
  step "Checking dependencies"
  local ok=true

  for cmd in node npm npx; do
    if command -v "$cmd" &>/dev/null; then
      pass "$cmd found ($(command -v "$cmd"))"
    else
      fail "$cmd not found — please install it"
      ok=false
    fi
  done

  if [[ -x "$ANDROID_DIR/gradlew" ]]; then
    pass "gradlew found"
  else
    fail "gradlew not found in $ANDROID_DIR"
    ok=false
  fi

  if [[ "$ok" == false ]]; then
    fail "Missing dependencies. Aborting."
    exit 1
  fi
}

# ── 1. Angular / Ionic Build ──────────────────
build_web() {
  step "Step 1/3 — Angular / Ionic Build (ng build)"
  cd "$PROJECT_ROOT"

  if ! run_step "Angular build" npm run build; then
    fail "Angular build failed. Aborting pipeline."
    exit 1
  fi
}

# ── 2. Capacitor Sync ─────────────────────────
sync_capacitor() {
  step "Step 2/3 — Capacitor Sync (Android)"
  cd "$PROJECT_ROOT"

  if ! run_step "Capacitor sync" npx capacitor sync android; then
    fail "Capacitor sync failed. Aborting pipeline."
    exit 1
  fi
}

# ── 3. Gradle Build ───────────────────────────
build_gradle() {
  step "Step 3/3 — Gradle Build (Android APK)"
  cd "$ANDROID_DIR"

  if ! run_step "Gradle build" ./gradlew build; then
    fail "Gradle build failed. Aborting pipeline."
    exit 1
  fi
}

# ── Show output APK paths ─────────────────────
show_artifacts() {
  step "Build Artifacts"

  if [[ -f "$APK_DEBUG" ]]; then
    pass "Debug APK:   $APK_DEBUG"
  else
    warn "Debug APK not found at expected path"
  fi

  if [[ -f "$APK_RELEASE" ]]; then
    pass "Release APK: $APK_RELEASE"
  else
    warn "Release APK not found at expected path"
  fi
}

# ── Check if dev server is already running ────
check_server_running() {
  # Try curl silently, or fallback to checking if port is in use
  if curl -s --max-time 1 "$WEB_URL" &>/dev/null; then
    return 0
  elif ss -tlnp 2>/dev/null | grep -q ":$WEB_PORT "; then
    return 0
  fi
  return 1
}

# ── Ask to start web service ──────────────────
prompt_web_server() {
  step "Web Preview"

  if check_server_running; then
    warn "Service is already running in $WEB_URL"
    return
  fi

  echo -e "${WHITE}Would you like to start the web preview server? ${BOLD}(${WEB_URL})${RESET}"
  echo -ne "${BOLD}Start server? [Y/N]: ${RESET}"
  read -r answer

  case "$answer" in
    [Yy]|[Yy][Ee][Ss])
      info "Starting development server at $WEB_URL ..."
      info "Press Ctrl+C to stop the server."
      cd "$PROJECT_ROOT"
      npm start
      ;;
    *)
      info "Skipping web server start."
      ;;
  esac
}

# ── Main ──────────────────────────────────────
main() {
  banner
  check_dependencies
  build_web
  sync_capacitor
  build_gradle
  show_artifacts

  echo -e "\n${GREEN}${BOLD}══════════════════════════════════════════════${RESET}"
  pass "Full build pipeline completed successfully!"
  echo -e "${GREEN}${BOLD}══════════════════════════════════════════════${RESET}\n"

  prompt_web_server
}

main "$@"
