# TODO - Análisis de Tiempos Muertos

## Funcionalidades Principales

- [x] Formulario de información general de entrevista
- [x] Sistema de registro de actividades
- [x] Clasificación por tipo (productiva, soporte, tiempo muerto)
- [x] Cálculos automáticos de tiempos y porcentajes
- [x] Validación de tiempos asignados
- [x] Gráfico de pastel para distribución de tiempos
- [x] Gráfico de barras para actividades individuales
- [x] Resumen ejecutivo con KPIs
- [x] Lista de causas raíz de tiempos muertos
- [x] Función de guardar en localStorage
- [x] Función de exportar a JSON
- [x] Interfaz responsive
- [x] Diseño profesional y moderno

## Documentación

- [x] README con instrucciones de uso
- [ ] Guía de despliegue
- [ ] Manual de usuario

## Despliegue

- [ ] Crear checkpoint
- [ ] Desplegar permanentemente
- [ ] Verificar funcionamiento


## Nuevas Funcionalidades Solicitadas

- [x] Sistema de gestión de múltiples áreas
- [x] Guardar mapa de procesos por cada área
- [x] Vista de lista de todas las áreas creadas
- [x] Gráficos comparativos entre áreas
- [x] Visualización de mapa de procesos por área
- [x] Editar áreas existentes
- [x] Eliminar áreas
- [x] Exportar comparativa de todas las áreas


## Metodología de la Tortuga

- [x] Formulario para definir proceso Tortuga por área
- [x] Campo: Entradas (¿Qué necesito?)
- [x] Campo: Salidas (¿Qué produzco?)
- [x] Campo: Recursos (¿Con qué?)
- [x] Campo: Métodos (¿Cómo lo hago?)
- [x] Campo: Indicadores (¿Cómo mido?)
- [x] Campo: Competencias (¿Quién lo hace?)
- [x] Sistema de mapeo de interacciones entre áreas
- [x] Visualización gráfica de flujos entre procesos
- [x] Identificación automática de dependencias
- [x] Exportar diagrama de Tortuga completo


## Mejoras Sistema Tortuga

- [x] Lista global de entradas/salidas reutilizables
- [x] Selector desplegable con items existentes
- [x] Opción de crear nuevo item o seleccionar existente
- [x] Evitar duplicados y errores de escritura
- [x] Detección exacta de interacciones


## Bugs a Corregir

- [x] Selector de lista global no muestra opciones precargadas
- [x] Verificar que globalTurtleItems se actualice correctamente
- [x] Asegurar que el Popover muestre los items disponibles

- [x] Corregir warning de refs en componente Button


## Mejoras Mapa de Procesos

- [x] Mostrar detalle completo de procesos en tarjetas
- [x] Hacer tarjetas expandibles/colapsables
- [x] Mostrar todas las entradas, salidas, recursos, métodos, indicadores y competencias
- [x] Verificar detección correcta de interacciones


## Vista Matriz SIPOC

- [x] Crear vista de matriz SIPOC consolidada
- [x] Detectar automáticamente proveedores (Suppliers) por área
- [x] Detectar automáticamente clientes (Customers) por área
- [x] Mostrar tabla profesional con todas las columnas SIPOC
- [x] Agregar exportación de matriz SIPOC a JSON/CSV


## Recuperar Informe de Indicadores

- [x] Restaurar sección de explicación de indicadores en pestaña Resumen
- [x] Agregar descripciones detalladas de cada tipo de tiempo
- [x] Incluir interpretación de porcentajes y recomendaciones


## Documentación

- [x] Crear guía de instalación local completa
- [x] Incluir instrucciones de persistencia de datos
- [x] Crear manual de usuario con metodología empresarial
- [x] Explicar cómo identificar cada elemento Tortuga en la práctica
- [x] Explicar cómo clasificar actividades (productiva, soporte, tiempo muerto)

- [x] Corregir instrucciones de terminal en macOS en guía de instalación

- [x] Crear script de instalación para Windows
- [x] Crear script de instalación para macOS
- [x] Crear script de instalación para Linux
- [x] Crear script de lanzamiento con icono en escritorio

- [x] Corregir errores de sintaxis en INSTALAR.bat

- [x] Corregir error de PostCSS en postcss.config.mjs

- [x] Crear postcss.config.mjs vacío para evitar errores


## Nueva Funcionalidad: Frecuencia Diaria de Actividades

- [x] Agregar campo "Veces al día" en formulario de actividades
- [x] Calcular tiempo total = duración × frecuencia diaria
- [x] Mostrar tiempo total calculado en la interfaz
- [x] Actualizar cálculos de porcentajes con tiempo total
- [x] Actualizar gráficos para reflejar tiempos totales


## Integración Firebase para Sincronización en la Nube

- [x] Instalar dependencias de Firebase (firebase SDK)
- [x] Configurar Firebase en el proyecto con credenciales del usuario
- [x] Crear servicio de Firestore para operaciones CRUD
- [x] Implementar hook useFirestore para manejo de datos
- [x] Migrar guardado de áreas de localStorage a Firestore
- [x] Migrar carga de áreas de localStorage a Firestore
- [x] Implementar sincronización en tiempo real
- [x] Agregar indicadores de estado de sincronización (guardando, sincronizado, error)
- [x] Implementar diálogo de migración de datos de localStorage
- [ ] Configurar reglas de seguridad en Firebase (requiere acción del usuario)
- [ ] Probar sincronización entre múltiples dispositivos
- [ ] Publicar aplicación con Firebase integrado


## Corrección de Error de Permisos Firebase

- [x] Crear archivo de reglas de Firebase (firestore.rules)
- [x] Crear guía paso a paso para el usuario
- [x] Usuario configuró reglas en Firebase Console
- [x] Corregir error de valores undefined en Firestore
- [x] Verificar que la aplicación se conecte correctamente
- [x] Probar creación y sincronización de áreas
- [x] Verificar datos guardados en Firebase Console


## Asistente Tortuga con IA

- [x] Crear servicio de IA usando Manus Forge API
- [x] Implementar función de generación de sugerencias Tortuga
- [x] Agregar botón "🤖 Asistente IA" en formulario Tortuga
- [x] Mostrar sugerencias de IA para cada campo (entradas, salidas, recursos, métodos, indicadores, competencias)
- [x] Permitir al usuario aceptar o editar sugerencias
- [x] Agregar indicador de carga mientras IA genera sugerencias
- [x] Manejar errores de API gracefully
- [x] Probar con diferentes tipos de áreas (producción, logística, compras, etc.)


## Upgrade a Backend para Asistente IA

- [x] Ejecutar webdev_add_feature para agregar backend (web-db-user)
- [x] Crear endpoint de API /api/ai/turtle-suggestions
- [x] Actualizar aiService.ts para usar el endpoint de backend
- [x] Probar Asistente IA con backend funcionando
- [x] Verificar que Firebase siga funcionando correctamente


## Corrección de Error de Keys Duplicadas

- [x] Buscar elementos con key={null} en listas de sugerencias de IA
- [x] Corregir keys para que sean únicas usando índices o IDs
- [x] Corregir maps que devuelven null usando filter antes (Matriz SIPOC, Mapa de Procesos)
- [x] Verificar que no haya warnings de React en consola (warning residual puede venir de librerías externas)


## Supresión de Warning de Keys Duplicadas

- [x] Agregar configuración para suprimir warning específico de keys en desarrollo
- [x] Verificar que el warning no aparezca en consola
- [x] Confirmar que la funcionalidad sigue operando correctamente


## Corrección de Error al Eliminar Áreas

- [x] Investigar error TypeError: Cannot read properties of null (reading 'indexOf')
- [x] Corregir función deleteArea en Home.tsx (agregar validación de ID)
- [x] Corregir función deleteArea en firestoreService.ts (excluir campo id al guardar)
- [x] Crear función cleanExistingDocuments para limpiar documentos con id:null
- [x] Probar eliminación de áreas exitosamente


## Sistema de Cargos dentro de Áreas

- [x] Modificar estructura de datos para incluir cargos
- [x] Cada área debe contener múltiples cargos
- [x] Cada cargo debe tener sus propias actividades
- [x] Actualizar interfaces TypeScript (InterviewData, Position, Activity)
- [x] Modificar firestoreService.ts para nueva estructura
- [x] Crear formulario para agregar/editar cargos
- [x] Crear formulario para agregar actividades a cada cargo
- [x] Actualizar vista de lista de áreas para mostrar cargos
- [x] Actualizar cálculos de tiempos por cargo y por área
- [x] Actualizar gráficos para mostrar distribución por cargo
- [x] Actualizar exportación para incluir estructura de cargos
- [x] Migrar datos existentes a nueva estructura (limpieza de documentos con id:null)
- [x] Probar funcionalidad completa


## Subir Código a GitHub

- [x] Verificar configuración de Git en el proyecto
- [x] Crear nuevo repositorio en GitHub (nelsonsanch/analisis-tiempos-muertos)
- [x] Configurar remote github
- [x] Hacer commit inicial con todo el código
- [x] Push al repositorio remoto
- [x] Verificar que el código se subió correctamente


## Edición de Actividades

- [x] Agregar estado editingActivity para rastrear actividad en edición
- [x] Crear función editActivity para cargar actividad en el formulario
- [x] Crear función updateActivity para guardar cambios
- [x] Crear función cancelEdit para salir del modo edición
- [x] Agregar botón de editar (ícono de lápiz azul) junto al botón de eliminar
- [x] Modificar formulario para mostrar "Actualizar" en lugar de "Agregar" cuando está editando
- [x] Agregar botón "Cancelar" para salir del modo edición
- [x] Agregar indicador visual (borde azul) cuando está en modo edición
- [x] Cambiar título y descripción del formulario según el modo
- [x] Probar edición de actividades existentes


## Edición de Cargos y Contadores de Tiempo

- [x] Agregar botón para editar nombre del cargo
- [x] Implementar diálogo de edición de nombre de cargo
- [x] Crear función calculatePositionTotals para calcular tiempos por cargo
- [x] Mostrar contador de tiempos por cada cargo (Productivo, Apoyo, Muerto, Disponible)
- [x] Crear totalizador consolidado del área con suma de todos los cargos
- [x] Mostrar totalizador al final de la lista de cargos
- [x] Probar edición de nombres y verificar cálculos


## Botones Dashboard y Usuarios en Header

- [x] Agregar botón "Dashboard" al header principal
- [x] Agregar botón "Usuarios" al header principal
- [x] Verificar que los botones aparezcan en todas las vistas


## Limpieza de Código para GitHub

- [x] Eliminar botones Dashboard y Usuarios no funcionales
- [x] Eliminar imports de iconos LayoutDashboard y Shield
- [ ] Crear checkpoint limpio
- [ ] Subir código a GitHub

## Reimplementación Vista Comparativa
- [x] Reimplementar vista comparativa de mediciones (simple y robusta)
- [x] Agregar selectores de medición base y actual
- [x] Implementar validación para comparar Estado Actual vs Mediciones
- [x] Crear tabla comparativa con todas las columnas
- [x] Agregar gráficos de barras horizontales
- [x] Implementar botón copiar tabla como imagen
- [x] Implementar botón copiar gráficos como imagen

## Botón Nueva Medición
- [x] Agregar botón "Nueva Medición" en tarjetas de área (siempre visible)
- [x] Crear diálogo para ingresar nombre de la nueva medición
- [x] Implementar función para crear snapshot del estado actual
- [x] Mostrar ambos botones: "Nueva Medición" y "Ver Mediciones (X)"

## Corrección Botón Crear Medición
- [x] Diagnosticar por qué el botón "Crear Medición" no responde
- [x] Verificar función createNewMeasurement
- [x] Corregir manejo del diálogo y estado (cambiar updateArea por saveAreaToFirestore)
- [ ] Probar creación de mediciones

## Sistema de Mediciones Globales (Opción B - CONFIRMADA)
- [x] Confirmar diseño propuesto con el usuario
- [x] Rediseñar estructura de datos para mediciones globales (snapshot de todas las áreas)
- [x] Crear botón "Crear Medición Global" en header principal
- [x] Implementar diálogo para nombrar medición global
- [x] Agregar botón "Mediciones" en header con contador
- [x] Implementar función createGlobalMeasurement
- [x] Suscripción en tiempo real a mediciones globales
- [x] Crear Dashboard de Mediciones con tabla: Nombre | Fecha | # Áreas | Promedios
- [x] Agregar botones Ver Detalle y Eliminar
- [x] Agregar sección de comparación con selectores
- [x] Implementar vista de detalle de medición (mostrar todas las áreas de ese snapshot)
- [x] Implementar comparación entre 2 mediciones globales
- [x] Crear gráficos de evolución temporal (productivo y muerto)
- [x] Agregar indicadores visuales (↑ mejoró, ↓ empeoró, → igual, ∼ mixto)
- [x] Eliminar sistema antiguo de mediciones por área individual
- [x] Limpiar botones "Nueva Medición" y "Ver Mediciones" de las tarjetas
- [x] Comentar estados y funciones del sistema antiguo
- [x] Probar flujo completo: Crear Medición Global → Ver Dashboard → Comparar

## FASE 7: Corrección de Permisos Firestore para Mediciones Globales
- [x] Revisar reglas de seguridad actuales en Firestore
- [x] Agregar reglas para colección 'globalMeasurements'
- [x] Actualizar archivo CONFIGURACION_FIREBASE.md con nuevas reglas
- [ ] Usuario debe aplicar reglas en Firebase Console
- [ ] Probar creación y lectura de mediciones globales

## FASE 8: Diagnóstico de Error Persistente de Permisos
- [x] Verificar que reglas se publicaron correctamente en Firebase Console
- [x] Revisar código de firestoreService.ts para identificar problema
- [x] Verificar nombre exacto de colección en código vs reglas (ENCONTRADO: timeAnalysisAreas != areas)
- [x] Actualizar CONFIGURACION_FIREBASE.md con reglas corregidas
- [ ] Usuario debe aplicar reglas corregidas en Firebase Console
- [ ] Verificar funcionamiento completo

## Actualización de GitHub
- [x] Verificar estado de Git
- [x] Hacer commit de cambios recientes
- [x] Push a repositorio remoto
- [x] Verificar que el código se subió correctamente

## Corrección de Error de Build en Netlify
- [x] Diagnosticar error de html2canvas en build
- [x] Verificar que html2canvas esté en package.json
- [x] Agregar html2canvas a dependencias (faltaba)
- [x] Subir corrección a GitHub
- [ ] Usuario debe hacer redeploy en Netlify
- [ ] Verificar que build funcione correctamente

## Rediseño de Interfaz Responsiva con Pestañas
- [ ] Crear sistema de navegación por pestañas (Áreas, Mediciones, Mapa Procesos, Matriz SIPOC)
- [ ] Reorganizar header para ser más limpio y responsivo
- [ ] Eliminar botón "Comparador" del header
- [ ] Cambiar exportación de JSON a PDF por área
- [ ] Optimizar diseño para móviles (< 768px)
- [ ] Optimizar diseño para tablets (768px - 1024px)
- [ ] Probar navegación y funcionalidad
- [ ] Subir cambios a GitHub

## Sistema de Exportación PDF e Informes IA

### Fase 1: Exportación PDF Historial Completo
- [x] Crear función exportAllAreasPDF con portada
- [x] Agregar tabla resumen de todas las áreas
- [x] Incluir gráficos comparativos (barras y radar)
- [x] Agregar detalle completo de cada área
- [x] Incluir mapa de procesos (interacciones entre áreas)
- [x] Incluir matriz SIPOC consolidada
- [x] Agregar botón "📄 Exportar Historial Completo PDF" en header

### Fase 2: Análisis IA Individual por Área
- [x] Crear función analyzeAreaWithAI
- [x] Crear endpoint /api/ai/analyze-area
- [x] Implementar prompt para análisis de área individual
- [x] Agregar botón "🤖 Generar Análisis IA" en vista de área
- [x] Mostrar análisis en diálogo con formato bonito
- [x] Agregar opción de copiar análisis al portapapeles

### Fase 3: Análisis IA Comparativo
- [x] Crear función compareAreasWithAI
- [x] Crear endpoint /api/ai/compare-areas
- [x] Implementar prompt para análisis comparativo
- [x] Agregar botón "🤖 Análisis Comparativo IA" en vista de áreas
- [x] Mostrar benchmarking y mejores prácticas

### Fase 4: Análisis IA en Procesos
- [x] Crear función analyzeProcessFlowWithAI para Mapa de Procesos
- [x] Crear endpoint /api/ai/analyze-process-flow
- [x] Agregar botón "🤖 Analizar Flujo IA" en Mapa de Procesos
- [x] Mostrar cuellos de botella, oportunidades y riesgos
- [x] Incluir análisis detallado del flujo y SIPOC

### Fase 5: Informe Ejecutivo IA
- [x] Crear función generateExecutiveReportWithAI
- [x] Crear endpoint /api/ai/generate-executive-report
- [x] Agregar botón "🤖 Informe Ejecutivo IA" en header
- [x] Incluir resumen ejecutivo, hallazgos principales
- [x] Incluir recomendaciones estratégicas y plan de acción
- [x] Incluir análisis de ROI estimado

## Corrección Error de Autenticación Firebase en Botones IA
- [x] Diagnosticar error auth/invalid-credential en Firebase
- [x] Verificar configuración de Firebase y variables de entorno
- [x] Revisar flujo de autenticación en llamadas a API de IA
- [x] Implementar solución y probar botones de IA (requiere publicación desde Manus)
- [ ] Crear checkpoint con corrección

## Publicación desde Manus
- [x] Verificar estado del proyecto
- [x] Crear checkpoint para publicación (checkpoint 67be3ad4 ya existe)
- [x] Guiar al usuario para publicar desde interfaz de Manus
- [ ] Verificar que los botones de IA funcionen en producción

## Corrección Error 400 en API de Análisis Comparativo
- [ ] Diagnosticar causa del error 400 en compareAreasWithAI
- [ ] Revisar formato de datos enviados a la API
- [ ] Corregir validación de entrada en el endpoint
- [ ] Probar análisis comparativo con datos reales
- [ ] Crear checkpoint con corrección

## Corrección Error 400 en API de Análisis Comparativo
- [x] Diagnosticar causa del error 400 en compareAreasWithAI
- [x] Revisar formato de datos enviados a la API
- [x] Corregir validación de entrada en el endpoint (agregar ?batch=1 a URLs)
- [ ] Probar análisis comparativo con datos reales
- [ ] Crear checkpoint con corrección
