@echo off
title Site Internet - Serveur Local
cd /d "%~dp0"

echo.
echo  ====================================
echo   Demarrage du serveur local...
echo  ====================================
echo.

python --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Python detecte - Serveur HTTP en cours de demarrage...
    echo  [INFO] Adresse : http://localhost:8080
    echo  [INFO] Appuyez sur CTRL+C pour arreter le serveur
    echo.
    start "" "http://localhost:8080"
    python -m http.server 8080
    goto :end
)

py --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Python detecte - Serveur HTTP en cours de demarrage...
    echo  [INFO] Adresse : http://localhost:8080
    echo  [INFO] Appuyez sur CTRL+C pour arreter le serveur
    echo.
    start "" "http://localhost:8080"
    py -m http.server 8080
    goto :end
)

npx --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Node.js detecte - Serveur en cours de demarrage via npx serve...
    echo  [INFO] Adresse : http://localhost:8080
    echo  [INFO] Appuyez sur CTRL+C pour arreter le serveur
    echo.
    start "" "http://localhost:8080"
    npx -y serve -l 8080 .
    goto :end
)

echo  [WARN] Python et Node.js introuvables.
echo  [INFO] Installez Python (https://www.python.org/downloads/ -
echo  [INFO] cochez "Add to PATH") pour un rendu fiable des images/JS.
echo  [INFO] Ouverture directe du fichier index.html dans le navigateur...
echo.
start "" "%~dp0index.html"

:end
echo.
pause
