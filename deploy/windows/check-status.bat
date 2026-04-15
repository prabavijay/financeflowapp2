@echo off
:: ============================================================
:: FinanceFlow - Check Service Status
:: ============================================================
setlocal

echo ============================================================
echo  FinanceFlow - Service Status
echo ============================================================
echo.

:: PostgreSQL
echo [PostgreSQL Service]
sc query postgresql-x64-17 | find "RUNNING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   Status:  RUNNING (port 5432)
) else (
    echo   Status:  STOPPED
    echo   Fix:     net start postgresql-x64-17
)
echo.

:: Backend API (port 3001)
echo [Backend API - port 3001]
netstat -ano | findstr ":3001 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   Status:  RUNNING
    echo   Health:  http://localhost:3001/health
) else (
    echo   Status:  STOPPED
    echo   Fix:     cd C:\FinanceFlow\backend ^&^& node server.js
)
echo.

:: Frontend (port 5173)
echo [Frontend - port 5173]
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   Status:  RUNNING
    echo   URL:     http://localhost:5173
) else (
    echo   Status:  STOPPED
    echo   Fix:     serve -s C:\FinanceFlow\dist -l 5173
)
echo.

:: PM2 status if available
where pm2 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PM2 Process List]
    pm2 list
    echo.
)

echo.
pause
