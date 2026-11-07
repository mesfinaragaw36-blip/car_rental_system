#!/bin/sh
set -e

# Render assigns a dynamic port via the PORT environment variable (default 10000).
# ServerSideUp's NGINX image listens on NGINX_HTTP_PORT (default 8080).
# If PORT is provided, forward it so NGINX binds to Render's expected port.
if [ -n "$PORT" ]; then
    export NGINX_HTTP_PORT="$PORT"
fi

exec docker-php-serversideup-entrypoint "$@"

