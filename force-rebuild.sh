#!/bin/bash

# FinanceFlow Force Rebuild Script
# Kills all processes, clears caches, rebuilds, and restarts both frontend and backend

echo "🚨 Force Rebuild Started: $(date)"
echo "================================="

# Function to kill process by PID file
kill_by_pid_file() {
    local pid_file=$1
    local process_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "🔪 Killing $process_name (PID: $pid)"
            kill -9 $pid 2>/dev/null || true
        fi
        rm -f "$pid_file"
    fi
}

# Step 1: Kill all existing processes
echo ""
echo "📡 Step 1: Killing all existing processes..."
echo "-------------------------------------------"

# Kill processes by PID files
kill_by_pid_file "logs/frontend.pid" "Frontend"
kill_by_pid_file "logs/backend.pid" "Backend"

# Kill by process names (backup)
echo "🔪 Killing Node.js processes..."
pkill -f "vite.*5173" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true
pkill -f "finance-flow" 2>/dev/null || true

# Kill by ports
echo "🔪 Killing processes on ports 5173 and 3001..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

sleep 2
echo "✅ All processes killed"

# Step 2: Clear all caches
echo ""
echo "🧹 Step 2: Clearing all caches..."
echo "--------------------------------"

# Frontend caches
echo "🧹 Clearing Vite cache..."
rm -rf dist
rm -rf node_modules/.vite

echo "🧹 Clearing node_modules cache..."
rm -rf node_modules/.cache

# Backend caches
echo "🧹 Clearing backend cache..."
rm -rf backend/node_modules/.cache

# System caches
echo "🧹 Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Browser caches note
echo "🧹 Note: Please clear browser cache manually (Cmd+Shift+R or Ctrl+Shift+R)"

echo "✅ All caches cleared"

# Step 3: Rebuild everything
echo ""
echo "🔨 Step 3: Rebuilding application..."
echo "-----------------------------------"

echo "🔨 Installing frontend dependencies..."
npm ci --silent

echo "🔨 Installing backend dependencies..."
cd backend
npm ci --silent
cd ..

echo "🔨 Building Vite application..."
npm run build

echo "✅ Application rebuilt"

# Step 4: Create logs directory
echo ""
echo "📁 Step 4: Preparing logs..."
echo "---------------------------"
mkdir -p logs
echo "✅ Logs directory ready"

# Step 5: Start backend
echo ""
echo "🚀 Step 5: Starting backend server..."
echo "------------------------------------"

cd backend
# Start backend in background
nohup npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

echo "🚀 Backend started (PID: $BACKEND_PID)"
echo "📋 Backend logs: logs/backend.log"

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start - check logs/backend.log"
fi

# Step 6: Start frontend
echo ""
echo "🚀 Step 6: Starting frontend server..."
echo "-------------------------------------"

# Start frontend in background
nohup npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > logs/frontend.pid

echo "🚀 Frontend started (PID: $FRONTEND_PID)"
echo "📋 Frontend logs: logs/frontend.log"

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 8

# Check if frontend is running
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start - check logs/frontend.log"
fi

# Step 7: Final status
echo ""
echo "🎉 Force Rebuild Complete!"
echo "========================="
echo "📅 Completed: $(date)"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3001"
echo ""
echo "📋 Logs:"
echo "   Frontend: logs/frontend.log"
echo "   Backend:  logs/backend.log"
echo ""
echo "🔍 Process Status:"
if ps -p $FRONTEND_PID > /dev/null; then
    echo "   ✅ Frontend (PID: $FRONTEND_PID) - Running"
else
    echo "   ❌ Frontend - Not Running"
fi

if ps -p $BACKEND_PID > /dev/null; then
    echo "   ✅ Backend (PID: $BACKEND_PID) - Running"
else
    echo "   ❌ Backend - Not Running"
fi

echo ""
echo "💡 Pro Tips:"
echo "   • Clear browser cache with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)"
echo "   • Use 'tail -f logs/frontend.log' to monitor frontend"
echo "   • Use 'tail -f logs/backend.log' to monitor backend"
echo "   • Run './force-rebuild.sh' again if issues persist"
echo ""