#!/bin/bash

# Script to check for network errors in Safari
# This script captures 404s, failed requests, and other network issues

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}=======================================${NC}"
echo "${BLUE}  Safari Network Error Checker        ${NC}"
echo "${BLUE}=======================================${NC}"
echo ""
echo "Checking for network errors in Safari..."
echo ""
echo "${YELLOW}⚠ Make sure Safari Web Inspector is open (Command+Option+I)${NC}"
echo "${YELLOW}⚠ Switch to the Network tab in Web Inspector${NC}"
echo ""

# Create temporary JavaScript file
TEMP_JS="/tmp/safari_network_check_$$.js"

cat > "$TEMP_JS" << 'EOF'
(function() {
    // Store current URL
    var currentUrl = window.location.href;
    
    // Initialize error counters
    var networkErrors = {
        total: 0,
        http404: 0,
        failed: 0,
        cors: 0,
        timeout: 0,
        other: 0,
        errors: []
    };
    
    // Function to check Network tab data
    function checkNetworkErrors() {
        // This is a placeholder for the actual check
        // In real applications, you would use the Web Inspector Network tab
        // or monitor fetch/XHR requests
        
        // Check for 404 errors in document
        document.querySelectorAll('link, script, img, iframe').forEach(function(el) {
            var src = el.src || el.href;
            if (src) {
                var img = new Image();
                img.onerror = function() {
                    networkErrors.total++;
                    networkErrors.http404++;
                    networkErrors.errors.push('404: ' + src);
                };
                img.src = src;
            }
        });
        
        // Check for failed fetch requests
        var originalFetch = window.fetch;
        window.fetch = function(url, options) {
            var promise = originalFetch(url, options);
            
            promise.catch(function(error) {
                networkErrors.total++;
                networkErrors.failed++;
                networkErrors.errors.push('Failed: ' + url + ' - ' + error);
            });
            
            return promise;
        };
        
        // Check for XMLHttpRequest errors
        var originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            var xhr = this;
            
            xhr.addEventListener('error', function() {
                networkErrors.total++;
                networkErrors.failed++;
                networkErrors.errors.push('XHR Failed: ' + method + ' ' + url);
            });
            
            xhr.addEventListener('load', function() {
                if (xhr.status >= 400) {
                    networkErrors.total++;
                    if (xhr.status === 404) {
                        networkErrors.http404++;
                        networkErrors.errors.push('404: ' + url);
                    } else {
                        networkErrors.other++;
                        networkErrors.errors.push('HTTP ' + xhr.status + ': ' + url);
                    }
                }
            });
            
            return originalOpen.apply(this, arguments);
        };
        
        // Return results after a short delay
        setTimeout(function() {
            // Encode the results as JSON and set as document title
            document.title = 'NETWORK_DATA:' + JSON.stringify(networkErrors) + ':URL:' + currentUrl;
        }, 2000);
    }
    
    // Run the network error check
    checkNetworkErrors();
})();
EOF

# Use AppleScript to inject and run JavaScript in Safari
RESULT=$(osascript <<EOF
tell application "Safari"
    if not running then
        activate
        delay 1
    end if
    
    set currentURL to URL of current tab of window 1
    set jsFile to "$TEMP_JS"
    
    try
        tell current tab of window 1
            do JavaScript (read file jsFile)
            delay 3
            set pageTitle to name
            return pageTitle
        end tell
    on error errMsg
        return "ERROR: " & errMsg
    end try
end tell
EOF
)

# Clean up the temporary JavaScript file
rm -f "$TEMP_JS"

# Check if we got a valid result
if [[ $RESULT == ERROR:* ]]; then
    echo "${RED}Failed to check network errors: ${RESULT#ERROR: }${NC}"
    echo ""
    echo "Please make sure:"
    echo "1. Safari is running with a web page loaded"
    echo "2. Developer Tools are enabled (Safari > Settings > Advanced)"
    echo "3. JavaScript is enabled in Safari"
    exit 1
fi

# Extract network error data from the title if available
if [[ $RESULT == NETWORK_DATA:* ]]; then
    # Parse the JSON data from the title
    JSON_DATA=$(echo "$RESULT" | sed -n 's/NETWORK_DATA:\(.*\):URL:.*/\1/p')
    URL=$(echo "$RESULT" | sed -n 's/.*:URL:\(.*\)/\1/p')
    
    # Extract values from the JSON
    TOTAL=$(echo "$JSON_DATA" | python3 -c "import sys, json; print(json.loads(sys.stdin.read()).get('total', 0))")
    HTTP404=$(echo "$JSON_DATA" | python3 -c "import sys, json; print(json.loads(sys.stdin.read()).get('http404', 0))")
    FAILED=$(echo "$JSON_DATA" | python3 -c "import sys, json; print(json.loads(sys.stdin.read()).get('failed', 0))")
    CORS=$(echo "$JSON_DATA" | python3 -c "import sys, json; print(json.loads(sys.stdin.read()).get('cors', 0))")
    TIMEOUT=$(echo "$JSON_DATA" | python3 -c "import sys, json; print(json.loads(sys.stdin.read()).get('timeout', 0))")
    OTHER=$(echo "$JSON_DATA" | python3 -c "import sys, json; print(json.loads(sys.stdin.read()).get('other', 0))")
    ERRORS=$(echo "$JSON_DATA" | python3 -c "import sys, json; print('\n'.join(json.loads(sys.stdin.read()).get('errors', [])))")
    
    # Display the results
    echo "URL: ${BLUE}$URL${NC}"
    echo ""
    
    if [ "$TOTAL" -eq 0 ]; then
        echo "${GREEN}✓ No network errors detected${NC}"
    else
        echo "${RED}✗ Found $TOTAL network errors:${NC}"
        echo "  - 404 Not Found: $HTTP404"
        echo "  - Failed Requests: $FAILED"
        echo "  - CORS Issues: $CORS"
        echo "  - Timeouts: $TIMEOUT"
        echo "  - Other HTTP Errors: $OTHER"
        echo ""
        echo "${YELLOW}Errors:${NC}"
        echo "$ERRORS" | while read -r line; do
            echo "  - $line"
        done
    fi
    
    # Save to log file
    LOG_FILE="safari_network_errors_$(date +%Y%m%d_%H%M%S).log"
    echo "URL: $URL" > "$LOG_FILE"
    echo "Timestamp: $(date)" >> "$LOG_FILE"
    echo "Total Errors: $TOTAL" >> "$LOG_FILE"
    echo "404 Errors: $HTTP404" >> "$LOG_FILE"
    echo "Failed Requests: $FAILED" >> "$LOG_FILE"
    echo "CORS Issues: $CORS" >> "$LOG_FILE"
    echo "Timeouts: $TIMEOUT" >> "$LOG_FILE"
    echo "Other HTTP Errors: $OTHER" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    echo "Error Details:" >> "$LOG_FILE"
    echo "$ERRORS" >> "$LOG_FILE"
    
    echo ""
    echo "Network error log saved to: ${YELLOW}$LOG_FILE${NC}"
else
    echo "${RED}Could not retrieve network error data from Safari${NC}"
    echo ""
    echo "${YELLOW}Manual Debugging Steps:${NC}"
    echo "1. Open Safari Web Inspector with Command+Option+I"
    echo "2. Select the Network tab"
    echo "3. Look for red entries or status codes >= 400"
    echo "4. Check for failed or canceled requests"
fi

echo ""
echo "${BLUE}=======================================${NC}"
echo "${BLUE}  End of Network Error Check          ${NC}"
echo "${BLUE}=======================================${NC}" 