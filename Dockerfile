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
FROM node:20-slim AS builder
WORKDIR /app

# Install OpenSSL required by Prisma (primarily for 'prisma generate')
RUN apt-get update -y && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the TypeScript project (which includes 'npx prisma generate')
RUN npm run build

# Stage 2: Run
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production

# Install OpenSSL if required by Prisma Runtime (Query Engine)
# Note: libssl-dev is usually not needed for runtime.
RUN apt-get update -y && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy built assets and necessary files from the builder stage
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=appuser:nodejs /app/src/templates ./src/templates
COPY --from=builder --chown=appuser:nodejs /app/src/public ./src/public

# Copy Prisma schema and migration files from the builder stage.
# These are needed for 'prisma migrate deploy'.
COPY --from=builder --chown=appuser:nodejs /app/prisma ./prisma/

# Define DATABASE_URL for Prisma migrate deploy during build time.
# This should point to the location of your SQLite file within the container.
ARG DATABASE_URL_BUILDTIME="file:./prisma/toolchest.db"
ENV DATABASE_URL=${DATABASE_URL_BUILDTIME}

# Apply database migrations. This is crucial for deployment.
# This runs as root before switching to appuser.
RUN npx prisma migrate deploy

USER appuser

EXPOSE 8080

CMD ["node", "dist/server.js"]