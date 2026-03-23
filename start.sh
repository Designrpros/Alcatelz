#!/bin/bash
# Copy uploads to standalone build
cp -r /mnt/storage/uploads/* .next/standalone/.next/static/uploads/ 2>/dev/null
PORT=8482 npm start
