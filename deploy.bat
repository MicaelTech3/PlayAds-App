@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   PlayAds — Deploy Firebase Hosting
echo ==========================================
echo.

REM ── Verifica Node/npm ───────────────────────────────────────────
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado.
    echo        Instale em https://nodejs.org
    pause & exit /b 1
)

REM ── Instala Firebase CLI se necessario ──────────────────────────
firebase --version >nul 2>&1
if errorlevel 1 (
    echo [1/4] Instalando Firebase CLI...
    npm install -g firebase-tools
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar firebase-tools
        pause & exit /b 1
    )
) else (
    echo [1/4] Firebase CLI ja instalado. OK
)

REM ── Login Firebase ──────────────────────────────────────────────
echo.
echo [2/4] Login no Firebase...
echo       (vai abrir o navegador para autenticar)
echo.
firebase login
if errorlevel 1 (
    echo [ERRO] Login falhou
    pause & exit /b 1
)

REM ── Build React ─────────────────────────────────────────────────
echo.
echo [3/4] Compilando interface React...
call npm install --silent
if errorlevel 1 ( echo [ERRO] npm install falhou & pause & exit /b 1 )

call npm run build
if errorlevel 1 ( echo [ERRO] npm build falhou & pause & exit /b 1 )
echo       Build concluido!

REM ── Deploy ──────────────────────────────────────────────────────
echo.
echo [4/4] Enviando para Firebase Hosting...
firebase deploy --only hosting

if errorlevel 1 (
    echo.
    echo [ERRO] Deploy falhou. Verifique se esta logado no projeto certo.
    pause & exit /b 1
)

echo.
echo ==========================================
echo   DEPLOY CONCLUIDO!
echo ==========================================
echo.
echo   Site publicado em:
echo   https://anucio-web.web.app
echo.
echo   O PlayAds.exe ja vai carregar a nova versao
echo   automaticamente na proxima abertura.
echo.
pause
