#!/bin/bash
cd ~/.openclaw/workspace/websites/alcatelz-app

# Gjenopprett uploads
rm -rf .next/standalone/.next/static/uploads
mkdir -p .next/standalone/.next/static/uploads
cp -r /mnt/storage/uploads/* .next/standalone/.next/static/uploads/ 2>/dev/null

# Start server
PORT=8482 npm start
