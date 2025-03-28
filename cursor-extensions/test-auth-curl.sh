#!/bin/bash

# SSOT8001 Supabase Authentication Test
# Using direct REST API approach as required by SSOT8001

# Supabase credentials
SUPABASE_URL="https://zoubqdwxemivxrjruvam.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs"
EMAIL="hertzofhopes@gmail.com"
PASSWORD="J4913836j"

echo "=== Supabase Authentication Test ==="
echo "Testing with account: $EMAIL"
echo "API URL: $SUPABASE_URL/auth/v1/token?grant_type=password"
echo ""

# Test authentication endpoint
echo "Attempting direct API login..."
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Extract status code
HTTP_STATUS=$(echo "$response" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

echo "Response status: $HTTP_STATUS"
echo ""
echo "Response body:"
echo "$body" | jq 2>/dev/null || echo "$body"

# Check if successful
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo ""
  echo "✅ Authentication successful!"
  
  # Extract user ID and other details if available
  user_id=$(echo "$body" | jq -r '.user.id' 2>/dev/null)
  if [ ! -z "$user_id" ] && [ "$user_id" != "null" ]; then
    echo "User ID: $user_id"
  fi
  
  # Extract token
  token=$(echo "$body" | jq -r '.access_token' 2>/dev/null)
  if [ ! -z "$token" ] && [ "$token" != "null" ]; then
    token_preview="${token:0:10}..."
    echo "Access token received: $token_preview"
  fi
  
  # Test a protected endpoint using the token
  echo ""
  echo "Testing protected endpoint with token..."
  user_response=$(curl -s \
    -X GET "$SUPABASE_URL/rest/v1/user_profiles?user_id=eq.$user_id" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json")
  
  echo "User profile data:"
  echo "$user_response" | jq 2>/dev/null || echo "$user_response"
else
  echo ""
  echo "❌ Authentication failed"
  
  # Extract error message if available
  error=$(echo "$body" | jq -r '.error' 2>/dev/null)
  if [ ! -z "$error" ] && [ "$error" != "null" ]; then
    echo "Error: $error"
  fi
  
  error_description=$(echo "$body" | jq -r '.error_description' 2>/dev/null)
  if [ ! -z "$error_description" ] && [ "$error_description" != "null" ]; then
    echo "Description: $error_description"
  fi
  
  # Test the general health endpoint to verify basic connectivity
  echo ""
  echo "Testing public endpoint..."
  health_response=$(curl -s \
    -X GET "$SUPABASE_URL/rest/v1/health" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json")
  
  echo "Health endpoint response:"
  echo "$health_response" | jq 2>/dev/null || echo "$health_response"
fi 