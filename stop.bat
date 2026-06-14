@echo off
setlocal EnableExtensions EnableDelayedExpansion

echo ============================================
echo  Badlaav - Stopping dev servers
echo ============================================
echo.

set /a KILLED=0

REM --- Kill anything LISTENING on the dev ports -----------------------------
REM Default ports: 5173 (Vite frontend), 4000 (Express backend),
REM 5555 (Prisma Studio if running)
set "PORTS=5173 4000 5555"

for %%p in (%PORTS%) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
    echo  - Killing PID %%a on port %%p
    taskkill /F /PID %%a >nul 2>&1
    if not errorlevel 1 set /a KILLED+=1
  )
)

echo.
if !KILLED! EQU 0 (
  echo  No dev servers were listening on ports 5173 / 4000 / 5555.
) else (
  echo  Stopped !KILLED! process^(es^).
)

echo.
echo Press any key to close this window...
pause >nul
endlocal
exit /b 0
