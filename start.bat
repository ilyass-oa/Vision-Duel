@echo off
setlocal enabledelayedexpansion

set "PROJECT_DIR=%~dp0"
echo [VisionDuel] Démarrage...

:: Define Python path
if exist "%PROJECT_DIR%.venv\Scripts\python.exe" (
  set "PYTHON_BIN=%PROJECT_DIR%.venv\Scripts\python.exe"
) else (
  set "PYTHON_BIN=python"
)

echo.
echo Vérification des modèles IA...
set "PY_CHECK=import os; ds='resources/dataset/training_images'; t_ds=max([os.path.getmtime(os.path.join(r,f)) for r,d,fs in os.walk(ds) for f in fs]+[0]) if os.path.exists(ds) else 0; ma='runs/model_a/best.pt'; mb='runs/model_b/best.pt'; (os.remove(ma) if t_ds>os.path.getmtime(ma) else 0) if os.path.exists(ma) else 0; (os.remove(mb) if t_ds>os.path.getmtime(mb) else 0) if os.path.exists(mb) else 0"
cd /d "%PROJECT_DIR%"
"%PYTHON_BIN%" -c "%PY_CHECK%"

set TRAIN_NEEDED=
if not exist "%PROJECT_DIR%runs\model_a\best.pt" set TRAIN_NEEDED=1
if not exist "%PROJECT_DIR%runs\model_b\best.pt" set TRAIN_NEEDED=1

if defined TRAIN_NEEDED (
  echo Entraînement des modèles requis (les fichiers sont manquants ou obsolètes)...
  cd /d "%PROJECT_DIR%backend"
  set "PYTHONPATH=%PROJECT_DIR%backend"
  
  echo Préparation des datasets...
  "%PYTHON_BIN%" scripts\prepare_datasets.py
  
  if not exist "%PROJECT_DIR%runs\model_a\best.pt" (
    echo Entraînement du Modèle A (Spécialiste)...
    "%PYTHON_BIN%" image_classifier\train.py --data_dir "%PROJECT_DIR%resources\dataset\model_a_data" --out_dir "%PROJECT_DIR%runs\model_a" --epochs 10 --batch_size 16 --lr 0.001
  )
  
  if not exist "%PROJECT_DIR%runs\model_b\best.pt" (
    echo Entraînement du Modèle B (Robuste)...
    "%PYTHON_BIN%" image_classifier\train.py --data_dir "%PROJECT_DIR%resources\dataset\model_b_data" --out_dir "%PROJECT_DIR%runs\model_b" --epochs 10 --batch_size 16 --lr 0.001
  )
  echo Entraînement terminé.
)

echo.
echo [1/3] Installation des dépendances du Frontend...
cd /d "%PROJECT_DIR%frontend" || exit /b
call npm install --no-audit --no-fund

echo.
echo [2/3] Démarrage du Backend...
cd /d "%PROJECT_DIR%backend" || exit /b
set "PYTHONPATH=%PROJECT_DIR%backend"
start /B "Backend" "%PYTHON_BIN%" app.py

echo.
echo [3/3] Configuration du tunnel public Cloudflare...
start /B "Cloudflared" cloudflared tunnel --url http://localhost:3000 > "%PROJECT_DIR%cloudflared.log" 2>&1

set "TUNNEL_URL="
echo En attente de l'obtention de l'URL publique (patientez jusqu'a 15s)...
for /L %%i in (1,1,15) do (
  for /F "delims=" %%A in ('findstr /R "https://[-0-9a-zA-Z]*\.trycloudflare\.com" "%PROJECT_DIR%cloudflared.log" 2^>nul') do (
    set "LINE=%%A"
    :: Extraction simple par position (la logique powershell limite les bugs CMD)
    for /f "usebackq tokens=*" %%p in (`powershell -NoProfile -Command "[regex]::match('!LINE!', 'https://[-0-9a-zA-Z]*\.trycloudflare\.com').Value"`) do set "TUNNEL_URL=%%p"
  )
  if defined TUNNEL_URL goto :url_found
  timeout /t 1 /nobreak >nul
)

:url_found
if defined TUNNEL_URL (
  echo Succès ! Lien public Cloudflare: !TUNNEL_URL!
  echo VITE_TUNNEL_URL=!TUNNEL_URL!> "%PROJECT_DIR%frontend\.env.local"
) else (
  echo ATTENTION: Impossible d'obtenir un lien Cloudflare. Vérifiez si cloudflared est installé.
  echo. > "%PROJECT_DIR%frontend\.env.local"
)

echo.
echo Construction et Démarrage du Frontend (Production Mode)...
cd /d "%PROJECT_DIR%frontend" || exit /b
start /B "Frontend" cmd /c "npm run build && npm run preview"

echo.
echo ====================================================
echo Dashboard Local Backend  : http://localhost:5000
echo Application Frontend     : http://localhost:3000
if defined TUNNEL_URL (
  echo Jouer depuis Mobile    : !TUNNEL_URL!
)
echo ====================================================
echo.
echo APPUYEZ SUR N'IMPORTE QUELLE TOUCHE POUR TOUT FERMER...
pause >nul

echo Fermeture des serveurs...
taskkill /F /IM cloudflared.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo Fini !
