

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  CreditCard, 
  PiggyBank, 
  Target, 
  Shield,
  Briefcase,
  Menu,
  X,
  FileText,
  Key // New Icon for Accounts
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    description: "Overview & Insights"
  },
  {
    title: "Income",
    url: createPageUrl("Income"),
    icon: TrendingUp,
    description: "Track earnings"
  },
  {
    title: "Expenses",
    url: createPageUrl("Expenses"),
    icon: TrendingDown,
    description: "Monitor spending"
  },
  {
    title: "Bills",
    url: createPageUrl("Bills"),
    icon: Receipt,
    description: "Payment tracking"
  },
  {
    title: "Debts",
    url: createPageUrl("Debts"),
    icon: CreditCard,
    description: "Debt management"
  },
  {
    title: "Assets",
    url: createPageUrl("Assets"),
    icon: PiggyBank,
    description: "Asset portfolio"
  },
  {
    title: "Budget",
    url: createPageUrl("Budget"),
    icon: FileText,
    description: "Plan your finances"
  },
  {
    title: "Debt Reduction",
    url: createPageUrl("DebtReduction"),
    icon: Target,
    description: "AI-powered strategies"
  },
  {
    title: "Credit & Loans",
    url: createPageUrl("CreditLoans"),
    icon: Briefcase,
    description: "Compare & profile"
  },
  {
    title: "Insurance",
    url: createPageUrl("Insurance"),
    icon: Shield,
    description: "Policy management"
  },
  {
    title: "Accounts",
    url: createPageUrl("Accounts"),
    icon: Key,
    description: "Credential manager"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <style>
        {`
          :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --dark-gradient: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            --glow-primary: 0 0 20px rgba(102, 126, 234, 0.4);
            --glow-accent: 0 0 20px rgba(79, 172, 254, 0.4);
          }
          
          .sidebar-gradient {
            background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            position: relative;
            overflow: hidden;
          }
          
          .sidebar-gradient::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(79, 172, 254, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%);
            pointer-events: none;
          }
          
          .nav-item {
            position: relative;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .nav-item:hover {
            transform: translateX(8px);
            box-shadow: var(--glow-accent);
          }
          
          .nav-item.active {
            background: linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%);
            box-shadow: var(--glow-primary);
            border-left: 4px solid #4facfe;
          }
          
          .nav-item.active::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, rgba(79, 172, 254, 0.1) 0%, transparent 100%);
            pointer-events: none;
          }
          
          .logo-glow {
            filter: drop-shadow(0 0 10px rgba(79, 172, 254, 0.5));
          }
          
          @media (max-width: 768px) {
            .nav-item:hover {
              transform: none;
            }
          }
        `}
      </style>
      
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-80 md:flex-col">
          <div className="flex flex-col h-full sidebar-gradient">
            {/* Logo Section */}
            <div className="p-8 border-b border-gray-700/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center logo-glow">
                  <PiggyBank className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">FinanceFlow</h1>
                  <p className="text-blue-200/80 text-sm font-medium">Personal Finance Manager</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`nav-item flex items-center gap-4 px-6 py-4 rounded-xl text-gray-200 hover:text-white transition-all duration-300 ${
                    location.pathname === item.url ? 'active text-white' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{item.title}</div>
                    <div className="text-xs text-gray-400 truncate">{item.description}</div>
                  </div>
                </Link>
              ))}
            </nav>

            {/* User Section */}
            <div className="p-6 border-t border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm">Your Account</div>
                  <div className="text-gray-400 text-xs">Manage finances</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative flex flex-col w-80 max-w-xs sidebar-gradient">
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center logo-glow">
                    <PiggyBank className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">FinanceFlow</h1>
                    <p className="text-blue-200/80 text-xs">Personal Finance Manager</p>
                  </div>
                </div>
              </div>
              
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-gray-200 hover:text-white transition-all duration-300 ${
                      location.pathname === item.url ? 'active text-white' : ''
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-gray-400 truncate">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

