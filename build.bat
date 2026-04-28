@echo off
setlocal

echo ============================================================
echo  SchemaSync -- Build EXE
echo ============================================================
echo.

:: ── 1. Create / reuse a clean build venv ─────────────────────────────────────
echo [1/4] Setting up clean build environment...
if not exist build_venv (
    python -m venv build_venv
    if errorlevel 1 ( echo FAILED to create venv & exit /b 1 )
)

call build_venv\Scripts\activate.bat
if errorlevel 1 ( echo FAILED to activate venv & exit /b 1 )

:: Install only SchemaSync's runtime deps + PyInstaller — nothing else
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt pyinstaller
if errorlevel 1 ( echo FAILED to install dependencies & exit /b 1 )
echo    Done.

:: ── 2. Build React frontend ───────────────────────────────────────────────────
echo.
echo [2/4] Building React frontend...
cd frontend
call npm install --silent
call npm run build
if errorlevel 1 ( echo FAILED & cd .. & exit /b 1 )
cd ..
echo    Done.

:: ── 3. Kill any previous dist so we get a fresh build ────────────────────────
echo.
echo [3/4] Cleaning previous build artifacts...
if exist dist\SchemaSync.exe del /f /q dist\SchemaSync.exe
if exist build\schemasync rmdir /s /q build\schemasync
echo    Done.

:: ── 4. Package ────────────────────────────────────────────────────────────────
echo.
echo [4/4] Packaging with PyInstaller (this takes a minute)...
pyinstaller schemasync.spec --clean --noconfirm
if errorlevel 1 ( echo FAILED & exit /b 1 )

call deactivate

echo.
echo ============================================================
echo  Done!  Your app is at:  dist\SchemaSync.exe
echo  Double-click it to launch SchemaSync.
echo ============================================================
endlocal
