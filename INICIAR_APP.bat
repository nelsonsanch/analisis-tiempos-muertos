@echo off
chcp 65001 >nul
title Análisis de Tiempos Muertos - Servidor
color 0B

echo ╔═══════════════════════════════════════════════════════════╗
echo ║        ANÁLISIS DE TIEMPOS MUERTOS                        ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo Iniciando servidor de desarrollo...
echo.
echo La aplicación se abrirá automáticamente en tu navegador.
echo Si no se abre, ve a: http://localhost:3000
echo.
echo Para detener el servidor, cierra esta ventana o presiona Ctrl+C
echo.
echo ═══════════════════════════════════════════════════════════
echo.

REM Cambiar al directorio del proyecto
cd /d "%~dp0"

REM Esperar 3 segundos y abrir el navegador en segundo plano
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

REM Iniciar el servidor
pnpm dev

pause
