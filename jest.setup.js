import '@testing-library/jest-dom'

// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock React Router DOM
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  }),
  useNavigate: () => jest.fn(),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}))

// Mock Next.js router (if using Next.js features)
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })
)

// Mock API client
jest.mock('./src/api/client', () => ({
  get: jest.fn(() => Promise.resolve({ success: true, data: [] })),
  post: jest.fn(() => Promise.resolve({ success: true, data: {} })),
  put: jest.fn(() => Promise.resolve({ success: true, data: {} })),
  delete: jest.fn(() => Promise.resolve({ success: true })),
}), { virtual: true })

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <div data-testid="layout-dashboard-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  TrendingDown: () => <div data-testid="trending-down-icon" />,
  Receipt: () => <div data-testid="receipt-icon" />,
  CreditCard: () => <div data-testid="credit-card-icon" />,
  Building2: () => <div data-testid="building2-icon" />,
  Calculator: () => <div data-testid="calculator-icon" />,
  Target: () => <div data-testid="target-icon" />,
  Banknote: () => <div data-testid="banknote-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  HelpCircle: () => <div data-testid="help-circle-icon" />,
  PiggyBank: () => <div data-testid="piggy-bank-icon" />,
  BarChart: () => <div data-testid="bar-chart-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Star: () => <div data-testid="star-icon" />,
  StarOff: () => <div data-testid="star-off-icon" />,
  Wallet: () => <div data-testid="wallet-icon" />,
  Award: () => <div data-testid="award-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  BarChart3: () => <div data-testid="bar-chart3-icon" />,
  Sun: () => <div data-testid="sun-icon" />,
  Moon: () => <div data-testid="moon-icon" />,
}))

// Mock Recharts
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="recharts-line-chart">{children}</div>,
  Line: () => <div data-testid="recharts-line" />,
  AreaChart: ({ children }) => <div data-testid="recharts-area-chart">{children}</div>,
  Area: () => <div data-testid="recharts-area" />,
  BarChart: ({ children }) => <div data-testid="recharts-bar-chart">{children}</div>,
  Bar: () => <div data-testid="recharts-bar" />,
  PieChart: ({ children }) => <div data-testid="recharts-pie-chart">{children}</div>,
  Pie: () => <div data-testid="recharts-pie" />,
  Cell: () => <div data-testid="recharts-cell" />,
  XAxis: () => <div data-testid="recharts-x-axis" />,
  YAxis: () => <div data-testid="recharts-y-axis" />,
  CartesianGrid: () => <div data-testid="recharts-cartesian-grid" />,
  Tooltip: () => <div data-testid="recharts-tooltip" />,
  Legend: () => <div data-testid="recharts-legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="recharts-responsive-container">{children}</div>,
}))