FROM node:20-slim AS base
# Install OpenSSL in the base stage so it's available for both builder and runner
# if they are both FROM base.
# Or, install it specifically in builder and runner if base is too generic.
# For node:20-slim, OpenSSL is usually present, but Prisma might be specific about the version.
# Let's add it to the 'base' to be safe and cover both,
# or you can add it to 'builder' and 'runner' separately if 'base' is used for other things.

# It's generally better to install dependencies in the most specific stage needed.
# Since node:20-slim *should* have a compatible OpenSSL,
# let's first try installing it ONLY in the builder stage where `prisma generate` runs.
# If runtime issues persist, we'll add it to the runner stage too.

# Stage 1: Build
FROM node:20-slim AS builder # Changed from 'base' to 'node:20-slim' for clarity, or keep 'FROM base' if 'base' itself is node:20-slim
WORKDIR /app

# Install OpenSSL required by Prisma
RUN apt-get update -y && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the TypeScript project (which now includes prisma generate)
RUN npm run build

# Stage 2: Run
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production

# Install OpenSSL required by Prisma Runtime (Query Engine)
# This ensures the runtime also has the necessary SSL libraries.
RUN apt-get update -y && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy built assets and necessary files from the builder stage
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json

# Copy Prisma schema. It's needed for Prisma Client to find the schema at runtime
# if your schema location is default or referenced by environment variable.
# Also copy the query engine if not already in node_modules.
COPY --from=builder --chown=appuser:nodejs /app/prisma ./prisma/

# Ensure the generated Prisma Client query engine binaries are executable by the appuser
# The Prisma client might place query engines in node_modules/.prisma/client or node_modules/@prisma/client/runtime
# We also need to ensure the schema is available for the runtime if not embedded.
# If `prisma generate` in the builder stage correctly places the engines in node_modules,
# the COPY --from=builder /app/node_modules ./node_modules should bring them.

USER appuser

EXPOSE 8080

# Set PORT environment variable, Railway might override this
ENV PORT 8080

CMD ["node", "dist/server.js"]