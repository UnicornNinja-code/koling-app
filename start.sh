#!/usr/bin/env bash
cd "$(dirname "$0")/mova_app/multi-tenant" || exit 1
bun dev.ts
