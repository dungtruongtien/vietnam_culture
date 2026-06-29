#!/bin/sh
set -e

echo "[startup] Running seed..."
node node_modules/.bin/tsx scripts/seed.ts

echo "[startup] Starting server..."
exec node server.js
