@echo off
title VoltPoint EV - Full Platform Launcher
color 0A

echo ====================================================================
echo        VOLTPOINT EV CHARGING PLATFORM - 1-CLICK LAUNCHER
echo ====================================================================
echo.

echo [1/4] Building Spring Boot Backend...
cd /d "%~dp0backend"
call mvn clean package -DskipTests

if not exist "target\ev-charging-backend-1.0.0.jar" (
    echo.
    echo ERROR: Backend JAR was not created.
    echo Please check the Maven errors above.
    pause
    exit /b
)

echo.
echo [2/4] Starting Spring Boot Backend on port 8080...
start "VoltPoint Backend API" cmd /k "cd /d "%~dp0backend" && java -jar target\ev-charging-backend-1.0.0.jar"

timeout /t 8 /nobreak > nul

echo.
echo [3/4] Starting Vite React Frontend on port 5173...
start "VoltPoint Frontend Web" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 0.0.0.0"

timeout /t 5 /nobreak > nul

echo.
echo [4/4] Opening Web App...
start http://localhost:5173

echo.
echo ====================================================================
echo                    VOLTPOINT EV STARTED
echo ====================================================================
echo.
echo  Local:        http://localhost:5173
echo  Backend API:  http://localhost:8080
echo.
echo  Demo Logins:
echo   Customer: customer@evhub.in
echo   Operator: operator@evhub.in
echo   Admin:    admin@evhub.in
echo.
echo ====================================================================
echo Keep the backend and frontend windows running.
pause