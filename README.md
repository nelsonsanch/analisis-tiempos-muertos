# 📊 Análisis de Tiempos Muertos

Aplicación web profesional para realizar análisis de tiempos muertos en empresas mediante entrevistas estructuradas con jefes de área.

## 🎯 Características Principales

✅ **Formulario de Entrevista Completo**
- Información general (área, jefe de área, fecha)
- Configuración de jornada laboral y pausas fijas
- Cálculo automático de tiempo disponible

✅ **Sistema de Registro de Actividades**
- Clasificación por tipo: Productiva, Soporte, Tiempo Muerto
- Estimación de tiempos en minutos
- Captura de causas raíz para tiempos muertos
- Validación en tiempo real

✅ **Cálculos Automáticos**
- Distribución de tiempos por tipo
- Porcentajes automáticos
- Alertas de tiempo sin asignar o excedido
- Totales y subtotales dinámicos

✅ **Visualización de Datos**
- Gráfico de pastel (distribución porcentual)
- Gráfico de barras (tiempo por actividad)
- Actualización en tiempo real
- Colores diferenciados por tipo

✅ **Resumen Ejecutivo**
- Indicadores clave (KPIs)
- Lista de causas raíz de tiempos muertos
- Hallazgos principales
- Observaciones del entrevistador

✅ **Funciones de Persistencia**
- Guardar en localStorage
- Exportar a JSON
- Nombre de archivo automático

## 🚀 Uso de la Aplicación

### 1. Información General

Completa los datos básicos:
- **Nombre del Área**: Departamento que se está analizando
- **Jefe de Área**: Responsable del área
- **Fecha**: Fecha de la entrevista
- **Jornada Laboral**: Total de minutos de trabajo (ej: 480 = 8 horas)
- **Pausas Fijas**: Minutos de descansos oficiales (ej: 60 = 1 hora almuerzo)

La aplicación calcula automáticamente el **Tiempo Disponible para Trabajo**.

### 2. Registrar Actividades

Durante la entrevista, registra cada actividad:

1. **Nombre de la Actividad**: Descripción clara (ej: "Revisar correos")
2. **Tiempo (min)**: Duración estimada en minutos
3. **Tipo**: Selecciona entre:
   - **Productiva**: Tareas que agregan valor directo
   - **Soporte**: Actividades necesarias pero que no agregan valor directo
   - **Tiempo Muerto**: Pérdidas de tiempo, esperas, inactividad
4. **Causa Raíz** (solo para Tiempos Muertos): Describe por qué ocurre

Haz clic en **"Agregar"** para añadir la actividad a la lista.

### 3. Visualizar Gráficos

Haz clic en la pestaña **"Gráficos"** para ver:
- **Gráfico de Pastel**: Distribución porcentual de tiempos
- **Gráfico de Barras**: Minutos dedicados a cada actividad

Los gráficos se actualizan automáticamente mientras agregas actividades.

### 4. Revisar el Resumen

Haz clic en la pestaña **"Resumen"** para ver:
- **Indicadores**: Porcentajes de tiempo productivo, soporte y muerto
- **Causas Raíz**: Lista detallada de tiempos muertos con sus causas
- **Resumen Ejecutivo**: Hallazgos clave y observaciones

### 5. Guardar y Exportar

- **Botón "Guardar"**: Guarda la entrevista en el navegador (localStorage)
- **Botón "Exportar"**: Descarga un archivo JSON con todos los datos

## 📈 Interpretación de Resultados

### Benchmarks de Referencia

| Indicador | Ideal | Aceptable | Crítico |
|-----------|-------|-----------|---------|
| Tiempo Productivo | >60% | 40-60% | <40% |
| Tiempo de Soporte | 20-30% | 30-40% | >40% |
| Tiempo Muerto | <10% | 10-20% | >20% |

### Señales de Alerta

🚨 **Tiempo Muerto > 20%**: Problemas serios de eficiencia
🚨 **Tiempo Productivo < 40%**: La mayor parte del día no agrega valor
🚨 **Una sola causa > 60 min**: Problema crítico que debe priorizarse

## 💡 Consejos para Entrevistas Efectivas

### Antes de la Entrevista
1. Agenda 60-90 minutos con el jefe de área
2. Explica el objetivo: identificar oportunidades de mejora
3. Revisa el organigrama y funciones del área
4. Ten la herramienta abierta y lista

### Durante la Entrevista
1. Empieza con el panorama general: "Descríbeme un día típico"
2. Anota en tiempo real mientras el jefe habla
3. Usa el método deductivo: empieza con la jornada completa y ve descontando
4. Pregunta por las causas: no solo "cuánto tiempo", sino "por qué"
5. Valida en voz alta los números y porcentajes

### Preguntas Clave

**Para mapear actividades**:
- "¿Cuál es la primera tarea al llegar?"
- "¿Cuáles son las 2-3 tareas principales del día?"
- "¿Qué reuniones tienen regularmente?"

**Para cuantificar tiempos**:
- "¿Cuánto tiempo dirías que toma eso en promedio?"
- "Si la jornada es de 8 horas, ¿cuánto de eso es para [actividad]?"

**Para identificar causas**:
- "¿Por qué ocurre esa espera?"
- "¿Cuál es la causa principal de esa falla?"

## 🛠️ Tecnologías Utilizadas

- **React 19** con TypeScript
- **Tailwind CSS 4** para estilos
- **shadcn/ui** para componentes
- **Recharts** para gráficos
- **Vite** para build

## 📦 Instalación Local

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd analisis-tiempos-muertos

# Instalar dependencias
pnpm install

# Iniciar en modo desarrollo
pnpm dev

# Compilar para producción
pnpm build
```

## 🌐 Despliegue

Esta aplicación es completamente estática (solo frontend) y puede desplegarse en:

- **Vercel**: Conecta tu repositorio y despliega automáticamente
- **Netlify**: Arrastra la carpeta `dist` después de `pnpm build`
- **GitHub Pages**: Configura en Settings → Pages
- **Cloudflare Pages**: Conecta tu repositorio

### Comando de Build
```bash
pnpm build
```

### Directorio de Output
```
dist/
```

## 📄 Licencia

MIT

## 👤 Autor

Nelson Sanchez - Asesor en SST, Calidad y RRHH - Colombia

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 📞 Soporte

Si tienes preguntas o necesitas ayuda, abre un issue en el repositorio.

---

**¡Éxito en tus análisis de tiempos muertos!** 🚀
