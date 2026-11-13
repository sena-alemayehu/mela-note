# ==============================================================================
# Mela Note Backend - Multi-stage Production Dockerfile
# ==============================================================================

FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native compilation if required
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache curl

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated

RUN mkdir -p uploads/attachments && chown -R node:node /app

USER node

EXPOSE 3001

CMD ["node", "dist/main"]
