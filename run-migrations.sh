#!/bin/bash

# Script to run migrations on existing database
# This ensures migrations work properly in production

echo "Running database migrations..."

# Check if the database file exists
if [ -f "/data/money-balancer.sqlite" ]; then
    echo "Database found, checking for pending migrations..."
    
    # Check if group table has timestamp columns
    HAS_CREATED_AT=$(sqlite3 /data/money-balancer.sqlite "PRAGMA table_info('group');" | grep created_at | wc -l)
    
    if [ "$HAS_CREATED_AT" -eq 0 ]; then
        echo "Adding timestamp columns to group table..."
        
        # Get current timestamp
        CURRENT_TIME=$(date +%s)
        
        # Add columns with default values
        sqlite3 /data/money-balancer.sqlite "ALTER TABLE 'group' ADD COLUMN created_at INTEGER NOT NULL DEFAULT $CURRENT_TIME;"
        sqlite3 /data/money-balancer.sqlite "ALTER TABLE 'group' ADD COLUMN updated_at INTEGER NOT NULL DEFAULT $CURRENT_TIME;"
        
        # Mark migration as completed
        sqlite3 /data/money-balancer.sqlite "INSERT INTO seaql_migrations (version, applied_at) VALUES ('m20250909_000001_add_group_timestamps', $CURRENT_TIME);"
        
        echo "Migration completed successfully!"
    else
        echo "Timestamp columns already exist, skipping migration."
    fi
else
    echo "No existing database found, will create new one with migrations."
fi

# Run the application (which will run any remaining migrations)
exec /money-balancer "$@"