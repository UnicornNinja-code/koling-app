#!/usr/bin/env bash
cd "$(dirname "$0")/bun_svelte" || exit 1
bun dev.ts
