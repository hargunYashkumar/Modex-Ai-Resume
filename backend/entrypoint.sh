#!/bin/sh
# entrypoint.sh — runs DB migrations then starts the Node.js server
# Used in production Docker to auto-migrate on container start

set -e

echo "Modex Backend starting..."
echo "  NODE_ENV: ${NODE_ENV:-development}"
echo "  PORT:     ${PORT:-5000}"

# Wait for PostgreSQL to be ready (up to 30 seconds)
echo "Waiting for database..."
MAX_RETRIES=30
RETRY=0
until node -e "
  const { Pool } = require('pg');
  const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });
  p.query('SELECT 1').then(() => { p.end(); process.exit(0); }).catch(() => { p.end(); process.exit(1); });
" 2>/dev/null; do
  RETRY=$((RETRY+1))
  if [ $RETRY -ge $MAX_RETRIES ]; then
    echo "ERROR: Database not ready after ${MAX_RETRIES}s — exiting"
    exit 1
  fi
  echo "  DB not ready, retrying ($RETRY/$MAX_RETRIES)..."
  sleep 1
done

echo "Database ready — running migrations..."
npm run db:migrate

echo "Starting server..."
exec node src/server.js
