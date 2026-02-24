FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# --- Development stage ---
FROM base AS dev
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
CMD ["pnpm", "run", "start:dev"]

# --- Build stage ---
FROM dev AS build
RUN pnpm run build

# --- Production stage ---
FROM base AS prod
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
COPY views ./views
COPY public ./public
EXPOSE 3000
CMD ["node", "dist/main"]
