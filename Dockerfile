
# Build the React frontend
FROM node:22-bookworm-slim AS frontend

WORKDIR /app

COPY package*.json ./

RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

COPY . .

RUN npm run build


# Run the Laravel application with Apache and PHP
FROM php:8.3-apache

RUN apt-get update && apt-get install -y --no-install-recommends \
    unzip \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
       pdo_mysql \
       mbstring \
       bcmath \
       exif \
       pcntl \
       gd \
       zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

# Copy the compiled React/Vite assets
COPY --from=frontend /app/public/build ./public/build

# Install Laravel dependencies and prepare writable directories
RUN mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    && composer install \
       --no-dev \
       --prefer-dist \
       --no-interaction \
       --optimize-autoloader \
    && chown -R www-data:www-data storage bootstrap/cache

# Point Apache to Laravel's public directory
RUN sed -ri 's!/var/www/html!/var/www/html/public!g' \
    /etc/apache2/sites-available/000-default.conf \
    && printf '<Directory /var/www/html/public>\nAllowOverride All\nRequire all granted\n</Directory>\n' \
       > /etc/apache2/conf-available/laravel.conf \
    && a2enmod rewrite headers \
    && a2enconf laravel

# Render supplies the PORT environment variable
ENV PORT=10000

CMD ["bash", "-lc", "sed -i \"s/Listen 80/Listen ${PORT}/\" /etc/apache2/ports.conf && sed -i \"s/<VirtualHost \\*:80>/<VirtualHost *:${PORT}>/\" /etc/apache2/sites-available/000-default.conf && apache2-foreground"]
