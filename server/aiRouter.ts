import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

export const aiRouter = router({
  generateTurtleSuggestions: publicProcedure
    .input(
      z.object({
        areaName: z.string(),
        processDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { areaName, processDescription } = input;

      const prompt = `Eres un consultor experto en mejora de procesos y metodología Tortuga. 

Área: ${areaName}
${processDescription ? `Descripción del proceso: ${processDescription}` : ""}

Genera sugerencias específicas y profesionales para completar el mapa de proceso Tortuga para esta área. Las sugerencias deben ser:
- Específicas para el área mencionada
- Profesionales y aplicables en empresas reales
- Concretas y accionables
- En español

Genera exactamente:
- 3-5 ENTRADAS (inputs necesarios para el proceso)
- 3-5 SALIDAS (outputs/resultados del proceso)
- 3-5 RECURSOS (herramientas, sistemas, equipos necesarios)
- 2-4 MÉTODOS (procedimientos, técnicas, metodologías usadas)
- 2-4 INDICADORES (KPIs para medir el proceso)
- 2-4 COMPETENCIAS (habilidades necesarias del personal)

Responde SOLO con un objeto JSON válido con esta estructura exacta:
{
  "entradas": ["entrada1", "entrada2", ...],
  "salidas": ["salida1", "salida2", ...],
  "recursos": ["recurso1", "recurso2", ...],
  "metodos": ["metodo1", "metodo2", ...],
  "indicadores": ["indicador1", "indicador2", ...],
  "competencias": ["competencia1", "competencia2", ...]
}`;

      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          responseFormat: { type: "json_object" },
        });

        const content = result.choices[0]?.message?.content;
        if (typeof content !== "string") {
          throw new Error("Respuesta inválida de la IA");
        }

        const suggestions = JSON.parse(content);

        return {
          success: true,
          suggestions,
        };
      } catch (error) {
        console.error("Error al generar sugerencias:", error);
        throw new Error(
          "Error al generar sugerencias. Por favor, intenta nuevamente."
        );
      }
    }),

  analyzeArea: publicProcedure
    .input(
      z.object({
        areaName: z.string(),
        managerName: z.string(),
        productivePercentage: z.number(),
        supportPercentage: z.number(),
        deadTimePercentage: z.number(),
        productiveTime: z.number(),
        supportTime: z.number(),
        deadTime: z.number(),
        workdayMinutes: z.number(),
        positions: z.array(
          z.object({
            name: z.string(),
            count: z.number(),
            activities: z.array(
              z.object({
                name: z.string(),
                type: z.string(),
                timeMinutes: z.number(),
                frequency: z.number(),
              })
            ),
          })
        ),
        observations: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const {
        areaName,
        managerName,
        productivePercentage,
        supportPercentage,
        deadTimePercentage,
        productiveTime,
        supportTime,
        deadTime,
        workdayMinutes,
        positions,
        observations,
      } = input;

      // Construir resumen de actividades por tipo
      const deadTimeActivities: string[] = [];
      const productiveActivities: string[] = [];
      const supportActivities: string[] = [];

      positions.forEach((position) => {
        position.activities.forEach((activity) => {
          const totalTime = activity.timeMinutes * activity.frequency;
          const activityInfo = `${activity.name} (${position.name}): ${totalTime} min/día`;

          if (activity.type === 'dead') {
            deadTimeActivities.push(activityInfo);
          } else if (activity.type === 'productive') {
            productiveActivities.push(activityInfo);
          } else if (activity.type === 'support') {
            supportActivities.push(activityInfo);
          }
        });
      });

      const prompt = `Eres un consultor experto en mejora de procesos, análisis de tiempos y eficiencia operacional.

ÁREA ANALIZADA: ${areaName}
RESPONSABLE: ${managerName}
JORNADA LABORAL: ${workdayMinutes} minutos (${(workdayMinutes / 60).toFixed(1)} horas)

RESULTADOS DEL ANÁLISIS:
- Tiempo Productivo: ${productivePercentage.toFixed(1)}% (${productiveTime} minutos)
- Tiempo de Soporte: ${supportPercentage.toFixed(1)}% (${supportTime} minutos)
- Tiempo Muerto: ${deadTimePercentage.toFixed(1)}% (${deadTime} minutos)

ACTIVIDADES PRODUCTIVAS:
${productiveActivities.length > 0 ? productiveActivities.map(a => `- ${a}`).join('\n') : '- Ninguna registrada'}

ACTIVIDADES DE SOPORTE:
${supportActivities.length > 0 ? supportActivities.map(a => `- ${a}`).join('\n') : '- Ninguna registrada'}

ACTIVIDADES DE TIEMPO MUERTO:
${deadTimeActivities.length > 0 ? deadTimeActivities.map(a => `- ${a}`).join('\n') : '- Ninguna registrada'}

${observations ? `OBSERVACIONES DEL RESPONSABLE:\n${observations}\n` : ''}

Como consultor experto, realiza un análisis profesional y genera:

1. HALLAZGOS CRÍTICOS (2-4 puntos): Identifica los problemas más importantes que afectan la productividad. Sé específico con números y causas raíz.

2. RECOMENDACIONES PRIORITARIAS (3-5 puntos): Proporciona acciones concretas y priorizadas para mejorar la eficiencia. Incluye el impacto esperado.

3. QUICK WINS (2-3 puntos): Mejoras de impacto inmediato que se pueden implementar en menos de 2 semanas.

4. ANÁLISIS DETALLADO: Un párrafo de 4-6 líneas con análisis profundo, comparación con estándares de la industria, y perspectiva estratégica.

Responde SOLO con un objeto JSON válido con esta estructura exacta:
{
  "hallazgosCriticos": ["hallazgo 1", "hallazgo 2", ...],
  "recomendacionesPrioritarias": ["recomendación 1", "recomendación 2", ...],
  "quickWins": ["quick win 1", "quick win 2", ...],
  "analisisDetallado": "texto del análisis detallado"
}`;

      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          responseFormat: { type: "json_object" },
        });

        const content = result.choices[0]?.message?.content;
        if (typeof content !== "string") {
          throw new Error("Respuesta inválida de la IA");
        }

        const analysis = JSON.parse(content);

        return {
          success: true,
          analysis,
        };
      } catch (error) {
        console.error("Error al analizar área:", error);
        throw new Error(
          "Error al generar análisis. Por favor, intenta nuevamente."
        );
      }
    }),

  compareAreas: publicProcedure
    .input(
      z.object({
        areas: z.array(
          z.object({
            areaName: z.string(),
            managerName: z.string(),
            productivePercentage: z.number(),
            supportPercentage: z.number(),
            deadTimePercentage: z.number(),
            totalActivities: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const { areas } = input;

      // Construir tabla comparativa
      const areasTable = areas.map((area) =>
        `- ${area.areaName} (${area.managerName}): ` +
        `Productivo ${area.productivePercentage.toFixed(1)}%, ` +
        `Soporte ${area.supportPercentage.toFixed(1)}%, ` +
        `Muerto ${area.deadTimePercentage.toFixed(1)}% ` +
        `(${area.totalActivities} actividades)`
      ).join('\n');

      // Identificar mejor y peor área
      const bestArea = areas.reduce((best, current) =>
        current.productivePercentage > best.productivePercentage ? current : best
      );

      const worstArea = areas.reduce((worst, current) =>
        current.deadTimePercentage > worst.deadTimePercentage ? current : worst
      );

      const prompt = `Eres un consultor experto en mejora de procesos y benchmarking organizacional.

ANÁLISIS COMPARATIVO DE ${areas.length} ÁREAS:

${areasTable}

MEJOR DESEMPEÑO:
- ${bestArea.areaName}: ${bestArea.productivePercentage.toFixed(1)}% productividad

MAYOR OPORTUNIDAD DE MEJORA:
- ${worstArea.areaName}: ${worstArea.deadTimePercentage.toFixed(1)}% tiempo muerto

Como consultor experto, realiza un análisis comparativo profesional y genera:

1. MEJORES PRÁCTICAS IDENTIFICADAS (2-4 puntos): Identifica qué están haciendo bien las áreas con mejor desempeño y cómo se puede replicar.

2. ÁREAS DE OPORTUNIDAD (2-4 puntos): Identifica patrones comunes de ineficiencia y áreas que requieren atención prioritaria.

3. OPORTUNIDADES DE MEJORA CRUZADA (2-3 puntos): Sugiere cómo las áreas pueden aprender unas de otras y colaborar para mejorar.

4. BENCHMARKING INTERNO: Un párrafo de 4-6 líneas con análisis estratégico del desempeño comparativo, brechas identificadas y recomendaciones de estandarización.

Responde SOLO con un objeto JSON válido con esta estructura exacta:
{
  "mejoresPracticas": ["práctica 1", "práctica 2", ...],
  "areasDeOportunidad": ["oportunidad 1", "oportunidad 2", ...],
  "oportunidadesMejoraCruzada": ["mejora 1", "mejora 2", ...],
  "benchmarkingInterno": "texto del análisis de benchmarking"
}`;

      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          responseFormat: { type: "json_object" },
        });

        const content = result.choices[0]?.message?.content;
        if (typeof content !== "string") {
          throw new Error("Respuesta inválida de la IA");
        }

        const analysis = JSON.parse(content);

        return {
          success: true,
          analysis,
        };
      } catch (error) {
        console.error("Error al comparar áreas:", error);
        throw new Error(
          "Error al generar análisis comparativo. Por favor, intenta nuevamente."
        );
      }
    }),

  analyzeProcessFlow: publicProcedure
    .input(
      z.object({
        totalAreas: z.number(),
        interactions: z.array(
          z.object({
            source: z.string(),
            target: z.string(),
            items: z.array(z.string()),
          })
        ),
        sipocData: z.array(
          z.object({
            areaName: z.string(),
            suppliers: z.array(z.string()),
            inputs: z.array(z.string()),
            outputs: z.array(z.string()),
            customers: z.array(z.string()),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const { totalAreas, interactions, sipocData } = input;

      // Construir descripción de interacciones
      const interactionsDesc = interactions.map((int) =>
        `- ${int.source} → ${int.target}: ${int.items.join(', ')}`
      ).join('\n');

      // Identificar áreas críticas (con más dependencias)
      const areaDependencies = new Map<string, number>();
      interactions.forEach((int) => {
        areaDependencies.set(int.source, (areaDependencies.get(int.source) || 0) + 1);
        areaDependencies.set(int.target, (areaDependencies.get(int.target) || 0) + 1);
      });

      const criticalAreas = Array.from(areaDependencies.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([area, count]) => `${area} (${count} conexiones)`);

      const prompt = `Eres un consultor experto en gestión de procesos, mapeo de flujos y metodología SIPOC.

ANÁLISIS DE FLUJO DE PROCESOS:

NÚMERO DE ÁREAS: ${totalAreas}
NÚMERO DE INTERACCIONES: ${interactions.length}

INTERACCIONES ENTRE ÁREAS:
${interactionsDesc || 'No hay interacciones registradas'}

ÁREAS CRÍTICAS (más conexiones):
${criticalAreas.length > 0 ? criticalAreas.map(a => `- ${a}`).join('\n') : '- Ninguna identificada'}

MATRIZ SIPOC:
${sipocData.map(s =>
        `- ${s.areaName}:\n` +
        `  Proveedores: ${s.suppliers.join(', ') || 'N/A'}\n` +
        `  Entradas: ${s.inputs.join(', ') || 'N/A'}\n` +
        `  Salidas: ${s.outputs.join(', ') || 'N/A'}\n` +
        `  Clientes: ${s.customers.join(', ') || 'N/A'}`
      ).join('\n\n')}

Como consultor experto, realiza un análisis profesional del flujo de procesos y genera:

1. CUELLOS DE BOTELLA (2-4 puntos): Identifica puntos críticos donde el flujo se ralentiza o se interrumpe.

2. OPORTUNIDADES DE OPTIMIZACIÓN (3-5 puntos): Sugiere mejoras concretas para el flujo de procesos.

3. RIESGOS IDENTIFICADOS (2-3 puntos): Señala dependencias críticas y puntos de falla potenciales.

4. ANÁLISIS DETALLADO: Un párrafo de 4-6 líneas con análisis estratégico del flujo completo, integración entre áreas y recomendaciones de mejora.

Responde SOLO con un objeto JSON válido con esta estructura exacta:
{
  "cuellosDeBottella": ["cuello 1", "cuello 2", ...],
  "oportunidadesOptimizacion": ["oportunidad 1", "oportunidad 2", ...],
  "riesgosIdentificados": ["riesgo 1", "riesgo 2", ...],
  "analisisDetallado": "texto del análisis detallado"
}`;

      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          responseFormat: { type: "json_object" },
        });

        const content = result.choices[0]?.message?.content;
        if (typeof content !== "string") {
          throw new Error("Respuesta inválida de la IA");
        }

        const analysis = JSON.parse(content);

        return {
          success: true,
          analysis,
        };
      } catch (error) {
        console.error("Error al analizar flujo de procesos:", error);
        throw new Error(
          "Error al generar análisis de procesos. Por favor, intenta nuevamente."
        );
      }
    }),

  generateExecutiveReport: publicProcedure
    .input(
      z.object({
        totalAreas: z.number(),
        areasData: z.array(
          z.object({
            areaName: z.string(),
            productivePercentage: z.number(),
            deadTimePercentage: z.number(),
          })
        ),
        totalInteractions: z.number(),
        averageProductivity: z.number(),
        averageDeadTime: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { totalAreas, areasData, totalInteractions, averageProductivity, averageDeadTime } = input;

      // Identificar mejores y peores áreas
      const bestAreas = areasData
        .sort((a, b) => b.productivePercentage - a.productivePercentage)
        .slice(0, 3)
        .map(a => `${a.areaName} (${a.productivePercentage.toFixed(1)}% productivo)`);

      const worstAreas = areasData
        .sort((a, b) => b.deadTimePercentage - a.deadTimePercentage)
        .slice(0, 3)
        .map(a => `${a.areaName} (${a.deadTimePercentage.toFixed(1)}% tiempo muerto)`);

      const prompt = `Eres un consultor ejecutivo experto en eficiencia operacional y mejora continua.

REPORTE EJECUTIVO - ANÁLISIS ORGANIZACIONAL COMPLETO

DATOS GENERALES:
- Total de áreas analizadas: ${totalAreas}
- Interacciones entre áreas: ${totalInteractions}
- Productividad promedio: ${averageProductivity.toFixed(1)}%
- Tiempo muerto promedio: ${averageDeadTime.toFixed(1)}%

MEJORES DESEMPEÑOS:
${bestAreas.map(a => `- ${a}`).join('\n')}

MAYORES OPORTUNIDADES:
${worstAreas.map(a => `- ${a}`).join('\n')}

Como consultor ejecutivo, genera un reporte estratégico completo:

1. RESUMEN EJECUTIVO: Un párrafo de 5-7 líneas con la visión general del estado actual, principales hallazgos y dirección estratégica recomendada.

2. HALLAZGOS PRINCIPALES (4-6 puntos): Los descubrimientos más importantes del análisis completo.

3. RECOMENDACIONES ESTRATÉGICAS (4-6 puntos): Acciones de alto nivel para la dirección ejecutiva.

4. PLAN DE ACCIÓN (5-7 puntos): Pasos concretos priorizados para implementar las mejoras.

5. ROI ESTIMADO: Un párrafo de 3-4 líneas con estimación del retorno de inversión esperado al implementar las recomendaciones.

Responde SOLO con un objeto JSON válido con esta estructura exacta:
{
  "resumenEjecutivo": "texto del resumen ejecutivo",
  "hallazgosPrincipales": ["hallazgo 1", "hallazgo 2", ...],
  "recomendacionesEstrategicas": ["recomendación 1", "recomendación 2", ...],
  "planDeAccion": ["acción 1", "acción 2", ...],
  "roi": "texto del análisis de ROI"
}`;

      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          responseFormat: { type: "json_object" },
        });

        const content = result.choices[0]?.message?.content;
        if (typeof content !== "string") {
          throw new Error("Respuesta inválida de la IA");
        }

        const report = JSON.parse(content);

        return {
          success: true,
          report,
        };
      } catch (error) {
        console.error("Error al generar reporte ejecutivo:", error);
        throw new Error(
          "Error al generar reporte ejecutivo. Por favor, intenta nuevamente."
        );
      }
    }),
});
