FROM serversideup/php:8.4-fpm-nginx

USER root

# Node (needed to build the Vite/React frontend) + PHP gd extension (dompdf)
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
 && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
 && apt-get install -y --no-install-recommends nodejs \
 && rm -rf /var/lib/apt/lists/* \
 && install-php-extensions gd

WORKDIR /var/www/html
COPY --chown=www-data:www-data . .

USER www-data

# PHP deps first (Wayfinder needs PHP + vendor present during the Vite build)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts \
 && composer dump-autoload --optimize

# Frontend build
RUN npm install --no-audit --no-fund \
 && npm run build \
 && rm -rf node_modules

# Runs migrations + storage:link on container start
ENV AUTORUN_ENABLED=true \
    PHP_OPCACHE_ENABLE=1