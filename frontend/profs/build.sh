#!/usr/bin/env bash
# Build command pour Cloudflare Pages - Ulamayi (frontend profs)
# A configurer dans Cloudflare Pages :
#   Build command           : ./build.sh
#   Build output directory  : dist
#   Environment variables   : NODE_VERSION=20  VITE_API_BASE_URL = https://api.ulamayi.online/api
set -e

echo ">>> Build Vite (sortie : dist/)"
npm run build

echo ">>> Build termine."
