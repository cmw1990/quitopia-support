#!/bin/bash

# This script switches from the old src directory structure to the new restructured one
# It creates a backup of the original src directory and replaces it with src-restructured

set -e  # Exit immediately if a command exits with a non-zero status

cd "$(dirname "$0")/.."
echo "Working in directory: $(pwd)"

# Check if src and src-restructured exist
if [ ! -d "src" ]; then
  echo "Error: src directory does not exist!"
  exit 1
fi

if [ ! -d "src-restructured" ]; then
  echo "Error: src-restructured directory does not exist!"
  exit 1
fi

# Check if src-old already exists
if [ -d "src-old" ]; then
  echo "Warning: src-old directory already exists."
  read -p "Do you want to remove it and continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
  fi
  
  echo "Removing src-old directory..."
  rm -rf src-old
fi

echo "Creating a timestamp for the old structure..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="src-old-$TIMESTAMP"

echo "Moving original src to $BACKUP_DIR as an additional backup..."
mv src "$BACKUP_DIR"

echo "Moving src-restructured to src..."
mv src-restructured src

echo "Success! The codebase is now using the new directory structure."
echo "The original source code has been backed up to $BACKUP_DIR."
echo ""
echo "To revert back to the original structure if needed, run:"
echo "  mv src src-restructured && mv $BACKUP_DIR src"
echo ""
echo "It's recommended to run the application and verify everything works correctly."
echo "You may also want to update any build scripts or documentation to reflect the new structure." 