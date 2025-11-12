import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Plus, 
  Trash2, 
  PieChart, 
  BarChart3, 
  FileText,
  Download,
  Save,
  AlertCircle
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Tipos de datos
interface Activity {
  id: string;
  name: string;
  timeMinutes: number;
  type: "productive" | "support" | "dead_time";
  cause?: string;
}

interface InterviewData {
  areaName: string;
  managerName: string;
  date: string;
  workdayMinutes: number;
  fixedBreaksMinutes: number;
  activities: Activity[];
  observations: string;
}

const COLORS = {
  productive: "#10b981",
  support: "#3b82f6",
  dead_time: "#ef4444",
};

const ACTIVITY_TYPES = {
  productive: { label: "Productiva", color: "bg-green-500" },
  support: { label: "Soporte", color: "bg-blue-500" },
  dead_time: { label: "Tiempo Muerto", color: "bg-red-500" },
};

export default function Home() {
  const [interviewData, setInterviewData] = useState<InterviewData>({
    areaName: "",
    managerName: "",
    date: new Date().toISOString().split("T")[0],
    workdayMinutes: 480, // 8 horas por defecto
    fixedBreaksMinutes: 60, // 1 hora de almuerzo por defecto
    activities: [],
    observations: "",
  });

  const [newActivity, setNewActivity] = useState({
    name: "",
    timeMinutes: 0,
    type: "productive" as Activity["type"],
    cause: "",
  });

  // Cálculos automáticos
  const calculateTotals = () => {
    const totalActivities = interviewData.activities.reduce(
      (acc, activity) => acc + activity.timeMinutes,
      0
    );

    const productiveTime = interviewData.activities
      .filter((a) => a.type === "productive")
      .reduce((acc, a) => acc + a.timeMinutes, 0);

    const supportTime = interviewData.activities
      .filter((a) => a.type === "support")
      .reduce((acc, a) => acc + a.timeMinutes, 0);

    const deadTime = interviewData.activities
      .filter((a) => a.type === "dead_time")
      .reduce((acc, a) => acc + a.timeMinutes, 0);

    const availableTime = interviewData.workdayMinutes - interviewData.fixedBreaksMinutes;
    const unassignedTime = availableTime - totalActivities;

    return {
      totalActivities,
      productiveTime,
      supportTime,
      deadTime,
      availableTime,
      unassignedTime,
      productivePercentage: availableTime > 0 ? (productiveTime / availableTime) * 100 : 0,
      supportPercentage: availableTime > 0 ? (supportTime / availableTime) * 100 : 0,
      deadTimePercentage: availableTime > 0 ? (deadTime / availableTime) * 100 : 0,
    };
  };

  const totals = calculateTotals();

  // Agregar actividad
  const addActivity = () => {
    if (!newActivity.name || newActivity.timeMinutes <= 0) {
      return;
    }

    const activity: Activity = {
      id: Date.now().toString(),
      name: newActivity.name,
      timeMinutes: newActivity.timeMinutes,
      type: newActivity.type,
      cause: newActivity.type === "dead_time" ? newActivity.cause : undefined,
    };

    setInterviewData({
      ...interviewData,
      activities: [...interviewData.activities, activity],
    });

    // Resetear formulario
    setNewActivity({
      name: "",
      timeMinutes: 0,
      type: "productive",
      cause: "",
    });
  };

  // Eliminar actividad
  const removeActivity = (id: string) => {
    setInterviewData({
      ...interviewData,
      activities: interviewData.activities.filter((a) => a.id !== id),
    });
  };

  // Datos para gráficos
  const pieChartData = [
    { name: "Tiempo Productivo", value: totals.productiveTime, color: COLORS.productive },
    { name: "Tiempo de Soporte", value: totals.supportTime, color: COLORS.support },
    { name: "Tiempo Muerto", value: totals.deadTime, color: COLORS.dead_time },
  ].filter((item) => item.value > 0);

  const barChartData = interviewData.activities.map((activity) => ({
    name: activity.name.length > 20 ? activity.name.substring(0, 20) + "..." : activity.name,
    minutos: activity.timeMinutes,
    tipo: ACTIVITY_TYPES[activity.type].label,
    fill: COLORS[activity.type],
  }));

  // Guardar en localStorage
  const saveInterview = () => {
    const interviews = JSON.parse(localStorage.getItem("timeAnalysisInterviews") || "[]");
    const newInterview = {
      ...interviewData,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
    };
    interviews.push(newInterview);
    localStorage.setItem("timeAnalysisInterviews", JSON.stringify(interviews));
    alert("Entrevista guardada exitosamente");
  };

  // Exportar a JSON
  const exportToJSON = () => {
    const dataStr = JSON.stringify({ ...interviewData, totals }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analisis-tiempos-${interviewData.areaName}-${interviewData.date}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Análisis de Tiempos Muertos
                </h1>
                <p className="text-slate-600 mt-1">
                  Herramienta para entrevistas y diagnóstico de productividad
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveInterview} variant="outline" size="lg">
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
              <Button onClick={exportToJSON} size="lg">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <Tabs defaultValue="interview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="interview">
              <FileText className="mr-2 h-4 w-4" />
              Entrevista
            </TabsTrigger>
            <TabsTrigger value="charts">
              <PieChart className="mr-2 h-4 w-4" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="summary">
              <BarChart3 className="mr-2 h-4 w-4" />
              Resumen
            </TabsTrigger>
          </TabsList>

          {/* Tab: Entrevista */}
          <TabsContent value="interview" className="space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>Datos básicos de la entrevista</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="areaName">Nombre del Área</Label>
                    <Input
                      id="areaName"
                      value={interviewData.areaName}
                      onChange={(e) =>
                        setInterviewData({ ...interviewData, areaName: e.target.value })
                      }
                      placeholder="Ej: Producción, Logística"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="managerName">Jefe de Área</Label>
                    <Input
                      id="managerName"
                      value={interviewData.managerName}
                      onChange={(e) =>
                        setInterviewData({ ...interviewData, managerName: e.target.value })
                      }
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={interviewData.date}
                      onChange={(e) =>
                        setInterviewData({ ...interviewData, date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workdayMinutes">Jornada Laboral (minutos)</Label>
                    <Input
                      id="workdayMinutes"
                      type="number"
                      value={interviewData.workdayMinutes}
                      onChange={(e) =>
                        setInterviewData({
                          ...interviewData,
                          workdayMinutes: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <p className="text-sm text-slate-600">
                      {(interviewData.workdayMinutes / 60).toFixed(1)} horas
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fixedBreaksMinutes">Pausas Fijas (minutos)</Label>
                    <Input
                      id="fixedBreaksMinutes"
                      type="number"
                      value={interviewData.fixedBreaksMinutes}
                      onChange={(e) =>
                        setInterviewData({
                          ...interviewData,
                          fixedBreaksMinutes: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <p className="text-sm text-slate-600">
                      {(interviewData.fixedBreaksMinutes / 60).toFixed(1)} horas (almuerzo, pausas)
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-slate-900">Tiempo Disponible para Trabajo:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {totals.availableTime} minutos ({(totals.availableTime / 60).toFixed(1)}{" "}
                      horas)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agregar Actividades */}
            <Card>
              <CardHeader>
                <CardTitle>Registrar Actividades</CardTitle>
                <CardDescription>
                  Agrega las actividades identificadas durante la entrevista
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="activityName">Nombre de la Actividad</Label>
                    <Input
                      id="activityName"
                      value={newActivity.name}
                      onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                      placeholder="Ej: Revisar correos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activityTime">Tiempo (min)</Label>
                    <Input
                      id="activityTime"
                      type="number"
                      value={newActivity.timeMinutes || ""}
                      onChange={(e) =>
                        setNewActivity({
                          ...newActivity,
                          timeMinutes: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activityType">Tipo</Label>
                    <select
                      id="activityType"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={newActivity.type}
                      onChange={(e) =>
                        setNewActivity({
                          ...newActivity,
                          type: e.target.value as Activity["type"],
                        })
                      }
                    >
                      <option value="productive">Productiva</option>
                      <option value="support">Soporte</option>
                      <option value="dead_time">Tiempo Muerto</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button onClick={addActivity} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                </div>

                {newActivity.type === "dead_time" && (
                  <div className="space-y-2">
                    <Label htmlFor="activityCause">Causa Raíz del Tiempo Muerto</Label>
                    <Textarea
                      id="activityCause"
                      value={newActivity.cause}
                      onChange={(e) => setNewActivity({ ...newActivity, cause: e.target.value })}
                      placeholder="Describe la causa principal de este tiempo muerto..."
                      rows={2}
                    />
                  </div>
                )}

                {totals.unassignedTime < 0 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">
                      Advertencia: Has asignado más tiempo del disponible (
                      {Math.abs(totals.unassignedTime)} minutos de exceso)
                    </span>
                  </div>
                )}

                {totals.unassignedTime > 0 && interviewData.activities.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">
                      Tiempo sin asignar: {totals.unassignedTime} minutos (
                      {(totals.unassignedTime / 60).toFixed(1)} horas)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de Actividades */}
            {interviewData.activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Actividades Registradas ({interviewData.activities.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {interviewData.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Badge className={ACTIVITY_TYPES[activity.type].color}>
                            {ACTIVITY_TYPES[activity.type].label}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium">{activity.name}</p>
                            {activity.cause && (
                              <p className="text-sm text-slate-600 mt-1">
                                Causa: {activity.cause}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{activity.timeMinutes} min</p>
                            <p className="text-sm text-slate-600">
                              {(activity.timeMinutes / 60).toFixed(1)} hrs
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeActivity(activity.id)}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Observaciones */}
            <Card>
              <CardHeader>
                <CardTitle>Observaciones Generales</CardTitle>
                <CardDescription>
                  Notas adicionales sobre la entrevista o hallazgos importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={interviewData.observations}
                  onChange={(e) =>
                    setInterviewData({ ...interviewData, observations: e.target.value })
                  }
                  placeholder="Escribe aquí observaciones, comentarios del jefe de área, problemas identificados, etc."
                  rows={4}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Gráficos */}
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gráfico de Pastel */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Tiempos</CardTitle>
                  <CardDescription>Porcentaje por tipo de actividad</CardDescription>
                </CardHeader>
                <CardContent>
                  {pieChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-slate-500">
                      No hay datos para mostrar
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gráfico de Barras */}
              <Card>
                <CardHeader>
                  <CardTitle>Tiempo por Actividad</CardTitle>
                  <CardDescription>Minutos dedicados a cada tarea</CardDescription>
                </CardHeader>
                <CardContent>
                  {barChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="minutos" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-slate-500">
                      No hay actividades registradas
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Resumen */}
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tiempo Productivo */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Tiempo Productivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {totals.productivePercentage.toFixed(1)}%
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    {totals.productiveTime} minutos ({(totals.productiveTime / 60).toFixed(1)}{" "}
                    horas)
                  </p>
                </CardContent>
              </Card>

              {/* Tiempo de Soporte */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Tiempo de Soporte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {totals.supportPercentage.toFixed(1)}%
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    {totals.supportTime} minutos ({(totals.supportTime / 60).toFixed(1)} horas)
                  </p>
                </CardContent>
              </Card>

              {/* Tiempo Muerto */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Tiempo Muerto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {totals.deadTimePercentage.toFixed(1)}%
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    {totals.deadTime} minutos ({(totals.deadTime / 60).toFixed(1)} horas)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Causas de Tiempos Muertos */}
            {interviewData.activities.filter((a) => a.type === "dead_time").length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Causas Raíz de Tiempos Muertos</CardTitle>
                  <CardDescription>
                    Principales problemas identificados que generan pérdida de tiempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {interviewData.activities
                      .filter((a) => a.type === "dead_time")
                      .map((activity) => (
                        <div key={activity.id} className="border-l-4 border-red-500 pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{activity.name}</p>
                              {activity.cause && (
                                <p className="text-sm text-slate-600 mt-1">
                                  {activity.cause}
                                </p>
                              )}
                            </div>
                            <Badge variant="destructive">{activity.timeMinutes} min</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resumen Ejecutivo */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen Ejecutivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Información de la Entrevista</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-600">Área:</span>{" "}
                      <span className="font-medium">{interviewData.areaName || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Jefe:</span>{" "}
                      <span className="font-medium">{interviewData.managerName || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Fecha:</span>{" "}
                      <span className="font-medium">{interviewData.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Actividades:</span>{" "}
                      <span className="font-medium">{interviewData.activities.length}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Hallazgos Clave</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      • El tiempo productivo representa el{" "}
                      <strong>{totals.productivePercentage.toFixed(1)}%</strong> de la jornada
                      efectiva
                    </li>
                    <li>
                      • Se identificaron <strong>{totals.deadTime} minutos</strong> de tiempos
                      muertos (
                      {totals.deadTimePercentage.toFixed(1)}%)
                    </li>
                    <li>
                      • Las actividades de soporte consumen{" "}
                      <strong>{totals.supportTime} minutos</strong> (
                      {totals.supportPercentage.toFixed(1)}%)
                    </li>
                    {totals.unassignedTime > 0 && (
                      <li>
                        • Hay <strong>{totals.unassignedTime} minutos</strong> sin clasificar que
                        requieren análisis adicional
                      </li>
                    )}
                  </ul>
                </div>

                {interviewData.observations && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Observaciones</h3>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">
                        {interviewData.observations}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
