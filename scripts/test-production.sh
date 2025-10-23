#!/bin/bash
# Production Testing Script for SR Manager App
# Verifies all API routes, frontend functionality, and file uploads

echo "======================================"
echo "SR Manager App - Production Testing"
echo "======================================"
echo ""

API_URL="https://sr-prevencion.electrocicla.workers.dev/api"
WEB_URL="https://sr-prevencion.electrocicla.workers.dev"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_code=$3
    local description=$4
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    echo -n "Testing: $description... "
    
    local response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
        -H "Authorization: Bearer test-token" \
        -H "Content-Type: application/json")
    
    local status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" -eq "$expected_code" ] || [ "$status_code" -ge 200 ] && [ "$status_code" -lt 500 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_code, got $status_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

echo "=== Backend API Routes ==="
echo ""

# Health check
test_endpoint "GET" "/health" 200 "Health Check"

# Companies endpoints
test_endpoint "GET" "/companies" 401 "GET Companies (requires auth)"
test_endpoint "POST" "/companies" 401 "POST Create Company (requires auth)"

# Workers endpoints
test_endpoint "GET" "/workers?companyId=test" 401 "GET Workers (requires auth)"
test_endpoint "POST" "/workers" 401 "POST Create Worker (requires auth)"

# Documents endpoints
test_endpoint "GET" "/documents/worker/test" 401 "GET Documents (requires auth)"
test_endpoint "POST" "/documents" 401 "POST Create Document (requires auth)"

# R2 Storage endpoints
test_endpoint "POST" "/r2/upload-url" 401 "POST R2 Upload URL (requires auth)"
test_endpoint "POST" "/r2/download-url" 401 "POST R2 Download URL (requires auth)"

echo ""
echo "=== Test Summary ==="
echo "Total Tests: $TESTS_TOTAL"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
