# Build from repository root. Pin resulting image digest in the CVM compose file.
FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install --global pnpm@10.2.0
COPY packages ./packages
COPY apps/agents ./apps/agents
RUN pnpm install --prod --frozen-lockfile
COPY services/glass-box-tee ./services/glass-box-tee
USER node
CMD ["node","--experimental-strip-types","services/glass-box-tee/server.mjs"]
