#!/bin/sh
set -e

echo "[startup] Running seed..."
TS_NODE_PROJECT=tsconfig.scripts.json node node_modules/.bin/ts-node --transpile-only scripts/seed.ts

echo "[startup] Starting server..."
exec node server.js
