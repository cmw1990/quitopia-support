#!/bin/bash

# SSOT8001 Migration Runner Script
# This script runs the SSOT8001-compliant migrations

# Set the script to exit immediately if any command fails
set -e

# Display banner
echo "=========================================="
echo "    SSOT8001 Migration Runner Script"
echo "=========================================="
echo ""

# Define paths
PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
MIGRATION_SCRIPT="$PROJECT_ROOT/scripts/ssot8001-apply-migrations.js"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js before running this script."
    exit 1
fi

# Display script info
echo "🔍 Project root: $PROJECT_ROOT"
echo "🔍 Migration script: $MIGRATION_SCRIPT"
echo ""

# Check if migration script exists
if [ ! -f "$MIGRATION_SCRIPT" ]; then
    echo "❌ Error: Migration script not found at: $MIGRATION_SCRIPT"
    exit 1
fi

# Run migration script
echo "🚀 Running SSOT8001 migrations..."
echo ""

cd "$PROJECT_ROOT"
node "$MIGRATION_SCRIPT"

echo ""
echo "✅ SSOT8001 migration script executed."
echo ""
echo "Note: Check the output above for any migration errors or successes."
echo "==========================================" 