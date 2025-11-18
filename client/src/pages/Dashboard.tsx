import { useState, useMemo } from "react";
import { useFirestore } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  LogOut
} from "lucide-react";
import { useLocation } from "wouter";
import type { InterviewData } from "@/lib/firestoreService";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { areas } = useFirestore();
  const { signOut } = useAuth();
  
  // Calcular métricas consolidadas
  const metrics = useMemo(() => {
    if (areas.length === 0) {
      return {
        totalAreas: 0,
        avgProductivo: 0,
        avgSoporte: 0,
        avgMuerto: 0,
        totalActividades: 0,
        areasEficientes: 0,
        areasCriticas: 0,
        mejorArea: null as InterviewData | null,
        peorArea: null as InterviewData | null,
      };
    }

    const calculateAreaPercentages = (area: InterviewData) => {
      const totalMinutes = area.workdayMinutes - area.fixedBreaksMinutes;
      
      let productiveTime = 0;
      let supportTime = 0;
      let deadTime = 0;
      let totalActivities = 0;

      area.positions.forEach(position => {
        totalActivities += position.activities.length;
        position.activities.forEach(activity => {
          const activityTime = activity.timeMinutes * activity.frequency;
          if (activity.type === "productive") productiveTime += activityTime;
          else if (activity.type === "support") supportTime += activityTime;
          else if (activity.type === "dead_time") deadTime += activityTime;
        });
      });

      const productivePercent = totalMinutes > 0 ? (productiveTime / totalMinutes) * 100 : 0;
      const supportPercent = totalMinutes > 0 ? (supportTime / totalMinutes) * 100 : 0;
      const deadPercent = totalMinutes > 0 ? (deadTime / totalMinutes) * 100 : 0;

      return {
        productivePercent,
        supportPercent,
        deadPercent,
        totalActivities,
        productiveTime,
        supportTime,
        deadTime,
        totalMinutes
      };
    };

    const areasWithMetrics = areas.map((area: InterviewData) => ({
      ...area,
      ...calculateAreaPercentages(area)
    }));

    const totalProductivo = areasWithMetrics.reduce((sum: number, a: any) => sum + a.productivePercent, 0);
    const totalSoporte = areasWithMetrics.reduce((sum: number, a: any) => sum + a.supportPercent, 0);
    const totalMuerto = areasWithMetrics.reduce((sum: number, a: any) => sum + a.deadPercent, 0);
    const totalActividades = areasWithMetrics.reduce((sum: number, a: any) => sum + a.totalActivities, 0);

    const avgProductivo = totalProductivo / areas.length;
    const avgSoporte = totalSoporte / areas.length;
    const avgMuerto = totalMuerto / areas.length;

    const areasEficientes = areasWithMetrics.filter((a: any) => a.productivePercent >= 70).length;
    const areasCriticas = areasWithMetrics.filter((a: any) => a.deadPercent >= 30).length;

    const mejorArea = areasWithMetrics.reduce((best: typeof areasWithMetrics[0] | null, current: typeof areasWithMetrics[0]) => 
      !best || current.productivePercent > best.productivePercent ? current : best
    , null as typeof areasWithMetrics[0] | null);

    const peorArea = areasWithMetrics.reduce((worst: typeof areasWithMetrics[0] | null, current: typeof areasWithMetrics[0]) => 
      !worst || current.deadPercent > worst.deadPercent ? current : worst
    , null as typeof areasWithMetrics[0] | null);

    return {
      totalAreas: areas.length,
      avgProductivo,
      avgSoporte,
      avgMuerto,
      totalActividades,
      areasEficientes,
      areasCriticas,
      mejorArea,
      peorArea,
      areasWithMetrics: areasWithMetrics.sort((a: any, b: any) => b.productivePercent - a.productivePercent)
    };
  }, [areas]);

  if (areas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto py-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No hay áreas registradas
              </h3>
              <p className="text-slate-500 mb-6">
                Crea tu primera área para ver el dashboard ejecutivo
              </p>
              <Button onClick={() => setLocation("/")}>
                Ir a Áreas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold text-slate-800">
              Dashboard Ejecutivo
            </h1>
            <p className="text-slate-600 mt-2">
              Visión consolidada de todas las áreas analizadas
            </p>
          </div>
          <Button 
            onClick={async () => {
              if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                await signOut();
              }
            }} 
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Métricas Clave */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Áreas</CardDescription>
              <CardTitle className="text-3xl">{metrics.totalAreas}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                {metrics.totalActividades} actividades registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Promedio Productivo</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {metrics.avgProductivo.toFixed(0)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {metrics.avgProductivo >= 70 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Excelente</span>
                  </>
                ) : metrics.avgProductivo >= 50 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">Aceptable</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Requiere atención</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Áreas Eficientes</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {metrics.areasEficientes}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                ≥70% tiempo productivo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Áreas Críticas</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {metrics.areasCriticas}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {metrics.areasCriticas > 0 ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">≥30% tiempo muerto</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Ninguna crítica</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mejor y Peor Área */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.mejorArea && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-800">🏆 Área Más Eficiente</CardTitle>
                  <Badge variant="default" className="bg-green-600">
                    {(metrics.mejorArea as any).productivePercent.toFixed(0)}% Productivo
                  </Badge>
                </div>
                <CardDescription className="text-green-700">
                  {metrics.mejorArea.areaName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">
                  Jefe: {metrics.mejorArea.managerName || "No especificado"}
                </p>
                <p className="text-sm text-green-700">
                  {(metrics.mejorArea as any).totalActivities} actividades · {metrics.mejorArea.positions.length} cargos
                </p>
              </CardContent>
            </Card>
          )}

          {metrics.peorArea && (metrics.peorArea as any).deadPercent > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-800">⚠️ Área con Mayor Tiempo Muerto</CardTitle>
                  <Badge variant="destructive">
                    {(metrics.peorArea as any).deadPercent.toFixed(0)}% Muerto
                  </Badge>
                </div>
                <CardDescription className="text-red-700">
                  {metrics.peorArea.areaName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">
                  Jefe: {metrics.peorArea.managerName || "No especificado"}
                </p>
                <p className="text-sm text-red-700">
                  Requiere intervención prioritaria
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ranking de Áreas */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Áreas por Eficiencia</CardTitle>
            <CardDescription>
              Ordenadas por porcentaje de tiempo productivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.areasWithMetrics?.map((area: any, index: number) => (
                <div
                  key={area.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{area.areaName}</h4>
                    <p className="text-sm text-slate-600">
                      {area.managerName} · {area.positions.length} cargos · {area.totalActivities} actividades
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="default" className="bg-green-600">
                      {area.productivePercent.toFixed(0)}% Productivo
                    </Badge>
                    <Badge variant="secondary">
                      {area.supportPercent.toFixed(0)}% Soporte
                    </Badge>
                    {area.deadPercent > 0 && (
                      <Badge variant="destructive">
                        {area.deadPercent.toFixed(0)}% Muerto
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation("/")}
                  >
                    Ver Detalles
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico Comparativo */}
        <Card>
          <CardHeader>
            <CardTitle>Comparación Visual de Áreas</CardTitle>
            <CardDescription>
              Distribución de tiempos por área
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {metrics.areasWithMetrics?.map((area: any) => (
                <div key={area.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">{area.areaName}</span>
                    <span className="text-sm text-slate-600">
                      {area.workdayMinutes - area.fixedBreaksMinutes} min disponibles
                    </span>
                  </div>
                  <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden flex">
                    <div
                      className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${area.productivePercent}%` }}
                    >
                      {area.productivePercent > 10 && `${area.productivePercent.toFixed(0)}%`}
                    </div>
                    <div
                      className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${area.supportPercent}%` }}
                    >
                      {area.supportPercent > 10 && `${area.supportPercent.toFixed(0)}%`}
                    </div>
                    <div
                      className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${area.deadPercent}%` }}
                    >
                      {area.deadPercent > 10 && `${area.deadPercent.toFixed(0)}%`}
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-600">
                    <span>🟢 Productivo: {area.productiveTime.toFixed(0)} min</span>
                    <span>🔵 Soporte: {area.supportTime.toFixed(0)} min</span>
                    <span>🔴 Muerto: {area.deadTime.toFixed(0)} min</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
