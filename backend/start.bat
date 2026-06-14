@echo off
setlocal EnableExtensions EnableDelayedExpansion

echo ============================================
echo  Badlaav - Starting BACKEND dev server
echo ============================================
echo.

REM --- Pre-flight: node_modules ---------------------------------------------
if not exist "%~dp0..\node_modules" (
  echo [X] node_modules missing.
  echo.
  echo     Run setup.bat from the repo root first, then try again.
  goto :error
)

REM --- Pre-flight: backend\.env (auto-create from example if missing) -------
if not exist "%~dp0.env" (
  if exist "%~dp0.env.example" (
    echo [!] backend\.env was missing. Copying from backend\.env.example...
    copy /Y "%~dp0.env.example" "%~dp0.env" >nul
    if errorlevel 1 (
      echo [X] Failed to copy .env.example to .env.
      goto :error
    )
    echo [OK] backend\.env created. You still need to fill in real values - see below.
    echo.
  ) else (
    echo [X] backend\.env AND backend\.env.example are both missing.
    echo     The backend cannot start without a .env file.
    echo     Re-run setup.bat or restore backend\.env.example from git.
    goto :error
  )
)

REM --- Warn if .env still has the placeholder DATABASE_URL ------------------
findstr /C:"postgresql://postgres.PROJECTREF" "%~dp0.env" >nul 2>&1
if not errorlevel 1 (
  echo [!] backend\.env still has the PLACEHOLDER DATABASE_URL from .env.example.
  echo     The backend will crash on Prisma client init until you fix this.
  echo.
  echo     Required env values to populate:
  echo       DATABASE_URL          Supabase transaction pooler ^(port 6543^)
  echo       DIRECT_URL            Supabase direct/session pooler ^(port 5432^)
  echo       JWT_SECRET            node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
  echo       JWT_REFRESH_SECRET    run the same command again - must differ
  echo       BREVO_SMTP_USER + BREVO_SMTP_PASS
  echo       RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET
  echo       SEED_ADMIN_PASSWORD
  echo.
  echo     Press Ctrl+C now to abort, or any key to start anyway and watch it fail.
  pause >nul
  echo.
)

REM --- Auto-kill any process already on port 4000 ---------------------------
REM Prevents "EADDRINUSE" crash if a previous backend is still running.
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr :4000 ^| findstr LISTENING') do (
  echo [!] Port 4000 is in use ^(PID %%a^). Stopping it first...
  taskkill /F /PID %%a >nul 2>&1
  timeout /t 1 /nobreak >nul
)

REM --- All checks passed - launch backend dev server ------------------------
echo --------------------------------------------
echo Backend  will be served at: http://localhost:4000
echo.
echo Press Ctrl+C in this window to stop the backend,
echo or run stop.bat from another terminal to stop everything.
echo --------------------------------------------
echo.

REM Run from repo root so npm workspaces resolves correctly
cd /d "%~dp0.."
call npm run dev:be
set "NPM_EXIT=%ERRORLEVEL%"

if not "%NPM_EXIT%"=="0" (
  echo.
  echo [X] npm run dev:be exited with code %NPM_EXIT%.
  echo     Common causes:
  echo       - DATABASE_URL is still the placeholder
  echo       - Port 4000 is already in use ^(run stop.bat first^)
  echo       - Prisma client not generated ^(run setup.bat^)
  goto :error
)

goto :end

:error
echo.
echo --------------------------------------------
echo Press any key to close this window...
pause >nul
endlocal
exit /b 1

:end
endlocal
exit /b 0
