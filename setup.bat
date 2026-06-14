@echo off
setlocal EnableExtensions EnableDelayedExpansion

echo ============================================
echo  Badlaav - First-time setup
echo ============================================
echo.

REM --- 1. Node version check -------------------------------------------------
where node >nul 2>&1
if errorlevel 1 (
  echo [X] Node.js not found. Install Node 18-22 from https://nodejs.org
  goto :error
)
for /f "delims=" %%v in ('node --version') do set "NODE_VER=%%v"
echo [OK] Node !NODE_VER! detected

where npm >nul 2>&1
if errorlevel 1 (
  echo [X] npm not found alongside Node. Reinstall Node.js.
  goto :error
)

REM --- 2. Install dependencies (root + all workspaces) -----------------------
echo.
echo Installing dependencies (npm install at repo root)...
call npm install
if errorlevel 1 (
  echo [X] npm install failed. Check the output above.
  goto :error
)
echo [OK] Dependencies installed.

REM --- 3. Generate Prisma client --------------------------------------------
echo.
echo Generating Prisma client...
pushd backend
call npx prisma generate
if errorlevel 1 (
  echo [X] prisma generate failed.
  popd
  goto :error
)
popd
echo [OK] Prisma client generated.

REM --- 4. Scaffold .env files from .env.example if missing -------------------
echo.
if exist backend\.env (
  echo [OK] backend\.env already exists - leaving it alone.
) else (
  if exist backend\.env.example (
    copy /Y backend\.env.example backend\.env >nul
    echo [!] backend\.env scaffolded from backend\.env.example.
    echo     Fill these BEFORE running start.bat:
    echo       DATABASE_URL          ^(Supabase transaction pooler, port 6543 - use a NEW Supabase project^)
    echo       DIRECT_URL            ^(Supabase direct/session pooler, port 5432^)
    echo       JWT_SECRET            node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
    echo       JWT_REFRESH_SECRET    run the same command again - must differ from JWT_SECRET
    echo       BREVO_SMTP_USER + BREVO_SMTP_PASS
    echo       RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET
    echo       CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET
    echo       SEED_ADMIN_PASSWORD
  ) else (
    echo [!] backend\.env.example not found; skipping backend .env scaffold.
  )
)

if exist frontend\.env (
  echo [OK] frontend\.env already exists - leaving it alone.
) else (
  if exist frontend\.env.example (
    copy /Y frontend\.env.example frontend\.env >nul
    echo [!] frontend\.env scaffolded from frontend\.env.example - set VITE_RAZORPAY_KEY_ID.
  ) else (
    echo [!] frontend\.env.example not found; skipping frontend .env scaffold.
  )
)

REM --- 5. Summary ------------------------------------------------------------
echo.
echo ============================================
echo  Setup complete
echo ============================================
echo Next steps:
echo   1. Edit backend\.env with your real Supabase/Brevo/Razorpay/Cloudinary credentials.
echo      ^(DATABASE_URL = Supabase TRANSACTION pooler, port 6543, with ?pgbouncer=true^&connection_limit=1^)
echo      ^(DIRECT_URL   = Supabase SESSION pooler, port 5432, for migrations^)
echo   2. cd backend ^&^& npm run migrate:deploy  ^(applies committed migrations to your Supabase project^)
echo   3. cd backend ^&^& npm run prisma:seed     ^(admin + a Badlaav batch + coupon^)
echo   4. start.bat                              ^(runs frontend + backend dev servers^)
echo   5. stop.bat                               ^(kills both servers from another terminal^)
echo.
echo Press any key to close this window...
pause >nul
endlocal
exit /b 0

:error
echo.
echo --------------------------------------------
echo Setup failed. Press any key to close this window...
pause >nul
endlocal
exit /b 1
