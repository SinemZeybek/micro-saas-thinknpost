# ============================================
# Dockerfile — The "recipe" for your app image
# ============================================
# Think of this like a step-by-step instruction manual.
# Docker reads this file top-to-bottom and builds a
# "container image" — a snapshot of your app with
# everything it needs to run (Node.js, dependencies, code).
#
# We use a "multi-stage build" here. That means we have
# separate stages (like prep stations in a kitchen):
#   1. deps    → install npm packages
#   2. builder → build the Next.js app
#   3. runner  → the final slim image that actually runs
#
# This keeps the final image small because it only includes
# what's needed to RUN the app, not what's needed to BUILD it.
# ============================================


# ── Stage 1: Install dependencies ──────────
# "FROM" tells Docker what base image to start with.
# node:20-alpine is a tiny Linux + Node.js 20 image.
# "alpine" = minimal Linux (~5MB vs ~900MB for full Ubuntu).
FROM node:20-alpine AS deps

# Set the working directory inside the container.
# All following commands run from /app.
WORKDIR /app

# Copy ONLY package files first. Why? Docker caches each step.
# If package.json didn't change, Docker skips npm install
# (which is slow). This is called "layer caching."
COPY package.json package-lock.json ./

# Copy prisma schema too — needed for "prisma generate" in postinstall
COPY prisma ./prisma

# Install ALL dependencies (including devDependencies for building)
RUN npm ci
# "npm ci" is like "npm install" but:
#   - Uses exact versions from package-lock.json
#   - Faster & more reliable for CI/Docker builds
#   - Deletes node_modules first for a clean install


# ── Stage 2: Build the app ─────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Now copy ALL source code
COPY . .

# Set environment to production for optimized build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js app.
# This creates the .next/ folder with optimized production files.
# We need DATABASE_URL at build time for Prisma, but we use a
# dummy value — the real DB connection happens at runtime.
# Use the docker-specific build script:
# - "build:docker" runs prisma generate + next build
# - We DON'T run "prisma db push" here because there's no
#   database available during the build phase.
#   Database sync happens at container startup (entrypoint).
RUN npm run build:docker


# ── Stage 3: Production runner ─────────────
# Start fresh with a clean, tiny image
FROM node:20-alpine AS runner

WORKDIR /app

# Don't run the app as root (security best practice).
# Create a non-root user called "nextjs".
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only what we need to run (not source code, not devDependencies):

# 1. Public assets (favicon, images, etc.)
COPY --from=builder /app/public ./public

# 2. Next.js standalone output + static files
#    Next.js "standalone" mode creates a minimal server
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 3. Prisma client (needed at runtime for database queries)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 4. Prisma schema + migration files (needed for db push at startup)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# 5. Startup script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Switch to the non-root user
USER nextjs

# Tell Docker this container listens on port 3000
EXPOSE 3000

# The PORT env var tells Next.js which port to use
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ENTRYPOINT runs when the container starts.
# We use a script that runs prisma db push, then starts the app.
ENTRYPOINT ["./docker-entrypoint.sh"]
