#!/bin/sh
set -e

echo "======================================"
echo "FND SaaS QuickLaunch - Docker Entrypoint"
echo "======================================"

# ========================================
# Environment Validation
# ========================================
echo "Validating required environment variables..."

# Database
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is required"
  exit 1
fi
echo "✓ DATABASE_URL configured"

# Redis
if [ -z "$REDIS_URL" ]; then
  echo "ERROR: REDIS_URL is required"
  exit 1
fi
echo "✓ REDIS_URL configured"

# Encryption
if [ -z "$ENCRYPTION_KEY" ]; then
  echo "ERROR: ENCRYPTION_KEY is required"
  exit 1
fi
echo "✓ ENCRYPTION_KEY configured"

echo ""
echo "======================================"
echo "Mode: ${NODE_MODE:-hybrid}"
echo "======================================"

# ========================================
# Database Migrations
# ========================================
echo ""
echo "Checking database migrations..."

# Wait for database to be ready
until pg_isready -h $(echo $DATABASE_URL | sed -e 's/.*@\(.*\):.*/\1/') -U $(echo $DATABASE_URL | sed -e 's/.*:\/\/\(.*\):.*/\1/') > /dev/null 2>&1; do
  echo "Waiting for database to be ready..."
  sleep 2
done

echo "✓ Database is ready"

# Run migrations
echo "Running database migrations..."
cd libs/database && npm run migrate:latest
echo "✓ Migrations completed"

# ========================================
# Start Application
# ========================================
echo ""
echo "======================================"
echo "Starting application..."
echo "======================================"

# Execute the command passed to the container
exec "$@"
