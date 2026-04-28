@echo off
setlocal

echo ============================================================
echo  SchemaSync -- Build EXE
echo ============================================================
echo.

echo [1/3] Installing PyInstaller...
pip install pyinstaller --quiet
if errorlevel 1 ( echo FAILED & exit /b 1 )

echo [2/3] Building React frontend...
cd frontend
call npm install --silent
call npm run build
if errorlevel 1 ( echo FAILED & cd .. & exit /b 1 )
cd ..

echo [3/3] Packaging with PyInstaller...
pyinstaller schemasync.spec --clean --noconfirm
if errorlevel 1 ( echo FAILED & exit /b 1 )

echo.
echo ============================================================
echo  Done!  Your app is at:  dist\SchemaSync.exe
echo  Double-click it to launch SchemaSync.
echo ============================================================
endlocal
