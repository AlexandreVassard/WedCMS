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

# --- Housekeeping development stage ---
FROM base AS housekeeping-dev
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/housekeeping/package.json ./apps/housekeeping/
RUN pnpm install --frozen-lockfile
COPY apps/housekeeping/ ./apps/housekeeping/
WORKDIR /app/apps/housekeeping
CMD ["pnpm", "run", "dev"]

# --- Housekeeping build stage ---
FROM base AS housekeeping-build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/housekeeping/package.json ./apps/housekeeping/
RUN pnpm install --frozen-lockfile
COPY apps/housekeeping/ ./apps/housekeeping/
WORKDIR /app/apps/housekeeping
RUN pnpm run build

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
COPY apps/core/texts ./apps/core/texts
COPY --from=housekeeping-build /app/apps/housekeeping/dist ./apps/core/public/housekeeping
WORKDIR /app/apps/core
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main"]
