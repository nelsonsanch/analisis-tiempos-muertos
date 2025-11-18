export interface TurtleSuggestions {
  entradas: string[];
  salidas: string[];
  recursos: string[];
  indicadores: string[];
  competencias: string[];
}

export interface AreaAnalysis {
  hallazgosCriticos: string[];
  recomendacionesPrioritarias: string[];
  quickWins: string[];
  analisisDetallado: string;
}

export interface ComparativeAnalysis {
  mejoresPracticas: string[];
  areasDeOportunidad: string[];
  oportunidadesMejoraCruzada: string[];
  benchmarkingInterno: string;
}

export interface ProcessFlowAnalysis {
  cuellosDeBottella: string[];
  oportunidadesOptimizacion: string[];
  riesgosIdentificados: string[];
  analisisDetallado: string;
}

export interface ExecutiveReport {
  resumenEjecutivo: string;
  hallazgosPrincipales: string[];
  recomendacionesEstrategicas: string[];
  planDeAccion: string[];
  roi: string;
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
    const response = await fetch('/api/trpc/ai.generateTurtleSuggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "0": {
          json: {
            areaName,
            processDescription: processDescription || "",
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

    return result.suggestions;
  } catch (error) {
    console.error("Error al generar sugerencias:", error);
    throw new Error("Error al generar sugerencias. Por favor, intenta nuevamente.");
  }
}
