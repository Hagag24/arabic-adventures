@echo off
setlocal enabledelayedexpansion
title Start Arabic Adventures (Development)

:: Ensure development diagnostics are disabled by default
set SHOW_NEXT_DEVTOOLS=false

:: Change to script directory
cd /d "%~dp0"
echo Starting Arabic Adventures in Development Mode...

:: Verify Node.js and pnpm
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    pause
    exit /b 1
)
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] pnpm is not installed.
    pause
    exit /b 1
)

:: Check and clean port 3000
echo Checking port 3000...
powershell -ExecutionPolicy Bypass -File scripts\ensure-project-port.ps1 -Port 3000
if %errorlevel% neq 0 (
    echo [ERROR] Port 3000 is occupied by an external application.
    pause
    exit /b 1
)

:: Start the dev server in a new window
echo Starting Next.js dev server on port 3000...
start "Arabic Adventures Dev Server" pnpm.cmd exec next dev -H 127.0.0.1 -p 3000

:: Poll /api/health with a maximum timeout
echo Waiting for the dev server to become healthy...
set "ready=0"
for /L %%i in (1,1,30) do (
    if !ready! equ 0 (
        powershell -Command "$resp = Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/health' -ErrorAction SilentlyContinue; if ($resp.status -eq 'ok') { exit 0 } else { exit 1 }" >nul 2>nul
        if !errorlevel! equ 0 (
            set "ready=1"
        ) else (
            timeout /t 1 /nobreak >nul
        )
    )
)

if !ready! equ 0 (
    echo [ERROR] Dev server failed to start or pass health check.
    pause
    exit /b 1
)

echo Dev server is ready!

:: Search for Chrome path to open
set "CHROME_PATH="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe"
)

if defined CHROME_PATH (
    echo Opening app in Google Chrome...
    start "" "!CHROME_PATH!" "http://127.0.0.1:3000"
) else (
    echo Google Chrome not found. Opening in system default browser...
    start "" "http://127.0.0.1:3000"
)

echo.
echo Dev server launched! Keep the server window open while developing.
echo To stop, close the "Arabic Adventures Dev Server" window.
echo.
