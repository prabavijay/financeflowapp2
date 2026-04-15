#!/bin/bash
# ==============================================================
# FinanceFlow - Build Windows Deployment Package
# Run this on the Mac (development machine) to produce:
#   finance-flow-deploy.zip  (~15-25 MB)
#
# The ZIP excludes:
#   - node_modules (both frontend and backend)
#   - .git directory
#   - Test files (tests/, e2e/, __tests__)
#   - Dev-only shell scripts
#   - Source map files
#   - OS junk files (.DS_Store, Thumbs.db)
# ==============================================================
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$PROJECT_ROOT/dist"
OUT_ZIP="$PROJECT_ROOT/finance-flow-deploy.zip"
TMP_DIR="$(mktemp -d)/finance-flow-deploy"

echo "=================================================="
echo " FinanceFlow - Building Windows Deployment Package"
echo "=================================================="
echo ""

# Step 1: Build the React frontend
echo "[1/5] Building React frontend..."
cd "$PROJECT_ROOT"
npm run build
echo "      Build complete → dist/"
echo ""

# Step 2: Verify dist exists
if [ ! -f "$DIST_DIR/index.html" ]; then
  echo "ERROR: dist/index.html not found. Build may have failed."
  exit 1
fi

# Step 3: Prepare staging directory
echo "[2/5] Staging deployment files..."
mkdir -p "$TMP_DIR/dist"
mkdir -p "$TMP_DIR/backend/routes"
mkdir -p "$TMP_DIR/backend/database"
mkdir -p "$TMP_DIR/backend/scripts"
mkdir -p "$TMP_DIR/deploy"

# Copy frontend build output
cp -r "$DIST_DIR/"* "$TMP_DIR/dist/"

# Copy backend source (excluding node_modules, tests, dev files)
cp "$PROJECT_ROOT/backend/server.js"      "$TMP_DIR/backend/"
cp "$PROJECT_ROOT/backend/package.json"   "$TMP_DIR/backend/"
cp "$PROJECT_ROOT/backend/routes/"*.js    "$TMP_DIR/backend/routes/"
cp "$PROJECT_ROOT/backend/database/schema.sql" "$TMP_DIR/backend/database/"
cp "$PROJECT_ROOT/backend/scripts/migrate.js"       "$TMP_DIR/backend/scripts/" 2>/dev/null || true
cp "$PROJECT_ROOT/backend/scripts/setup-database.js" "$TMP_DIR/backend/scripts/" 2>/dev/null || true
cp "$PROJECT_ROOT/backend/scripts/seed.js"           "$TMP_DIR/backend/scripts/" 2>/dev/null || true

# Create .env.example for backend
cat > "$TMP_DIR/backend/.env.example" << 'EOF'
# FinanceFlow Backend Configuration
# Copy this file to .env and fill in your values.

# Server
NODE_ENV=production
PORT=3001
HOST=localhost

# Database — update these to match your PostgreSQL setup
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance
DB_USER=financeapp
DB_PASSWORD=CHANGE_ME

# Security — generate a strong random string (min 32 chars)
JWT_SECRET=CHANGE_ME_TO_LONG_RANDOM_STRING

# CORS — URL of the frontend (use machine IP for network access)
CORS_ORIGIN=http://localhost:5173
EOF

# Copy Windows deployment scripts
cp "$PROJECT_ROOT/deploy/windows/"*.bat "$TMP_DIR/deploy/"

# Copy deployment guide
cp "$PROJECT_ROOT/docs/WINDOWS_DEPLOYMENT.md" "$TMP_DIR/"

echo "      Staging complete at: $TMP_DIR"
echo ""

# Step 4: Show what we're packaging
echo "[3/5] Package contents:"
find "$TMP_DIR" -not -path '*/.*' | sort | head -60
echo ""

# Step 5: Create the ZIP
echo "[4/5] Creating ZIP package..."
rm -f "$OUT_ZIP"
cd "$(dirname "$TMP_DIR")"
zip -r "$OUT_ZIP" "finance-flow-deploy/" \
  --exclude "*.DS_Store" \
  --exclude "*.map" \
  --exclude "*Thumbs.db" \
  --exclude "*/node_modules/*"

echo ""
echo "[5/5] Cleaning up temp files..."
rm -rf "$TMP_DIR"

# Show final stats
ZIP_SIZE=$(du -sh "$OUT_ZIP" | cut -f1)
echo ""
echo "=================================================="
echo " Deployment package ready!"
echo "=================================================="
echo ""
echo "  File:  $OUT_ZIP"
echo "  Size:  $ZIP_SIZE"
echo ""
echo "  Transfer this ZIP to your Windows machine and follow:"
echo "  docs/WINDOWS_DEPLOYMENT.md"
echo ""
echo "  Quick start on Windows:"
echo "    1. Extract the ZIP to C:\\"
echo "    2. Run deploy\\setup.bat  (first time only)"
echo "    3. Run deploy\\setup-database.bat  (first time only)"
echo "    4. Run deploy\\start.bat"
echo ""
