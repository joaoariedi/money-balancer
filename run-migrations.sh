#!/bin/sh
set -e  # Exit on any error

# Script to run migrations on existing database
# This ensures migrations work properly in production

echo "Starting Money Balancer with database migrations..."

# Set default database URL if not provided
export DATABASE_URL="${DATABASE_URL:-sqlite:/data/money-balancer.sqlite?mode=rwc}"

# Extract database path from URL (for SQLite only)
DB_PATH="/data/money-balancer.sqlite"

# Ensure the data directory exists
mkdir -p /data

echo "Database path: $DB_PATH"
echo "Database URL: $DATABASE_URL"

# Check if this is a SQLite database and if the file exists
if [[ "$DATABASE_URL" == sqlite:* ]]; then
    if [ -f "$DB_PATH" ]; then
        echo "Existing SQLite database found at $DB_PATH"
        
        # Check database integrity
        echo "Checking database integrity..."
        sqlite3 "$DB_PATH" "PRAGMA integrity_check;" > /dev/null || {
            echo "Database integrity check failed! Please check your database file."
            exit 1
        }
        
        echo "Database integrity check passed."
    else
        echo "No existing database found. New database will be created with migrations."
    fi
else
    echo "Non-SQLite database detected. Skipping file-based checks."
fi

echo "Starting application with automatic SeaORM migrations..."

# Run the application (which will run SeaORM migrations automatically)
exec /money-balancer "$@"