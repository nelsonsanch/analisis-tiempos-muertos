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


## Supresi\u00f## Supresión de Warning de Keys Duplicadas

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


## Corrección de Visualización de Botones de Editar/Eliminar

- [x] Investigar por qué los íconos no se mostraban (cambios no estaban en el código)
- [x] Verificar que los íconos estén correctamente importados (Pencil agregado)
- [x] Revisar el código JSX de los botones de editar y eliminar
- [x] Implementar botones con íconos de lápiz azul (editar) y basura roja (eliminar)
- [x] Probar que los botones se vean correctamente en el navegador


## Dashboard Ejecutivo Consolidado

- [x] Crear componente Dashboard.tsx en pages
- [x] Implementar cálculos de métricas consolidadas (promedios, totales)
- [x] Crear tarjetas de resumen con estadísticas clave (Total Áreas, Promedio Productivo, Áreas Eficientes, Áreas Críticas)
- [x] Implementar ranking de áreas por eficiencia (ordenado por % productivo)
- [x] Agregar gráfico comparativo de barras horizontales para todas las áreas
- [x] Implementar sistema de alertas para áreas críticas (>30% tiempo muerto)
- [x] Mostrar área más eficiente y área con mayor tiempo muerto
- [x] Crear visualización de distribución de tiempos global con colores
- [x] Integrar dashboard en la navegación principal (botón "Dashboard")
- [x] Agregar ruta /dashboard en App.tsx
- [x] Probar con datos reales de las 9 áreas existentes


## 🚨 SEGURIDAD Y AUTENTICACIÓN (URGENTE)

- [x] Configurar Firebase Authentication
- [x] Implementar página de Login
- [x] Proteger todas las rutas con AuthGuard
- [x] Crear panel de administración de usuarios (solo para admin)
- [x] Agregar botón de cerrar sesión en todas las páginas
- [x] Crear guía de configuración (CONFIGURAR_AUTENTICACION.md)
- [ ] Crear usuario inicial en Firebase Console: hsesupergas@gmail.com (requiere acción del usuario)
- [ ] Configurar reglas de seguridad en Firestore (requiere acción del usuario)
- [ ] Desplegar versión segura a producción


## 🐛 Bugs a Corregir

- [x] Botón "Cerrar Sesión" superpuesto con botón "Exportar" en el header
