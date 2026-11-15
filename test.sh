#!/bin/sh
# Runs every test in Docker, so you don't need Node.js or Python installed: sh test.sh  (BENCH=1 also prints speeds)
# Node.js 24 runs the examples; Node.js 26 adds the Uint8Array.fromBase64 columns; Python 3.14 brings GNU coreutils.
set -e
cd "$(dirname "$0")"
DIR="$(pwd -W 2>/dev/null || pwd)" # Git Bash on Windows needs the Windows path
export MSYS_NO_PATHCONV=1
for node in 24 26; do
  echo "== Node.js $node"
  docker run --rm -e BENCH -v "$DIR:/w:ro" -w /w "node:$node-alpine" node tests/test.mjs
done
echo "== Python 3.14 and GNU coreutils"
docker run --rm -e BENCH -v "$DIR:/w:ro" -w /w python:3.14-slim python tests/test.py
