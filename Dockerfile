# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Install all dependencies (including devDependencies for build tools like Prisma CLI, TypeScript)
COPY package*.json ./
RUN npm install --ignore-scripts
# RUN npm ci --ignore-scripts # Use npm ci if you have a package-lock.json and want stricter builds

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client (needs devDependencies)
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Compile TypeScript
RUN npm run build # This is "npx prisma generate && tsc"

# Prune development dependencies after build to keep node_modules smaller for the final image
RUN npm prune --production

# Stage 2: Create the production image
FROM node:20-slim AS production

# Set environment to production
ENV NODE_ENV=production
# Set the port (Railway will override this with its own PORT variable if set)
ENV PORT=8080

WORKDIR /app

# Create a non-root user and group for security best practices
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Create the /data directory and set its ownership BEFORE copying other app files
# This is where the SQLite database will live on the persistent volume.
# The user 'appuser' (which will run migrations and the app) needs write access here.
RUN mkdir -p /data && chown appuser:nodejs /data

# Copy built application from builder stage
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package*.json ./

# Copy Prisma schema (optional for runtime, but can be useful)
COPY --from=builder --chown=appuser:nodejs /app/prisma ./prisma

# Copy static assets and templates required at runtime
COPY --from=builder --chown=appuser:nodejs /app/src/templates ./src/templates
COPY --from=builder --chown=appuser:nodejs /app/src/public ./src/public

# Switch to the non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
# This uses the "start" script from your package.json: "node dist/server.js"
CMD ["npm", "start"]
