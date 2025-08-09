#!/bin/bash

# Finance Flow - Single Script to Start Complete App
# Starts PostgreSQL backend + React frontend together
# Tech Stack: React + Tailwind + PostgreSQL + Node.js

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration from ENVIRONMENT_NOTES.md
FRONTEND_PORT=5173
BACKEND_PORT=3001

# Banner
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                        FinanceFlow                           ║"
echo "║              Complete Local Finance Manager                  ║"
echo "║          Vite + React + Tailwind + PostgreSQL + Node.js     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print status messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        print_warning "Killing existing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi
}

# Pre-flight checks
print_status "Running pre-flight checks..."

# Check Node.js
if ! command_exists node; then
    print_error "Node.js is not installed!"
    print_status "Please install Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js $NODE_VERSION detected"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found!"
    print_status "Please run this script from the Finance Flow project root directory."
    exit 1
fi

# Check if backend exists
if [ ! -d "backend" ]; then
    print_error "Backend directory not found!"
    print_status "Please ensure the backend directory exists with the Node.js server."
    exit 1
fi

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
fi

# Clean Vite cache to ensure fresh build
print_status "Cleaning Vite cache and build artifacts..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf node_modules/.cache
# Force kill any existing dev processes
pkill -f "vite.*5173" 2>/dev/null || true
sleep 2
print_success "All caches cleared and processes stopped"

# Check PostgreSQL database
print_status "Checking PostgreSQL database..."
cd backend
if node -e "
const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'finance',
  user: 'luxmiuser',
  password: 'luxmi'
});
client.connect()
  .then(() => {
    console.log('✅ Database connection successful');
    return client.end();
  })
  .catch(err => {
    console.log('❌ Database connection failed:', err.message);
    process.exit(1);
  });
" 2>/dev/null; then
    print_success "PostgreSQL database 'finance' is accessible"
else
    print_error "Cannot connect to PostgreSQL database!"
    print_status "Please run: node scripts/setup-database.js"
    exit 1
fi
cd ..

# Check and kill existing processes on ports
if port_in_use $BACKEND_PORT; then
    kill_port $BACKEND_PORT
fi

if port_in_use $FRONTEND_PORT; then
    kill_port $FRONTEND_PORT
fi

# Display configuration
echo
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    Starting Finance Flow                     ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC} Tech Stack:      Vite + React + Tailwind + PostgreSQL + Node.js ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} Frontend:        http://localhost:$FRONTEND_PORT                        ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} Backend API:     http://localhost:$BACKEND_PORT                         ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} Database:        PostgreSQL 17 (finance)                    ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} Status:          Vite + React Router, fully local          ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo

# Create log directory
mkdir -p logs

# Start backend server
print_status "Starting backend server on port $BACKEND_PORT..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
print_status "Waiting for backend to initialize..."
sleep 3

# Check if backend is running
if ! port_in_use $BACKEND_PORT; then
    print_error "Backend failed to start!"
    print_status "Check logs/backend.log for details"
    exit 1
fi

# Test backend health
if curl -s http://localhost:$BACKEND_PORT/health > /dev/null; then
    print_success "Backend server is healthy"
else
    print_warning "Backend health check failed, but server is running"
fi

# Start frontend with clean dev server
print_status "Starting Vite development server on port $FRONTEND_PORT..."
BROWSER=none npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
print_status "Waiting for frontend to initialize..."
sleep 7

# Check if frontend is running with retry logic
FRONTEND_CHECK_ATTEMPTS=0
MAX_ATTEMPTS=15
while ! port_in_use $FRONTEND_PORT && [ $FRONTEND_CHECK_ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    sleep 1
    FRONTEND_CHECK_ATTEMPTS=$((FRONTEND_CHECK_ATTEMPTS + 1))
    print_status "Attempt $FRONTEND_CHECK_ATTEMPTS/$MAX_ATTEMPTS - checking if frontend is ready..."
done

if ! port_in_use $FRONTEND_PORT; then
    print_warning "Port check failed, but frontend may still be starting..."
    print_status "Continuing anyway - check http://localhost:$FRONTEND_PORT manually"
else
    print_success "Frontend is now running on port $FRONTEND_PORT"
fi

# Success message
echo
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    🚀 Finance Flow Started!                  ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}                                                            ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} 🌐 Frontend:    http://localhost:$FRONTEND_PORT                        ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} 🔌 Backend API: http://localhost:$BACKEND_PORT                         ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} 🗄️  Database:   PostgreSQL (finance)                       ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}                                                            ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} 📱 Features Available:                                     ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} • 📊 Dashboard with Financial Overview                    ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} • 💰 Income & Expense Tracking                           ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} • 🧾 Bills & Payment Management                          ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} • 💳 Debt & Credit Management                            ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} • 🏠 Asset Portfolio Tracking                            ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} • 📅 Budget Planning & Analysis                          ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} • 🔧 Advanced Tools (Subscriptions, Travel, Fees, etc.)  ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} • 🔐 Secure Account Management                           ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}                                                            ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} 🎯 Status: Vite + React Router, fully local PostgreSQL  ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} 📝 Logs: Check logs/ directory for troubleshooting       ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo
echo -e "${YELLOW}💡 Press Ctrl+C to stop both servers${NC}"
echo

# Store PIDs for cleanup
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

# Cleanup function
cleanup() {
    echo
    print_status "Shutting down Finance Flow..."
    
    # Kill frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill backend
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    # Clean up any remaining processes
    kill_port $FRONTEND_PORT
    kill_port $BACKEND_PORT
    
    # Remove PID files
    rm -f logs/backend.pid logs/frontend.pid
    
    print_success "Finance Flow stopped. Thanks for using Finance Flow! 👋"
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Wait for processes to finish
wait $FRONTEND_PID $BACKEND_PID