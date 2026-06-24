@echo off
setlocal enabledelayedexpansion
title Setup Arabic Adventures

:: Change to script directory
cd /d "%~dp0"
echo Setting up Arabic Adventures in: %CD%

:: Verify Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo Found Node.js: %NODE_VER%

:: Verify pnpm
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] pnpm is not installed. Please run "npm install -g pnpm" first.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('pnpm --version') do set PNPM_VER=%%v
echo Found pnpm: %PNPM_VER%

:: Step 1: pnpm install
echo.
echo [1/6] Installing dependencies...
call pnpm install
if %errorlevel% neq 0 (
    echo [ERROR] pnpm install failed.
    pause
    exit /b 1
)

:: Step 2: pnpm db:generate
echo.
echo [2/6] Generating Prisma Client...
call pnpm db:generate
if %errorlevel% neq 0 (
    echo [ERROR] Prisma client generation failed.
    pause
    exit /b 1
)

:: Step 3: pnpm db:migrate:deploy
echo.
echo [3/6] Applying database migrations...
call pnpm db:migrate:deploy
if %errorlevel% neq 0 (
    echo [ERROR] Database migrations deployment failed.
    pause
    exit /b 1
)

:: Step 4: pnpm db:seed
echo.
echo [4/6] Seeding the database...
call pnpm db:seed
if %errorlevel% neq 0 (
    echo [ERROR] Database seeding failed.
    pause
    exit /b 1
)

:: Step 5: pnpm db:verify
echo.
echo [5/6] Verifying database integrity...
call pnpm db:verify
if %errorlevel% neq 0 (
    echo [ERROR] Database verification failed.
    pause
    exit /b 1
)

:: Step 6: pnpm build
echo.
echo [6/6] Building production Next.js application...
call pnpm build
if %errorlevel% neq 0 (
    echo [ERROR] Next.js build failed.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo SUCCESS: Setup completed successfully!
echo You can now launch the app using: start-app.bat
echo ========================================================
pause
