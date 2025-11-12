#!/bin/bash

# Colores para la terminal
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

clear

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        ANÁLISIS DE TIEMPOS MUERTOS                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Iniciando servidor de desarrollo..."
echo ""
echo "La aplicación se abrirá automáticamente en tu navegador."
echo "Si no se abre, ve a: http://localhost:3000"
echo ""
echo "Para detener el servidor, cierra esta ventana o presiona Ctrl+C"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Obtener el directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Abrir el navegador después de 3 segundos en segundo plano
(sleep 3 && xdg-open http://localhost:3000) &

# Iniciar el servidor
pnpm dev
