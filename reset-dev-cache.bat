@echo off
setlocal enabledelayedexpansion
title Reset Arabic Adventures Dev Cache

:: Disable devtools when clearing dev cache
set SHOW_NEXT_DEVTOOLS=false

:: Change to script directory
cd /d "%~dp0"

echo Stopping any stale project dev server on port 3000...
powershell -ExecutionPolicy Bypass -File scripts\ensure-project-port.ps1 -Port 3000

echo Deleting .next cache folder...
powershell -Command "Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue"

echo Dev cache has been reset. Starting development mode...
call start-dev.bat
