#!/bin/bash

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

clear

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     INSTALADOR - ANÁLISIS DE TIEMPOS MUERTOS              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Este instalador realizará las siguientes acciones:"
echo "  1. Instalar las dependencias necesarias"
echo "  2. Crear un acceso directo en el escritorio"
echo "  3. Preparar la aplicación para su uso"
echo ""
read -p "Presiona Enter para continuar..."

echo ""
echo "═══════════════════════════════════════════════════════════"
echo " PASO 1: Instalando dependencias..."
echo "═══════════════════════════════════════════════════════════"
echo ""

# Obtener el directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Instalar dependencias
pnpm install

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ ERROR: No se pudieron instalar las dependencias.${NC}"
    echo ""
    echo "Posibles soluciones:"
    echo "  - Verifica que pnpm esté instalado: pnpm --version"
    echo "  - Si no está instalado, ejecuta: npm install -g pnpm"
    echo "  - Verifica tu conexión a internet"
    echo ""
    read -p "Presiona Enter para salir..."
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Dependencias instaladas correctamente${NC}"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo " PASO 2: Creando acceso directo en el escritorio..."
echo "═══════════════════════════════════════════════════════════"
echo ""

# Hacer ejecutable el script de inicio
chmod +x "$SCRIPT_DIR/INICIAR_APP.sh"

# Crear el archivo .desktop para el acceso directo
DESKTOP="$HOME/Desktop"
SHORTCUT="$DESKTOP/analisis-tiempos.desktop"

cat > "$SHORTCUT" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Análisis de Tiempos
Comment=Aplicación para análisis de tiempos muertos
Exec=$SCRIPT_DIR/INICIAR_APP.sh
Icon=utilities-system-monitor
Terminal=true
Categories=Office;
EOF

chmod +x "$SHORTCUT"

# En algunos sistemas Linux, también necesitamos marcar como confiable
if command -v gio &> /dev/null; then
    gio set "$SHORTCUT" metadata::trusted true 2>/dev/null
fi

echo -e "${GREEN}✓ Acceso directo creado en el escritorio${NC}"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo " ✓ INSTALACIÓN COMPLETADA"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "La aplicación ha sido instalada correctamente."
echo ""
echo "Para iniciar la aplicación:"
echo "  - Haz doble clic en el icono 'Análisis de Tiempos' en tu escritorio"
echo "  - O ejecuta el archivo INICIAR_APP.sh en esta carpeta"
echo ""
echo "Nota: En algunos sistemas, puede que necesites hacer clic derecho"
echo "en el icono del escritorio y seleccionar 'Permitir ejecutar'"
echo ""
echo "La aplicación se abrirá en tu navegador en: http://localhost:3000"
echo ""
echo "¡Disfruta analizando tiempos muertos!"
echo ""
read -p "Presiona Enter para salir..."
