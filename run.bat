@echo off
setlocal enabledelayedexpansion
title Arabic Adventures - Auto Run

:: Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%"

:: Change to project directory
cd /d "%PROJECT_DIR%"
echo Project directory: %PROJECT_DIR%
echo.

:: Check if setup is needed
if not exist ".next\BUILD_ID" (
    echo [INFO] Build not found. Running setup first...
    cd /d "%PROJECT_DIR%\development\scripts"
    call setup-app.bat
    cd /d "%PROJECT_DIR%"
    if %errorlevel% neq 0 (
        echo [ERROR] Setup failed.
        pause
        exit /b 1
    )
    echo.
)

:: Start the application
echo Starting Arabic Adventures...
pnpm start -- --hostname 127.0.0.1 --port 3001
