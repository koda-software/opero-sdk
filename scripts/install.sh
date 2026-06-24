#!/usr/bin/env bash
set -euo pipefail

REPO="${OPERO_RELEASE_REPO:-koda-software/opero-sdk}"
VERSION="${OPERO_VERSION:-latest}"
INSTALL_DIR="${OPERO_INSTALL_DIR:-$HOME/.local/share/opero-cli}"
BIN_DIR="${OPERO_BIN_DIR:-$HOME/.local/bin}"
NO_PATH_WARNING=0

usage() {
  cat <<'EOF'
Install the standalone Opero CLI.

Usage:
  install.sh [--version v0.1.0] [--install-dir DIR] [--bin-dir DIR] [--no-path-warning]

Environment:
  OPERO_RELEASE_REPO   GitHub repo, default koda-software/opero-sdk
  OPERO_VERSION        Release version, default latest
  OPERO_INSTALL_DIR    Install directory, default ~/.local/share/opero-cli
  OPERO_BIN_DIR        Binary directory, default ~/.local/bin
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)
      VERSION="$2"
      shift 2
      ;;
    --install-dir)
      INSTALL_DIR="$2"
      shift 2
      ;;
    --bin-dir)
      BIN_DIR="$2"
      shift 2
      ;;
    --no-path-warning)
      NO_PATH_WARNING=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

need curl
need tar

OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Linux) OS_TARGET="linux" ;;
  Darwin) OS_TARGET="darwin" ;;
  *)
    echo "Unsupported OS: $OS" >&2
    exit 1
    ;;
esac

case "$ARCH" in
  x86_64|amd64) ARCH_TARGET="x64" ;;
  arm64|aarch64) ARCH_TARGET="arm64" ;;
  *)
    echo "Unsupported architecture: $ARCH" >&2
    exit 1
    ;;
esac

TARGET="${OS_TARGET}-${ARCH_TARGET}"
if [[ "$TARGET" == "linux-arm64" ]]; then
  echo "No linux-arm64 artifact is published yet." >&2
  exit 1
fi

API_BASE="https://api.github.com/repos/${REPO}/releases"
if [[ "$VERSION" == "latest" ]]; then
  RELEASE_JSON="$(curl -fsSL "${API_BASE}/latest")"
else
  RELEASE_JSON="$(curl -fsSL "${API_BASE}/tags/${VERSION}")"
fi

TAG="$(printf '%s' "$RELEASE_JSON" | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' | head -n 1)"
if [[ -z "$TAG" ]]; then
  echo "Could not determine release tag for ${REPO} ${VERSION}" >&2
  exit 1
fi

ASSET_NAME="$(printf '%s' "$RELEASE_JSON" \
  | grep -o "opero-v[^\" ]*-${TARGET}\\.tar\\.gz" \
  | head -n 1 || true)"

if [[ -z "$ASSET_NAME" ]]; then
  echo "Could not find ${TARGET} tarball in release ${TAG}" >&2
  exit 1
fi

BASE_URL="https://github.com/${REPO}/releases/download/${TAG}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Downloading ${ASSET_NAME}"
curl -fsSL "${BASE_URL}/${ASSET_NAME}" -o "${TMP_DIR}/${ASSET_NAME}"
curl -fsSL "${BASE_URL}/checksums.txt" -o "${TMP_DIR}/checksums.txt"

EXPECTED="$(awk -v file="$ASSET_NAME" '$2 == file {print $1}' "${TMP_DIR}/checksums.txt")"
if [[ -z "$EXPECTED" ]]; then
  echo "checksums.txt does not contain ${ASSET_NAME}" >&2
  exit 1
fi

if command -v sha256sum >/dev/null 2>&1; then
  ACTUAL="$(sha256sum "${TMP_DIR}/${ASSET_NAME}" | awk '{print $1}')"
elif command -v shasum >/dev/null 2>&1; then
  ACTUAL="$(shasum -a 256 "${TMP_DIR}/${ASSET_NAME}" | awk '{print $1}')"
else
  echo "Missing sha256sum or shasum for checksum verification" >&2
  exit 1
fi

if [[ "$ACTUAL" != "$EXPECTED" ]]; then
  echo "Checksum verification failed for ${ASSET_NAME}" >&2
  exit 1
fi

VERSION_DIR="${INSTALL_DIR}/${TAG}"
rm -rf "$VERSION_DIR"
mkdir -p "$VERSION_DIR" "$BIN_DIR"
tar -xzf "${TMP_DIR}/${ASSET_NAME}" -C "$VERSION_DIR"

OPERO_BIN="${VERSION_DIR}/opero/bin/opero"
if [[ ! -x "$OPERO_BIN" ]]; then
  echo "Installed artifact does not contain executable ${OPERO_BIN}" >&2
  exit 1
fi

ln -sfn "$OPERO_BIN" "${BIN_DIR}/opero"

echo "Installed opero ${TAG}"
echo "Binary: ${BIN_DIR}/opero"

if [[ ":$PATH:" != *":${BIN_DIR}:"* && "$NO_PATH_WARNING" -ne 1 ]]; then
  echo "Warning: ${BIN_DIR} is not on PATH" >&2
fi

"${BIN_DIR}/opero" --version

print_completion_hint() {
  local shell_name
  shell_name="$(basename "${SHELL:-}")"

  case "$shell_name" in
    zsh)
      echo ""
      echo "To enable zsh autocomplete:"
      echo "  opero autocomplete zsh"
      echo "Then run the setup command printed by opero."
      ;;
    bash)
      echo ""
      echo "To enable bash autocomplete:"
      echo "  opero autocomplete bash"
      echo "Then run the setup command printed by opero."
      ;;
    *)
      echo ""
      echo "To enable shell autocomplete, run:"
      echo "  opero autocomplete"
      ;;
  esac
}

print_completion_hint
