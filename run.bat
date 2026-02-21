@echo off
setlocal

title HealthMitra Runner

echo =======================================================
echo   🏥 HealthMitra Scan - Automated Runner ^& Setup
echo =======================================================
echo.

:: ── Step 1: Cleanup Existing Processes ─────────────────────────────
echo [1/4] Closing existing HealthMitra tasks...

:: Check for port 8000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /c:"LISTENING" ^| findstr ":8000"') do (
    echo [CLEANUP] Killing Process ID %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)

:: Check for port 5173 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /c:"LISTENING" ^| findstr ":5173"') do (
    echo [CLEANUP] Killing Process ID %%a on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Cleanup complete.
echo.

:: ── Step 2: Backend Dependencies ──────────────────────────────────
echo [2/4] Syncing Backend dependencies...

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found! Please install Python 3.10 or higher.
    pause
    exit /b
)

:: Create/Update Virtual Environment
if not exist "venv" (
    echo [SETUP] Creating virtual environment...
    python -m venv venv
)

:: Install dependencies
echo [SETUP] Updating pip and installing requirements...
if exist "venv\Scripts\activate.bat" (
    call "venv\Scripts\activate.bat"
    python -m pip install --upgrade pip >nul 2>&1
    pip install -r requirements.txt
) else (
    echo [ERROR] Virtual environment activation script not found!
    echo Trying global pip...
    pip install -r requirements.txt
)
echo [OK] Backend ready.
echo.

:: ── Step 3: Frontend Dependencies ─────────────────────────────────
echo [3/4] Syncing Frontend dependencies...

:: Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please install Node.js 18 or higher.
    pause
    exit /b
)

if exist "frontend" (
    pushd frontend
    if not exist "node_modules" (
        echo [SETUP] Installing node_modules ^(this may take a minute^)...
        call npm install
    ) else (
        echo [SETUP] Checking for new frontend dependencies...
        call npm install
    )
    popd
) else (
    echo [ERROR] Frontend directory not found!
)
echo [OK] Frontend ready.
echo.

:: ── Step 4: Launch Servers ────────────────────────────────────────
echo [4/4] Launching servers...

:: Start Backend
echo [LAUNCH] Starting Backend at http://localhost:8000
if exist "backend\main.py" (
    start "HealthMitra - Backend" cmd /k "title HealthMitra Backend && call venv\Scripts\activate && cd backend && python main.py"
) else (
    echo [ERROR] backend\main.py not found!
)

:: Start Frontend
echo [LAUNCH] Starting Frontend at http://localhost:5173
if exist "frontend" (
    start "HealthMitra - Frontend" cmd /k "title HealthMitra Frontend && cd frontend && npm run dev"
) else (
    echo [ERROR] frontend directory not found!
)

echo.
echo =======================================================
echo   🚀 Application is starting in new windows...
echo   Backend: http://localhost:8000/docs
echo   Frontend: http://localhost:5173
echo =======================================================
echo.
echo If any window closes suddenly, check the error message in it.
echo Press any key to exit this loader.
pause >nul
exit
