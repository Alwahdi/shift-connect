#!/bin/sh
set -e

# Replace runtime placeholders in built JS/CSS assets so the image can be
# deployed against any self-hosted Supabase instance without rebuilding.
#
# Required environment variables:
#   VITE_SUPABASE_URL            – Public URL of the Supabase Kong gateway
#   VITE_SUPABASE_PUBLISHABLE_KEY – Supabase anon/publishable JWT

PLACEHOLDER_URL="__SUPABASE_URL_PLACEHOLDER__"
PLACEHOLDER_KEY="__SUPABASE_KEY_PLACEHOLDER__"

if [ -z "$VITE_SUPABASE_URL" ]; then
  echo "ERROR: VITE_SUPABASE_URL is not set" >&2
  exit 1
fi

if [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then
  echo "ERROR: VITE_SUPABASE_PUBLISHABLE_KEY is not set" >&2
  exit 1
fi

echo "Injecting runtime config..."
echo "  SUPABASE_URL -> ${VITE_SUPABASE_URL}"

# Operate on all JS assets in place
find /usr/share/nginx/html/assets -type f -name "*.js" | while read -r file; do
  sed -i \
    -e "s|${PLACEHOLDER_URL}|${VITE_SUPABASE_URL}|g" \
    -e "s|${PLACEHOLDER_KEY}|${VITE_SUPABASE_PUBLISHABLE_KEY}|g" \
    "$file"
done

echo "Runtime config injected. Starting nginx..."
exec nginx -g "daemon off;"
