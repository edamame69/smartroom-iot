#!/bin/bash
set -e
cd "$(dirname "$0")/backend"
mkdir -p data

if command -v mvn >/dev/null 2>&1; then
  MAVEN=mvn
else
  MAVEN=$(find "$HOME/.m2/wrapper/dists/apache-maven-3.9.9" -path '*/bin/mvn' -type f 2>/dev/null | head -1)
fi
if [ -z "$MAVEN" ]; then
  echo "Cần cài Maven 3.9 hoặc Maven wrapper 3.9.9." >&2
  exit 1
fi

if [ -z "${SERVER_PORT:-}" ]; then
  for port in {8080..8099}; do
    if ! lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      SERVER_PORT="$port"
      break
    fi
  done
fi
if [ -z "${SERVER_PORT:-}" ]; then
  echo "Không tìm được cổng trống từ 8080 đến 8099." >&2
  exit 1
fi

export SERVER_PORT
echo "Mở Smart Room tại http://localhost:$SERVER_PORT"
exec "$MAVEN" spring-boot:run
