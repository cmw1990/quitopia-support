#!/bin/bash

# Script to systematically test all routes in the Mission Fresh app
# SSOT8001 compliant

BASE_URL="http://localhost:5001"

# Define all public and protected routes to test
declare -a ROUTES=(
  # Public routes
  "/"
  "/auth"
  
  # Protected routes (require login)
  "/app"
  "/app/dashboard"
  "/app/progress"
  "/app/consumption-logger"
  "/app/nrt-directory"
  "/app/alternative-products"
  "/app/guides"
  "/app/web-tools"
  "/app/community"
  "/app/settings"
  "/app/task-manager"
  "/app/trigger-analysis"
  "/app/challenges"
  "/app/achievements"
  "/app/journal"
  "/app/analytics"
  
  # Health routes
  "/app/health/dashboard"
  "/app/health/mood"
  "/app/health/energy"
  "/app/health/focus"
)

echo "===================================="
echo "Mission Fresh Route Tester"
echo "===================================="
echo ""
echo "This script will open each route in Safari."
echo "For each route, please:"
echo ""
echo "1. Check for console errors (Option+Command+I)"
echo "2. Verify page content loads correctly"
echo "3. Test all interactive elements"
echo "4. Note any visual inconsistencies"
echo ""
echo "Test credentials:"
echo "Username: hertzofhopes@gmail.com"
echo "Password: J4913836j"
echo ""

while true; do
  echo "Available actions:"
  echo "1. Test all routes sequentially"
  echo "2. Test a specific route"
  echo "3. Exit"
  echo ""
  read -p "Select an option (1-3): " choice
  
  case $choice in
    1)
      echo "Testing all routes sequentially..."
      for route in "${ROUTES[@]}"; do
        echo "Opening route: $BASE_URL$route"
        open -a Safari "$BASE_URL$route"
        read -p "Press Enter to continue to the next route..." continue
      done
      ;;
    2)
      echo "Available routes:"
      for i in "${!ROUTES[@]}"; do
        echo "$((i+1)). ${ROUTES[$i]}"
      done
      read -p "Enter the route number: " route_num
      if [[ $route_num -ge 1 && $route_num -le ${#ROUTES[@]} ]]; then
        selected_route=${ROUTES[$((route_num-1))]}
        echo "Opening route: $BASE_URL$selected_route"
        open -a Safari "$BASE_URL$selected_route"
      else
        echo "Invalid selection."
      fi
      ;;
    3)
      echo "Exiting route tester."
      exit 0
      ;;
    *)
      echo "Invalid option. Please try again."
      ;;
  esac
  echo ""
done 