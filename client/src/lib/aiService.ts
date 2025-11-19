/**
 * Servicio de IA para el Asistente Tortuga y Análisis de Áreas
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
    // Llamada directa a la API del backend usando el formato de tRPC
    const response = await fetch('/api/trpc/ai.generateTurtleSuggestions?batch=1', {
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
    // En modo batch, tRPC devuelve un array
    const batchResult = Array.isArray(data) ? data[0] : data;
    const result = batchResult.result.data;

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

/**
 * Genera análisis inteligente de un área usando IA
 */
export async function analyzeAreaWithAI(areaData: {
  areaName: string;
  managerName: string;
  productivePercentage: number;
  supportPercentage: number;
  deadTimePercentage: number;
  productiveTime: number;
  supportTime: number;
  deadTime: number;
  workdayMinutes: number;
  positions: Array<{
    name: string;
    peopleCount: number;
    activities: Array<{
      name: string;
      type: string;
      timeMinutes: number;
      frequency: number;
    }>;
  }>;
  observations?: string;
}): Promise<AreaAnalysis> {
  try {
    const response = await fetch('/api/trpc/ai.analyzeArea?batch=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "0": {
          json: areaData,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Error de API: ${response.status}`);
    }

    const data = await response.json();
    // En modo batch, tRPC devuelve un array
    const batchResult = Array.isArray(data) ? data[0] : data;
    const result = batchResult.result.data;

    if (!result.success || !result.analysis) {
      throw new Error("Respuesta inválida de la IA");
    }

    return result.analysis;
  } catch (error) {
    console.error("Error al analizar área:", error);
    throw new Error("Error al generar análisis. Por favor, intenta nuevamente.");
  }
}

/**
 * Genera análisis comparativo entre múltiples áreas usando IA
 */
export async function compareAreasWithAI(areasData: Array<{
  areaName: string;
  managerName: string;
  productivePercentage: number;
  supportPercentage: number;
  deadTimePercentage: number;
  totalActivities: number;
}>): Promise<ComparativeAnalysis> {
  try {
    const response = await fetch('/api/trpc/ai.compareAreas?batch=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "0": {
          json: { areas: areasData },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Error de API: ${response.status}`);
    }

    const data = await response.json();
    // En modo batch, tRPC devuelve un array
    const batchResult = Array.isArray(data) ? data[0] : data;
    const result = batchResult.result.data;

    if (!result.success || !result.analysis) {
      throw new Error("Respuesta inválida de la IA");
    }

    return result.analysis;
  } catch (error) {
    console.error("Error al comparar áreas:", error);
    throw new Error("Error al generar análisis comparativo. Por favor, intenta nuevamente.");
  }
}

/**
 * Genera análisis de flujo de procesos (Mapa de Procesos y SIPOC) usando IA
 */
export async function analyzeProcessFlowWithAI(processData: {
  totalAreas: number;
  interactions: Array<{
    source: string;
    target: string;
    items: string[];
  }>;
  sipocData: Array<{
    areaName: string;
    suppliers: string[];
    inputs: string[];
    outputs: string[];
    customers: string[];
  }>;
}): Promise<ProcessFlowAnalysis> {
  try {
    const response = await fetch('/api/trpc/ai.analyzeProcessFlow?batch=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "0": {
          json: processData,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Error de API: ${response.status}`);
    }

    const data = await response.json();
    // En modo batch, tRPC devuelve un array
    const batchResult = Array.isArray(data) ? data[0] : data;
    const result = batchResult.result.data;

    if (!result.success || !result.analysis) {
      throw new Error("Respuesta inválida de la IA");
    }

    return result.analysis;
  } catch (error) {
    console.error("Error al analizar flujo de procesos:", error);
    throw new Error("Error al generar análisis de procesos. Por favor, intenta nuevamente.");
  }
}

/**
 * Genera reporte ejecutivo completo con todos los análisis de IA
 */
export async function generateExecutiveReportWithAI(reportData: {
  totalAreas: number;
  areasData: Array<{
    areaName: string;
    productivePercentage: number;
    deadTimePercentage: number;
  }>;
  totalInteractions: number;
  averageProductivity: number;
  averageDeadTime: number;
}): Promise<ExecutiveReport> {
  try {
    const response = await fetch('/api/trpc/ai.generateExecutiveReport?batch=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "0": {
          json: reportData,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Error de API: ${response.status}`);
    }

    const data = await response.json();
    // En modo batch, tRPC devuelve un array
    const batchResult = Array.isArray(data) ? data[0] : data;
    const result = batchResult.result.data;

    if (!result.success || !result.report) {
      throw new Error("Respuesta inválida de la IA");
    }

    return result.report;
  } catch (error) {
    console.error("Error al generar reporte ejecutivo:", error);
    throw new Error("Error al generar reporte ejecutivo. Por favor, intenta nuevamente.");
  }
}
