@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
set "ERR=0"

echo ============================================
echo   Mise a jour du site en cours...
echo ============================================
echo.

echo [1/3] Photos de projets...
python "%~dp0generate_manifest.py"
if errorlevel 1 set "ERR=1"
echo.

echo [2/3] Parcours (Journey)...
python "%~dp0generate_journey.py"
if errorlevel 1 set "ERR=1"
echo.

echo [3/3] Competences (Skills)...
python "%~dp0generate_skills.py"
if errorlevel 1 set "ERR=1"
echo.

if "%ERR%"=="1" (
    echo ============================================
    echo   Une erreur est survenue pendant la mise a jour.
    echo   Verifiez que Python est installe
    echo   ^(https://www.python.org/downloads/ - cochez "Add to PATH" a l'installation^).
    echo ============================================
) else (
    echo ============================================
    echo   Site mis a jour ^(photos + parcours + competences^).
    echo   Rafraichissez la page ^(F5^) pour voir les changements.
    echo ============================================
)
echo.
pause
