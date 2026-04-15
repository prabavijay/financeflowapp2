@echo off
:: ============================================================
:: FinanceFlow - Database Setup Script
:: Run this ONCE to create the PostgreSQL database, user, and tables.
:: Prerequisites: PostgreSQL installed and running.
:: ============================================================
setlocal enabledelayedexpansion

set "INSTALL_DIR=C:\FinanceFlow"

echo ============================================================
echo  FinanceFlow - Database Setup
echo ============================================================
echo.
echo This script will:
echo   1. Create the 'finance' database
echo   2. Create the 'financeapp' database user
echo   3. Create all application tables
echo.
echo You will need the PostgreSQL SUPERUSER (postgres) password.
echo.

:: Prompt for postgres superuser password
set /p PG_SUPERPASS=Enter the PostgreSQL 'postgres' superuser password:

echo.
echo [1/4] Creating database and user...
echo.

:: Write a temp SQL setup file
set "TMPFILE=%TEMP%\ff_db_setup.sql"
(
echo -- FinanceFlow database setup
echo SELECT 'CREATE DATABASE finance' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'finance'^)\gexec
echo SELECT 'CREATE USER financeapp WITH PASSWORD ''ChangeMe123!''' WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'financeapp'^)\gexec
echo GRANT ALL PRIVILEGES ON DATABASE finance TO financeapp;
) > "%TMPFILE%"

set PGPASSWORD=%PG_SUPERPASS%
psql -U postgres -h localhost -f "%TMPFILE%"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Could not connect to PostgreSQL as postgres.
    echo Make sure PostgreSQL is running and the password is correct.
    del "%TMPFILE%" 2>nul
    pause
    exit /b 1
)
del "%TMPFILE%" 2>nul
echo.
echo [2/4] Granting schema privileges...

set "TMPFILE2=%TEMP%\ff_schema_grant.sql"
(
echo \c finance
echo GRANT ALL ON SCHEMA public TO financeapp;
echo ALTER DATABASE finance OWNER TO financeapp;
) > "%TMPFILE2%"

psql -U postgres -h localhost -f "%TMPFILE2%"
del "%TMPFILE2%" 2>nul
echo.

:: Prompt for financeapp password (must match .env)
echo [3/4] Updating 'financeapp' password...
echo.
echo IMPORTANT: Enter the SAME password you put in C:\FinanceFlow\backend\.env
echo            (DB_PASSWORD value)
echo.
set /p FF_PASS=Enter the password for 'financeapp' database user:

set "TMPFILE3=%TEMP%\ff_pass_update.sql"
echo ALTER USER financeapp WITH PASSWORD '%FF_PASS%'; > "%TMPFILE3%"
psql -U postgres -h localhost -f "%TMPFILE3%"
del "%TMPFILE3%" 2>nul
echo.

:: Load schema
echo [4/4] Loading application schema (creating tables)...
set PGPASSWORD=%FF_PASS%
psql -U financeapp -h localhost -d finance -f "%INSTALL_DIR%\backend\database\schema.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to load schema. Check the error above.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo  Database setup complete!
echo ============================================================
echo.
echo  Tables created in the 'finance' database.
echo  Connection: postgresql://financeapp@localhost:5432/finance
echo.
echo  You can now start the application:
echo    Run: C:\FinanceFlow\deploy\start.bat
echo.
pause
