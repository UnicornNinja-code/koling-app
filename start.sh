#!/usr/bin/env bash
cd "$(dirname "$0")/apps/multi-tenant" || exit 1
bun dev.ts
