@echo off
:: ============================================================
:: FinanceFlow - Stop All Services
:: ============================================================
setlocal

echo ============================================================
echo  FinanceFlow - Stopping Services
echo ============================================================
echo.

:: Stop PM2 processes if PM2 is installed
where pm2 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Stopping PM2 processes...
    pm2 stop financeflow-api 2>nul
    pm2 stop financeflow-web 2>nul
    echo Done.
) else (
    :: Kill node processes on ports 3001 and 5173
    echo Stopping Node.js processes on ports 3001 and 5173...
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3001 "') do (
        taskkill /PID %%p /F >nul 2>&1
    )
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5173 "') do (
        taskkill /PID %%p /F >nul 2>&1
    )
    echo Done.
)
echo.

set /p STOP_PG=Stop PostgreSQL service as well? (y/N):
if /i "%STOP_PG%"=="y" (
    net stop postgresql-x64-17 >nul 2>&1
    echo PostgreSQL service stopped.
)
echo.
echo All FinanceFlow services stopped.
pause
