# Build from repository root; run alongside Ollama on leased Akash GPU capacity.
FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
COPY scripts/setup-c2pa.mjs ./scripts/setup-c2pa.mjs
COPY packages ./packages
COPY apps ./apps
COPY services/gpu-provider ./services/gpu-provider
RUN npm install --global pnpm@10.2.0 && pnpm install --prod --frozen-lockfile
RUN mkdir -p /app/.outputs && chown node:node /app/.outputs
USER node
EXPOSE 8080
CMD ["node","services/gpu-provider/server.mjs"]
