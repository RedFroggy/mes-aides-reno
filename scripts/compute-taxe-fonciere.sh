#!/bin/bash
# Script to compute taxe foncière population data using Deno in Docker
# This avoids having Deno as a npm dependency (saves ~109MB in node_modules)

set -e

echo "Computing taxe foncière population data using Deno..."

docker run --rm \
  -v "$(pwd)":/app \
  -w /app \
  denoland/deno:latest \
  run \
  --allow-read \
  --allow-net \
  --allow-write \
  lib/computeTaxeFoncièrePopulation.ts

echo "✓ Done! Output written to data/exonération-taxe-foncière-population.csv"
