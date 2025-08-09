// Local API Client for Finance Flow (replaces Base44 SDK)
// This file maintains backward compatibility with existing imports
import { apiClient } from './localApiClient';

// Export the local API client as 'base44' for backward compatibility
// This allows existing code using 'base44' to work without changes
export const base44 = {
  // Authentication methods
  auth: {
    login: async (email, password) => apiClient.login(email, password),
    register: async (email, password, name) => apiClient.register(email, password, name),
    logout: async () => apiClient.logout(),
    getCurrentUser: async () => apiClient.getCurrentUser(),
    isAuthenticated: () => !!apiClient.getToken()
  },

  // Entity services - maintains Base44-like interface
  entities: {
    Income: apiClient.createEntityService('income'),
    Expense: apiClient.createEntityService('expenses'),
    Bill: apiClient.createEntityService('bills'),
    Debt: apiClient.createEntityService('debts'),
    Asset: apiClient.createEntityService('assets'),
    CreditCard: apiClient.createEntityService('creditcards'),
    InsurancePolicy: apiClient.createEntityService('insurance'),
    BudgetItem: apiClient.createEntityService('budgetitems'),
    Budget: apiClient.createEntityService('budgets'),
    Account: apiClient.createEntityService('accounts')
  },

  // Direct access to the API client for advanced use cases
  client: apiClient
};

// Check if we're in local development mode
const isLocalDev = import.meta.env.VITE_LOCAL_DEV === 'true' || import.meta.env.DEV;

// For backward compatibility - export as default
export default base44;

// Development mode info
if (isLocalDev) {
  console.info('🔄 Finance Flow: Running with local PostgreSQL backend (Base44 removed)');
}
