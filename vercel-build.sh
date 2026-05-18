#!/bin/bash
set -e

npm install -g pnpm@9.15.0
pnpm install --frozen-lockfile=false

pnpm --filter @wellink/ui build

# prj_cnRjL0MR84wriww1Hxi8kISZbCsw = wellink-influencer
if [ "$VERCEL_PROJECT_ID" = "prj_cnRjL0MR84wriww1Hxi8kISZbCsw" ]; then
  echo "=== Building influencer app ==="
  pnpm --filter wellink-influencer build
  mkdir -p dist
  cp -r apps/influencer/dist/. dist/
else
  echo "=== Building brand app ==="
  pnpm --filter wellink-brand build
  mkdir -p dist
  cp -r apps/brand/dist/. dist/
fi
