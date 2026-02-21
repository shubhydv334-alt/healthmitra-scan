@echo off
echo ============================================
echo   HealthMitra Scan - Setup Script
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found! Install Python 3.10+ first.
    pause
    exit /b
)

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Install Node.js 18+ first.
    pause
    exit /b
)

echo.
echo [1/5] Installing Python dependencies...
pip install -r requirements.txt
echo.

echo [2/5] Installing frontend dependencies...
cd frontend
call npm install
cd ..
echo.

echo [3/5] Checking Tesseract OCR...
where tesseract >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Tesseract OCR not found in PATH.
    echo          Download from: https://github.com/UB-Mannheim/tesseract/wiki
    echo          After install, add to PATH or set TESSERACT_CMD env variable.
    echo          OCR will use SIMULATED mode until Tesseract is installed.
) else (
    echo [OK] Tesseract OCR found!
)
echo.

echo [4/5] Checking ffmpeg (required for Whisper)...
where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo [WARNING] ffmpeg not found in PATH.
    echo          Download from: https://ffmpeg.org/download.html
    echo          Speech-to-text will use SIMULATED mode until ffmpeg is installed.
) else (
    echo [OK] ffmpeg found!
)
echo.

echo [5/5] Checking Ollama...
where ollama >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Ollama not found. LLM features will use fallback responses.
    echo          Download from: https://ollama.ai
) else (
    echo [OK] Ollama found! Run: ollama pull phi3
)
echo.

echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo To start the backend:
echo   cd backend ^&^& python main.py
echo.
echo To start the frontend:
echo   cd frontend ^&^& npm run dev
echo.
echo Model Status:
echo   - OCR:   Tesseract (real if installed, simulated fallback)
echo   - Food:  YOLOv8 (auto-downloads model on first use)
echo   - Voice: Whisper (real if ffmpeg installed, simulated fallback)
echo   - LLM:   Ollama + Phi3 (real if running, fallback responses)
echo.
pause
