# Build from repository root. Pin resulting image digest in the CVM compose file.
FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY apps/agents ./apps/agents
RUN npm ci --omit=dev
COPY services/glass-box-tee ./services/glass-box-tee
USER node
CMD ["node","--experimental-strip-types","services/glass-box-tee/server.mjs"]
