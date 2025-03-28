#!/bin/bash

# Script to check for TypeScript and build errors without generating production files
# This script helps identify build errors early in the development process

echo "📝 Checking for TypeScript errors..."
# Check TypeScript errors
npx tsc --noEmit --pretty > /tmp/ts-errors.log
TS_EXIT_CODE=$?

# Extract error count by type
if [ $TS_EXIT_CODE -ne 0 ]; then
  echo "❌ TypeScript errors found. Analyzing error types..."
  
  MISSING_EXPORTS=$(grep -c "has no exported member" /tmp/ts-errors.log || echo "0")
  PROPERTY_ACCESS=$(grep -c "Property .* does not exist on type" /tmp/ts-errors.log || echo "0")
  TYPE_MISMATCH=$(grep -c "Type .* is not assignable to" /tmp/ts-errors.log || echo "0")
  ARGUMENT_MISMATCH=$(grep -c "Argument of type .* is not assignable" /tmp/ts-errors.log || echo "0")
  
  echo ""
  echo "📊 TypeScript Error Summary:"
  echo "  - Missing exports or imports: $MISSING_EXPORTS"
  echo "  - Invalid property access: $PROPERTY_ACCESS"
  echo "  - Type mismatches: $TYPE_MISMATCH"
  echo "  - Argument mismatches: $ARGUMENT_MISMATCH"
  echo ""
  
  # Find top 5 files with most errors
  echo "🔍 Top 5 files with most errors:"
  grep -o "src/[^ ]*\.tsx\?:[0-9]*:[0-9]*" /tmp/ts-errors.log | cut -d: -f1 | sort | uniq -c | sort -nr | head -5 | awk '{print "  - " $2 " (" $1 " errors)"}' 
  
  echo ""
  echo "👉 For detailed error list, see /tmp/ts-errors.log"
  echo ""
else
  echo "✅ No TypeScript errors found!"
fi

echo "🏗️ Checking for build errors (without generating production files)..."
# Run the build with a temporary output directory
NODE_ENV=production npx vite build --outDir /tmp/build-check > /tmp/build-output.log 2>&1
BUILD_EXIT_CODE=$?

# Check build output for common errors
if [ $BUILD_EXIT_CODE -ne 0 ]; then
  echo "❌ Build errors found. Common issues:"
  
  IMPORT_ERRORS=$(grep -c "is not exported by" /tmp/build-output.log || echo "0")
  SYNTAX_ERRORS=$(grep -c "SyntaxError" /tmp/build-output.log || echo "0")
  RUNTIME_ERRORS=$(grep -c "ReferenceError" /tmp/build-output.log || echo "0")
  
  echo "  - Import errors: $IMPORT_ERRORS"
  echo "  - Syntax errors: $SYNTAX_ERRORS"
  echo "  - Runtime errors: $RUNTIME_ERRORS"
  
  echo ""
  echo "🔍 Error details from build:"
  grep -A 3 "error during build" /tmp/build-output.log || echo "  No specific error details found."
  
  echo ""
  echo "👉 For detailed build output, see /tmp/build-output.log"
else
  echo "✅ Build completed without errors!"
  # Clean up temporary build directory
  rm -rf /tmp/build-check
fi

# Check final outcome
if [ $TS_EXIT_CODE -ne 0 ] || [ $BUILD_EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ Errors detected:"
  [ $TS_EXIT_CODE -ne 0 ] && echo "   - TypeScript errors found"
  [ $BUILD_EXIT_CODE -ne 0 ] && echo "   - Build errors found"
  echo ""
  echo "Please fix the errors before deploying."
  exit 1
else
  echo ""
  echo "✅ All checks passed! No TypeScript or build errors found."
  exit 0
fi 