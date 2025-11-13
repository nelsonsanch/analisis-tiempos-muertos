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
});
