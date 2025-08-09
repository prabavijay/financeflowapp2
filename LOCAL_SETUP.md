# Local Development Setup

This guide will help you run FinanceFlow locally without requiring Base44 authentication.

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script
./local-dev.sh

# Start the development server
npm run dev:local
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Create local environment file
echo "VITE_LOCAL_DEV=true" > .env.local

# 3. Start development server in local mode
npm run dev:local
```

### Option 3: One-Command Setup
```bash
npm run setup:local
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:local` | Start development server with local mode enabled |
| `npm start` | Alias for `dev:local` |
| `npm run setup:local` | Create .env.local and start development server |
| `npm run build:local` | Build for production with local mode |
| `./local-dev.sh` | Interactive setup script |

## How It Works

### Authentication Bypass
- The app checks for `VITE_LOCAL_DEV=true` in environment variables
- When enabled, Base44 client runs without authentication requirements
- All UI features work normally without login prompts

### Local Development Environment
The `.env.local` file contains:
```env
VITE_LOCAL_DEV=true        # Disables authentication
VITE_PORT=5173            # Development server port
VITE_HOST=localhost       # Development server host  
VITE_USE_MOCK_DATA=true   # Optional: enables mock data
```

### Base44 Client Configuration
The client automatically detects local development mode:
```javascript
const isLocalDev = import.meta.env.VITE_LOCAL_DEV === 'true' || import.meta.env.DEV;
const base44 = createClient({
  appId: "686fa7d8e321d7d8bb128dd0",
  requiresAuth: !isLocalDev  // Disabled in local mode
});
```

## Accessing the Application

1. **Start the development server**:
   ```bash
   npm run dev:local
   ```

2. **Open your browser**:
   - Navigate to `http://localhost:5173`
   - No authentication required
   - All 11 pages are accessible via sidebar navigation

3. **Available Features**:
   - ✅ Dashboard with financial overview
   - ✅ Income tracking and management
   - ✅ Expense categorization and analysis
   - ✅ Bills management and payment tracking
   - ✅ Debt portfolio and reduction strategies
   - ✅ Asset portfolio tracking
   - ✅ Budget planning and comparison
   - ✅ Credit and loan management
   - ✅ Insurance policy management
   - ✅ Account credential storage
   - ⚠️  AI features may be limited without cloud connection

## Troubleshooting

### Port Already in Use
If port 5173 is busy:
```bash
# Use a different port
VITE_PORT=3000 npm run dev:local
```

### Authentication Still Required
Ensure `.env.local` exists with:
```env
VITE_LOCAL_DEV=true
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Production vs Local Mode

| Feature | Production Mode | Local Mode |
|---------|----------------|------------|
| Authentication | Required | Disabled |
| Data Storage | Base44 Cloud | Local/Mock |
| AI Features | Full | Limited |
| All UI Features | ✅ | ✅ |
| Navigation | ✅ | ✅ |

## Reverting to Production Mode

To switch back to production mode:
1. Delete or rename `.env.local`
2. Use standard scripts: `npm run dev`, `npm run build`
3. Authentication will be required again