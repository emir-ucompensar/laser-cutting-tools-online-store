#!/usr/bin/env bash

# ─────────────────────────────────────────────
#  sideload.sh — Install APK to Android Device / Emulator
#  WSL2 environment — Android SDK on Windows (C:\Android\sdk)
# ─────────────────────────────────────────────

set -uo pipefail

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
banner() {
  echo -e "${CYAN}${BOLD}"
  echo "  ╔══════════════════════════════════════════╗"
  echo "  ║      Ionic Hybrid App — Sideload Tool    ║"
  echo "  ║     Laser Cutting Tools Online Store     ║"
  echo "  ╚══════════════════════════════════════════╝"
  echo -e "${RESET}"
}

# ── Config ────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ANDROID_DIR="$PROJECT_ROOT/android"

# ADB / Emulator binaries — WSL2: Android SDK lives in C:\Android\sdk
ADB="/mnt/c/Android/sdk/platform-tools/adb.exe"
EMULATOR="/mnt/c/Android/sdk/emulator/emulator.exe"

APK_DEBUG="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
APK_RELEASE="$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"

# ── Check ADB binary ──────────────────────────
check_adb() {
  step "Checking ADB"

  if [[ ! -x "$ADB" ]]; then
    fail "adb not found or not executable at: $ADB"
    fail "Make sure the Android SDK is installed at C:\\Android\\sdk and WSL2 can access it."
    exit 1
  fi

  pass "ADB binary found: $ADB"
}

# ── Check / start ADB daemon ──────────────────
check_daemon() {
  step "ADB Daemon"

  local state
  state=$("$ADB" get-state 2>&1 || true)

  if echo "$state" | grep -q "device"; then
    pass "ADB daemon is running and a device is already reachable."
  else
    warn "ADB daemon may not be active. Attempting to start it..."
    "$ADB" start-server 2>&1 | while IFS= read -r line; do
      info "  $line"
    done

    # Verify after start attempt
    local state_after
    state_after=$("$ADB" get-state 2>&1 || true)
    if echo "$state_after" | grep -qE "device|daemon"; then
      pass "ADB daemon started successfully."
    else
      # start-server itself might return nothing on success; check devices instead
      info "Daemon start issued. Proceeding to device listing..."
    fi
  fi
}

# ── Launch emulator by AVD name ──────────────
launch_emulator() {
  local avd_name

  echo -ne "${BOLD}  AVD name to launch: ${RESET}"
  read -r avd_name

  if [[ -z "$avd_name" ]]; then
    warn "No AVD name entered. Skipping emulator launch."
    return 1
  fi

  if [[ ! -x "$EMULATOR" ]]; then
    fail "Emulator binary not found at: $EMULATOR"
    return 1
  fi

  info "Launching emulator: $avd_name ..."
  # Start the emulator in the background (Windows process from WSL2)
  "$EMULATOR" -avd "$avd_name" &>/dev/null &
  disown

  echo ""
  warn "The emulator is booting. Wait until it reaches the home screen."
  echo -ne "${BOLD}  Press [Enter] when the emulator is ready... ${RESET}"
  read -r

  return 0
}

# ── List and select device ────────────────────
select_device() {
  step "Connected Devices"

  local device_lines raw_output

  while true; do
    info "Running: adb devices..."
    raw_output=$("$ADB" devices 2>&1)

    # Strip Windows carriage returns (\r) produced by adb.exe, then filter
    # only lines whose second field is exactly "device" (excludes offline/unauthorized)
    device_lines=$(echo "$raw_output" | tr -d '\r' | awk 'NF==2 && $2=="device" {print $1}' || true)

    if [[ -n "$device_lines" ]]; then
      break  # At least one ready device — proceed
    fi

    # ── No devices found ─────────────────────
    warn "No ready devices found."
    echo -e "${YELLOW}── adb devices output ──────────────────────${RESET}"
    echo "$raw_output"
    echo -e "${YELLOW}────────────────────────────────────────────${RESET}"
    echo ""

    local answer
    echo -ne "${BOLD}  Would you like to launch an emulator? [Y/N]: ${RESET}"
    read -r answer

    case "$answer" in
      [Yy]|[Yy][Ee][Ss])
        if ! launch_emulator; then
          fail "Could not launch emulator. Aborting."
          exit 1
        fi
        ;;
      *)
        fail "No devices available. Aborting."
        warn "Make sure the emulator is running or the device has USB debugging enabled and is authorized."
        exit 1
        ;;
    esac
  done

  local device_ids=()
  local i=1

  echo ""
  echo -e "${BOLD}${WHITE}  Available devices:${RESET}"
  echo -e "${WHITE}  ──────────────────────────────────────${RESET}"

  while IFS= read -r dev_id; do
    device_ids+=("$dev_id")
    echo -e "  ${BOLD}${CYAN}[$i]${RESET}  $dev_id"
    (( i++ ))
  done <<< "$device_lines"

  echo -e "${WHITE}  ──────────────────────────────────────${RESET}"
  echo ""

  local total="${#device_ids[@]}"

  # Always prompt the user — even with a single device
  local choice
  while true; do
    echo -ne "${BOLD}  Select device [1-${total}]: ${RESET}"
    read -r choice

    if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= total )); then
      SELECTED_DEVICE="${device_ids[$((choice - 1))]}"
      pass "Selected device: $SELECTED_DEVICE"
      break
    else
      warn "Invalid selection '$choice'. Please enter a number between 1 and ${total}."
    fi
  done
}

# ── Select which APK to install ───────────────
select_apk() {
  step "APK Selection"

  local debug_exists=false
  local release_exists=false

  [[ -f "$APK_DEBUG"   ]] && debug_exists=true
  [[ -f "$APK_RELEASE" ]] && release_exists=true

  if [[ "$debug_exists" == false && "$release_exists" == false ]]; then
    fail "No APK found. Build the project first with compile.sh."
    exit 1
  fi

  if [[ "$debug_exists" == true && "$release_exists" == true ]]; then
    echo ""
    echo -e "${BOLD}${WHITE}  Available APKs:${RESET}"
    echo -e "${WHITE}  ──────────────────────────────────────${RESET}"
    echo -e "  ${BOLD}${CYAN}[1]${RESET}  Debug   — app-debug.apk"
    echo -e "  ${BOLD}${CYAN}[2]${RESET}  Release — app-release-unsigned.apk"
    echo -e "${WHITE}  ──────────────────────────────────────${RESET}"
    echo ""

    local apk_choice
    while true; do
      echo -ne "${BOLD}Select APK [1-2]: ${RESET}"
      read -r apk_choice
      case "$apk_choice" in
        1) SELECTED_APK="$APK_DEBUG";   info "Selected: Debug APK";   break ;;
        2) SELECTED_APK="$APK_RELEASE"; info "Selected: Release APK"; break ;;
        *) warn "Invalid selection. Enter 1 (debug) or 2 (release)." ;;
      esac
    done

  elif [[ "$debug_exists" == true ]]; then
    SELECTED_APK="$APK_DEBUG"
    info "Only Debug APK found. Using: $APK_DEBUG"
  else
    SELECTED_APK="$APK_RELEASE"
    info "Only Release APK found. Using: $APK_RELEASE"
  fi
}

# ── Install APK ───────────────────────────────
install_apk() {
  step "Installing APK"

  info "Target device : $SELECTED_DEVICE"
  info "APK           : $SELECTED_APK"
  echo ""

  local output
  if output=$("$ADB" -s "$SELECTED_DEVICE" install -r "$SELECTED_APK" 2>&1); then
    if echo "$output" | grep -qi "success"; then
      pass "APK installed successfully on $SELECTED_DEVICE"
    else
      # Some ADB versions exit 0 but still print errors
      warn "ADB exited without error, but output may indicate a problem:"
      echo "$output"
    fi
  else
    fail "APK installation failed on $SELECTED_DEVICE"
    echo -e "${RED}── ADB output ────────────────────────────────${RESET}"
    echo "$output"
    echo -e "${RED}──────────────────────────────────────────────${RESET}"
    exit 1
  fi
}

# ── Main ──────────────────────────────────────
SELECTED_DEVICE=""
SELECTED_APK=""

main() {
  banner
  check_adb
  check_daemon
  select_device
  select_apk
  install_apk

  echo ""
  echo -e "${GREEN}${BOLD}══════════════════════════════════════════════${RESET}"
  pass "Sideload pipeline completed successfully!"
  echo -e "${GREEN}${BOLD}══════════════════════════════════════════════${RESET}"
  echo ""
}

main "$@"
