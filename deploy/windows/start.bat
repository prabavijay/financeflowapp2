@echo off
:: ============================================================
:: FinanceFlow - Start All Services
:: Starts the PostgreSQL service, backend API, and frontend.
:: ============================================================
setlocal

set "INSTALL_DIR=C:\FinanceFlow"

echo ============================================================
echo  FinanceFlow - Starting Services
echo ============================================================
echo.

:: Start PostgreSQL service
echo [1/3] Starting PostgreSQL service...
sc query postgresql-x64-17 | find "RUNNING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo       PostgreSQL is already running.
) else (
    net start postgresql-x64-17 >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo WARNING: Could not start postgresql-x64-17 service.
        echo          Try running this script as Administrator, or start it manually
        echo          from Windows Services (services.msc).
    ) else (
        echo       PostgreSQL started.
    )
)
echo.

:: Check if .env exists
if not exist "%INSTALL_DIR%\backend\.env" (
    echo ERROR: %INSTALL_DIR%\backend\.env not found.
    echo        Run setup.bat first, then edit the .env file.
    pause
    exit /b 1
)

:: Start backend API server
echo [2/3] Starting backend API server on port 3001...
where pm2 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    pm2 start "%INSTALL_DIR%\backend\server.js" --name "financeflow-api" --cwd "%INSTALL_DIR%\backend" 2>nul
    pm2 restart financeflow-api 2>nul
    echo       Backend started via PM2.
    echo       View logs: pm2 logs financeflow-api
) else (
    echo       PM2 not found - starting in a new window (close to stop).
    start "FinanceFlow API" cmd /k "cd /d %INSTALL_DIR%\backend && node server.js"
)
echo.

:: Start frontend server
echo [3/3] Starting frontend on port 5173...
where pm2 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    pm2 start "serve -s dist -l 5173" --name "financeflow-web" --cwd "%INSTALL_DIR%" 2>nul
    pm2 restart financeflow-web 2>nul
    echo       Frontend started via PM2.
    echo       View logs: pm2 logs financeflow-web
) else (
    echo       PM2 not found - starting in a new window (close to stop).
    start "FinanceFlow Web" cmd /k "serve -s %INSTALL_DIR%\dist -l 5173"
)
echo.

:: Wait a moment then check
timeout /t 3 /nobreak >nul

echo ============================================================
echo  FinanceFlow is starting up!
echo ============================================================
echo.
echo  Frontend:  http://localhost:5173
echo  Backend:   http://localhost:3001
echo  API Health: http://localhost:3001/health
echo.
echo  Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo.
pause
