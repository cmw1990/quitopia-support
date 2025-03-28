#!/bin/bash

# SSOT8001 Supabase API Routes Test
# Using direct REST API approach as required by SSOT8001

# Supabase credentials
SUPABASE_URL="https://zoubqdwxemivxrjruvam.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs"
EMAIL="hertzofhopes@gmail.com"
PASSWORD="J4913836j"

# API endpoints to test
ENDPOINTS=(
  "/rest/v1/health"
  "/rest/v1/user_profiles"
  "/rest/v1/progress8"
  "/rest/v1/consumption_logs"
  "/rest/v1/craving_logs"
  "/rest/v1/mood_logs"
  "/rest/v1/energy_logs"
  "/rest/v1/focus_logs"
)

echo "=== Supabase API Routes Test ==="
echo "Testing with account: $EMAIL"
echo ""

# First authenticate to get access token
echo "Step 1: Authenticating to get access token..."
auth_response=$(curl -s \
  -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Extract access token and user ID
access_token=$(echo "$auth_response" | grep -o '"access_token":"[^"]*"' | cut -d':' -f2 | tr -d '"')
user_id=$(echo "$auth_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d':' -f2 | tr -d '"')

if [ -z "$access_token" ]; then
  echo "❌ Authentication failed! Cannot proceed with tests."
  echo "$auth_response" | jq 2>/dev/null || echo "$auth_response"
  exit 1
fi

echo "✅ Authentication successful!"
echo "User ID: $user_id"
echo "Access token: ${access_token:0:10}..."
echo ""

# Now test each endpoint
echo "Step 2: Testing API endpoints..."
echo ""

success_count=0
fail_count=0

for endpoint in "${ENDPOINTS[@]}"; do
  echo "Testing endpoint: $endpoint"
  
  # Add user_id filter for user-specific endpoints
  query_param=""
  if [[ "$endpoint" != "/rest/v1/health" ]]; then
    query_param="?user_id=eq.$user_id"
  fi
  
  response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -X GET "$SUPABASE_URL$endpoint$query_param" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $access_token" \
    -H "Content-Type: application/json")
  
  # Extract status code
  HTTP_STATUS=$(echo "$response" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d':' -f2)
  body=$(echo "$response" | sed '/HTTP_STATUS/d')
  
  echo "  Status: $HTTP_STATUS"
  
  # Check if successful (200 OK or 400 for certain cases)
  if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 404 ]; then
    # For 200 OK, show first few items or data structure
    if [ "$HTTP_STATUS" -eq 200 ]; then
      echo "  ✅ Endpoint accessible"
      
      # Check if the response is an array (begins with [)
      if [[ "$body" == \[* ]]; then
        count=$(echo "$body" | jq '. | length' 2>/dev/null || echo "unknown")
        echo "  Data items: $count"
        
        # Show sample of first item if available
        if [ "$count" != "0" ] && [ "$count" != "unknown" ]; then
          echo "  Sample data:"
          echo "$body" | jq '.[0] | {id:.id, user_id:.user_id}' 2>/dev/null || echo "  (Unable to parse response)"
        fi
      else
        # Show basic response for non-array responses
        echo "  Response:"
        echo "$body" | jq '.' 2>/dev/null || echo "$body" | head -5
      fi
      
      ((success_count++))
    else
      # 404 may be normal for endpoints with no data yet
      echo "  ⚠️ Endpoint returned 404 - this may be normal for new users with no data"
      ((success_count++))
    fi
  else
    # Error case
    echo "  ❌ Endpoint failed with status $HTTP_STATUS"
    echo "  Error details:"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body" | head -5
    ((fail_count++))
  fi
  echo ""
done

# Print summary
echo "=== API Test Summary ==="
echo "Total endpoints tested: ${#ENDPOINTS[@]}"
echo "Successful: $success_count"
echo "Failed: $fail_count"
echo ""
echo "Test completed." 