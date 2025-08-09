#!/bin/bash

# FinanceFlow Comprehensive Test Runner
# This script runs all tests for the FinanceFlow application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
FRONTEND_TESTS_PASSED=false
BACKEND_TESTS_PASSED=false
E2E_TESTS_PASSED=false

echo -e "${BLUE}🚀 FinanceFlow Comprehensive Test Suite${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}📋 $1${NC}"
    echo -e "${BLUE}$(printf '=%.0s' {1..50})${NC}"
}

# Function to print success message
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error message
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print warning message
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Create test reports directory
mkdir -p test-reports
mkdir -p test-reports/coverage

print_section "Environment Setup"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js to run tests."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm to run tests."
    exit 1
fi

print_success "Node.js and npm are available"

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    print_warning "PostgreSQL is not running. Database tests may fail."
fi

print_section "Installing Dependencies"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi
cd ..

print_section "Frontend Tests"

# Run frontend linting
echo "🔍 Running frontend linting..."
npm run lint
if [ $? -eq 0 ]; then
    print_success "Frontend linting passed"
else
    print_warning "Frontend linting issues found"
fi

# Run frontend unit tests
echo "🧪 Running frontend unit tests..."
npm test -- --coverage --watchAll=false --passWithNoTests
if [ $? -eq 0 ]; then
    print_success "Frontend unit tests passed"
    FRONTEND_TESTS_PASSED=true
else
    print_error "Frontend unit tests failed"
    FRONTEND_TESTS_PASSED=false
fi

# Copy frontend coverage report
if [ -d coverage ]; then
    cp -r coverage test-reports/coverage/frontend
    print_success "Frontend coverage report saved to test-reports/coverage/frontend"
fi

print_section "Backend Tests"

cd backend

# Run backend linting
echo "🔍 Running backend linting..."
npm run lint
if [ $? -eq 0 ]; then
    print_success "Backend linting passed"
else
    print_warning "Backend linting issues found"
fi

# Run backend unit tests
echo "🧪 Running backend unit tests..."
npm test -- --coverage --passWithNoTests
if [ $? -eq 0 ]; then
    print_success "Backend unit tests passed"
    BACKEND_TESTS_PASSED=true
else
    print_error "Backend unit tests failed"
    BACKEND_TESTS_PASSED=false
fi

# Copy backend coverage report
if [ -d coverage ]; then
    cp -r coverage ../test-reports/coverage/backend
    print_success "Backend coverage report saved to test-reports/coverage/backend"
fi

cd ..

print_section "Integration Tests"

# Check if servers are running
echo "🔍 Checking if servers are running..."

# Check if frontend server is running
if curl -s http://localhost:5173 > /dev/null; then
    print_success "Frontend server is running on port 5173"
    FRONTEND_RUNNING=true
else
    print_warning "Frontend server is not running on port 5173"
    FRONTEND_RUNNING=false
fi

# Check if backend server is running
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "Backend server is running on port 3001"
    BACKEND_RUNNING=true
else
    print_warning "Backend server is not running on port 3001"
    BACKEND_RUNNING=false
fi

# Run API tests if backend is running
if [ "$BACKEND_RUNNING" = true ]; then
    echo "🧪 Running API integration tests..."
    cd backend
    # Create a simple API test
    node -e "
    const request = require('supertest');
    const express = require('express');
    
    console.log('Testing API endpoints...');
    
    // Test health endpoint
    fetch('http://localhost:3001/health')
      .then(response => response.ok ? console.log('✅ Health endpoint working') : console.log('❌ Health endpoint failed'))
      .catch(err => console.log('❌ Health endpoint error:', err.message));
    
    // Test status endpoint
    fetch('http://localhost:3001/api/status')
      .then(response => response.ok ? console.log('✅ Status endpoint working') : console.log('❌ Status endpoint failed'))
      .catch(err => console.log('❌ Status endpoint error:', err.message));
    "
    cd ..
fi

print_section "End-to-End Tests"

# Run E2E tests if both servers are running
if [ "$FRONTEND_RUNNING" = true ] && [ "$BACKEND_RUNNING" = true ]; then
    echo "🧪 Running end-to-end tests..."
    # Check if Playwright is configured
    if [ -f "playwright.config.js" ]; then
        npm run test:e2e -- --reporter=html
        if [ $? -eq 0 ]; then
            print_success "End-to-end tests passed"
            E2E_TESTS_PASSED=true
        else
            print_error "End-to-end tests failed"
            E2E_TESTS_PASSED=false
        fi
        
        # Copy E2E test report
        if [ -d "playwright-report" ]; then
            cp -r playwright-report test-reports/e2e-report
            print_success "E2E test report saved to test-reports/e2e-report"
        fi
    else
        print_warning "Playwright not configured. Skipping E2E tests."
    fi
else
    print_warning "Servers not running. Skipping E2E tests."
    print_warning "Start servers with: npm run start-app"
fi

print_section "Test Results Summary"

echo ""
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo -e "${BLUE}======================${NC}"
echo ""

# Frontend Tests
if [ "$FRONTEND_TESTS_PASSED" = true ]; then
    print_success "Frontend Tests: PASSED"
else
    print_error "Frontend Tests: FAILED"
fi

# Backend Tests
if [ "$BACKEND_TESTS_PASSED" = true ]; then
    print_success "Backend Tests: PASSED"
else
    print_error "Backend Tests: FAILED"
fi

# E2E Tests
if [ "$E2E_TESTS_PASSED" = true ]; then
    print_success "End-to-End Tests: PASSED"
elif [ "$FRONTEND_RUNNING" = true ] && [ "$BACKEND_RUNNING" = true ]; then
    print_error "End-to-End Tests: FAILED"
else
    print_warning "End-to-End Tests: SKIPPED (servers not running)"
fi

print_section "Coverage Reports"

echo ""
echo "📈 Coverage reports available at:"
if [ -d "test-reports/coverage/frontend" ]; then
    echo "   Frontend: test-reports/coverage/frontend/lcov-report/index.html"
fi
if [ -d "test-reports/coverage/backend" ]; then
    echo "   Backend: test-reports/coverage/backend/lcov-report/index.html"
fi
if [ -d "test-reports/e2e-report" ]; then
    echo "   E2E Tests: test-reports/e2e-report/index.html"
fi

print_section "Recommendations"

echo ""
if [ "$FRONTEND_TESTS_PASSED" = false ] || [ "$BACKEND_TESTS_PASSED" = false ]; then
    echo "🔧 To fix failing tests:"
    echo "   1. Review test output above for specific failures"
    echo "   2. Fix the failing code or tests"
    echo "   3. Re-run tests with: ./run-all-tests.sh"
fi

if [ "$FRONTEND_RUNNING" = false ] || [ "$BACKEND_RUNNING" = false ]; then
    echo "🚀 To run full test suite including E2E:"
    echo "   1. Start servers: ./start-finance-flow.sh"
    echo "   2. Run tests: ./run-all-tests.sh"
fi

echo ""
echo "📚 Test Documentation:"
echo "   - Frontend tests: src/**/*.test.js"
echo "   - Backend tests: backend/tests/**/*.test.js"
echo "   - E2E tests: tests/**/*.spec.js"
echo "   - Test Guide: TESTING_GUIDE.md"

print_section "Test Execution Complete"

# Exit with appropriate code
if [ "$FRONTEND_TESTS_PASSED" = true ] && [ "$BACKEND_TESTS_PASSED" = true ]; then
    print_success "All core tests passed! 🎉"
    exit 0
else
    print_error "Some tests failed. Please review and fix."
    exit 1
fi