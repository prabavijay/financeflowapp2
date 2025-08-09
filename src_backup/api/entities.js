// Finance Flow Entity Services (Local PostgreSQL Backend)
// Replaces Base44 entities with local API calls
import { base44 } from './base44Client';

// Financial Data Entities
export const Income = base44.entities.Income;
export const Expense = base44.entities.Expense;
export const Bill = base44.entities.Bill;
export const Debt = base44.entities.Debt;
export const Asset = base44.entities.Asset;

// Credit and Insurance Entities
export const CreditCard = base44.entities.CreditCard;
export const InsurancePolicy = base44.entities.InsurancePolicy;

// Budget and Account Entities
export const BudgetItem = base44.entities.BudgetItem;
export const Budget = base44.entities.Budget;
export const Account = base44.entities.Account;

// User Authentication
export const User = base44.auth;

// Direct API client access for advanced operations
export const apiClient = base44.client;

// Entity list for reference
export const ENTITIES = [
  'Income',
  'Expense', 
  'Bill',
  'Debt',
  'Asset',
  'CreditCard',
  'InsurancePolicy',
  'BudgetItem',
  'Budget',
  'Account'
];

// Helper function to get all entity services
export const getAllEntityServices = () => ({
  Income,
  Expense,
  Bill, 
  Debt,
  Asset,
  CreditCard,
  InsurancePolicy,
  BudgetItem,
  Budget,
  Account
});

// Console info for development
if (import.meta.env.DEV) {
  console.info('✅ Finance Flow Entities: Ready for local PostgreSQL backend');
  console.info('📊 Available entities:', ENTITIES.join(', '));
}