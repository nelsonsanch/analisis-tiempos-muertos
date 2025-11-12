#!/bin/bash

# Hacer que el script sea ejecutable
chmod +x "$0"

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
chmod +x "$SCRIPT_DIR/INICIAR_APP.command"

# Crear el acceso directo en el escritorio
DESKTOP="$HOME/Desktop"
SHORTCUT="$DESKTOP/Analisis de Tiempos.command"

cat > "$SHORTCUT" << EOF
#!/bin/bash
cd "$SCRIPT_DIR"
./INICIAR_APP.command
EOF

chmod +x "$SHORTCUT"

echo -e "${GREEN}✓ Acceso directo creado en el escritorio${NC}"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo " ✓ INSTALACIÓN COMPLETADA"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "La aplicación ha sido instalada correctamente."
echo ""
echo "Para iniciar la aplicación:"
echo "  - Haz doble clic en el icono 'Analisis de Tiempos' en tu escritorio"
echo "  - O ejecuta el archivo INICIAR_APP.command en esta carpeta"
echo ""
echo "La aplicación se abrirá en tu navegador en: http://localhost:3000"
echo ""
echo "¡Disfruta analizando tiempos muertos!"
echo ""
read -p "Presiona Enter para salir..."
