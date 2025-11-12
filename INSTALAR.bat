@echo off
chcp 65001 >nul
title Instalador - Análisis de Tiempos Muertos
color 0A

echo ╔═══════════════════════════════════════════════════════════╗
echo ║     INSTALADOR - ANÁLISIS DE TIEMPOS MUERTOS              ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo Este instalador realizará las siguientes acciones:
echo   1. Instalar las dependencias necesarias
echo   2. Crear un acceso directo en el escritorio
echo   3. Preparar la aplicación para su uso
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════
echo  PASO 1: Instalando dependencias...
echo ═══════════════════════════════════════════════════════════
echo.

pnpm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR: No se pudieron instalar las dependencias.
    echo.
    echo Posibles soluciones:
    echo   - Verifica que pnpm esté instalado: pnpm --version
    echo   - Si no está instalado, ejecuta: npm install -g pnpm
    echo   - Verifica tu conexión a internet
    echo.
    pause
    exit /b 1
)

echo.
echo ✓ Dependencias instaladas correctamente
echo.

echo ═══════════════════════════════════════════════════════════
echo  PASO 2: Creando acceso directo en el escritorio...
echo ═══════════════════════════════════════════════════════════
echo.

REM Obtener la ruta actual del proyecto
set "PROJECT_DIR=%CD%"

REM Crear archivo VBScript temporal para crear el acceso directo
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\Analisis de Tiempos.lnk" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%PROJECT_DIR%\INICIAR_APP.bat" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%PROJECT_DIR%" >> CreateShortcut.vbs
echo oLink.Description = "Análisis de Tiempos Muertos" >> CreateShortcut.vbs
echo oLink.IconLocation = "%SystemRoot%\System32\shell32.dll,13" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

REM Ejecutar el script VBScript
cscript //nologo CreateShortcut.vbs

REM Eliminar el archivo temporal
del CreateShortcut.vbs

echo ✓ Acceso directo creado en el escritorio
echo.

echo ═══════════════════════════════════════════════════════════
echo  ✓ INSTALACIÓN COMPLETADA
echo ═══════════════════════════════════════════════════════════
echo.
echo La aplicación ha sido instalada correctamente.
echo.
echo Para iniciar la aplicación:
echo   - Haz doble clic en el icono "Analisis de Tiempos" en tu escritorio
echo   - O ejecuta el archivo INICIAR_APP.bat en esta carpeta
echo.
echo La aplicación se abrirá en tu navegador en: http://localhost:3000
echo.
echo ¡Disfruta analizando tiempos muertos!
echo.
pause
