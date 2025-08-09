# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinanceFlow is a comprehensive personal finance management application built with React and Vite. It provides centralized tracking and management of income, expenses, bills, debts, assets, insurance policies, and financial accounts with AI-powered insights and recommendations. The application uses the Base44 platform for backend services and data persistence.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`  
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`
- **Install dependencies**: `npm install`

## Local Development Setup (Without Base44 Authentication)

### Running Locally Without Online Authentication

To run the application locally without Base44 authentication redirects:

1. **Disable Authentication in Base44 Client**:
   - Edit `src/api/base44Client.js`
   - Change `requiresAuth: true` to `requiresAuth: false`

2. **Mock Authentication State**:
   - The Base44 SDK will run in local mode without authentication
   - All entity operations will work with local/mock data
   - AI features may be limited without the InvokeLLM service

3. **Start Development Server**:
   ```bash
   npm install
   npm run dev
   ```
   - Application will be available at `http://localhost:5173`
   - No login/authentication prompts will appear
   - All navigation and UI features will work normally

### Authentication Configuration Options

**Current Configuration** (`src/api/base44Client.js`):
```javascript
export const base44 = createClient({
  appId: "686fa7d8e321d7d8bb128dd0", 
  requiresAuth: true // Change to false for local development
});
```

**For Local Development**:
```javascript
export const base44 = createClient({
  appId: "686fa7d8e321d7d8bb128dd0", 
  requiresAuth: false // Disables authentication redirects
});
```

### Entity Access in Local Mode

With `requiresAuth: false`, all entities remain accessible:
- `Income`, `Expense`, `Bill`, `Debt`, `Asset`
- `CreditCard`, `InsurancePolicy`, `BudgetItem`, `Budget`, `Account`
- Data will be stored locally or in mock state rather than Base44 cloud

## Architecture

### Core Structure
- **Entry point**: `src/main.jsx` renders the App component
- **App component**: `src/App.jsx` includes the main Pages component and Toaster
- **Routing**: `src/pages/index.jsx` handles all route definitions and page mapping
- **Layout**: `src/pages/Layout.jsx` provides sidebar navigation with dark gradient styling

### Key Directories
- `src/pages/` - 11 main application pages (Dashboard, Income, Expenses, Bills, Debts, Assets, Budget, DebtReduction, CreditLoans, Insurance, Accounts)
- `src/components/ui/` - Reusable UI components built with Radix UI primitives and Shadcn/ui
- `src/api/` - Base44 API client configuration and entity definitions
- `src/utils/` - Utility functions including page URL creation helpers
- `src/hooks/` - Custom React hooks (currently use-mobile.jsx)

### Technology Stack
- **Frontend**: React 18 with functional components and hooks
- **Build Tool**: Vite with React plugin
- **Routing**: React Router DOM v7
- **UI Framework**: Tailwind CSS with custom gradients and animations
- **Component Library**: Radix UI primitives with Shadcn/ui styling system
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for financial data visualization
- **Icons**: Lucide React icon library
- **Date Handling**: Date-fns for date manipulation
- **Backend**: Base44 platform with SDK integration
- **AI Features**: InvokeLLM service for financial analysis and recommendations

### Base44 Integration
The application is built on the Base44 platform:
- **Client Configuration**: `src/api/base44Client.js` with configurable authentication
- **App ID**: `686fa7d8e321d7d8bb128dd0`
- **SDK Version**: `@base44/sdk ^0.1.2`
- **Authentication**: Configurable via `requiresAuth` parameter
- **Data Persistence**: Entity management through Base44 platform (cloud or local)
- **AI Integration**: LLM-powered financial insights and debt reduction strategies

### Application Features (Per Specification)

**Core Financial Modules:**
- **Dashboard**: Financial overview cards, AI insights, expense breakdown charts, upcoming bills, key metrics visualization
- **Income Management**: Multi-category income tracking (salary, freelance, investment, rental, business) with recurring income support
- **Expense Tracking**: Comprehensive categorization, payment method tracking, recurring expense management
- **Bills Management**: Due date tracking, payment status, auto-pay indicators, overdue bill alerts
- **Debt Portfolio**: Multi-debt tracking with interest rates, minimum payments, payoff calculations, priority management
- **Asset Portfolio**: Real estate, vehicles, investments tracking with appreciation analysis
- **Budget System**: Flexible frequency support (weekly to yearly), actual vs budget comparison, calendar view
- **Debt Reduction**: AI-powered strategies (snowball vs avalanche), payment recommendations, interest savings calculator
- **Credit & Loans**: Credit card management, utilization tracking, rewards programs, credit profile analysis
- **Insurance**: Policy management with coverage analysis, premium tracking, expiration alerts
- **Accounts**: Secure credential storage with masked display, password visibility controls

**Data Models (10 Main Entities):**
- Income, Expense, Bill, Debt, Asset, CreditCard, InsurancePolicy, BudgetItem, Budget, Account

### Navigation Structure
The app features a responsive sidebar with 11 main sections:
- Dashboard (overview with AI insights)
- Income (earnings tracking)
- Expenses (spending monitoring)
- Bills (payment management)
- Debts (debt portfolio)
- Assets (asset tracking)
- Budget (financial planning)
- Debt Reduction (AI strategies)
- Credit & Loans (credit management)
- Insurance (policy tracking)
- Accounts (credential storage)

### Styling System
- **CSS Framework**: Tailwind CSS with custom configuration
- **UI Components**: Shadcn/ui component library for consistent design
- **Custom Styling**: CSS-in-JS for complex gradient effects in Layout component
- **Theme Variables**: CSS custom properties for gradients and glow effects
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Color Scheme**: Dark sidebar with blue/purple gradient backgrounds

### Path Resolution & Configuration
- **Import Alias**: `@/` points to `src/` directory (configured in vite.config.js)
- **File Extensions**: Supports .mjs, .js, .jsx, .ts, .tsx, .json
- **Build Optimization**: ESBuild loader configured for JSX in .js files

### Implementation Status
According to the specification, all 69 features are marked as "Implemented", covering 10 data entities across 11 application pages. However, actual implementation may vary from specification - always verify feature availability in the codebase before making assumptions.

## Development Notes

### File Naming Conventions
- React components: PascalCase (e.g., `Dashboard.jsx`)
- Utility files: camelCase (e.g., `base44Client.js`)
- UI components: kebab-case (e.g., `alert-dialog.jsx`)

### Security Considerations
- User-based data isolation through Base44 authentication (when enabled)
- Secure credential storage with masked display in Accounts module
- Password visibility controls and copy-to-clipboard functionality
- No sensitive data should be logged or exposed in client-side code

### AI Integration
The application leverages AI through the Base44 platform's InvokeLLM service for:
- Financial analysis and insights on the Dashboard
- Debt reduction strategy recommendations
- Credit profile analysis and improvement tips
- Insurance coverage gap analysis

**Note**: AI features may be limited when running in local mode without authentication.

## Quick Start for Local Development

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Disable authentication for local development
# Edit src/api/base44Client.js and set requiresAuth: false

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:5173
```

The application will run with full UI functionality. Data operations will work through the Base44 SDK in local mode when authentication is disabled.