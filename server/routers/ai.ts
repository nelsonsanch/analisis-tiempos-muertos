import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";

// Schema para área
const AreaSchema = z.object({
  id: z.string().optional(),
  areaName: z.string(),
  managerName: z.string(),
  date: z.string(),
  positions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      count: z.number(),
      activities: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          timeMinutes: z.number(),
          frequency: z.number(),
          type: z.enum(["productive", "support", "dead_time"]),
          cause: z.string().optional(),
        })
      ),
    })
  ),
});

export const aiRouter = router({
  /**
   * Endpoint de chat del asistente IA
   * Recibe mensajes del usuario y datos de áreas para análisis
   */
  chat: publicProcedure
    .input(
      z.object({
        message: z.string().min(1, "El mensaje no puede estar vacío"),
        areas: z.array(AreaSchema),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Calcular métricas agregadas de cada área
        const areaMetrics = input.areas.map((area) => {
          const allActivities = area.positions.flatMap((pos) =>
            pos.activities.map((act) => ({
              ...act,
              position: pos.name,
              positionCount: pos.count,
            }))
          );

          const totalActivities = allActivities.length;
          const productiveCount = allActivities.filter(
            (act) => act.type === "productive"
          ).length;
          const supportCount = allActivities.filter(
            (act) => act.type === "support"
          ).length;
          const deadCount = allActivities.filter(
            (act) => act.type === "dead_time"
          ).length;

          const productivePercent =
            totalActivities > 0
              ? Math.round((productiveCount / totalActivities) * 100)
              : 0;
          const supportPercent =
            totalActivities > 0
              ? Math.round((supportCount / totalActivities) * 100)
              : 0;
          const deadPercent =
            totalActivities > 0
              ? Math.round((deadCount / totalActivities) * 100)
              : 0;

          // Calcular tiempo total por tipo
          const productiveTime = allActivities
            .filter((act) => act.type === "productive")
            .reduce((sum, act) => sum + act.timeMinutes * act.frequency, 0);
          const supportTime = allActivities
            .filter((act) => act.type === "support")
            .reduce((sum, act) => sum + act.timeMinutes * act.frequency, 0);
          const deadTime = allActivities
            .filter((act) => act.type === "dead_time")
            .reduce((sum, act) => sum + act.timeMinutes * act.frequency, 0);

          const totalTime = productiveTime + supportTime + deadTime;

          return {
            name: area.areaName,
            responsible: area.managerName,
            date: area.date,
            totalActivities,
            productivePercent,
            supportPercent,
            deadPercent,
            productiveTime,
            supportTime,
            deadTime,
            totalTime,
            positions: area.positions.map((pos) => ({
              name: pos.name,
              count: pos.count,
              activities: pos.activities.map((act) => ({
                name: act.name,
                type: act.type,
                timeMinutes: act.timeMinutes,
                frequency: act.frequency,
                cause: act.cause,
              })),
            })),
          };
        });

        // Construir contexto para el LLM
        const context = `
Eres un asistente experto en análisis de tiempos muertos usando la Metodología Tortuga.

DATOS DISPONIBLES:
${JSON.stringify(areaMetrics, null, 2)}

PREGUNTA DEL USUARIO:
${input.message}

INSTRUCCIONES:
- Analiza los datos proporcionados para responder la pregunta
- Proporciona insights específicos basados en los números reales
- Si la pregunta no se puede responder con los datos disponibles, indícalo claramente
- Usa un tono profesional pero amigable
- Incluye recomendaciones prácticas cuando sea apropiado
- Formatea tu respuesta en Markdown para mejor legibilidad
- Si mencionas porcentajes o números, asegúrate de que coincidan con los datos
- Identifica patrones y oportunidades de mejora
- Prioriza las áreas con mayores tiempos muertos

RESPUESTA:`;

        // Invocar el LLM
        const response = await invokeLLM({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Eres un asistente experto en análisis de procesos y tiempos muertos. Respondes de forma clara, profesional y basada en datos.",
            },
            {
              role: "user",
              content: context,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        });

        return {
          message: response.content,
        };
      } catch (error) {
        console.error("Error en chat del asistente:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Error al procesar tu pregunta. Por favor, intenta nuevamente.",
        });
      }
    }),

  /**
   * Endpoint para análisis de área específica
   */
  analyzeArea: publicProcedure
    .input(
      z.object({
        area: AreaSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        const area = input.area;
        const allActivities = area.positions.flatMap((pos) =>
          pos.activities.map((act) => ({
            ...act,
            position: pos.name,
          }))
        );

        const totalActivities = allActivities.length;
        const productiveCount = allActivities.filter(
          (act) => act.type === "productive"
        ).length;
        const supportCount = allActivities.filter(
          (act) => act.type === "support"
        ).length;
        const deadCount = allActivities.filter(
          (act) => act.type === "dead_time"
        ).length;

        const productivePercent =
          totalActivities > 0
            ? Math.round((productiveCount / totalActivities) * 100)
            : 0;
        const supportPercent =
          totalActivities > 0
            ? Math.round((supportCount / totalActivities) * 100)
            : 0;
        const deadPercent =
          totalActivities > 0
            ? Math.round((deadCount / totalActivities) * 100)
            : 0;

        const prompt = `Analiza el siguiente área de trabajo usando la Metodología Tortuga:

**Área:** ${area.areaName}
**Responsable:** ${area.managerName}
**Fecha:** ${area.date}

**Métricas:**
- Total de actividades: ${totalActivities}
- Productivo: ${productivePercent}%
- Soporte: ${supportPercent}%
- Muerto: ${deadPercent}%

**Cargos y actividades registradas:**
${area.positions
  .map(
    (pos) =>
      `\n**${pos.name}** (${pos.count} personas):\n${pos.activities
        .map(
          (act) =>
            `- ${act.name} (${act.type}) - ${act.timeMinutes} min x ${act.frequency} veces${
              act.cause ? ` - Causa: ${act.cause}` : ""
            }`
        )
        .join("\n")}`
  )
  .join("\n")}

Proporciona:
1. Un análisis detallado de la eficiencia del área
2. Identificación de los principales tiempos muertos y sus causas
3. Recomendaciones específicas para mejorar la productividad
4. Áreas de oportunidad por cargo

Formatea tu respuesta en Markdown.`;

        const response = await invokeLLM({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Eres un experto en análisis de procesos y optimización de tiempos.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        });

        return {
          analysis: response.content,
        };
      } catch (error) {
        console.error("Error al analizar área:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al generar análisis. Por favor, intenta nuevamente.",
        });
      }
    }),
});
