@echo off

:: Base output folder. Override it by setting the SCAN_DIR environment variable.
set "output_folder=%SCAN_DIR%"
if not defined SCAN_DIR set "output_folder=C:\SCANS"

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
set filename=%date:~6,4%-%date:~3,2%-%date:~0,2%-%time:~0,2%-%time:~3,2%-%time:~6,2%.tiff

:: Run NAPS2 CLI to perform the scan and save it to the desired location
NAPS2.Console scan --profile "Canon DR-C230" --output "%output_folder%\%filename%"

echo Scan complete. File saved as %output_folder%\%filename%

pause
