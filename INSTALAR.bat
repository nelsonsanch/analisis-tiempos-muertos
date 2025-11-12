@echo off
chcp 65001 >nul
title Instalador - Analisis de Tiempos Muertos
color 0A

echo.
echo ================================================================
echo      INSTALADOR - ANALISIS DE TIEMPOS MUERTOS
echo ================================================================
echo.
echo Este instalador realizara las siguientes acciones:
echo   1. Instalar las dependencias necesarias
echo   2. Crear un acceso directo en el escritorio
echo   3. Preparar la aplicacion para su uso
echo.
pause

echo.
echo ================================================================
echo  PASO 1: Instalando dependencias...
echo ================================================================
echo.

pnpm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: No se pudieron instalar las dependencias.
    echo.
    echo Posibles soluciones:
    echo   - Verifica que pnpm este instalado: pnpm --version
    echo   - Si no esta instalado, ejecuta: npm install -g pnpm
    echo   - Verifica tu conexion a internet
    echo.
    pause
    exit /b 1
)

echo.
echo Dependencias instaladas correctamente
echo.

echo ================================================================
echo  PASO 2: Creando acceso directo en el escritorio...
echo ================================================================
echo.

set SCRIPT_DIR=%~dp0
set SCRIPT_DIR=%SCRIPT_DIR:~0,-1%

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Analisis de Tiempos.lnk'); $Shortcut.TargetPath = '%SCRIPT_DIR%\INICIAR_APP.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'Analisis de Tiempos Muertos'; $Shortcut.Save()"

if %ERRORLEVEL% EQU 0 (
    echo Acceso directo creado en el escritorio
) else (
    echo No se pudo crear el acceso directo automaticamente
    echo Puedes crear uno manualmente apuntando a INICIAR_APP.bat
)

echo.
echo ================================================================
echo  INSTALACION COMPLETADA
echo ================================================================
echo.
echo La aplicacion ha sido instalada correctamente.
echo.
echo Para iniciar la aplicacion:
echo   - Haz doble clic en el icono "Analisis de Tiempos" en tu escritorio
echo   - O ejecuta el archivo INICIAR_APP.bat en esta carpeta
echo.
echo La aplicacion se abrira en tu navegador en: http://localhost:3000
echo.
echo Disfruta analizando tiempos muertos!
echo.
pause
