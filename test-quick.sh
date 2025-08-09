#!/bin/bash

# Quick Test Runner - Just run unit tests without full setup
set -e

echo "🧪 FinanceFlow Quick Test Runner"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "📋 Running Frontend Unit Tests..."
npm test -- --watchAll=false --passWithNoTests --verbose
FRONTEND_EXIT_CODE=$?

echo ""
echo "📋 Running Backend Unit Tests..."
cd backend
npm test -- --passWithNoTests --verbose
BACKEND_EXIT_CODE=$?
cd ..

echo ""
echo "📊 Quick Test Results:"
echo "====================="

if [ $FRONTEND_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend Tests: PASSED${NC}"
else
    echo -e "${RED}❌ Frontend Tests: FAILED${NC}"
fi

if [ $BACKEND_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Backend Tests: PASSED${NC}"
else
    echo -e "${RED}❌ Backend Tests: FAILED${NC}"
fi

echo ""
if [ $FRONTEND_EXIT_CODE -eq 0 ] && [ $BACKEND_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed.${NC}"
    exit 1
fi