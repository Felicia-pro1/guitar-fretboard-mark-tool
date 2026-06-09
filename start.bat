@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==============================================
echo     Guitar Fretboard Application Launcher
echo ==============================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "delims=" %%a in ('node --version') do set NODE_VERSION=%%a
echo Node.js version: !NODE_VERSION!
echo.

echo Checking if port 8080 is available...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo WARNING: Port 8080 is already in use!
    echo Trying to kill the process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
        taskkill /f /pid %%a >nul 2>&1
        if !errorlevel! equ 0 (
            echo Successfully killed process PID %%a
        ) else (
            echo Failed to kill process PID %%a, continuing anyway...
        )
    )
    timeout /t 1 /nobreak >nul
)

echo.
echo Starting server...
start /B /MIN cmd /c "node server.js"

set "wait_count=0"
set "max_wait=30"

:wait_loop
timeout /t 1 /nobreak >nul
set /a wait_count+=1

netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    goto server_ready
)

if !wait_count! geq !max_wait! (
    echo ERROR: Server failed to start within !max_wait! seconds
    pause
    exit /b 1
)

echo Waiting for server... [!wait_count!/!max_wait!]
goto wait_loop

:server_ready
echo.
echo Server is ready!
echo Opening browser...
start "" http://localhost:8080/

echo.
echo ==============================================
echo     Server running at http://localhost:8080/
echo ==============================================
echo Press any key to exit...
pause >nul
