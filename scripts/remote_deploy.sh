#!/usr/bin/env bash
# Usage: ./remote_deploy.sh <user@host> <remote_wp_path> [plugin-zip-path]
# Example: ./remote_deploy.sh ubuntu@1.2.3.4 /var/www/html/wordpress ./wordpress-plugin/siport-plugin.zip

set -euo pipefail
SSH_TARGET="$1"
WP_PATH="$2"
ZIP_PATH="${3:-./wordpress-plugin/siport-plugin.zip}"

if [ ! -f "$ZIP_PATH" ]; then
  echo "Plugin zip not found at $ZIP_PATH"
  exit 1
fi

echo "Copying $ZIP_PATH to $SSH_TARGET:/tmp/"
scp "$ZIP_PATH" "$SSH_TARGET:/tmp/"

echo "Connecting to $SSH_TARGET and deploying..."
ssh "$SSH_TARGET" bash -s <<EOF
set -euo pipefail
TMP_ZIP=/tmp/$(basename "$ZIP_PATH")
WP_ROOT="$WP_PATH"

if [ ! -d "${WP_ROOT}" ]; then
  echo "WordPress path $WP_ROOT not found on remote"
  exit 2
fi

# Unzip plugin into plugins folder
unzip -o "${TMP_ZIP}" -d "${WP_ROOT}/wp-content/plugins/"

# Ensure correct permissions
chown -R www-data:www-data "${WP_ROOT}/wp-content/plugins/"
find "${WP_ROOT}/wp-content/plugins/" -type d -exec chmod 755 {} +
find "${WP_ROOT}/wp-content/plugins/" -type f -exec chmod 644 {} +

# Try to activate with wp-cli if available
if command -v wp >/dev/null 2>&1; then
  echo "Activating plugin via WP-CLI"
  # Attempt to find plugin folder name (assumes zip contains single top-level dir)
  PLUGIN_DIR_NAME=$(unzip -Z1 "${TMP_ZIP}" | sed -e 's@/.*@@' | uniq | head -n1)
  if [ -n "$PLUGIN_DIR_NAME" ]; then
    wp plugin activate "$PLUGIN_DIR_NAME" --path="$WP_ROOT" || echo "WP-CLI activation failed"
  else
    echo "Could not determine plugin folder name for activation"
  fi
else
  echo "wp-cli not found on remote; activate plugin from WP admin"
fi
EOF

echo "Deployment finished."
