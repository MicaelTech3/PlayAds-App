@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   PlayAds v7.0 — Build EXE (modo online)
echo ==========================================
echo.
echo A interface carrega do site — sem npm necessario!
echo.

REM ── 1. Verifica Python ──────────────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado.
    echo        Instale em https://python.org  (marque "Add to PATH")
    pause & exit /b 1
)

REM ── 2. Instala dependencias Python ──────────────────────────────
echo [1/3] Instalando dependencias Python...
pip install pywebview requests pygame pyinstaller
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias
    pause & exit /b 1
)
echo.

REM ── 3. Gera o .exe ──────────────────────────────────────────────
echo [2/3] Gerando executavel...
echo.

pyinstaller ^
  --noconfirm ^
  --onefile ^
  --windowed ^
  --name "PlayAds" ^
  --hidden-import "webview" ^
  --hidden-import "webview.platforms.winforms" ^
  --hidden-import "clr" ^
  --hidden-import "pygame" ^
  --hidden-import "pygame.mixer" ^
  --hidden-import "requests" ^
  --hidden-import "certifi" ^
  --hidden-import "charset_normalizer" ^
  --hidden-import "urllib3" ^
  --collect-all "webview" ^
  player.py

if errorlevel 1 (
    echo.
    echo [ERRO] PyInstaller falhou.
    echo        Tente rodar sem --windowed para ver o erro:
    echo        pyinstaller --onefile --name PlayAds --collect-all webview player.py
    pause & exit /b 1
)

echo.
echo [3/3] Copiando arquivos necessarios...
if not exist "dist" mkdir dist
if exist "activation.json" copy /y "activation.json" "dist\" >nul
if exist "serviceAccountKey.json" copy /y "serviceAccountKey.json" "dist\" >nul

echo.
echo ==========================================
echo   BUILD CONCLUIDO!
echo ==========================================
echo.
echo   Executavel: dist\PlayAds.exe
echo.
echo   Para distribuir: envie apenas  dist\PlayAds.exe
echo   (modo --onefile = EXE unico, nao precisa de pasta)
echo.
echo   ATENCAO: O PC precisa ter internet para abrir o app.
echo.
pause
