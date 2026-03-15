@echo off
echo ==========================================
echo   PlayAds v7.0 - Setup
echo ==========================================
echo.

echo [1/3] Instalando dependencias Python...
pip install pywebview requests pygame pycaw yt-dlp
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias Python
    pause
    exit /b 1
)

echo.
echo [2/3] Instalando dependencias Node...
npm install
if errorlevel 1 (
    echo ERRO: Falha no npm install. Instale o Node.js em https://nodejs.org
    pause
    exit /b 1
)

echo.
echo [3/3] Compilando interface React...
npm run build
if errorlevel 1 (
    echo ERRO: Falha no build React
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   Setup concluido! Rodando PlayAds...
echo ==========================================
echo.
python player.py
pause
