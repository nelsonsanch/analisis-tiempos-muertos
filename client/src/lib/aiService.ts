/**
 * Servicio de IA para el Asistente Tortuga
 * Usa el endpoint de backend que llama a la API de Manus Forge
 */

export interface TurtleSuggestions {
  entradas: string[];
  salidas: string[];
  recursos: string[];
  metodos: string[];
  indicadores: string[];
  competencias: string[];
}

/**
 * Genera sugerencias de metodología Tortuga usando IA
 * Nota: Esta función debe ser llamada desde un componente que use el hook de trpc
 */
export async function generateTurtleSuggestions(
  areaName: string,
  processDescription?: string
): Promise<TurtleSuggestions> {
  try {
    // Llamada directa a la API del backend usando el formato de tRPC
    const response = await fetch('/api/trpc/ai.generateTurtleSuggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "0": {
          json: {
            areaName,
            processDescription,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Error de API: ${response.status}`);
    }

    const data = await response.json();
    const result = data.result.data;

    if (!result.success || !result.suggestions) {
      throw new Error("Respuesta inválida de la IA");
    }

    const suggestions = result.suggestions;

    return {
      entradas: suggestions.entradas || [],
      salidas: suggestions.salidas || [],
      recursos: suggestions.recursos || [],
      metodos: suggestions.metodos || [],
      indicadores: suggestions.indicadores || [],
      competencias: suggestions.competencias || [],
    };
  } catch (error) {
    console.error("Error al generar sugerencias:", error);
    throw new Error("Error al generar sugerencias. Por favor, intenta nuevamente.");
  }
}
