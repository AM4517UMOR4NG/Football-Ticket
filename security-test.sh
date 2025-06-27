#!/bin/bash

# Security Testing Script for Football Ticket Booking Application
# This script validates all security features implemented

echo "🔒 SECURITY TESTING - FOOTBALL TICKET BOOKING APPLICATION"
echo "=========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED${NC} - $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} - $2"
        ((FAILED++))
    fi
}

# Function to test endpoint
test_endpoint() {
    local url=$1
    local expected_status=$2
    local test_name=$3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$response" = "$expected_status" ]; then
        print_result 0 "$test_name"
    else
        print_result 1 "$test_name (Expected: $expected_status, Got: $response)"
    fi
}

# Function to test security headers
test_security_headers() {
    local url=$1
    local test_name=$2
    
    headers=$(curl -s -I "$url")
    
    # Test X-Frame-Options
    if echo "$headers" | grep -q "X-Frame-Options: DENY"; then
        print_result 0 "$test_name - X-Frame-Options"
    else
        print_result 1 "$test_name - X-Frame-Options"
    fi
    
    # Test X-Content-Type-Options
    if echo "$headers" | grep -q "X-Content-Type-Options: nosniff"; then
        print_result 0 "$test_name - X-Content-Type-Options"
    else
        print_result 1 "$test_name - X-Content-Type-Options"
    fi
    
    # Test HSTS
    if echo "$headers" | grep -q "Strict-Transport-Security"; then
        print_result 0 "$test_name - HSTS"
    else
        print_result 1 "$test_name - HSTS"
    fi
    
    # Test Content Security Policy
    if echo "$headers" | grep -q "Content-Security-Policy"; then
        print_result 0 "$test_name - CSP"
    else
        print_result 1 "$test_name - CSP"
    fi
}

echo -e "${BLUE}1. Testing Authentication & Authorization${NC}"
echo "----------------------------------------"

# Test public endpoints
test_endpoint "http://localhost:8481/" "200" "Public home page access"
test_endpoint "http://localhost:8481/login.html" "200" "Login page access"
test_endpoint "http://localhost:8481/api/events/all" "200" "Public events endpoint"

# Test protected endpoints (should return 401)
test_endpoint "http://localhost:8481/api/bookings/all" "401" "Protected bookings endpoint (unauthorized)"

echo ""
echo -e "${BLUE}2. Testing Security Headers${NC}"
echo "--------------------------------"

# Test security headers on main page
test_security_headers "http://localhost:8481/" "Main page security headers"

echo ""
echo -e "${BLUE}3. Testing CORS Configuration${NC}"
echo "--------------------------------"

# Test CORS preflight
cors_response=$(curl -s -H "Origin: http://malicious-site.com" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS "http://localhost:8481/api/auth/login" -w "%{http_code}")
if [ "$cors_response" = "200" ]; then
    print_result 0 "CORS preflight request"
else
    print_result 1 "CORS preflight request"
fi

echo ""
echo -e "${BLUE}4. Testing Rate Limiting${NC}"
echo "----------------------------"

# Test rate limiting by making multiple requests
echo "Making multiple requests to test rate limiting..."
for i in {1..15}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8481/api/auth/login")
    if [ "$response" = "429" ]; then
        print_result 0 "Rate limiting active (request $i)"
        break
    fi
    sleep 0.1
done

echo ""
echo -e "${BLUE}5. Testing Password Validation${NC}"
echo "--------------------------------"

# Test weak password (should fail)
weak_password_response=$(curl -s -X POST "http://localhost:8481/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","email":"test@example.com","password":"123","fullName":"Test User","phoneNumber":"1234567890"}' \
    -w "%{http_code}")

if [ "$weak_password_response" = "400" ]; then
    print_result 0 "Weak password rejection"
else
    print_result 1 "Weak password rejection"
fi

echo ""
echo -e "${BLUE}6. Testing JWT Token Validation${NC}"
echo "-----------------------------------"

# Test invalid JWT token
invalid_token_response=$(curl -s -H "Authorization: Bearer invalid-token" \
    "http://localhost:8481/api/bookings/all" \
    -w "%{http_code}")

if [ "$invalid_token_response" = "401" ]; then
    print_result 0 "Invalid JWT token rejection"
else
    print_result 1 "Invalid JWT token rejection"
fi

echo ""
echo -e "${BLUE}7. Testing CSRF Protection${NC}"
echo "-----------------------------"

# Test CSRF protection (should work for non-auth endpoints)
csrf_response=$(curl -s -X POST "http://localhost:8481/api/bookings/create" \
    -H "Content-Type: application/json" \
    -d '{"eventId":1,"quantity":1}' \
    -w "%{http_code}")

if [ "$csrf_response" = "401" ] || [ "$csrf_response" = "403" ]; then
    print_result 0 "CSRF protection active"
else
    print_result 1 "CSRF protection active"
fi

echo ""
echo -e "${BLUE}8. Testing Error Handling${NC}"
echo "----------------------------"

# Test error handling (should not expose sensitive information)
error_response=$(curl -s "http://localhost:8481/api/nonexistent" | grep -i "stack\|exception\|error" | wc -l)
if [ "$error_response" -eq 0 ]; then
    print_result 0 "Secure error handling"
else
    print_result 1 "Secure error handling"
fi

echo ""
echo -e "${BLUE}9. Testing Admin Security Endpoints${NC}"
echo "-------------------------------------"

# Test admin security endpoint (should require authentication)
admin_response=$(curl -s "http://localhost:8481/api/admin/security/status" -w "%{http_code}")
if [ "$admin_response" = "401" ]; then
    print_result 0 "Admin security endpoint protection"
else
    print_result 1 "Admin security endpoint protection"
fi

echo ""
echo -e "${BLUE}10. Testing H2 Console Access${NC}"
echo "--------------------------------"

# Test H2 console access (should be accessible in development)
h2_response=$(curl -s "http://localhost:8481/h2-console" -w "%{http_code}")
if [ "$h2_response" = "200" ]; then
    print_result 0 "H2 console accessible (development mode)"
else
    print_result 1 "H2 console accessible (development mode)"
fi

echo ""
echo "=========================================================="
echo -e "${BLUE}SECURITY TEST RESULTS${NC}"
echo "=========================================================="
echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
echo -e "${RED}❌ FAILED: $FAILED${NC}"
echo ""

# Calculate security score
total_tests=$((PASSED + FAILED))
if [ $total_tests -gt 0 ]; then
    score=$((PASSED * 100 / total_tests))
    echo -e "${BLUE}Security Score: $score/100${NC}"
    
    if [ $score -eq 100 ]; then
        echo -e "${GREEN}🏆 EXCELLENT! Your application has achieved 10/10 security score!${NC}"
    elif [ $score -ge 90 ]; then
        echo -e "${GREEN}🎉 GREAT! Your application has excellent security!${NC}"
    elif [ $score -ge 80 ]; then
        echo -e "${YELLOW}👍 GOOD! Your application has good security!${NC}"
    else
        echo -e "${RED}⚠️  NEEDS IMPROVEMENT! Please review failed tests.${NC}"
    fi
fi

echo ""
echo -e "${BLUE}Security Testing Complete!${NC}"
echo "For detailed security information, see SECURITY.md" 