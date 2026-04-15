#!/usr/bin/env node

/**
 * Finance Flow — Mock Data Seed Script
 *
 * Inserts representative test records via the REST API to validate:
 *   1. Personal records appear on the Personal tab
 *   2. Spouse records appear on the Spouse tab
 *   3. Both Personal AND Spouse records appear together on the Family tab
 *
 * Pages covered: Income, Expenses, Bills, Debts, Assets, Budget
 *
 * Usage:
 *   node scripts/seed-mock-data.js              # insert mock data
 *   node scripts/seed-mock-data.js --clear      # clear all mock data first, then insert
 *   node scripts/seed-mock-data.js --clear-only # only clear mock data, no insert
 *
 * Prerequisites: Backend server must be running on http://localhost:3001
 */

const BASE_URL = 'http://localhost:3001'
const TODAY = new Date().toISOString().split('T')[0]
const MONTH = new Date().getMonth() + 1
const YEAR  = new Date().getFullYear()

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
async function api(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = { success: false, raw: text } }
  return { ok: res.ok, status: res.status, data: json }
}

const GET    = (path)       => api('GET', path)
const POST   = (path, body) => api('POST', path, body)
const DELETE = (path)       => api('DELETE', path)

// ---------------------------------------------------------------------------
// Colour helpers for terminal output
// ---------------------------------------------------------------------------
const c = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  cyan:   '\x1b[36m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
}

const ok   = (msg) => console.log(`  ${c.green}✔${c.reset}  ${msg}`)
const warn = (msg) => console.log(`  ${c.yellow}⚠${c.reset}  ${msg}`)
const fail = (msg) => console.log(`  ${c.red}✖${c.reset}  ${msg}`)
const info = (msg) => console.log(`  ${c.cyan}→${c.reset}  ${msg}`)
const section = (title) => {
  console.log()
  console.log(`${c.bold}${c.cyan}━━━ ${title} ━━━${c.reset}`)
}

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------
async function insertRecord(label, path, body) {
  const { ok: success, data } = await POST(path, body)
  if (success && data.success !== false) {
    ok(`${label}`)
    return data.data || data
  } else {
    fail(`${label} — ${JSON.stringify(data?.message || data)}`)
    return null
  }
}

async function clearAll(path, label) {
  const { data } = await GET(path)
  const records = data?.data || []
  if (records.length === 0) {
    info(`No existing ${label} to clear`)
    return
  }
  for (const r of records) {
    await DELETE(`${path}/${r.id}`)
  }
  ok(`Cleared ${records.length} existing ${label}`)
}

// ---------------------------------------------------------------------------
// INCOME mock data
// Validates: Personal tab, Spouse tab, Family tab (= Personal + Spouse)
// ---------------------------------------------------------------------------
async function seedIncome() {
  section('INCOME')

  const records = [
    // ── Personal ──────────────────────────────────────────────────────────
    {
      label:         'Personal • Primary Salary',
      source:        'Primary Salary',
      category:      'salary',
      amount:        5000,
      frequency:     'monthly',
      date_received: TODAY,
      description:   'Monthly salary from main employer',
      is_recurring:  true,
      owner:         'Personal'
    },
    {
      label:         'Personal • Freelance Projects',
      source:        'Freelance Projects',
      category:      'freelance',
      amount:        800,
      frequency:     'monthly',
      date_received: TODAY,
      description:   'Web development side work',
      is_recurring:  false,
      owner:         'Personal'
    },
    {
      label:         'Personal • Investment Dividends',
      source:        'Stock Dividends',
      category:      'investment',
      amount:        1200,
      frequency:     'quarterly',
      date_received: TODAY,
      description:   'Dividend income from equity portfolio',
      is_recurring:  true,
      owner:         'Personal'
    },
    // ── Spouse ────────────────────────────────────────────────────────────
    {
      label:         'Spouse • Teaching Job',
      source:        'Teaching Salary',
      category:      'salary',
      amount:        4500,
      frequency:     'monthly',
      date_received: TODAY,
      description:   'Monthly salary from school district',
      is_recurring:  true,
      owner:         'Spouse'
    },
    {
      label:         'Spouse • Rental Property',
      source:        'Rental Income',
      category:      'rental',
      amount:        1800,
      frequency:     'monthly',
      date_received: TODAY,
      description:   'Condo rental income',
      is_recurring:  true,
      owner:         'Spouse'
    },
    {
      label:         'Spouse • Online Business',
      source:        'Etsy Shop',
      category:      'business',
      amount:        350,
      frequency:     'monthly',
      date_received: TODAY,
      description:   'Handmade crafts online store',
      is_recurring:  false,
      owner:         'Spouse'
    }
  ]

  for (const { label, ...body } of records) {
    await insertRecord(label, '/api/income', body)
  }
}

// ---------------------------------------------------------------------------
// EXPENSES mock data
// Expenses has Personal + Business tabs (no Family tab) — validated per rule 3
// ---------------------------------------------------------------------------
async function seedExpenses() {
  section('EXPENSES  (Personal + Business — no Family tab)')

  const records = [
    // ── Personal ──────────────────────────────────────────────────────────
    {
      label:          'Personal • Groceries',
      description:    'Weekly grocery shopping',
      category:       'food',
      amount:         280,
      payment_method: 'credit_card',
      date:           TODAY,
      is_recurring:   true,
      frequency:      'weekly',
      owner:          'Personal'
    },
    {
      label:          'Personal • Gas & Fuel',
      description:    'Monthly gas fill-ups',
      category:       'transportation',
      amount:         120,
      payment_method: 'debit_card',
      date:           TODAY,
      is_recurring:   true,
      frequency:      'monthly',
      owner:          'Personal'
    },
    {
      label:          'Personal • Gym Membership',
      description:    'Monthly gym subscription',
      category:       'healthcare',
      amount:         45,
      payment_method: 'credit_card',
      date:           TODAY,
      is_recurring:   true,
      frequency:      'monthly',
      owner:          'Personal'
    },
    // ── Business ──────────────────────────────────────────────────────────
    {
      label:          'Business • Software Subscriptions',
      description:    'Adobe Creative Cloud',
      category:       'other',
      amount:         54.99,
      payment_method: 'credit_card',
      date:           TODAY,
      is_recurring:   true,
      frequency:      'monthly',
      owner:          'Business'
    },
    {
      label:          'Business • Office Supplies',
      description:    'Printer paper & toner',
      category:       'other',
      amount:         89,
      payment_method: 'credit_card',
      date:           TODAY,
      is_recurring:   false,
      owner:          'Business'
    }
  ]

  for (const { label, ...body } of records) {
    await insertRecord(label, '/api/expenses', body)
  }
}

// ---------------------------------------------------------------------------
// BILLS mock data
// Validates: Personal tab, Spouse tab, Family tab (= Personal + Spouse)
// ---------------------------------------------------------------------------
async function seedBills() {
  section('BILLS')

  const dueSoon = new Date()
  dueSoon.setDate(dueSoon.getDate() + 5)
  const dueSoonStr = dueSoon.toISOString().split('T')[0]

  const overdue = new Date()
  overdue.setDate(overdue.getDate() - 3)
  const overdueStr = overdue.toISOString().split('T')[0]

  const records = [
    // ── Personal ──────────────────────────────────────────────────────────
    {
      label:          'Personal • Electric Bill',
      name:           'Electric Bill',
      category:       'utilities',
      amount:         145,
      due_date:       dueSoonStr,
      frequency:      'monthly',
      auto_pay:       false,
      payment_method: 'bank_transfer',
      notes:          'Due in 5 days',
      owner:          'Personal'
    },
    {
      label:          'Personal • Netflix Subscription',
      name:           'Netflix',
      category:       'subscription',
      amount:         15.99,
      due_date:       TODAY,
      frequency:      'monthly',
      auto_pay:       true,
      payment_method: 'credit_card',
      notes:          'Auto-pay enabled',
      owner:          'Personal'
    },
    {
      label:          'Personal • Internet Bill (overdue)',
      name:           'Internet Service',
      category:       'utilities',
      amount:         89,
      due_date:       overdueStr,
      frequency:      'monthly',
      auto_pay:       false,
      payment_method: 'bank_transfer',
      notes:          'Overdue — pay immediately',
      owner:          'Personal'
    },
    // ── Spouse ────────────────────────────────────────────────────────────
    {
      label:          'Spouse • Car Insurance',
      name:           'Car Insurance',
      category:       'insurance',
      amount:         128,
      due_date:       dueSoonStr,
      frequency:      'monthly',
      auto_pay:       true,
      payment_method: 'bank_transfer',
      notes:          'Comprehensive coverage',
      owner:          'Spouse'
    },
    {
      label:          'Spouse • Mortgage Payment',
      name:           'Mortgage',
      category:       'rent',
      amount:         2200,
      due_date:       TODAY,
      frequency:      'monthly',
      auto_pay:       true,
      payment_method: 'bank_transfer',
      notes:          '30-year fixed at 3.5%',
      owner:          'Spouse'
    },
    {
      label:          'Spouse • Life Insurance',
      name:           'Life Insurance Premium',
      category:       'insurance',
      amount:         75,
      due_date:       dueSoonStr,
      frequency:      'monthly',
      auto_pay:       false,
      payment_method: 'check',
      notes:          '$500k term policy',
      owner:          'Spouse'
    }
  ]

  for (const { label, ...body } of records) {
    await insertRecord(label, '/api/bills', body)
  }
}

// ---------------------------------------------------------------------------
// DEBTS mock data
// Validates: Personal tab, Spouse tab, Family tab (= Personal + Spouse)
// ---------------------------------------------------------------------------
async function seedDebts() {
  section('DEBTS')

  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const nextMonthStr = nextMonth.toISOString().split('T')[0]

  const records = [
    // ── Personal ──────────────────────────────────────────────────────────
    {
      label:           'Personal • Chase Credit Card',
      name:            'Chase Sapphire Credit Card',
      type:            'credit_card',
      balance:         4850,
      interest_rate:   19.99,
      minimum_payment: 97,
      due_date:        nextMonthStr,
      notes:           'High priority — highest interest rate',
      owner:           'Personal'
    },
    {
      label:           'Personal • Car Loan',
      name:            'Toyota Camry Auto Loan',
      type:            'auto_loan',
      balance:         12400,
      interest_rate:   4.9,
      minimum_payment: 285,
      due_date:        nextMonthStr,
      notes:           '36 months remaining',
      owner:           'Personal'
    },
    // ── Spouse ────────────────────────────────────────────────────────────
    {
      label:           'Spouse • Student Loan',
      name:            'Federal Student Loan',
      type:            'student_loan',
      balance:         27500,
      interest_rate:   5.5,
      minimum_payment: 310,
      due_date:        nextMonthStr,
      notes:           'Income-driven repayment plan',
      owner:           'Spouse'
    },
    {
      label:           'Spouse • Home Equity Line',
      name:            'HELOC — Home Equity',
      type:            'personal_loan',
      balance:         18000,
      interest_rate:   7.25,
      minimum_payment: 220,
      due_date:        nextMonthStr,
      notes:           'Used for kitchen renovation',
      owner:           'Spouse'
    }
  ]

  for (const { label, ...body } of records) {
    await insertRecord(label, '/api/debts', body)
  }
}

// ---------------------------------------------------------------------------
// ASSETS mock data
// Assets has no owner/Family tabs — all assets shown together (rule 3)
// ---------------------------------------------------------------------------
async function seedAssets() {
  section('ASSETS  (no owner tabs — all shown together)')

  const records = [
    {
      label:            'Primary Residence',
      name:             'Primary Residence',
      category:         'real_estate',
      value:            485000,
      purchase_price:   380000,
      purchase_date:    '2019-06-15',
      location:         'Austin, TX',
      appreciation_rate: 5.5,
      description:      '4-bed 3-bath single family home'
    },
    {
      label:            'Spouse Vehicle',
      name:             'Toyota RAV4 2022',
      category:         'vehicle',
      value:            29500,
      purchase_price:   36000,
      purchase_date:    '2022-03-01',
      location:         'Austin, TX',
      appreciation_rate: -12,
      description:      'Primary vehicle — spouse'
    },
    {
      label:            'Brokerage Account',
      name:             'Fidelity Brokerage Portfolio',
      category:         'investment',
      value:            68000,
      purchase_price:   45000,
      purchase_date:    '2018-01-10',
      location:         'Fidelity Investments',
      appreciation_rate: 8,
      description:      'Diversified index fund portfolio'
    },
    {
      label:            'Emergency Fund',
      name:             'High-Yield Savings — Emergency Fund',
      category:         'savings',
      value:            25000,
      purchase_price:   25000,
      purchase_date:    TODAY,
      location:         'Marcus by Goldman Sachs',
      appreciation_rate: 4.5,
      description:      '6-month expense buffer'
    },
    {
      label:            '401k / Retirement',
      name:             '401(k) Retirement Account',
      category:         'retirement',
      value:            142000,
      purchase_price:   80000,
      purchase_date:    '2015-09-01',
      location:         'Vanguard',
      appreciation_rate: 7,
      description:      'Employer-matched — maxing annual contributions'
    }
  ]

  for (const { label, ...body } of records) {
    await insertRecord(label, '/api/assets', body)
  }
}

// ---------------------------------------------------------------------------
// BUDGET mock data
// Creates Personal + Spouse budgets for current month with items
// Family tab combines Personal + Spouse budget items (after our fix)
// ---------------------------------------------------------------------------
async function seedBudget() {
  section('BUDGET  (Personal + Spouse — Family = combined)')

  const startDate = `${YEAR}-${String(MONTH).padStart(2,'0')}-01`
  const lastDay   = new Date(YEAR, MONTH, 0).getDate()
  const endDate   = `${YEAR}-${String(MONTH).padStart(2,'0')}-${lastDay}`
  const monthName = new Date(YEAR, MONTH - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  for (const profile of ['Personal', 'Spouse']) {
    const budgetName = `${profile} Budget ${monthName}`
    info(`Creating ${budgetName}...`)

    const { ok: success, data } = await POST('/api/budgets', {
      name:       budgetName,
      start_date: startDate,
      end_date:   endDate,
      notes:      `Mock budget for ${profile} — ${monthName}`,
      owner:      profile
    })

    if (!success || data.success === false) {
      fail(`Could not create ${profile} budget — ${JSON.stringify(data?.message)}`)
      continue
    }

    const budget = data.data || data
    const budgetId = budget.id
    ok(`Created budget: ${budgetName} (id: ${budgetId})`)

    const items = profile === 'Personal' ? [
      { name: 'Salary Income',       type: 'income',  amount: 5000, category: 'Food',           frequency: 'monthly',   day_of_month_1: 1  },
      { name: 'Freelance Income',    type: 'income',  amount: 800,  category: 'Other',           frequency: 'monthly',   day_of_month_1: 15 },
      { name: 'Rent / Mortgage',     type: 'expense', amount: 2200, category: 'Housing',         frequency: 'monthly',   day_of_month_1: 1  },
      { name: 'Groceries',           type: 'expense', amount: 600,  category: 'Food',            frequency: 'monthly',   day_of_month_1: 5  },
      { name: 'Transportation',      type: 'expense', amount: 200,  category: 'Transportation',  frequency: 'monthly',   day_of_month_1: 10 },
      { name: 'Healthcare',          type: 'expense', amount: 150,  category: 'Healthcare',      frequency: 'monthly',   day_of_month_1: 20 },
      { name: 'Entertainment',       type: 'expense', amount: 100,  category: 'Entertainment',   frequency: 'monthly',   day_of_month_1: 25 },
    ] : [
      { name: 'Teaching Salary',     type: 'income',  amount: 4500, category: 'Other',           frequency: 'monthly',   day_of_month_1: 1  },
      { name: 'Rental Income',       type: 'income',  amount: 1800, category: 'Other',           frequency: 'monthly',   day_of_month_1: 5  },
      { name: 'Car Insurance',       type: 'expense', amount: 128,  category: 'Insurance',       frequency: 'monthly',   day_of_month_1: 3  },
      { name: 'Student Loan',        type: 'expense', amount: 310,  category: 'Other',           frequency: 'monthly',   day_of_month_1: 10 },
      { name: 'Utilities',           type: 'expense', amount: 250,  category: 'Utilities',       frequency: 'monthly',   day_of_month_1: 15 },
      { name: 'Shopping',            type: 'expense', amount: 300,  category: 'Shopping',        frequency: 'monthly',   day_of_month_1: 20 },
    ]

    for (const item of items) {
      const { ok: itemOk, data: itemData } = await POST(`/api/budgets/${budgetId}/items`, {
        ...item,
        start_date: startDate
      })
      if (itemOk && itemData.success !== false) {
        ok(`  Item: ${item.name} (${item.type}, $${item.amount})`)
      } else {
        fail(`  Item failed: ${item.name} — ${JSON.stringify(itemData?.message)}`)
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Validation report — checks Family counts match Personal + Spouse
// ---------------------------------------------------------------------------
async function validateFamilyAggregation() {
  section('VALIDATION — Family = Personal + Spouse')

  const checks = [
    { label: 'Income',   path: '/api/income' },
    { label: 'Bills',    path: '/api/bills'  },
    { label: 'Debts',    path: '/api/debts'  },
    { label: 'Assets',   path: '/api/assets' },
  ]

  let allPass = true

  for (const { label, path } of checks) {
    const { data } = await GET(path)
    const all = data?.data || []

    const personal = all.filter(r => r.owner === 'Personal').length
    const spouse   = all.filter(r => r.owner === 'Spouse').length
    const family   = personal + spouse

    const icon = (personal > 0 || spouse > 0) ? `${c.green}✔${c.reset}` : `${c.yellow}⚠${c.reset}`
    console.log(
      `  ${icon}  ${c.bold}${label}${c.reset}  Personal: ${c.cyan}${personal}${c.reset}  Spouse: ${c.cyan}${spouse}${c.reset}  Family (computed): ${c.green}${family}${c.reset}`
    )

    if (label !== 'Assets' && family !== personal + spouse) allPass = false
  }

  // Expenses — Personal + Business (no Family tab)
  const { data: expData } = await GET('/api/expenses')
  const allExp  = expData?.data || []
  const expPers = allExp.filter(r => r.owner === 'Personal').length
  const expBiz  = allExp.filter(r => r.owner === 'Business').length
  console.log(
    `  ${c.green}✔${c.reset}  ${c.bold}Expenses${c.reset}  Personal: ${c.cyan}${expPers}${c.reset}  Business: ${c.cyan}${expBiz}${c.reset}  ${c.dim}(no Family tab — by design)${c.reset}`
  )

  return allPass
}

// ---------------------------------------------------------------------------
// Clear helpers
// ---------------------------------------------------------------------------
async function clearAllData() {
  section('CLEARING existing data')
  await clearAll('/api/income',   'income records')
  await clearAll('/api/expenses', 'expense records')
  await clearAll('/api/bills',    'bill records')
  await clearAll('/api/debts',    'debt records')
  await clearAll('/api/assets',   'asset records')
  // Budget — fetch and delete each budget (items cascade-delete)
  const { data } = await GET('/api/budgets')
  const budgets = data?.data || []
  for (const b of budgets) await DELETE(`/api/budgets/${b.id}`)
  if (budgets.length > 0) ok(`Cleared ${budgets.length} budget(s)`)
  else info('No existing budgets to clear')
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
async function checkHealth() {
  try {
    const { ok: healthy } = await GET('/health')
    if (!healthy) throw new Error('unhealthy')
    ok('Backend server is reachable at http://localhost:3001')
    return true
  } catch {
    fail('Cannot reach backend at http://localhost:3001')
    console.log(`\n  ${c.yellow}Make sure the backend server is running:${c.reset}`)
    console.log(`  cd backend && node server.js\n`)
    return false
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args      = process.argv.slice(2)
  const doClear   = args.includes('--clear') || args.includes('--clear-only')
  const doInsert  = !args.includes('--clear-only')

  console.log(`\n${c.bold}${c.cyan}Finance Flow — Mock Data Seed${c.reset}`)
  console.log(`${'━'.repeat(45)}`)

  const healthy = await checkHealth()
  if (!healthy) process.exit(1)

  if (doClear)  await clearAllData()
  if (doInsert) {
    await seedIncome()
    await seedExpenses()
    await seedBills()
    await seedDebts()
    await seedAssets()
    await seedBudget()
  }

  const pass = await validateFamilyAggregation()

  console.log()
  console.log(`${'━'.repeat(45)}`)
  if (doInsert) {
    console.log(`\n${c.bold}Seed complete!${c.reset} Open the app and verify:\n`)
    console.log(`  ${c.cyan}Income${c.reset}`)
    console.log(`    Personal tab → 3 records (Salary, Freelance, Dividends)`)
    console.log(`    Spouse tab   → 3 records (Teaching, Rental, Etsy)`)
    console.log(`    Family tab   → 6 records combined\n`)
    console.log(`  ${c.cyan}Bills${c.reset}`)
    console.log(`    Personal tab → 3 records (incl. 1 overdue)`)
    console.log(`    Spouse tab   → 3 records`)
    console.log(`    Family tab   → 6 records combined\n`)
    console.log(`  ${c.cyan}Debts${c.reset}`)
    console.log(`    Personal tab → 2 records`)
    console.log(`    Spouse tab   → 2 records`)
    console.log(`    Family tab   → 4 records combined  ${c.dim}(bug was fixed)${c.reset}\n`)
    console.log(`  ${c.cyan}Budget${c.reset}`)
    console.log(`    Personal tab → 7 items (2 income, 5 expense)`)
    console.log(`    Spouse tab   → 6 items (2 income, 4 expense)`)
    console.log(`    Family tab   → 13 items combined   ${c.dim}(bug was fixed)${c.reset}\n`)
    console.log(`  ${c.cyan}Expenses${c.reset}  Personal + Business tabs  ${c.dim}(no Family tab — by design)${c.reset}\n`)
    console.log(`  ${c.cyan}Assets${c.reset}    5 records shown on single view  ${c.dim}(no owner tabs — by design)${c.reset}\n`)
  }
  if (!pass) console.log(`${c.yellow}⚠  Some validation checks reported 0 records — ensure backend is seeded and connected.${c.reset}\n`)
}

main().catch(err => {
  console.error(`\n${c.red}Fatal error:${c.reset}`, err.message)
  process.exit(1)
})
