# syntax=docker/dockerfile:1.7
# Canonical SPA → nginx (unprivileged, foreground, health on :8080).
#
# Build: SPA is a named context so this directory stays the default context
# (nginx conf lives next to this Dockerfile).
#
#   docker build -f platform/spa-nginx/Dockerfile \
#     --build-context spa=apps/console \
#     -t home-cloud-console:local \
#     platform/spa-nginx
#
# Expected `spa` layout (Vue 3 + Vite, same shape as apps/console):
#   package.json, package-lock.json, index.html, *.config.js, public/, src/

FROM node:22-alpine AS build
WORKDIR /src

COPY --from=spa package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY --from=spa index.html ./
COPY --from=spa *.config.js ./
COPY --from=spa public ./public
COPY --from=spa src ./src

ENV NODE_ENV=production
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

USER root
RUN apk add --no-cache wget \
    && rm -rf /var/cache/apk/*

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /src/dist /usr/share/nginx/html

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/health || exit 1

STOPSIGNAL SIGQUIT
CMD ["nginx", "-g", "daemon off;"]
