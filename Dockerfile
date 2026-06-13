# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: builder ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Stage 3: runner ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_PATH=/data/database.db
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Next.js standalone build
COPY --from=builder /app/public           ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static

# Seed dependencies: migrations, data JSON, seed script, ts-node runtime
COPY --from=builder /app/migrations          ./migrations
COPY --from=builder /app/data                ./data
COPY --from=builder /app/scripts             ./scripts
COPY --from=builder /app/tsconfig.scripts.json ./tsconfig.scripts.json
COPY --from=builder /app/node_modules        ./node_modules
COPY --from=builder /app/package.json        ./package.json

# Startup script: seed → start server
COPY --from=builder /app/startup.sh ./startup.sh
RUN chmod +x startup.sh \
 && chown -R nextjs:nodejs /app

VOLUME ["/data"]

USER nextjs
EXPOSE 3000

CMD ["./startup.sh"]
