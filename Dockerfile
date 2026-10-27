FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
COPY scripts/setup-c2pa.mjs ./scripts/setup-c2pa.mjs
RUN npm install --global pnpm@10.2.0
COPY apps ./apps
COPY packages ./packages
COPY tsconfig.json ./
RUN pnpm install --frozen-lockfile
ARG APP=day-01-wallet-genesis
RUN pnpm --filter ./apps/agents/${APP} run build
RUN cp -r apps/agents/${APP}/.next/standalone /runtime && mkdir -p /runtime/apps/agents/${APP}/.next && cp -r apps/agents/${APP}/.next/static /runtime/apps/agents/${APP}/.next/static
RUN if [ -d apps/agents/${APP}/public ]; then cp -r apps/agents/${APP}/public /runtime/apps/agents/${APP}/public; fi
FROM node:22-bookworm-slim
ARG APP=day-01-wallet-genesis
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 APP=${APP}
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build --chown=node:node /runtime ./
USER node
EXPOSE 3000
CMD ["sh","-c","node apps/agents/$APP/server.js"]
