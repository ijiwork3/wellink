#!/bin/bash
set -e

npm install -g pnpm@9.15.0
pnpm install --frozen-lockfile=false

pnpm --filter @wellink/ui build

# ── 프로젝트 ID 분기 ──
# prj_cnRjL0MR84wriww1Hxi8kISZbCsw = wellink-influencer
# prj_wFikuhetaZ15z0pt8dAOzPknzgOb = wellink-landing
# 그 외 (prj_C463kzYEChTKORBFxvLdAIeuNHnn) = wellink-brand

if [ "$VERCEL_PROJECT_ID" = "prj_cnRjL0MR84wriww1Hxi8kISZbCsw" ]; then
  echo "=== Building influencer app ==="
  pnpm --filter wellink-influencer build
  mkdir -p dist
  cp -r apps/influencer/dist/. dist/

elif [ "$VERCEL_PROJECT_ID" = "prj_wFikuhetaZ15z0pt8dAOzPknzgOb" ]; then
  echo "=== Building landing page (v5 export) ==="
  cd apps/landing
  npm install
  npm run build
  cd ../..
  mkdir -p dist
  cp -r apps/landing/dist/. dist/

else
  echo "=== Building brand app ==="
  pnpm --filter wellink-brand build
  mkdir -p dist
  cp -r apps/brand/dist/. dist/
fi
