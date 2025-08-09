# Finance Flow - Personal Finance Manager

A comprehensive personal finance management application with local PostgreSQL backend. Track, analyze, and optimize your financial health with complete data privacy.

## 🚀 Quick Start (One Command)

### Start Complete App:
```bash
./start-finance-flow.sh
```

### Alternative using npm:
```bash
npm start              # Same as ./start-finance-flow.sh
npm run start-app      # Same as ./start-finance-flow.sh
```

## 📋 What the Script Does

The single script handles everything automatically:
- ✅ Checks system requirements (Node.js, PostgreSQL)
- ✅ Installs all dependencies (frontend + backend)
- ✅ Sets up PostgreSQL database with complete schema
- ✅ Starts backend server (Node.js + Express) on port 3001
- ✅ Starts frontend server (React + Vite) on port 5173
- ✅ Connects both servers with proper CORS configuration
- ✅ Opens app at `http://localhost:5173`

## 🌟 Features Available Locally

- **📊 Dashboard** - Financial overview with AI insights
- **💰 Income Tracking** - Multi-source income management
- **💸 Expense Management** - Categorized spending analysis  
- **🧾 Bills Management** - Payment tracking and reminders
- **💳 Debt Portfolio** - Debt reduction strategies
- **🏠 Asset Tracking** - Portfolio performance monitoring
- **📅 Budget Planning** - Flexible budgeting system
- **🔐 Account Management** - Secure credential storage
- **📊 Analytics** - Charts and financial insights
- **🎯 AI Recommendations** - Smart financial advice

## 🔧 Manual Setup (if needed)

```bash
# Install dependencies
npm install

# Start in local mode (no authentication)
npm run dev:local

# Or standard development mode
npm run dev

# Build for production
npm run build
```

## 🌐 Access URLs

- **Local Development**: http://localhost:5173
- **Network Access**: Available on your local network
- **No Authentication Required** in local mode

## 🛠 Available Scripts

| Command | Description |
|---------|-------------|
| `./run-app.sh` | **One-click setup and start** |
| `npm run dev:local` | Start with local config |
| `npm start` | Alias for local development |
| `npm run build:local` | Build with local settings |
| `npm run lint` | Check code quality |

## 🔒 Authentication Modes

- **Local Mode**: No authentication required (default for development)
- **Production Mode**: Base44 authentication enabled

## 📁 Project Structure

```
src/
├── pages/           # 11 main application pages
├── components/ui/   # Reusable UI components  
├── api/            # Base44 client and entities
├── hooks/          # Custom React hooks
└── utils/          # Utility functions
```

## 🎯 Technology Stack

- **Frontend**: React 18 + Vite
- **UI**: Tailwind CSS + Shadcn/ui + Radix UI
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Backend**: Base44 Platform
- **AI**: InvokeLLM Service

## 📞 Support

For technical issues or questions:
- Check `LOCAL_SETUP.md` for detailed setup instructions
- Review `CLAUDE.md` for development guidance
- Contact Base44 support at app@base44.com