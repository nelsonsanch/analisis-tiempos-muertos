import { useState, useEffect, useMemo } from "react";
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
  ArrowLeft,
  Network,
  ArrowRight,
  CheckCircle2,
  Check,
  ChevronsUpDown
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Tipos de datos
interface Activity {
  id: string;
  name: string;
  timeMinutes: number;
  type: "productive" | "support" | "dead_time";
  cause?: string;
}

interface TurtleProcess {
  inputs: string[];
  outputs: string[];
  resources: string[];
  methods: string[];
  indicators: string[];
  competencies: string[];
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
  turtleProcess?: TurtleProcess;
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

const TURTLE_FIELDS = [
  { key: "inputs", label: "Entradas", question: "¿Qué necesito?", icon: "📥" },
  { key: "outputs", label: "Salidas", question: "¿Qué produzco?", icon: "📤" },
  { key: "resources", label: "Recursos", question: "¿Con qué?", icon: "🔧" },
  { key: "methods", label: "Métodos", question: "¿Cómo lo hago?", icon: "📋" },
  { key: "indicators", label: "Indicadores", question: "¿Cómo mido?", icon: "📊" },
  { key: "competencies", label: "Competencias", question: "¿Quién lo hace?", icon: "👥" },
];

export default function Home() {
  const [view, setView] = useState<"list" | "form" | "compare" | "process-map" | "sipoc">("list");
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
    turtleProcess: {
      inputs: [],
      outputs: [],
      resources: [],
      methods: [],
      indicators: [],
      competencies: [],
    },
  });

  const [newActivity, setNewActivity] = useState({
    name: "",
    timeMinutes: 0,
    type: "productive" as Activity["type"],
    cause: "",
  });

  // Estados para Tortuga
  const [newTurtleItem, setNewTurtleItem] = useState("");
  const [currentTurtleField, setCurrentTurtleField] = useState<keyof TurtleProcess | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedFromList, setSelectedFromList] = useState("");
  const [expandedProcesses, setExpandedProcesses] = useState<Set<string>>(new Set());

  // Cargar áreas guardadas
  useEffect(() => {
    const stored = localStorage.getItem("timeAnalysisInterviews");
    if (stored) {
      setSavedAreas(JSON.parse(stored));
    }
  }, []);

  // Generar lista global de items únicos por campo
  const globalTurtleItems = useMemo(() => {
    const items: Record<keyof TurtleProcess, Set<string>> = {
      inputs: new Set(),
      outputs: new Set(),
      resources: new Set(),
      methods: new Set(),
      indicators: new Set(),
      competencies: new Set(),
    };

    // Incluir items de todas las áreas guardadas
    savedAreas.forEach((area) => {
      if (area.turtleProcess) {
        Object.keys(items).forEach((key) => {
          const field = key as keyof TurtleProcess;
          area.turtleProcess![field].forEach((item) => {
            items[field].add(item);
          });
        });
      }
    });

    // Incluir items del área actual (para que aparezcan al editar)
    if (interviewData.turtleProcess) {
      Object.keys(items).forEach((key) => {
        const field = key as keyof TurtleProcess;
        interviewData.turtleProcess![field].forEach((item) => {
          items[field].add(item);
        });
      });
    }

    // Convertir Sets a Arrays ordenados
    return {
      inputs: Array.from(items.inputs).sort(),
      outputs: Array.from(items.outputs).sort(),
      resources: Array.from(items.resources).sort(),
      methods: Array.from(items.methods).sort(),
      indicators: Array.from(items.indicators).sort(),
      competencies: Array.from(items.competencies).sort(),
    };
  }, [savedAreas, interviewData.turtleProcess]);

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

  // Funciones de Actividades
  const addActivity = () => {
    if (!newActivity.name || newActivity.timeMinutes <= 0) return;

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

    setNewActivity({ name: "", timeMinutes: 0, type: "productive", cause: "" });
  };

  const removeActivity = (id: string) => {
    setInterviewData({
      ...interviewData,
      activities: interviewData.activities.filter((a) => a.id !== id),
    });
  };

  // Funciones de Tortuga
  const addTurtleItem = (field: keyof TurtleProcess, value?: string) => {
    const itemToAdd = value || newTurtleItem.trim();
    if (!itemToAdd) return;
    
    const turtle = interviewData.turtleProcess || {
      inputs: [], outputs: [], resources: [], methods: [], indicators: [], competencies: []
    };

    // Evitar duplicados en la misma área
    if (turtle[field].includes(itemToAdd)) {
      alert("Este item ya existe en esta área");
      return;
    }

    setInterviewData({
      ...interviewData,
      turtleProcess: {
        ...turtle,
        [field]: [...turtle[field], itemToAdd],
      },
    });
    
    setNewTurtleItem("");
    setSelectedFromList("");
    setOpenCombobox(false);
  };

  const removeTurtleItem = (field: keyof TurtleProcess, index: number) => {
    const turtle = interviewData.turtleProcess!;
    setInterviewData({
      ...interviewData,
      turtleProcess: {
        ...turtle,
        [field]: turtle[field].filter((_, i) => i !== index),
      },
    });
  };

  // Funciones de Área
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
    
    setInterviewData({
      areaName: "",
      managerName: "",
      date: new Date().toISOString().split("T")[0],
      workdayMinutes: 480,
      fixedBreaksMinutes: 60,
      activities: [],
      observations: "",
      turtleProcess: {
        inputs: [], outputs: [], resources: [], methods: [], indicators: [], competencies: []
      },
    });
    setEditingId(null);
    setView("list");
  };

  const editArea = (area: InterviewData) => {
    setInterviewData({
      ...area,
      turtleProcess: area.turtleProcess || {
        inputs: [], outputs: [], resources: [], methods: [], indicators: [], competencies: []
      }
    });
    setEditingId(area.id || null);
    setView("form");
  };

  const deleteArea = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta área?")) {
      const updatedAreas = savedAreas.filter((area) => area.id !== id);
      localStorage.setItem("timeAnalysisInterviews", JSON.stringify(updatedAreas));
      setSavedAreas(updatedAreas);
    }
  };

  const newArea = () => {
    setInterviewData({
      areaName: "",
      managerName: "",
      date: new Date().toISOString().split("T")[0],
      workdayMinutes: 480,
      fixedBreaksMinutes: 60,
      activities: [],
      observations: "",
      turtleProcess: {
        inputs: [], outputs: [], resources: [], methods: [], indicators: [], competencies: []
      },
    });
    setEditingId(null);
    setView("form");
  };

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

  // Detectar interacciones entre áreas (coincidencia exacta)
  const detectInteractions = () => {
    const interactions: Array<{source: string, target: string, items: string[]}> = [];
    
    savedAreas.forEach((sourceArea) => {
      if (!sourceArea.turtleProcess) return;
      
      savedAreas.forEach((targetArea) => {
        if (sourceArea.id === targetArea.id || !targetArea.turtleProcess) return;
        
        // Buscar coincidencias exactas entre salidas de origen y entradas de destino
        const matchingItems = sourceArea.turtleProcess!.outputs.filter((output) =>
          targetArea.turtleProcess!.inputs.includes(output)
        );
        
        if (matchingItems.length > 0) {
          interactions.push({
            source: sourceArea.areaName,
            target: targetArea.areaName,
            items: matchingItems,
          });
        }
      });
    });
    
    return interactions;
  };

  const interactions = detectInteractions();

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
                  Gestión de áreas y mapas de procesos - Metodología Tortuga
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
                  {savedAreas.length === 0 && (
                    <Button 
                      onClick={() => {
                        // Cargar datos de ejemplo
                        const ejemplos: InterviewData[] = [
                          {
                            id: "ejemplo1",
                            areaName: "Compras",
                            managerName: "María García",
                            date: new Date().toISOString().split('T')[0],
                            workdayMinutes: 540,
                            fixedBreaksMinutes: 60,
                            activities: [],
                            observations: "",
                            turtleProcess: {
                              inputs: ["Requisición de compra", "Presupuesto aprobado"],
                              outputs: ["Orden de compra", "Materiales", "Insumos"],
                              resources: ["Sistema ERP", "Proveedores"],
                              methods: ["Proceso de cotización", "Análisis de proveedores"],
                              indicators: ["Tiempo de respuesta", "Costo de compra"],
                              competencies: ["Negociación", "Análisis de costos"]
                            }
                          },
                          {
                            id: "ejemplo2",
                            areaName: "Producción",
                            managerName: "Carlos Rodríguez",
                            date: new Date().toISOString().split('T')[0],
                            workdayMinutes: 540,
                            fixedBreaksMinutes: 60,
                            activities: [],
                            observations: "",
                            turtleProcess: {
                              inputs: ["Materiales", "Insumos", "Orden de producción"],
                              outputs: ["Producto terminado", "Unidades producidas"],
                              resources: ["Maquinaria", "Personal operativo"],
                              methods: ["Proceso de manufactura", "Control de calidad"],
                              indicators: ["Eficiencia productiva", "Unidades por hora"],
                              competencies: ["Operación de maquinaria", "Control de calidad"]
                            }
                          },
                          {
                            id: "ejemplo3",
                            areaName: "Logística",
                            managerName: "Ana Martínez",
                            date: new Date().toISOString().split('T')[0],
                            workdayMinutes: 600,
                            fixedBreaksMinutes: 60,
                            activities: [],
                            observations: "",
                            turtleProcess: {
                              inputs: ["Producto terminado", "Orden de despacho"],
                              outputs: ["Producto despachado", "Guía de envío"],
                              resources: ["Vehículos", "Almacén"],
                              methods: ["Proceso de empaque", "Ruteo de entregas"],
                              indicators: ["Entregas a tiempo", "Costo de envío"],
                              competencies: ["Gestión de inventario", "Coordinación logística"]
                            }
                          }
                        ];
                        setSavedAreas(ejemplos);
                        localStorage.setItem("timeAnalysisInterviews", JSON.stringify(ejemplos));
                        alert("✅ Se cargaron 3 áreas de ejemplo con interacciones detectadas");
                      }}
                      variant="outline" 
                      size="lg"
                    >
                      🎯 Cargar Ejemplo
                    </Button>
                  )}
                  {savedAreas.length > 0 && (
                    <>
                      <Button onClick={() => setView("compare")} variant="outline" size="lg">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Comparar
                      </Button>
                      <Button onClick={() => setView("process-map")} variant="outline" size="lg">
                        <Network className="mr-2 h-4 w-4" />
                        Mapa de Procesos
                      </Button>
                      <Button onClick={() => setView("sipoc")} variant="outline" size="lg">
                        <FileText className="mr-2 h-4 w-4" />
                        Matriz SIPOC
                      </Button>
                      <Button onClick={exportComparative} variant="outline" size="lg">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
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
              {(view === "compare" || view === "process-map" || view === "sipoc") && (
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
                      const hasTurtle = area.turtleProcess && 
                        Object.values(area.turtleProcess).some(arr => arr.length > 0);
                      
                      return (
                        <Card key={area.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-lg">{area.areaName}</CardTitle>
                                  {hasTurtle && (
                                    <Badge variant="outline" className="text-xs">
                                      🐢 Tortuga
                                    </Badge>
                                  )}
                                </div>
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
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="interview">
                <FileText className="mr-2 h-4 w-4" />
                Entrevista
              </TabsTrigger>
              <TabsTrigger value="turtle">
                🐢 Tortuga
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
                        {(interviewData.fixedBreaksMinutes / 60).toFixed(1)} horas
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
                  <CardTitle>Registrar Actividades</CardTitle>
                  <CardDescription>
                    Registra las actividades del área
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="activityName">Nombre</Label>
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
                      <Label htmlFor="activityCause">Causa Raíz</Label>
                      <Textarea
                        id="activityCause"
                        value={newActivity.cause}
                        onChange={(e) => setNewActivity({ ...newActivity, cause: e.target.value })}
                        placeholder="Describe la causa..."
                        rows={2}
                      />
                    </div>
                  )}

                  {totals.unassignedTime < 0 && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm text-red-600 font-medium">
                        Exceso de {Math.abs(totals.unassignedTime)} minutos
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lista de Actividades */}
              {interviewData.activities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actividades ({interviewData.activities.length})</CardTitle>
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
                  <CardTitle>Observaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={interviewData.observations}
                    onChange={(e) =>
                      setInterviewData({ ...interviewData, observations: e.target.value })
                    }
                    placeholder="Notas adicionales..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Metodología Tortuga */}
            <TabsContent value="turtle" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>🐢 Metodología de la Tortuga</CardTitle>
                  <CardDescription>
                    Define el proceso completo del área. Usa la lista global para garantizar conexiones exactas entre áreas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {TURTLE_FIELDS.map((field) => {
                      const fieldKey = field.key as keyof TurtleProcess;
                      const availableItems = globalTurtleItems[fieldKey];
                      
                      return (
                        <Card key={field.key} className="border-2">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <span className="text-2xl">{field.icon}</span>
                              {field.label}
                            </CardTitle>
                            <CardDescription className="text-sm font-medium text-blue-600">
                              {field.question}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {/* Selector de items existentes */}
                            <div className="space-y-2">
                              <Label className="text-xs text-slate-600">
                                Seleccionar de la lista global {availableItems.length > 0 && `(${availableItems.length} disponibles)`}:
                              </Label>
                                <Popover open={openCombobox && currentTurtleField === fieldKey} onOpenChange={(open) => {
                                  setOpenCombobox(open);
                                  if (open) setCurrentTurtleField(fieldKey);
                                }}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className="w-full justify-between"
                                      onClick={() => setCurrentTurtleField(fieldKey)}
                                    >
                                      {selectedFromList && currentTurtleField === fieldKey
                                        ? selectedFromList
                                        : "Seleccionar item existente..."}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput placeholder="Buscar..." />
                                      <CommandList>
                                        <CommandEmpty>No se encontraron resultados</CommandEmpty>
                                        <CommandGroup>
                                          {availableItems.map((item) => (
                                            <CommandItem
                                              key={item}
                                              value={item}
                                              onSelect={(value) => {
                                                setSelectedFromList(value);
                                                addTurtleItem(fieldKey, value);
                                              }}
                                            >
                                              <Check
                                                className={`mr-2 h-4 w-4 ${
                                                  interviewData.turtleProcess?.[fieldKey]?.includes(item)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                }`}
                                              />
                                              {item}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                {availableItems.length === 0 && (
                                  <p className="text-xs text-slate-400 italic">
                                    No hay items creados aún. Crea el primero abajo.
                                  </p>
                                )}
                              </div>

                            {/* Input para crear nuevo */}
                            <div className="space-y-2">
                              <Label className="text-xs text-slate-600">
                                O crear nuevo:
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  value={currentTurtleField === fieldKey ? newTurtleItem : ""}
                                  onChange={(e) => {
                                    setCurrentTurtleField(fieldKey);
                                    setNewTurtleItem(e.target.value);
                                  }}
                                  placeholder={`Nuevo ${field.label.toLowerCase()}...`}
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      addTurtleItem(fieldKey);
                                    }
                                  }}
                                />
                                <Button
                                  onClick={() => addTurtleItem(fieldKey)}
                                  size="icon"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Lista de items agregados */}
                            <div className="space-y-2">
                              {interviewData.turtleProcess?.[fieldKey]?.map(
                                (item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-slate-50 rounded border"
                                  >
                                    <span className="text-sm flex-1">{item}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => removeTurtleItem(fieldKey, index)}
                                    >
                                      <Trash2 className="h-3 w-3 text-red-500" />
                                    </Button>
                                  </div>
                                )
                              )}
                              {(!interviewData.turtleProcess?.[fieldKey] ||
                                interviewData.turtleProcess[fieldKey].length === 0) && (
                                <p className="text-sm text-slate-400 text-center py-4">
                                  No hay items agregados
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
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
                    <CardTitle>Causas Raíz</CardTitle>
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

        {/* Vista: Comparativa */}
        {view === "compare" && savedAreas.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparativa entre Áreas</CardTitle>
                <CardDescription>
                  Análisis de {savedAreas.length} áreas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Distribución (%)</h3>
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

            <Card>
              <CardHeader>
                <CardTitle>Tabla Comparativa</CardTitle>
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
                        <th className="text-right p-3">Muerto</th>
                        <th className="text-center p-3">Tortuga</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedAreas.map((area) => {
                        const totals = calculateTotals(area);
                        const hasTurtle = area.turtleProcess && 
                          Object.values(area.turtleProcess).some(arr => arr.length > 0);
                        
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
                            <td className="p-3 text-center">
                              {hasTurtle ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
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

        {/* Vista: Mapa de Procesos */}
        {view === "process-map" && savedAreas.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Interacciones entre Áreas</CardTitle>
                <CardDescription>
                  Visualización de flujos basados en coincidencias exactas (Entradas ↔ Salidas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interactions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        ✅ Se detectaron {interactions.length} interacciones entre áreas
                      </p>
                    </div>
                    
                    {interactions.map((interaction, index) => (
                      <Card key={index} className="border-2 border-blue-200">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 text-right">
                              <p className="font-bold text-lg text-blue-600">
                                {interaction.source}
                              </p>
                              <p className="text-sm text-slate-600">Salida</p>
                            </div>
                            
                            <div className="flex flex-col items-center gap-2">
                              <ArrowRight className="h-8 w-8 text-green-600" />
                              <div className="bg-green-100 px-3 py-1 rounded-full">
                                <p className="text-xs font-medium text-green-800">
                                  {interaction.items.length} flujo(s)
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <p className="font-bold text-lg text-purple-600">
                                {interaction.target}
                              </p>
                              <p className="text-sm text-slate-600">Entrada</p>
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-slate-700">
                              Elementos transferidos:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {interaction.items.map((item, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Network className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No se detectaron interacciones
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Para que aparezcan conexiones, las <strong>SALIDAS</strong> de un área deben coincidir <strong>exactamente</strong> con las <strong>ENTRADAS</strong> de otra.
                    </p>
                    <p className="text-sm text-slate-500">
                      💡 Usa el selector de la lista global en la pestaña Tortuga para garantizar nombres idénticos.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalle de Procesos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedAreas.map((area) => {
                const hasTurtle = area.turtleProcess && 
                  Object.values(area.turtleProcess).some(arr => arr.length > 0);
                
                if (!hasTurtle) return null;
                
                const isExpanded = expandedProcesses.has(area.id!);
                
                return (
                  <Card key={area.id} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{area.areaName}</CardTitle>
                          <CardDescription>Proceso Tortuga - {area.managerName}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newExpanded = new Set(expandedProcesses);
                            if (isExpanded) {
                              newExpanded.delete(area.id!);
                            } else {
                              newExpanded.add(area.id!);
                            }
                            setExpandedProcesses(newExpanded);
                          }}
                        >
                          {isExpanded ? "Colapsar" : "Ver Detalle"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Vista Resumida */}
                      {!isExpanded && (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="font-semibold text-blue-700">📥 Entradas</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {area.turtleProcess?.inputs.length || 0}
                            </p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="font-semibold text-green-700">📤 Salidas</p>
                            <p className="text-2xl font-bold text-green-600">
                              {area.turtleProcess?.outputs.length || 0}
                            </p>
                          </div>
                          <div className="p-3 bg-orange-50 rounded-lg">
                            <p className="font-semibold text-orange-700">🔧 Recursos</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {area.turtleProcess?.resources.length || 0}
                            </p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="font-semibold text-purple-700">📋 Métodos</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {area.turtleProcess?.methods.length || 0}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Vista Expandida */}
                      {isExpanded && (
                        <div className="space-y-4">
                          {TURTLE_FIELDS.map((field) => {
                            const fieldKey = field.key as keyof TurtleProcess;
                            const items = area.turtleProcess?.[fieldKey] || [];
                            
                            if (items.length === 0) return null;
                            
                            return (
                              <div key={field.key} className="border-l-4 border-blue-500 pl-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xl">{field.icon}</span>
                                  <h4 className="font-semibold text-slate-900">{field.label}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {items.length}
                                  </Badge>
                                </div>
                                <ul className="space-y-1">
                                  {items.map((item, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                      <span className="text-blue-500 mt-1">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Vista: Matriz SIPOC */}
        {view === "sipoc" && savedAreas.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Matriz SIPOC Consolidada</CardTitle>
                <CardDescription>
                  Análisis de procesos: Proveedores - Entradas - Proceso - Salidas - Clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-900">
                          Suppliers<br/>
                          <span className="text-xs font-normal text-slate-600">Proveedores</span>
                        </th>
                        <th className="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-900">
                          Inputs<br/>
                          <span className="text-xs font-normal text-slate-600">Entradas</span>
                        </th>
                        <th className="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-900">
                          Process<br/>
                          <span className="text-xs font-normal text-slate-600">Proceso</span>
                        </th>
                        <th className="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-900">
                          Outputs<br/>
                          <span className="text-xs font-normal text-slate-600">Salidas</span>
                        </th>
                        <th className="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-900">
                          Customers<br/>
                          <span className="text-xs font-normal text-slate-600">Clientes</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedAreas.map((area) => {
                        if (!area.turtleProcess) return null;
                        
                        // Detectar proveedores (areas que tienen salidas que coinciden con mis entradas)
                        const suppliers = savedAreas
                          .filter(otherArea => 
                            otherArea.id !== area.id && 
                            otherArea.turtleProcess &&
                            otherArea.turtleProcess.outputs.some(output =>
                              area.turtleProcess!.inputs.includes(output)
                            )
                          )
                          .map(a => a.areaName);
                        
                        // Detectar clientes (areas que tienen entradas que coinciden con mis salidas)
                        const customers = savedAreas
                          .filter(otherArea => 
                            otherArea.id !== area.id && 
                            otherArea.turtleProcess &&
                            otherArea.turtleProcess.inputs.some(input =>
                              area.turtleProcess!.outputs.includes(input)
                            )
                          )
                          .map(a => a.areaName);
                        
                        return (
                          <tr key={area.id} className="hover:bg-slate-50">
                            {/* Suppliers */}
                            <td className="border border-slate-300 px-4 py-3 align-top">
                              {suppliers.length > 0 ? (
                                <ul className="space-y-1">
                                  {suppliers.map((supplier, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                      <span className="text-blue-500">\u2022</span>
                                      <span className="font-medium">{supplier}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-sm text-slate-400 italic">Sin proveedores internos</span>
                              )}
                            </td>
                            
                            {/* Inputs */}
                            <td className="border border-slate-300 px-4 py-3 align-top">
                              {area.turtleProcess.inputs.length > 0 ? (
                                <ul className="space-y-1">
                                  {area.turtleProcess.inputs.map((input, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                      <span className="text-green-500">\u25B6</span>
                                      <span>{input}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-sm text-slate-400 italic">-</span>
                              )}
                            </td>
                            
                            {/* Process */}
                            <td className="border border-slate-300 px-4 py-3 align-top bg-blue-50">
                              <div className="space-y-2">
                                <div>
                                  <h4 className="font-bold text-slate-900 text-base">{area.areaName}</h4>
                                  <p className="text-xs text-slate-600 mt-1">{area.managerName}</p>
                                </div>
                                {area.turtleProcess.methods.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-blue-200">
                                    <p className="text-xs font-semibold text-slate-700 mb-1">Métodos:</p>
                                    <ul className="space-y-1">
                                      {area.turtleProcess.methods.map((method, idx) => (
                                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                                          <span>\u2022</span>
                                          <span>{method}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </td>
                            
                            {/* Outputs */}
                            <td className="border border-slate-300 px-4 py-3 align-top">
                              {area.turtleProcess.outputs.length > 0 ? (
                                <ul className="space-y-1">
                                  {area.turtleProcess.outputs.map((output, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                      <span className="text-orange-500">\u25C0</span>
                                      <span>{output}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-sm text-slate-400 italic">-</span>
                              )}
                            </td>
                            
                            {/* Customers */}
                            <td className="border border-slate-300 px-4 py-3 align-top">
                              {customers.length > 0 ? (
                                <ul className="space-y-1">
                                  {customers.map((customer, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                      <span className="text-purple-500">\u2022</span>
                                      <span className="font-medium">{customer}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-sm text-slate-400 italic">Sin clientes internos</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Leyenda */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3">Leyenda SIPOC</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-blue-600">Suppliers:</span>
                      <p className="text-slate-600 mt-1">\u00c1reas internas que proveen entradas a este proceso</p>
                    </div>
                    <div>
                      <span className="font-semibold text-green-600">Inputs:</span>
                      <p className="text-slate-600 mt-1">Recursos, materiales o información que recibe el proceso</p>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-800">Process:</span>
                      <p className="text-slate-600 mt-1">El área y los métodos que utiliza para transformar entradas</p>
                    </div>
                    <div>
                      <span className="font-semibold text-orange-600">Outputs:</span>
                      <p className="text-slate-600 mt-1">Productos, servicios o información que genera el proceso</p>
                    </div>
                    <div>
                      <span className="font-semibold text-purple-600">Customers:</span>
                      <p className="text-slate-600 mt-1">\u00c1reas internas que reciben las salidas de este proceso</p>
                    </div>
                  </div>
                </div>
                
                {/* Botón de exportación */}
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={() => {
                      const sipocData = savedAreas.map(area => {
                        if (!area.turtleProcess) return null;
                        
                        const suppliers = savedAreas
                          .filter(otherArea => 
                            otherArea.id !== area.id && 
                            otherArea.turtleProcess &&
                            otherArea.turtleProcess.outputs.some(output =>
                              area.turtleProcess!.inputs.includes(output)
                            )
                          )
                          .map(a => a.areaName);
                        
                        const customers = savedAreas
                          .filter(otherArea => 
                            otherArea.id !== area.id && 
                            otherArea.turtleProcess &&
                            otherArea.turtleProcess.inputs.some(input =>
                              area.turtleProcess!.outputs.includes(input)
                            )
                          )
                          .map(a => a.areaName);
                        
                        return {
                          Suppliers: suppliers.join(", ") || "Sin proveedores internos",
                          Inputs: area.turtleProcess.inputs.join(", ") || "-",
                          Process: area.areaName,
                          Methods: area.turtleProcess.methods.join(", ") || "-",
                          Outputs: area.turtleProcess.outputs.join(", ") || "-",
                          Customers: customers.join(", ") || "Sin clientes internos",
                        };
                      }).filter(Boolean);
                      
                      const blob = new Blob([JSON.stringify(sipocData, null, 2)], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `matriz-sipoc-${new Date().toISOString().split("T")[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Matriz SIPOC
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
