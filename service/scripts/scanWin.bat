@echo off

if "%1"=="" (
        echo {"success": false, "errorCode": 1, "message": "A category has to be provided!"}
        exit /b 2
) 

:: Base output folder. Override it by setting the SCAN_DIR environment variable.
set "base_output_folder=%SCAN_DIR%"
if not defined SCAN_DIR set "base_output_folder=C:\SCANS"

:: Define the category-specific output folder
set output_folder=%base_output_folder%\%1

:: Create the output folder if it doesn't exist (recursively)
if not exist %output_folder% (
    mkdir %output_folder%
    if errorlevel 1 (
        echo {"success": false, "errorCode": 2, "message": "Failed to create output folder"}
        exit /b 2
    )
)


:: Get the current date and time components
for /f "tokens=1-5 delims=/: " %%a in ("%date% %time%") do (
    set year=%%c
    set month=%%a
    set day=%%b
    set hour=%%d
    set minute=%%e
    set second=%%f
)

:: Format the output filename as year-month-day-hour-minute-second.tiff
set filename=%date:~6,4%-%date:~3,2%-%date:~0,2%-%time:~0,2%-%time:~3,2%-%time:~6,2%.pdf

:: Construct the full file path
set filepath=%output_folder%\%filename%

:: Run NAPS2 CLI to perform the scan and save it to the desired location
NAPS2.Console scan -p "Canon DR-C230" -o "%filepath%" 
if errorlevel 1 (
    echo {"success": false, "errorCode": 3, "message": "NAPS2 scan failed"}
    exit /b 3
)

set "escapedFilepath=%filepath:\=\\%"

:: Return the result as JSON
echo {"success": true, "errorCode": 0, "filename": "%filename%", "filepath": "%escapedFilepath%"}
exit /b 0