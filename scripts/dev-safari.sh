#!/bin/bash

# Make the script directory if it doesn't exist
mkdir -p $(dirname "$0")

# Script to run the development server and open Safari
PORT=5001
BASE_URL="http://localhost:$PORT"

# Check if port is already in use and kill the process if necessary
echo "Checking if port $PORT is in use..."
PID=$(lsof -ti:$PORT)
if [ ! -z "$PID" ]; then
  echo "Port $PORT is in use by process $PID. Terminating process..."
  kill -9 $PID
  sleep 1
fi

# Make scripts executable
chmod +x "$(dirname "$0")/open-safari-dev.sh"
chmod +x "$(dirname "$0")/check-safari-errors.sh"

# Start the development server in the background
echo "Starting development server on port $PORT..."
npm run dev &
DEV_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
for i in {1..30}; do
  if curl -s "http://localhost:$PORT" > /dev/null; then
    echo "Server started successfully!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "Timeout waiting for server to start"
    kill $DEV_PID
    exit 1
  fi
  sleep 1
  echo -n "."
done

# Open Safari with the application
echo "Opening Safari with the application..."
"$(dirname "$0")/open-safari-dev.sh" "$BASE_URL"

# Inform about the check-safari-errors script
echo ""
echo "To check for console errors, run:"
echo "./scripts/check-safari-errors.sh"
echo ""
echo "Development server is running with PID: $DEV_PID"
echo "Press Ctrl+C to stop the server"

# Wait for the development server to complete
wait $DEV_PID 