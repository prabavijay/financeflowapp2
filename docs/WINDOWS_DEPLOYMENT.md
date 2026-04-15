# FinanceFlow — Windows Deployment Guide

> **Target environment:** Windows 10/11 (64-bit)
> **Application stack:** React 18 frontend + Node.js/Express backend + PostgreSQL 17

---

## Table of Contents

1. [Deployment Package Contents](#1-deployment-package-contents)
2. [Prerequisites Overview](#2-prerequisites-overview)
3. [Step 1 — Install Node.js on Windows](#3-step-1--install-nodejs-on-windows)
4. [Step 2 — Install PostgreSQL on Windows](#4-step-2--install-postgresql-on-windows)
5. [Step 3 — Extract the Deployment Package](#5-step-3--extract-the-deployment-package)
6. [Step 4 — Configure the Database](#6-step-4--configure-the-database)
7. [Step 5 — Configure the Backend](#7-step-5--configure-the-backend)
8. [Step 6 — Install Backend Dependencies](#8-step-6--install-backend-dependencies)
9. [Step 7 — Run Database Migrations](#9-step-7--run-database-migrations)
10. [Step 8 — Start the Application](#10-step-8--start-the-application)
11. [Step 9 — Run as Windows Service (Optional)](#11-step-9--run-as-windows-service-optional)
12. [Firewall & Network Configuration](#12-firewall--network-configuration)
13. [Verifying the Deployment](#13-verifying-the-deployment)
14. [Troubleshooting](#14-troubleshooting)
15. [Updating the Application](#15-updating-the-application)

---

## 1. Deployment Package Contents

The deployment ZIP (`finance-flow-deploy.zip`) contains only what is needed to run — no source `node_modules` are included. This keeps the package small (< 20 MB vs 300+ MB with dependencies).

```
finance-flow-deploy.zip
├── dist/                        ← Pre-built React frontend (static files)
│   ├── index.html
│   ├── assets/
│   └── ...
├── backend/                     ← Node.js/Express API server (no node_modules)
│   ├── server.js
│   ├── package.json
│   ├── .env.example             ← Template — you will copy this to .env
│   ├── routes/
│   │   ├── income.js
│   │   ├── expenses.js
│   │   ├── bills.js
│   │   ├── debts.js
│   │   ├── assets.js
│   │   ├── budgets.js
│   │   ├── credit.js
│   │   ├── insurance.js
│   │   └── accounts.js
│   ├── database/
│   │   └── schema.sql           ← PostgreSQL schema — run once during setup
│   └── scripts/
│       ├── setup-database.js    ← Creates DB + tables automatically
│       ├── migrate.js
│       └── seed.js              ← (Optional) load sample data
├── deploy/
│   ├── setup.bat                ← First-time setup script
│   ├── start.bat                ← Start all services
│   ├── stop.bat                 ← Stop all services
│   └── check-status.bat         ← Check if services are running
└── WINDOWS_DEPLOYMENT.md        ← This file
```

**What is NOT included (install separately on the Windows machine):**
- Node.js runtime (instructions below)
- PostgreSQL 17 (instructions below)
- `node_modules` for the backend (installed by `npm install` on first run)

---

## 2. Prerequisites Overview

| Requirement       | Version  | Download                                      |
|-------------------|----------|-----------------------------------------------|
| Windows           | 10/11 64-bit | —                                         |
| Node.js           | 22.x LTS | https://nodejs.org/en/download               |
| PostgreSQL        | 17.x     | https://www.postgresql.org/download/windows/ |
| Disk space        | ~500 MB  | (DB + dependencies)                          |
| RAM               | 2 GB min | 4 GB recommended                             |

---

## 3. Step 1 — Install Node.js on Windows

### 3.1 Download

1. Open a browser and go to: **https://nodejs.org/en/download**
2. Under "Prebuilt Installer", select:
   - **Windows** platform
   - **x64** architecture
   - Version: **22.x.x LTS** (recommended) — do NOT choose "Current"
3. Click **"node-v22.x.x-x64.msi"** to download the installer.

### 3.2 Install

1. Double-click the downloaded `.msi` file.
2. Click **Next** on the Welcome screen.
3. Accept the License Agreement → **Next**.
4. Leave the default install path (`C:\Program Files\nodejs\`) → **Next**.
5. On "Custom Setup", leave all defaults — ensure **"Add to PATH"** is checked → **Next**.
6. On "Tools for Native Modules" screen: **check the checkbox** "Automatically install the necessary tools..." → **Next**.
7. Click **Install** (a UAC prompt will appear — click Yes).
8. A second terminal window may open to install Chocolatey and build tools — let it finish.
9. Click **Finish** when done.

### 3.3 Verify Installation

Open a **new** Command Prompt (`Win + R` → type `cmd` → Enter) and run:

```cmd
node --version
npm --version
```

Expected output:
```
v22.x.x
10.x.x
```

If these commands are not recognized, restart your computer and try again — the PATH environment variable needs to refresh.

---

## 4. Step 2 — Install PostgreSQL on Windows

### 4.1 Download

1. Open: **https://www.postgresql.org/download/windows/**
2. Click **"Download the installer"** (this takes you to EDB's download page).
3. Select version **17.x** for **Windows x86-64**.
4. Download the `.exe` installer.

### 4.2 Install

1. Double-click the downloaded `.exe` file.
2. Click **Next** on the Welcome screen.
3. **Installation Directory**: leave default (`C:\Program Files\PostgreSQL\17`) → **Next**.
4. **Components**: keep all checked:
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4
   - ✅ Stack Builder
   - ✅ Command Line Tools
   → **Next**
5. **Data Directory**: leave default (`C:\Program Files\PostgreSQL\17\data`) → **Next**.
6. **Password**: enter a password for the `postgres` superuser account.
   - **Write this down — you will need it.**
   - Example: `Admin@1234`
   → **Next**
7. **Port**: leave default **5432** → **Next**.
8. **Locale**: leave default → **Next**.
9. Review the summary → **Next** → **Next** to begin installation.
10. Uncheck "Launch Stack Builder at exit" → **Finish**.

### 4.3 Add PostgreSQL to PATH

The `psql` command-line tool needs to be accessible from any terminal.

1. Press `Win + S` and search for **"Environment Variables"** → open **"Edit the system environment variables"**.
2. Click **"Environment Variables..."** at the bottom.
3. Under **"System variables"**, find and select **Path** → click **Edit**.
4. Click **New** and add:
   ```
   C:\Program Files\PostgreSQL\17\bin
   ```
5. Click **OK** on all dialogs.
6. Open a **new** Command Prompt and verify:
   ```cmd
   psql --version
   ```
   Expected: `psql (PostgreSQL) 17.x`

### 4.4 Verify PostgreSQL Service is Running

```cmd
sc query postgresql-x64-17
```

Look for `STATE: 4  RUNNING`. If it says STOPPED, start it:

```cmd
net start postgresql-x64-17
```

---

## 5. Step 3 — Extract the Deployment Package

1. Copy `finance-flow-deploy.zip` to the Windows machine (USB, shared drive, email, etc.).
2. Right-click the ZIP → **"Extract All..."**
3. Extract to: `C:\FinanceFlow\`

   After extraction you should have:
   ```
   C:\FinanceFlow\
   ├── dist\
   ├── backend\
   ├── deploy\
   └── WINDOWS_DEPLOYMENT.md
   ```

4. Verify the folder exists:
   ```cmd
   dir C:\FinanceFlow
   ```

---

## 6. Step 4 — Configure the Database

### 6.1 Create the Application Database and User

Open Command Prompt **as Administrator** and run:

```cmd
psql -U postgres -h localhost
```

Enter the PostgreSQL password you set during installation when prompted.

Once inside the `psql` prompt, run the following SQL commands one by one:

```sql
-- Create application database
CREATE DATABASE finance;

-- Create application user (change the password as desired)
CREATE USER financeapp WITH PASSWORD 'YourSecurePassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE finance TO financeapp;

-- Connect to the finance database
\c finance

-- Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO financeapp;

-- Exit psql
\q
```

> **Security tip:** Replace `YourSecurePassword123!` with a strong password. Note it down — you will put it in the `.env` file.

### 6.2 Run the Database Schema

This creates all the application tables:

```cmd
psql -U financeapp -h localhost -d finance -f C:\FinanceFlow\backend\database\schema.sql
```

Enter the password for `financeapp` when prompted.

Expected output:
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
CREATE TABLE
...
```

---

## 7. Step 5 — Configure the Backend

### 7.1 Create the Environment File

```cmd
copy C:\FinanceFlow\backend\.env.example C:\FinanceFlow\backend\.env
```

### 7.2 Edit the Environment File

Open with Notepad:

```cmd
notepad C:\FinanceFlow\backend\.env
```

Update the values to match your setup:

```env
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance
DB_USER=financeapp
DB_PASSWORD=YourSecurePassword123!

# Security
JWT_SECRET=change-this-to-a-long-random-string-at-least-32-chars

# CORS — set to the URL where the frontend will be accessed
# For local machine access only:
CORS_ORIGIN=http://localhost:5173
# For network access (replace with the machine's IP):
# CORS_ORIGIN=http://192.168.1.100:5173
```

> **JWT_SECRET**: Generate a strong random string. You can use this PowerShell command:
> ```powershell
> [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
> ```

Save and close Notepad.

---

## 8. Step 6 — Install Backend Dependencies

This replaces the missing `node_modules` folder. Only production dependencies will be installed (no dev tools).

```cmd
cd C:\FinanceFlow\backend
npm install --omit=dev
```

This downloads approximately 15–20 MB of packages and takes 1–2 minutes.

Verify success:
```cmd
dir node_modules
```
You should see folders like `express`, `pg`, `bcrypt`, `helmet`, etc.

---

## 9. Step 7 — Run Database Migrations

The automated setup script creates the database tables via Node.js:

```cmd
cd C:\FinanceFlow\backend
node scripts/setup-database.js
```

If the script completes without errors, the database is ready.

**Optional — Load Sample Data:**

```cmd
node scripts/seed.js
```

This populates the database with sample income, expenses, bills, etc. for testing.

---

## 10. Step 8 — Start the Application

### 10.1 Start the Backend API Server

Open a Command Prompt window:

```cmd
cd C:\FinanceFlow\backend
node server.js
```

You should see:
```
Finance Flow API Server running on http://localhost:3001
Connected to PostgreSQL database: finance
```

Leave this window open — the server runs in the foreground.

### 10.2 Serve the Frontend

The `dist\` folder contains the built React app (static HTML/CSS/JS). You need a simple HTTP server to serve it.

Install the `serve` package globally (one-time):

```cmd
npm install -g serve
```

Open a **second** Command Prompt window:

```cmd
serve -s C:\FinanceFlow\dist -l 5173
```

You should see:
```
Serving!
- Local:    http://localhost:5173
```

### 10.3 Open the Application

Open a browser and go to: **http://localhost:5173**

The FinanceFlow login page should appear.

---

## 11. Step 9 — Run as Windows Service (Optional)

For production use, you want the services to start automatically and run in the background.

### 11.1 Install PM2 (Process Manager)

```cmd
npm install -g pm2
npm install -g pm2-windows-startup
```

### 11.2 Start Services with PM2

```cmd
cd C:\FinanceFlow\backend
pm2 start server.js --name "financeflow-api"

cd C:\FinanceFlow
pm2 start "serve -s dist -l 5173" --name "financeflow-web"
```

### 11.3 Configure PM2 to Start on Windows Boot

```cmd
pm2-startup install
pm2 save
```

### 11.4 Useful PM2 Commands

```cmd
pm2 list                        # Show all running processes
pm2 logs financeflow-api        # View API server logs
pm2 logs financeflow-web        # View web server logs
pm2 stop financeflow-api        # Stop API server
pm2 stop financeflow-web        # Stop web server
pm2 restart financeflow-api     # Restart API server
pm2 delete all                  # Remove all processes
```

---

## 12. Firewall & Network Configuration

### 12.1 Allow Ports Through Windows Firewall

If you want to access FinanceFlow from other machines on the network:

Open Command Prompt **as Administrator**:

```cmd
:: Allow frontend port
netsh advfirewall firewall add rule name="FinanceFlow Web" dir=in action=allow protocol=TCP localport=5173

:: Allow backend API port
netsh advfirewall firewall add rule name="FinanceFlow API" dir=in action=allow protocol=TCP localport=3001
```

### 12.2 Update CORS for Network Access

If accessing from another machine (e.g., tablet or another PC on the same network):

1. Find the Windows machine's IP address:
   ```cmd
   ipconfig
   ```
   Look for `IPv4 Address`, e.g. `192.168.1.50`.

2. Edit `C:\FinanceFlow\backend\.env` and update:
   ```env
   CORS_ORIGIN=http://192.168.1.50:5173
   ```

3. Restart the backend server.

4. Access from other devices using: `http://192.168.1.50:5173`

---

## 13. Verifying the Deployment

### Check Backend Health

Open a browser or run in Command Prompt:

```cmd
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"healthy","database":"connected","version":"1.0.0"}
```

### Check Database Connection

```cmd
psql -U financeapp -h localhost -d finance -c "\dt"
```

You should see a list of tables: `users`, `income`, `expenses`, `bills`, `debts`, `assets`, etc.

### Check Frontend Loads

Navigate to http://localhost:5173 in a browser. The login page should appear with the FinanceFlow logo and dark green theme.

---

## 14. Troubleshooting

### "node is not recognized as an internal or external command"
- Node.js was not added to PATH. Restart your computer after installation.
- Alternatively, re-run the Node.js installer and ensure "Add to PATH" is checked.

### "psql is not recognized..."
- PostgreSQL bin folder is not in PATH. Re-do Section 4.3.
- Restart the terminal after adding to PATH.

### Backend fails to start — "password authentication failed for user financeapp"
- Verify `DB_PASSWORD` in `C:\FinanceFlow\backend\.env` matches what you set in Step 4.
- Test the connection manually: `psql -U financeapp -h localhost -d finance`

### Backend fails to start — "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL service is not running. Start it:
  ```cmd
  net start postgresql-x64-17
  ```
- Verify it's running: `sc query postgresql-x64-17`

### Frontend shows blank page or API errors
- Ensure the backend is running on port 3001.
- Check browser developer console (F12) for error messages.
- Verify the `dist\` folder contains `index.html`.

### Port 3001 or 5173 already in use
- Find what is using the port:
  ```cmd
  netstat -ano | findstr :3001
  netstat -ano | findstr :5173
  ```
- Kill the process using the PID shown:
  ```cmd
  taskkill /PID <pid_number> /F
  ```

### "Cannot find module" errors when starting backend
- Dependencies were not installed. Run:
  ```cmd
  cd C:\FinanceFlow\backend
  npm install --omit=dev
  ```

### Database tables not found
- Schema was not loaded. Re-run:
  ```cmd
  psql -U financeapp -h localhost -d finance -f C:\FinanceFlow\backend\database\schema.sql
  ```

---

## 15. Updating the Application

When a new deployment package is released:

1. **Stop services:**
   ```cmd
   pm2 stop all
   ```
   (or close the terminal windows if not using PM2)

2. **Back up the database** (optional but recommended):
   ```cmd
   pg_dump -U financeapp -h localhost finance > C:\FinanceFlow\backup_%DATE%.sql
   ```

3. **Replace application files:**
   - Delete `C:\FinanceFlow\dist\` and replace with the new `dist\` folder.
   - Replace `C:\FinanceFlow\backend\` files (but keep your `.env` file — do NOT overwrite it).

4. **Install any new dependencies:**
   ```cmd
   cd C:\FinanceFlow\backend
   npm install --omit=dev
   ```

5. **Run any new migrations:**
   ```cmd
   node scripts/migrate.js
   ```

6. **Restart services:**
   ```cmd
   pm2 restart all
   ```

---

## Quick Reference Card

| Task                        | Command                                              |
|-----------------------------|------------------------------------------------------|
| Start PostgreSQL service    | `net start postgresql-x64-17`                        |
| Stop PostgreSQL service     | `net stop postgresql-x64-17`                         |
| Start backend (foreground)  | `cd C:\FinanceFlow\backend && node server.js`        |
| Start frontend (foreground) | `serve -s C:\FinanceFlow\dist -l 5173`               |
| Start backend (PM2)         | `pm2 start financeflow-api`                          |
| Start frontend (PM2)        | `pm2 start financeflow-web`                          |
| Check PM2 status            | `pm2 list`                                           |
| View logs                   | `pm2 logs`                                           |
| Backend health check        | `curl http://localhost:3001/health`                  |
| Connect to DB               | `psql -U financeapp -h localhost -d finance`         |
| Backup database             | `pg_dump -U financeapp -h localhost finance > bak.sql` |

---

## Port Summary

| Service            | Port | URL                         |
|--------------------|------|-----------------------------|
| React Frontend     | 5173 | http://localhost:5173       |
| Node.js API Server | 3001 | http://localhost:3001       |
| PostgreSQL         | 5432 | localhost:5432 (internal)   |

---

*FinanceFlow Deployment Guide — Windows Edition*
*Generated: 2026-03-17*
