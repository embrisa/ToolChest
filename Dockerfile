FROM node:20-slim AS base

# Stage 1: Build
FROM base AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Stage 2: Run
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy built assets and necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy Prisma schema and migration files if they exist in the context of the Docker build
# Ensure your .dockerignore is not excluding these if they are at the root
COPY prisma ./prisma/

USER appuser

EXPOSE 8080

# Set PORT environment variable, Railway might override this
ENV PORT 8080

CMD ["node", "dist/server.js"]