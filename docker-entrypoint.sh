#!/bin/sh
# ============================================
# docker-entrypoint.sh — Runs when container starts
# ============================================
# This script runs BEFORE the app starts. It:
#   1. Pushes the Prisma schema to the database
#      (creates/updates tables if needed)
#   2. Starts the Next.js production server
#
# Why a script instead of just starting the app?
# Because the database might be empty (first run),
# so we need to create the tables first.
# ============================================

echo "🔄 Running Prisma db push (syncing database schema)..."
npx prisma db push --skip-generate
echo "✅ Database schema synced!"

echo "🚀 Starting Next.js server..."
exec node server.js
# "exec" replaces this shell process with the node process.
# This is important so Docker can send signals (like stop)
# directly to Node.js instead of to this shell script.
