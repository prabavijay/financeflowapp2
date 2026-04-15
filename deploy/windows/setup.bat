@echo off
:: ============================================================
:: FinanceFlow - First-Time Setup Script
:: Run this ONCE after extracting the deployment package.
:: Must be run from the root of the extracted package.
:: ============================================================
setlocal enabledelayedexpansion

set "INSTALL_DIR=C:\FinanceFlow"
set "SCRIPT_DIR=%~dp0"
set "PKG_ROOT=%SCRIPT_DIR%..\..\"

echo ============================================================
echo  FinanceFlow - First-Time Setup
echo ============================================================
echo.

:: Check for Node.js
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org and rerun this script.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo       Found Node.js !NODE_VER!
echo.

:: Check for npm
echo [2/6] Checking npm...
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not found. Reinstall Node.js.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm --version') do set NPM_VER=%%v
echo       Found npm !NPM_VER!
echo.

:: Check for psql
echo [3/6] Checking PostgreSQL...
psql --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: psql is not found. Ensure PostgreSQL is installed and its bin
    echo        folder is added to the system PATH.
    echo        Default bin path: C:\Program Files\PostgreSQL\17\bin
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('psql --version') do set PG_VER=%%v
echo       Found !PG_VER!
echo.

:: Copy files to install directory
echo [4/6] Installing to %INSTALL_DIR%...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
xcopy /E /I /Y "%PKG_ROOT%dist"    "%INSTALL_DIR%\dist\"    >nul
xcopy /E /I /Y "%PKG_ROOT%backend" "%INSTALL_DIR%\backend\" /EXCLUDE:%SCRIPT_DIR%exclude.txt >nul
copy /Y "%PKG_ROOT%WINDOWS_DEPLOYMENT.md" "%INSTALL_DIR%\" >nul
xcopy /E /I /Y "%PKG_ROOT%deploy\windows" "%INSTALL_DIR%\deploy\" >nul
echo       Files copied to %INSTALL_DIR%
echo.

:: Create .env from example if not already present
if not exist "%INSTALL_DIR%\backend\.env" (
    if exist "%INSTALL_DIR%\backend\.env.example" (
        copy "%INSTALL_DIR%\backend\.env.example" "%INSTALL_DIR%\backend\.env" >nul
        echo       Created backend\.env from .env.example
        echo       IMPORTANT: Edit C:\FinanceFlow\backend\.env with your DB password and JWT secret!
    )
) else (
    echo       backend\.env already exists - skipping
)
echo.

:: Install backend Node.js dependencies
echo [5/6] Installing backend dependencies (this may take a minute)...
cd /d "%INSTALL_DIR%\backend"
npm install --omit=dev --silent
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed. Check your internet connection.
    pause
    exit /b 1
)
echo       Backend dependencies installed.
echo.

:: Install serve for frontend
echo [6/6] Installing 'serve' for frontend hosting...
npm install -g serve --silent >nul 2>&1
echo       'serve' installed globally.
echo.

echo ============================================================
echo  Setup complete!
echo ============================================================
echo.
echo  NEXT STEPS:
echo  1. Edit C:\FinanceFlow\backend\.env
echo     - Set DB_PASSWORD to your PostgreSQL financeapp user password
echo     - Set JWT_SECRET to a long random string
echo.
echo  2. Create the database user and tables:
echo     Run:  C:\FinanceFlow\deploy\setup-database.bat
echo.
echo  3. Start the application:
echo     Run:  C:\FinanceFlow\deploy\start.bat
echo.
pause
