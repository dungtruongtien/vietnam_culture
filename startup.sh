#!/bin/sh
set -e

echo "[startup] Running seed..."
node node_modules/.bin/ts-node-script --project tsconfig.scripts.json scripts/seed.ts

echo "[startup] Starting server..."
exec node server.js
