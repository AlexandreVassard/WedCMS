FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# --- Development stage ---
FROM base AS dev
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/core/package.json ./apps/core/
RUN pnpm install --frozen-lockfile
COPY apps/core/ ./apps/core/
WORKDIR /app/apps/core
CMD ["pnpm", "run", "start:dev"]

# --- Build stage ---
FROM dev AS build
RUN pnpm run build

# --- Production stage ---
FROM base AS prod
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/core/package.json ./apps/core/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/apps/core/dist ./apps/core/dist
COPY apps/core/views ./apps/core/views
COPY apps/core/public ./apps/core/public
WORKDIR /app/apps/core
EXPOSE 3000
CMD ["node", "dist/main"]
