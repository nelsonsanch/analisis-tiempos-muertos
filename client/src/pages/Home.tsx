import { useState, useEffect } from "react";
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
  AlertCircle,
  List,
  Edit,
  TrendingUp,
  ArrowLeft
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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
  id?: string;
  areaName: string;
  managerName: string;
  date: string;
  workdayMinutes: number;
  fixedBreaksMinutes: number;
  activities: Activity[];
  observations: string;
  savedAt?: string;
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
  const [view, setView] = useState<"list" | "form" | "compare">("list");
  const [savedAreas, setSavedAreas] = useState<InterviewData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [interviewData, setInterviewData] = useState<InterviewData>({
    areaName: "",
    managerName: "",
    date: new Date().toISOString().split("T")[0],
    workdayMinutes: 480,
    fixedBreaksMinutes: 60,
    activities: [],
    observations: "",
  });

  const [newActivity, setNewActivity] = useState({
    name: "",
    timeMinutes: 0,
    type: "productive" as Activity["type"],
    cause: "",
  });

  // Cargar áreas guardadas al iniciar
  useEffect(() => {
    const stored = localStorage.getItem("timeAnalysisInterviews");
    if (stored) {
      setSavedAreas(JSON.parse(stored));
    }
  }, []);

  // Cálculos automáticos
  const calculateTotals = (data: InterviewData) => {
    const totalActivities = data.activities.reduce(
      (acc, activity) => acc + activity.timeMinutes,
      0
    );

    const productiveTime = data.activities
      .filter((a) => a.type === "productive")
      .reduce((acc, a) => acc + a.timeMinutes, 0);

    const supportTime = data.activities
      .filter((a) => a.type === "support")
      .reduce((acc, a) => acc + a.timeMinutes, 0);

    const deadTime = data.activities
      .filter((a) => a.type === "dead_time")
      .reduce((acc, a) => acc + a.timeMinutes, 0);

    const availableTime = data.workdayMinutes - data.fixedBreaksMinutes;
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

  const totals = calculateTotals(interviewData);

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

  // Guardar área
  const saveArea = () => {
    if (!interviewData.areaName) {
      alert("Por favor ingresa el nombre del área");
      return;
    }

    const newArea: InterviewData = {
      ...interviewData,
      id: editingId || Date.now().toString(),
      savedAt: new Date().toISOString(),
    };

    let updatedAreas: InterviewData[];
    if (editingId) {
      updatedAreas = savedAreas.map((area) =>
        area.id === editingId ? newArea : area
      );
    } else {
      updatedAreas = [...savedAreas, newArea];
    }

    localStorage.setItem("timeAnalysisInterviews", JSON.stringify(updatedAreas));
    setSavedAreas(updatedAreas);
    alert("Área guardada exitosamente");
    
    // Resetear formulario
    setInterviewData({
      areaName: "",
      managerName: "",
      date: new Date().toISOString().split("T")[0],
      workdayMinutes: 480,
      fixedBreaksMinutes: 60,
      activities: [],
      observations: "",
    });
    setEditingId(null);
    setView("list");
  };

  // Editar área
  const editArea = (area: InterviewData) => {
    setInterviewData(area);
    setEditingId(area.id || null);
    setView("form");
  };

  // Eliminar área
  const deleteArea = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta área?")) {
      const updatedAreas = savedAreas.filter((area) => area.id !== id);
      localStorage.setItem("timeAnalysisInterviews", JSON.stringify(updatedAreas));
      setSavedAreas(updatedAreas);
    }
  };

  // Nueva área
  const newArea = () => {
    setInterviewData({
      areaName: "",
      managerName: "",
      date: new Date().toISOString().split("T")[0],
      workdayMinutes: 480,
      fixedBreaksMinutes: 60,
      activities: [],
      observations: "",
    });
    setEditingId(null);
    setView("form");
  };

  // Exportar área individual
  const exportArea = (area: InterviewData) => {
    const totals = calculateTotals(area);
    const dataStr = JSON.stringify({ ...area, totals }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analisis-${area.areaName}-${area.date}.json`;
    link.click();
  };

  // Exportar comparativa
  const exportComparative = () => {
    const comparative = savedAreas.map((area) => ({
      ...area,
      totals: calculateTotals(area),
    }));
    const dataStr = JSON.stringify(comparative, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `comparativa-areas-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
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

  // Datos para comparativa entre áreas
  const comparativeData = savedAreas.map((area) => {
    const totals = calculateTotals(area);
    return {
      area: area.areaName,
      Productivo: totals.productivePercentage,
      Soporte: totals.supportPercentage,
      "Tiempo Muerto": totals.deadTimePercentage,
    };
  });

  const radarData = savedAreas.map((area) => {
    const totals = calculateTotals(area);
    return {
      area: area.areaName.length > 15 ? area.areaName.substring(0, 15) + "..." : area.areaName,
      productivo: totals.productivePercentage,
      soporte: totals.supportPercentage,
      muerto: totals.deadTimePercentage,
    };
  });

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
                  Gestión de áreas y mapas de procesos
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {view === "list" && (
                <>
                  <Button onClick={newArea} size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Área
                  </Button>
                  {savedAreas.length > 0 && (
                    <>
                      <Button onClick={() => setView("compare")} variant="outline" size="lg">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Comparar
                      </Button>
                      <Button onClick={exportComparative} variant="outline" size="lg">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Todo
                      </Button>
                    </>
                  )}
                </>
              )}
              {view === "form" && (
                <>
                  <Button onClick={() => setView("list")} variant="outline" size="lg">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                  </Button>
                  <Button onClick={saveArea} size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    {editingId ? "Actualizar" : "Guardar"} Área
                  </Button>
                </>
              )}
              {view === "compare" && (
                <Button onClick={() => setView("list")} variant="outline" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        {/* Vista: Lista de Áreas */}
        {view === "list" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Áreas Registradas ({savedAreas.length})</CardTitle>
                <CardDescription>
                  Gestiona todas las áreas analizadas y sus mapas de procesos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedAreas.length === 0 ? (
                  <div className="text-center py-12">
                    <List className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No hay áreas registradas
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Comienza creando tu primera área para analizar tiempos muertos
                    </p>
                    <Button onClick={newArea}>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Primera Área
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedAreas.map((area) => {
                      const areaTotals = calculateTotals(area);
                      return (
                        <Card key={area.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg">{area.areaName}</CardTitle>
                                <CardDescription className="mt-1">
                                  {area.managerName} • {area.date}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <div className="text-2xl font-bold text-green-600">
                                  {areaTotals.productivePercentage.toFixed(0)}%
                                </div>
                                <div className="text-xs text-slate-600">Productivo</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-blue-600">
                                  {areaTotals.supportPercentage.toFixed(0)}%
                                </div>
                                <div className="text-xs text-slate-600">Soporte</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-red-600">
                                  {areaTotals.deadTimePercentage.toFixed(0)}%
                                </div>
                                <div className="text-xs text-slate-600">Muerto</div>
                              </div>
                            </div>
                            <Separator />
                            <div className="text-sm text-slate-600">
                              <strong>{area.activities.length}</strong> actividades registradas
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => editArea(area)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Edit className="mr-1 h-3 w-3" />
                                Ver/Editar
                              </Button>
                              <Button
                                onClick={() => exportArea(area)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Download className="mr-1 h-3 w-3" />
                                Exportar
                              </Button>
                              <Button
                                onClick={() => deleteArea(area.id!)}
                                variant="outline"
                                size="sm"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vista: Formulario de Área */}
        {view === "form" && (
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
                  <CardDescription>Datos básicos del área</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="areaName">Nombre del Área *</Label>
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
                      <span className="font-semibold text-slate-900">Tiempo Disponible:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {totals.availableTime} min ({(totals.availableTime / 60).toFixed(1)} hrs)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agregar Actividades */}
              <Card>
                <CardHeader>
                  <CardTitle>Mapa de Procesos - Registrar Actividades</CardTitle>
                  <CardDescription>
                    Construye el mapa de procesos del área registrando cada actividad
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
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                        placeholder="Describe la causa principal..."
                        rows={2}
                      />
                    </div>
                  )}

                  {totals.unassignedTime < 0 && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm text-red-600 font-medium">
                        Advertencia: Exceso de {Math.abs(totals.unassignedTime)} minutos
                      </span>
                    </div>
                  )}

                  {totals.unassignedTime > 0 && interviewData.activities.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">
                        Tiempo sin asignar: {totals.unassignedTime} min
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
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50"
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
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={interviewData.observations}
                    onChange={(e) =>
                      setInterviewData({ ...interviewData, observations: e.target.value })
                    }
                    placeholder="Notas adicionales, hallazgos importantes..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Gráficos */}
            <TabsContent value="charts" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Tiempos</CardTitle>
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
                        No hay datos
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tiempo por Actividad</CardTitle>
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
                        No hay actividades
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Resumen */}
            <TabsContent value="summary" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      {totals.productiveTime} min
                    </p>
                  </CardContent>
                </Card>

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
                      {totals.supportTime} min
                    </p>
                  </CardContent>
                </Card>

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
                      {totals.deadTime} min
                    </p>
                  </CardContent>
                </Card>
              </div>

              {interviewData.activities.filter((a) => a.type === "dead_time").length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Causas Raíz de Tiempos Muertos</CardTitle>
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
                                  <p className="text-sm text-slate-600 mt-1">{activity.cause}</p>
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
            </TabsContent>
          </Tabs>
        )}

        {/* Vista: Comparativa entre Áreas */}
        {view === "compare" && savedAreas.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparativa entre Áreas</CardTitle>
                <CardDescription>
                  Análisis comparativo de {savedAreas.length} áreas registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de Barras Comparativo */}
                  <div>
                    <h3 className="font-semibold mb-4">Distribución por Área (%)</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={comparativeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="area" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Productivo" fill={COLORS.productive} />
                        <Bar dataKey="Soporte" fill={COLORS.support} />
                        <Bar dataKey="Tiempo Muerto" fill={COLORS.dead_time} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Gráfico Radar */}
                  <div>
                    <h3 className="font-semibold mb-4">Vista Radar</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="area" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Productivo"
                          dataKey="productivo"
                          stroke={COLORS.productive}
                          fill={COLORS.productive}
                          fillOpacity={0.6}
                        />
                        <Radar
                          name="Tiempo Muerto"
                          dataKey="muerto"
                          stroke={COLORS.dead_time}
                          fill={COLORS.dead_time}
                          fillOpacity={0.6}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabla Comparativa */}
            <Card>
              <CardHeader>
                <CardTitle>Tabla Comparativa Detallada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Área</th>
                        <th className="text-left p-3">Jefe</th>
                        <th className="text-right p-3">Productivo</th>
                        <th className="text-right p-3">Soporte</th>
                        <th className="text-right p-3">Tiempo Muerto</th>
                        <th className="text-right p-3">Actividades</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedAreas.map((area) => {
                        const totals = calculateTotals(area);
                        return (
                          <tr key={area.id} className="border-b hover:bg-slate-50">
                            <td className="p-3 font-medium">{area.areaName}</td>
                            <td className="p-3 text-slate-600">{area.managerName}</td>
                            <td className="p-3 text-right">
                              <span className="font-semibold text-green-600">
                                {totals.productivePercentage.toFixed(1)}%
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <span className="font-semibold text-blue-600">
                                {totals.supportPercentage.toFixed(1)}%
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <span className="font-semibold text-red-600">
                                {totals.deadTimePercentage.toFixed(1)}%
                              </span>
                            </td>
                            <td className="p-3 text-right text-slate-600">
                              {area.activities.length}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
