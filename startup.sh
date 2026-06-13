#!/bin/sh
set -e

echo "[startup] Running seed..."
node node_modules/.bin/ts-node --project tsconfig.scripts.json --transpile-only scripts/seed.ts

echo "[startup] Starting server..."
exec node server.js
