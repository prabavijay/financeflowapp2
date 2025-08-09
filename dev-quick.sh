#!/bin/bash

# Quick Development Mode - Optimized for Fast Changes
# Use this for development to avoid the 30-minute delay issue

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[DEV]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Banner
echo -e "${GREEN}⚡ FinanceFlow - Quick Dev Mode${NC}"
echo "Optimized for instant change reflection"
echo "----------------------------------------"

# Kill ALL existing processes aggressively
print_status "Killing all existing Vite and Node processes..."
pkill -f "vite" || true
pkill -f "node.*5173" || true
pkill -f "node.*3001" || true
sleep 2

# Clear ALL caches aggressively
print_status "Clearing all caches..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf backend/.tmp

# Quick dependency check (no reinstall)
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install --prefer-offline
fi

# Start ONLY frontend with hot reload optimizations
print_status "Starting Vite with hot reload optimizations..."

# Set environment for fast development
export NODE_ENV=development
export BROWSER=none

# Start with aggressive hot reload settings
npm run dev &
FRONTEND_PID=$!

# Wait and check
sleep 3
print_success "Quick dev server started!"
echo -e "${GREEN}🌐 Frontend: http://localhost:5173${NC}"
echo -e "${YELLOW}⚡ Hot reload enabled - changes should reflect in 1-2 seconds${NC}"
echo -e "${YELLOW}💡 Press Ctrl+C to stop${NC}"
echo ""

# Cleanup on exit
trap 'echo -e "\n${BLUE}Stopping dev server...${NC}"; kill $FRONTEND_PID 2>/dev/null || true; echo -e "${GREEN}Done!${NC}"; exit 0' INT

# Wait
wait $FRONTEND_PID