// Finance Flow API Client - Clean PostgreSQL Backend Connection
// Connects to Node.js + Express + PostgreSQL backend on port 3001

const API_BASE_URL = 'http://localhost:3001'

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        // Try to get error details from response body
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          }
          if (errorData.errors) {
            errorMessage += '. Validation errors: ' + JSON.stringify(errorData.errors)
          }
        } catch (e) {
          // If we can't parse JSON, use the default error message
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: 'GET' })
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  // Backend Health Check
  async health() {
    return this.get('/health')
  }

  async status() {
    return this.get('/api/status')
  }

  // Income Operations
  async getIncome(params = {}) {
    return this.get('/api/income', params)
  }

  async createIncome(incomeData) {
    return this.post('/api/income', incomeData)
  }

  async updateIncome(id, incomeData) {
    return this.put(`/api/income/${id}`, incomeData)
  }

  async deleteIncome(id) {
    return this.delete(`/api/income/${id}`)
  }

  async getIncomeAnalytics(params = {}) {
    return this.get('/api/income/analytics', params)
  }

  // Expense Operations
  async getExpenses(params = {}) {
    return this.get('/api/expenses', params)
  }

  async createExpense(expenseData) {
    return this.post('/api/expenses', expenseData)
  }

  async updateExpense(id, expenseData) {
    return this.put(`/api/expenses/${id}`, expenseData)
  }

  async deleteExpense(id) {
    return this.delete(`/api/expenses/${id}`)
  }

  async getExpenseAnalytics(params = {}) {
    return this.get('/api/expenses/analytics', params)
  }

  // Bills Operations
  async getBills(params = {}) {
    return this.get('/api/bills', params)
  }

  async createBill(billData) {
    return this.post('/api/bills', billData)
  }

  async updateBill(id, billData) {
    return this.put(`/api/bills/${id}`, billData)
  }

  async deleteBill(id) {
    return this.delete(`/api/bills/${id}`)
  }

  async payBill(id, paymentData) {
    return this.post(`/api/bills/${id}/pay`, paymentData)
  }

  async getUpcomingBills(params = {}) {
    return this.get('/api/bills/upcoming', params)
  }

  async getBillAnalytics(params = {}) {
    return this.get('/api/bills/analytics', params)
  }

  // Debts Operations
  async getDebts(params = {}) {
    return this.get('/api/debts', params)
  }

  async createDebt(debtData) {
    return this.post('/api/debts', debtData)
  }

  async updateDebt(id, debtData) {
    return this.put(`/api/debts/${id}`, debtData)
  }

  async deleteDebt(id) {
    return this.delete(`/api/debts/${id}`)
  }

  async makeDebtPayment(id, paymentData) {
    return this.post(`/api/debts/${id}/payment`, paymentData)
  }

  async getDebtAnalytics(params = {}) {
    return this.get('/api/debts/analytics', params)
  }

  // Assets Operations
  async getAssets(params = {}) {
    return this.get('/api/assets', params)
  }

  async createAsset(assetData) {
    return this.post('/api/assets', assetData)
  }

  async updateAsset(id, assetData) {
    return this.put(`/api/assets/${id}`, assetData)
  }

  async deleteAsset(id) {
    return this.delete(`/api/assets/${id}`)
  }

  async getAssetAnalytics(params = {}) {
    return this.get('/api/assets/analytics', params)
  }

  // Budget Operations
  async getBudgets(params = {}) {
    return this.get('/api/budgets', params)
  }

  async getBudget(id, params = {}) {
    return this.get(`/api/budgets/${id}`, params)
  }

  async createBudget(budgetData) {
    return this.post('/api/budgets', budgetData)
  }

  async addBudgetItem(budgetId, itemData) {
    return this.post(`/api/budgets/${budgetId}/items`, itemData)
  }

  async deleteBudgetItem(itemId) {
    return this.delete(`/api/budgets/items/${itemId}`)
  }

  async getBudgetComparison(budgetId, month, year) {
    return this.get(`/api/budgets/${budgetId}/comparison/${month}/${year}`)
  }

  // Credit Products Operations (Credit Cards, Loans, Mortgages)
  async getCreditProducts(params = {}) {
    return this.get('/api/credit', params)
  }

  async getCreditProduct(id) {
    return this.get(`/api/credit/${id}`)
  }

  async createCreditProduct(creditData) {
    return this.post('/api/credit', creditData)
  }

  async updateCreditProduct(id, creditData) {
    return this.put(`/api/credit/${id}`, creditData)
  }

  async deleteCreditProduct(id) {
    return this.delete(`/api/credit/${id}`)
  }

  async makeCreditPayment(id, paymentData) {
    return this.post(`/api/credit/${id}/payment`, paymentData)
  }

  async getCreditAnalytics() {
    return this.get('/api/credit/analytics/summary')
  }

  // Insurance Operations
  async getInsurancePolicies(params = {}) {
    return this.get('/api/insurance', params)
  }

  async getInsurancePolicy(id) {
    return this.get(`/api/insurance/${id}`)
  }

  async createInsurancePolicy(policyData) {
    return this.post('/api/insurance', policyData)
  }

  async updateInsurancePolicy(id, policyData) {
    return this.put(`/api/insurance/${id}`, policyData)
  }

  async deleteInsurancePolicy(id) {
    return this.delete(`/api/insurance/${id}`)
  }

  async getInsuranceAnalytics() {
    return this.get('/api/insurance/analytics/summary')
  }

  async getExpiringPolicies(days = 30) {
    return this.get(`/api/insurance/expiring/${days}`)
  }

  // Accounts Operations (Secure Credential Management)
  async getAccounts(params = {}) {
    return this.get('/api/accounts', params)
  }

  async getAccount(id) {
    return this.get(`/api/accounts/${id}`)
  }

  async getAccountPassword(id) {
    return this.get(`/api/accounts/${id}/password`)
  }

  async createAccount(accountData) {
    return this.post('/api/accounts', accountData)
  }

  async updateAccount(id, accountData) {
    return this.put(`/api/accounts/${id}`, accountData)
  }

  async deleteAccount(id) {
    return this.delete(`/api/accounts/${id}`)
  }

  async getAccountsAnalytics() {
    return this.get('/api/accounts/analytics/summary')
  }

  async getPasswordHealth() {
    return this.get('/api/accounts/password-health')
  }

  // Subscription Operations
  async getSubscriptions(params = {}) {
    return this.get('/api/subscriptions', params)
  }

  async getSubscription(id) {
    return this.get(`/api/subscriptions/${id}`)
  }

  async createSubscription(subscriptionData) {
    return this.post('/api/subscriptions', subscriptionData)
  }

  async updateSubscription(id, subscriptionData) {
    return this.put(`/api/subscriptions/${id}`, subscriptionData)
  }

  async deleteSubscription(id) {
    return this.delete(`/api/subscriptions/${id}`)
  }

  async detectSubscriptions() {
    return this.post('/api/subscriptions/detect')
  }

  async getSubscriptionAnalytics(params = {}) {
    return this.get('/api/subscriptions/analytics', params)
  }

  async getSubscriptionCategories() {
    return this.get('/api/subscriptions/categories')
  }

  async getUpcomingSubscriptions(days = 7) {
    return this.get(`/api/subscriptions/upcoming/${days}`)
  }

  async cancelSubscription(id, cancellationData) {
    return this.post(`/api/subscriptions/${id}/cancel`, cancellationData)
  }

  // Travel Budget Operations
  async getTravelBudgets(params = {}) {
    return this.get('/api/travel-budgets', params)
  }

  async getTravelBudget(id) {
    return this.get(`/api/travel-budgets/${id}`)
  }

  async createTravelBudget(budgetData) {
    return this.post('/api/travel-budgets', budgetData)
  }

  async updateTravelBudget(id, budgetData) {
    return this.put(`/api/travel-budgets/${id}`, budgetData)
  }

  async deleteTravelBudget(id) {
    return this.delete(`/api/travel-budgets/${id}`)
  }

  async getTravelExpenses(budgetId) {
    return this.get(`/api/travel-budgets/${budgetId}/expenses`)
  }

  async createTravelExpense(budgetId, expenseData) {
    return this.post(`/api/travel-budgets/${budgetId}/expenses`, expenseData)
  }

  async updateTravelExpense(expenseId, expenseData) {
    return this.put(`/api/travel-expenses/${expenseId}`, expenseData)
  }

  async deleteTravelExpense(expenseId) {
    return this.delete(`/api/travel-expenses/${expenseId}`)
  }

  async getTravelCategories() {
    return this.get('/api/travel-categories')
  }

  async getTravelBudgetAnalytics(budgetId) {
    return this.get(`/api/travel-budgets/${budgetId}/analytics`)
  }

  async getExchangeRates(baseCurrency = 'USD') {
    return this.get(`/api/currency/rates/${baseCurrency}`)
  }

  async convertCurrency(amount, fromCurrency, toCurrency) {
    return this.post('/api/currency/convert', { amount, fromCurrency, toCurrency })
  }

  // Fee Tracker Operations
  async getFees(params = {}) {
    return this.get('/api/fees', params)
  }

  async getFee(id) {
    return this.get(`/api/fees/${id}`)
  }

  async createFee(feeData) {
    return this.post('/api/fees', feeData)
  }

  async updateFee(id, feeData) {
    return this.put(`/api/fees/${id}`, feeData)
  }

  async deleteFee(id) {
    return this.delete(`/api/fees/${id}`)
  }

  async detectFees() {
    return this.post('/api/fees/detect')
  }

  async getFeeAnalytics(params = {}) {
    return this.get('/api/fees/analytics', params)
  }

  async getFeeCategories() {
    return this.get('/api/fees/categories')
  }

  async getFeeRecommendations() {
    return this.get('/api/fees/recommendations')
  }

  async disputeFee(id, disputeData) {
    return this.post(`/api/fees/${id}/dispute`, disputeData)
  }

  async getFeesByInstitution(institution) {
    return this.get(`/api/fees/institution/${encodeURIComponent(institution)}`)
  }

  async getFeesByCategory(categoryType) {
    return this.get(`/api/fees/category/${categoryType}`)
  }

  // Loan Comparison Operations
  async getLoanProducts(params = {}) {
    return this.get('/api/loans/products', params)
  }

  async getLoanProduct(id) {
    return this.get(`/api/loans/products/${id}`)
  }

  async createLoanProduct(productData) {
    return this.post('/api/loans/products', productData)
  }

  async updateLoanProduct(id, productData) {
    return this.put(`/api/loans/products/${id}`, productData)
  }

  async deleteLoanProduct(id) {
    return this.delete(`/api/loans/products/${id}`)
  }

  async getLoanComparisons(params = {}) {
    return this.get('/api/loans/comparisons', params)
  }

  async getLoanComparison(id) {
    return this.get(`/api/loans/comparisons/${id}`)
  }

  async createLoanComparison(comparisonData) {
    return this.post('/api/loans/comparisons', comparisonData)
  }

  async updateLoanComparison(id, comparisonData) {
    return this.put(`/api/loans/comparisons/${id}`, comparisonData)
  }

  async deleteLoanComparison(id) {
    return this.delete(`/api/loans/comparisons/${id}`)
  }

  async calculateLoanPayment(loanData) {
    return this.post('/api/loans/calculate', loanData)
  }

  async compareLoanProducts(comparisonParams) {
    return this.post('/api/loans/compare', comparisonParams)
  }

  async getLoanRates(loanType) {
    return this.get(`/api/loans/rates/${loanType}`)
  }

  async calculateAffordability(affordabilityData) {
    return this.post('/api/loans/affordability', affordabilityData)
  }

  async generateAmortizationSchedule(scheduleData) {
    return this.post('/api/loans/amortization', scheduleData)
  }

  async calculateRefinancing(refinanceData) {
    return this.post('/api/loans/refinance', refinanceData)
  }

  async getLoanQualification(qualificationData) {
    return this.post('/api/loans/qualification', qualificationData)
  }

  // Document Vault Operations
  async getDocuments(params = {}) {
    return this.get('/api/documents', params)
  }

  async getDocument(id) {
    return this.get(`/api/documents/${id}`)
  }

  async uploadDocument(formData) {
    return this.request('/api/documents/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    })
  }

  async updateDocument(id, documentData) {
    return this.put(`/api/documents/${id}`, documentData)
  }

  async deleteDocument(id) {
    return this.delete(`/api/documents/${id}`)
  }

  async downloadDocument(id, token = null) {
    const url = token ? `/api/documents/${id}/download?token=${token}` : `/api/documents/${id}/download`
    return this.get(url)
  }

  async previewDocument(id) {
    return this.get(`/api/documents/${id}/preview`)
  }

  async shareDocument(id, shareData) {
    return this.post(`/api/documents/${id}/share`, shareData)
  }

  async getDocumentCategories() {
    return this.get('/api/documents/categories')
  }

  async createDocumentCategory(categoryData) {
    return this.post('/api/documents/categories', categoryData)
  }

  async searchDocuments(query, filters = {}) {
    return this.get('/api/documents/search', { q: query, ...filters })
  }

  async getDocumentsByCategory(categoryId, params = {}) {
    return this.get(`/api/documents/category/${categoryId}`, params)
  }

  async getDocumentsByDateRange(startDate, endDate, params = {}) {
    return this.get('/api/documents/date-range', { 
      start: startDate, 
      end: endDate, 
      ...params 
    })
  }

  async getDocumentAnalytics(params = {}) {
    return this.get('/api/documents/analytics', params)
  }

  async getDocumentAccessLog(documentId) {
    return this.get(`/api/documents/${documentId}/access-log`)
  }

  async archiveDocument(id, archiveData) {
    return this.post(`/api/documents/${id}/archive`, archiveData)
  }

  async restoreDocument(id) {
    return this.post(`/api/documents/${id}/restore`)
  }

  async getArchivedDocuments(params = {}) {
    return this.get('/api/documents/archived', params)
  }

  async processDocumentOCR(id) {
    return this.post(`/api/documents/${id}/ocr`)
  }

  async getDocumentThumbnail(id, size = 'medium') {
    return this.get(`/api/documents/${id}/thumbnail`, { size })
  }

  async bulkUploadDocuments(formData) {
    return this.request('/api/documents/bulk-upload', {
      method: 'POST',
      body: formData,
      headers: {}
    })
  }

  async getDocumentRetentionReport() {
    return this.get('/api/documents/retention-report')
  }

  // Receipt Scanner Operations
  async getReceipts(params = {}) {
    return this.get('/api/receipts', params)
  }

  async getReceipt(id) {
    return this.get(`/api/receipts/${id}`)
  }

  async createReceipt(receiptData) {
    return this.post('/api/receipts', receiptData)
  }

  async updateReceipt(id, receiptData) {
    return this.put(`/api/receipts/${id}`, receiptData)
  }

  async deleteReceipt(id) {
    return this.delete(`/api/receipts/${id}`)
  }

  async uploadReceiptImage(formData) {
    return this.request('/api/receipts/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    })
  }

  async processReceiptOCR(id) {
    return this.post(`/api/receipts/${id}/process`)
  }

  async verifyReceipt(id, verificationData) {
    return this.put(`/api/receipts/${id}/verify`, verificationData)
  }

  async convertReceiptToExpense(id, expenseData) {
    return this.post(`/api/receipts/${id}/convert-to-expense`, expenseData)
  }

  async getReceiptLineItems(receiptId) {
    return this.get(`/api/receipts/${receiptId}/line-items`)
  }

  async createReceiptLineItem(receiptId, lineItemData) {
    return this.post(`/api/receipts/${receiptId}/line-items`, lineItemData)
  }

  async updateReceiptLineItem(lineItemId, lineItemData) {
    return this.put(`/api/receipt-line-items/${lineItemId}`, lineItemData)
  }

  async deleteReceiptLineItem(lineItemId) {
    return this.delete(`/api/receipt-line-items/${lineItemId}`)
  }

  async getReceiptAnalytics(params = {}) {
    return this.get('/api/receipts/analytics', params)
  }

  async searchReceipts(query, filters = {}) {
    return this.get('/api/receipts/search', { q: query, ...filters })
  }

  async getReceiptsByMerchant(merchant, params = {}) {
    return this.get(`/api/receipts/merchant/${encodeURIComponent(merchant)}`, params)
  }

  async getReceiptsByCategory(category, params = {}) {
    return this.get(`/api/receipts/category/${category}`, params)
  }

  async getReceiptsByDateRange(startDate, endDate, params = {}) {
    return this.get('/api/receipts/date-range', { 
      start: startDate, 
      end: endDate, 
      ...params 
    })
  }

  async duplicateReceiptCheck(receiptData) {
    return this.post('/api/receipts/duplicate-check', receiptData)
  }

  async getReceiptOCRLog(receiptId) {
    return this.get(`/api/receipts/${receiptId}/ocr-log`)
  }

  async retryReceiptProcessing(id, provider = null) {
    return this.post(`/api/receipts/${id}/retry`, provider ? { provider } : {})
  }

  async batchProcessReceipts(receiptIds) {
    return this.post('/api/receipts/batch-process', { receipt_ids: receiptIds })
  }

  async getReceiptProcessingStatus(id) {
    return this.get(`/api/receipts/${id}/status`)
  }

  // Email Receipt Processing Operations
  async getEmailAccounts(params = {}) {
    return this.get('/api/email-accounts', params)
  }

  async getEmailAccount(id) {
    return this.get(`/api/email-accounts/${id}`)
  }

  async createEmailAccount(accountData) {
    return this.post('/api/email-accounts', accountData)
  }

  async updateEmailAccount(id, accountData) {
    return this.put(`/api/email-accounts/${id}`, accountData)
  }

  async deleteEmailAccount(id) {
    return this.delete(`/api/email-accounts/${id}`)
  }

  async testEmailConnection(id) {
    return this.post(`/api/email-accounts/${id}/test`)
  }

  async syncEmailAccount(id) {
    return this.post(`/api/email-accounts/${id}/sync`)
  }

  async processEmailAccount(id) {
    return this.post(`/api/email-accounts/${id}/process`)
  }

  async getEmailReceipts(params = {}) {
    return this.get('/api/email-receipts', params)
  }

  async getEmailReceipt(id) {
    return this.get(`/api/email-receipts/${id}`)
  }

  async createEmailReceipt(receiptData) {
    return this.post('/api/email-receipts', receiptData)
  }

  async updateEmailReceipt(id, receiptData) {
    return this.put(`/api/email-receipts/${id}`, receiptData)
  }

  async deleteEmailReceipt(id) {
    return this.delete(`/api/email-receipts/${id}`)
  }

  async processEmailReceipt(id) {
    return this.post(`/api/email-receipts/${id}/process`)
  }

  async convertEmailReceiptToReceipt(id, conversionData) {
    return this.post(`/api/email-receipts/${id}/convert`, conversionData)
  }

  async markEmailReceiptAsSpam(id) {
    return this.post(`/api/email-receipts/${id}/spam`)
  }

  async getEmailRules(params = {}) {
    return this.get('/api/email-rules', params)
  }

  async getEmailRule(id) {
    return this.get(`/api/email-rules/${id}`)
  }

  async createEmailRule(ruleData) {
    return this.post('/api/email-rules', ruleData)
  }

  async updateEmailRule(id, ruleData) {
    return this.put(`/api/email-rules/${id}`, ruleData)
  }

  async deleteEmailRule(id) {
    return this.delete(`/api/email-rules/${id}`)
  }

  async testEmailRule(id, testData) {
    return this.post(`/api/email-rules/${id}/test`, testData)
  }

  async getEmailRuleMatches(id, params = {}) {
    return this.get(`/api/email-rules/${id}/matches`, params)
  }

  async batchProcessEmails(processingData) {
    return this.post('/api/email-receipts/batch-process', processingData)
  }

  async getEmailProcessingQueue(params = {}) {
    return this.get('/api/email-processing/queue', params)
  }

  async getEmailProcessingStats(params = {}) {
    return this.get('/api/email-processing/stats', params)
  }

  async searchEmailReceipts(query, filters = {}) {
    return this.get('/api/email-receipts/search', { q: query, ...filters })
  }

  async getEmailReceiptsByAccount(accountId, params = {}) {
    return this.get(`/api/email-accounts/${accountId}/receipts`, params)
  }

  async getEmailReceiptsByDateRange(startDate, endDate, params = {}) {
    return this.get('/api/email-receipts/date-range', { 
      start: startDate, 
      end: endDate, 
      ...params 
    })
  }

  async getEmailReceiptsByMerchant(merchant, params = {}) {
    return this.get(`/api/email-receipts/merchant/${encodeURIComponent(merchant)}`, params)
  }

  async getEmailReceiptAnalytics(params = {}) {
    return this.get('/api/email-receipts/analytics', params)
  }

  async exportEmailReceipts(exportParams) {
    return this.post('/api/email-receipts/export', exportParams)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient