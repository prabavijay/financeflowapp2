-- Finance Flow Database Schema
-- PostgreSQL 17 Schema for Local Finance Management
-- Reference: ../PostgreSQL_Database_Requirements.md

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create Income table
CREATE TABLE income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly')),
    category VARCHAR(100) NOT NULL CHECK (category IN ('salary', 'freelance', 'investment', 'rental', 'business', 'other')),
    date_received DATE NOT NULL,
    description TEXT,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) NOT NULL CHECK (category IN ('housing', 'transportation', 'food', 'utilities', 'healthcare', 'entertainment', 'shopping', 'insurance', 'debt_payments', 'other')),
    date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'check')),
    is_recurring BOOLEAN DEFAULT false,
    frequency VARCHAR(50) CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Bills table
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('utilities', 'rent', 'mortgage', 'insurance', 'phone', 'internet', 'streaming', 'subscription', 'other')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    is_recurring BOOLEAN DEFAULT true,
    frequency VARCHAR(50) DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly')),
    auto_pay BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Debts table
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    balance DECIMAL(12,2) NOT NULL CHECK (balance >= 0),
    original_amount DECIMAL(12,2),
    interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate >= 0),
    minimum_payment DECIMAL(12,2) NOT NULL CHECK (minimum_payment > 0),
    due_date DATE,
    type VARCHAR(100) NOT NULL CHECK (type IN ('credit_card', 'personal_loan', 'student_loan', 'mortgage', 'auto_loan', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    value DECIMAL(15,2) NOT NULL CHECK (value >= 0),
    purchase_price DECIMAL(15,2),
    purchase_date DATE,
    category VARCHAR(100) NOT NULL CHECK (category IN ('real_estate', 'vehicle', 'investment', 'savings', 'retirement', 'other')),
    description TEXT,
    location VARCHAR(255),
    appreciation_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Credit Cards table
CREATE TABLE credit_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    credit_limit DECIMAL(12,2) NOT NULL CHECK (credit_limit > 0),
    current_balance DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (current_balance >= 0),
    apr DECIMAL(5,2) NOT NULL CHECK (apr >= 0),
    annual_fee DECIMAL(8,2) DEFAULT 0 CHECK (annual_fee >= 0),
    rewards_program VARCHAR(255),
    payment_due_date DATE,
    minimum_payment DECIMAL(12,2),
    card_type VARCHAR(50) CHECK (card_type IN ('visa', 'mastercard', 'amex', 'discover', 'other')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Insurance Policies table
CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    policy_name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100),
    type VARCHAR(100) NOT NULL CHECK (type IN ('health', 'auto', 'home', 'life', 'disability', 'travel', 'pet')),
    premium DECIMAL(12,2) NOT NULL CHECK (premium > 0),
    premium_frequency VARCHAR(50) NOT NULL CHECK (premium_frequency IN ('monthly', 'quarterly', 'semi-annual', 'annual')),
    coverage_amount DECIMAL(15,2),
    deductible DECIMAL(12,2),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Budgets table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Create Budget Items table
CREATE TABLE budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) NOT NULL,
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('weekly', 'bi-weekly', 'semi-monthly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    day_of_month_1 INTEGER CHECK (day_of_month_1 BETWEEN 1 AND 31),
    day_of_month_2 INTEGER CHECK (day_of_month_2 BETWEEN 1 AND 31),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Accounts table (for secure credential storage)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(100) NOT NULL CHECK (account_type IN ('bank', 'credit_card', 'investment', 'insurance', 'utility', 'other')),
    website_url VARCHAR(500),
    username VARCHAR(255),
    password_encrypted TEXT, -- Encrypted password storage
    account_number_encrypted TEXT, -- Encrypted account number
    email_address VARCHAR(255),
    phone_number VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
-- User-based indexes (most important for data isolation)
CREATE INDEX idx_income_user_id ON income(user_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_bills_user_id ON bills(user_id);
CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX idx_insurance_policies_user_id ON insurance_policies(user_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budget_items_user_id ON budget_items(user_id);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- Date-based indexes for time-series queries
CREATE INDEX idx_income_date ON income(date_received);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_bills_due_date ON bills(due_date);
CREATE INDEX idx_debts_due_date ON debts(due_date);

-- Category-based indexes for filtering
CREATE INDEX idx_income_category ON income(category);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_bills_category ON bills(category);
CREATE INDEX idx_debts_type ON debts(type);
CREATE INDEX idx_assets_category ON assets(category);

-- Status and priority indexes
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_debts_priority ON debts(priority);
CREATE INDEX idx_credit_cards_active ON credit_cards(is_active);
CREATE INDEX idx_insurance_policies_active ON insurance_policies(is_active);
CREATE INDEX idx_accounts_active ON accounts(is_active);

-- Composite indexes for common queries
CREATE INDEX idx_budget_items_budget_type ON budget_items(budget_id, type);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX idx_income_user_date ON income(user_id, date_received);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_income_updated_at BEFORE UPDATE ON income FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON credit_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_policies_updated_at BEFORE UPDATE ON insurance_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a test user (for development)
INSERT INTO users (email, password_hash, name) 
VALUES ('test@financeflow.local', '$2b$10$example.hash.replace.with.real.bcrypt.hash', 'Test User')
ON CONFLICT (email) DO NOTHING;