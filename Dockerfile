# ---- build stage ----
FROM node:22-alpine AS build

WORKDIR /app

# pnpm via corepack
RUN corepack enable

# install deps first (better cache)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# copy source and build
COPY . .
RUN pnpm build


# ---- runtime stage ----
FROM nginx:1.27-alpine

# Optional but recommended: custom nginx config for SPA-style routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# basic container healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1