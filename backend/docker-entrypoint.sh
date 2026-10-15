#!/bin/sh
set -e

# Ensure uploads directories exist inside the persistent volume
mkdir -p /app/uploads/products /app/uploads/icons

# Seed sample images if not present
if [ -d "/app/assets/samples" ]; then
  cp -n /app/assets/samples/* /app/uploads/products/ 2>/dev/null || true
fi

# Ensure correct permissions for the non-root node user (UID 1000)
chown -R node:node /app/uploads || true
chmod -R 775 /app/uploads || true

# Execute command as node user if running as root
if [ "$(id -u)" = '0' ]; then
  exec su-exec node dumb-init -- "$@"
else
  exec dumb-init -- "$@"
fi
