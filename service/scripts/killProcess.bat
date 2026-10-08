@echo off
setlocal
set "processName=%~1"
set "pids="

if "%processName%"=="" (
        echo {"success": false, "errorCode": 1, "message": "A category has to be provided!"}
        exit /b 2
)

for /f "tokens=2 delims=," %%A in ('tasklist /FO CSV /NH ^| findstr /I "%processName%"') do (
    set "pids=%pids%,%%A"
    taskkill /F /PID %%A >nul 2>&1
)

:: Remove leading comma if any PIDs were found
if not "%pids%"=="" set "pids=%pids:~1%"

echo {"success": true, "errorCode": 0, "killedPIDs": [%pids%]}
exit /b 0

endlocal