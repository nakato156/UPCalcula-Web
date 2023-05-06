@echo off

set nombreCarpetaEnv=env

if not "%1"=="" (
    set nombreCarpetaEnv=%1
)

set global=0

if not exist %nombreCarpetaEnv% (
    powershell.exe -Command "Write-Host 'No se ha encontrado el entorno virtual %nombreCarpetaEnv%' -ForegroundColor Red"
    powershell.exe -Command "Write-Host 'Buscando requirements.txt' -ForegroundColor Yellow"
    if not exist requirements.txt (
        powershell.exe -Command "Write-Host 'No se ha encontrado requirements.txt' -ForegroundColor Red"
        powershell.exe -Command "Write-Host 'Intentando de forma global' -ForegroundColor Yellow"
        set global=1
    ) else (
        powershell.exe -Command "Write-Host 'Creando entorno virtual %nombreCarpetaEnv%' -ForegroundColor Green"
        call python -m venv %nombreCarpetaEnv%
        call %nombreCarpetaEnv%\Scripts\activate
        call pip install -r requirements.txt
    )
)

if %global% EQU 0 (
    powershell.exe -Command "Write-Host 'Activando entorno' -ForegroundColor Yellow"
    call %nombreCarpetaEnv%\Scripts\activate
)

powershell.exe -Command "Write-Host 'Convirtiendo archivos' -ForegroundColor Yellow"
pyinstaller --onefile --add-data "static;static" --add-data "templates;templates" --icon=UPCalcula_ico.ico index.py

if %ERRORLEVEL% NEQ 0 (
    powershell.exe -Command "Write-Host 'Error al ejecutar pyinstaller' -ForegroundColor Red"
    exit /b 1
)

pyinstaller --onefile --add-data "diagrama;." --add-data "diagrama.png;diagrama.png" --icon=hasse.ico hasse.py

if %global% EQU 0 (
    call %nombreCarpetaEnv%\Scripts\deactivate
)

powershell.exe -Command "Write-Host 'Terminado exitosamente!' -ForegroundColor Green"