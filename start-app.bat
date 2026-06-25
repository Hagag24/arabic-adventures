@echo off
setlocal enabledelayedexpansion
title Start Arabic Adventures

:: Disable devtools in production
set SHOW_NEXT_DEVTOOLS=false

:: Change to script directory
cd /d "%~dp0"
echo Starting Arabic Adventures...

:: Verify Node.js and pnpm
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    pause
    exit /b 1
)
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] pnpm is not installed.
    pause
    exit /b 1
)

:: Verify build output exists
if not exist ".next\BUILD_ID" (
    echo [ERROR] لم يتم إنشاء نسخة التشغيل بعد. شغّل setup-app.bat أولًا.
    pause
    exit /b 1
)

:: Verify database file exists
if not exist "data\arabic-adventures.db" (
    echo [ERROR] Database file (data\arabic-adventures.db) is missing. Please run setup-app.bat first.
    pause
    exit /b 1
)

:: Check and clean port 3001
echo Checking port 3001...
powershell -ExecutionPolicy Bypass -File scripts\ensure-project-port.ps1 -Port 3001
if %errorlevel% neq 0 (
    echo [ERROR] Port 3001 is occupied by an external application.
    pause
    exit /b 1
)

:: Start the production server in a new window to keep it visible
echo Starting Next.js production server on port 3001...
start "Arabic Adventures Server" pnpm start -- --hostname 127.0.0.1 --port 3001

:: Poll /api/health with a maximum timeout
echo Waiting for the server to become healthy...
set "ready=0"
for /L %%i in (1,1,30) do (
    if !ready! equ 0 (
        powershell -Command "$resp = Invoke-RestMethod -Uri 'http://127.0.0.1:3001/api/health' -ErrorAction SilentlyContinue; if ($resp.status -eq 'ok') { exit 0 } else { exit 1 }" >nul 2>nul
        if !errorlevel! equ 0 (
            set "ready=1"
        ) else (
            timeout /t 1 /nobreak >nul
        )
    )
)

if !ready! equ 0 (
    echo [ERROR] Server failed to start or did not pass the health check.
    pause
    exit /b 1
)

echo Server is ready!

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
    start "" "!CHROME_PATH!" "http://127.0.0.1:3001"
) else (
    echo Google Chrome not found. Opening in system default browser...
    start "" "http://127.0.0.1:3001"
)

echo.
echo Application launched! Keep the server window open while using the app.
echo To stop, close the "Arabic Adventures Server" window.
echo.
