import { useState, useEffect, useMemo, useRef } from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// // import { useAuth } from "@/hooks/useAuth"; // Comentado temporalmente // Comentado temporalmente - auth no implementado aún
import { useFirestore } from "@/hooks/useFirestore";
import { 
  saveGlobalMeasurement, 
  subscribeToGlobalMeasurements, 
  deleteGlobalMeasurement,
  type GlobalMeasurement 
} from "@/lib/firestoreService";
import { generateTurtleSuggestions, type TurtleSuggestions, type AreaAnalysis, type ComparativeAnalysis, type ProcessFlowAnalysis, type ExecutiveReport } from "@/lib/aiService";
import { trpc } from "@/lib/trpc";
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
  Pencil,
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
  ChevronsUpDown,
  Loader2
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
  frequency: number; // Veces al día que se realiza la actividad
  type: "productive" | "support" | "dead_time";
  cause?: string;
}

interface Position {
  id: string;
  name: string; // Nombre del cargo (ej: "Contador Senior", "Auxiliar Contable")
  activities: Activity[]; // Actividades asignadas a este cargo
}

interface TurtleProcess {
  inputs: string[]; // Entradas
  outputs: string[]; // Salidas
  resources: string[]; // Recursos
  methods: string[]; // Métodos
  indicators: string[]; // Indicadores
  competencies: string[]; // Competencias
}

interface InterviewData {
  id?: string;
  areaName: string;
  managerName: string;
  date: string;
  workdayMinutes: number;
  fixedBreaksMinutes: number;
  positions: Position[]; // Cargos dentro del área
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
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  // let { user, loading, error, isAuthenticated, logout } = useAuth(); // Comentado - auth opcional por ahora

  const [view, setView] = useState<"list" | "form" | "compare" | "process-map" | "sipoc" | "measurements" | "measurement-detail" | "measurement-compare">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMigrateDialog, setShowMigrateDialog] = useState(false);
  
  // Estados para vista comparativa de mediciones (SISTEMA ANTIGUO - ELIMINADO)
  // const [selectedAreaForComparison, setSelectedAreaForComparison] = useState<InterviewData | null>(null);
  // const [baseMeasurementId, setBaseMeasurementId] = useState<string | null>(null);
  // const [currentMeasurementId, setCurrentMeasurementId] = useState<string | null>(null);
  // const comparisonTableRef = useRef<HTMLDivElement>(null);
  // const comparisonChartsRef = useRef<HTMLDivElement>(null);
  
  // Estados para crear nueva medición (SISTEMA ANTIGUO - ELIMINADO)
  // const [selectedAreaForNewMeasurement, setSelectedAreaForNewMeasurement] = useState<InterviewData | null>(null);
  // const [showNewMeasurementDialog, setShowNewMeasurementDialog] = useState(false);
  // const [newMeasurementName, setNewMeasurementName] = useState("");
  
  // Estados para Mediciones Globales (NUEVO SISTEMA)
  const [showGlobalMeasurementDialog, setShowGlobalMeasurementDialog] = useState(false);
  const [globalMeasurementName, setGlobalMeasurementName] = useState("");
  const [globalMeasurements, setGlobalMeasurements] = useState<GlobalMeasurement[]>([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState<GlobalMeasurement | null>(null);
  const [measurementToCompare1, setMeasurementToCompare1] = useState<GlobalMeasurement | null>(null);
  const [measurementToCompare2, setMeasurementToCompare2] = useState<GlobalMeasurement | null>(null);
  
  // Hook de Firestore para sincronización en la nube
  const { 
    areas: savedAreas, 
    saveArea: saveAreaToFirestore, 
    deleteArea: deleteAreaFromFirestore,
    migrateData,
    cleanDocuments,
    syncStatus,
    error: firestoreError,
    isMigrated
  } = useFirestore();
  
  const [interviewData, setInterviewData] = useState<InterviewData>({
    areaName: "",
    managerName: "",
    date: new Date().toISOString().split("T")[0],
    workdayMinutes: 480,
    fixedBreaksMinutes: 60,
    positions: [], // Cargos del área
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

  // Estados para gestión de cargos
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null); // Cargo actual seleccionado
  const [newPositionName, setNewPositionName] = useState("");
  const [showPositionDialog, setShowPositionDialog] = useState(false);

  const [newActivity, setNewActivity] = useState({
    name: "",
    timeMinutes: 0,
    frequency: 1,
    type: "productive" as Activity["type"],
    cause: "",
  });

  const [editingActivity, setEditingActivity] = useState<{activityId: string, positionId: string} | null>(null);
  
  // Estado para edición de nombre de cargo
  const [editingPosition, setEditingPosition] = useState<{id: string, name: string} | null>(null);
  const [editPositionName, setEditPositionName] = useState("");

  // Función auxiliar: Obtener todas las actividades de un área (de todos los cargos)
  const getAllActivities = (area: InterviewData): Activity[] => {
    return area.positions.flatMap(position => position.activities);
  };

  // Función auxiliar: Obtener todas las actividades del área actual
  const currentActivities = useMemo(() => getAllActivities(interviewData), [interviewData]);

  // Estados para Tortuga
  const [newTurtleItem, setNewTurtleItem] = useState("");
  const [currentTurtleField, setCurrentTurtleField] = useState<keyof TurtleProcess | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedFromList, setSelectedFromList] = useState("");
  const [expandedProcesses, setExpandedProcesses] = useState<Set<string>>(new Set());
  
  // Estados para Asistente IA
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<TurtleSuggestions | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  
  // Estados para Análisis IA de Área
  const [isAnalyzingArea, setIsAnalyzingArea] = useState(false);
  const [areaAnalysis, setAreaAnalysis] = useState<any>(null);
  const [showAreaAnalysis, setShowAreaAnalysis] = useState(false);
  
  // Estados para Análisis Comparativo IA
  const [isComparingAreas, setIsComparingAreas] = useState(false);
  const [comparativeAnalysis, setComparativeAnalysis] = useState<ComparativeAnalysis | null>(null);
  const [showComparativeAnalysis, setShowComparativeAnalysis] = useState(false);
  
  // Estados para Análisis de Procesos IA
  const [isAnalyzingProcesses, setIsAnalyzingProcesses] = useState(false);
  const [processAnalysis, setProcessAnalysis] = useState<ProcessFlowAnalysis | null>(null);
  const [showProcessAnalysis, setShowProcessAnalysis] = useState(false);
  
  // Estados para Reporte Ejecutivo IA
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [executiveReport, setExecutiveReport] = useState<ExecutiveReport | null>(null);
  const [showExecutiveReport, setShowExecutiveReport] = useState(false);

  // Verificar si hay datos en localStorage para migrar
  useEffect(() => {
    const stored = localStorage.getItem("timeAnalysisInterviews");
    if (stored && !isMigrated) {
      const areas = JSON.parse(stored);
      if (areas.length > 0) {
        setShowMigrateDialog(true);
      }
    }
  }, [isMigrated]);
  
  // Suscribirse a mediciones globales en tiempo real
  useEffect(() => {
    const unsubscribe = subscribeToGlobalMeasurements(
      (measurements) => {
        setGlobalMeasurements(measurements);
      },
      (error) => {
        console.error('Error al cargar mediciones globales:', error);
      }
    );
    
    return () => unsubscribe();
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
    // Obtener todas las actividades de todos los cargos
    const allActivities = getAllActivities(data);
    
    // Calcular tiempo total = duración × frecuencia
    const totalActivities = allActivities.reduce(
      (acc, activity) => acc + (activity.timeMinutes * activity.frequency),
      0
    );

    const productiveTime = allActivities
      .filter((a) => a.type === "productive")
      .reduce((acc, a) => acc + (a.timeMinutes * a.frequency), 0);

    const supportTime = allActivities
      .filter((a) => a.type === "support")
      .reduce((acc, a) => acc + (a.timeMinutes * a.frequency), 0);

    const deadTime = allActivities
      .filter((a) => a.type === "dead_time")
      .reduce((acc, a) => acc + (a.timeMinutes * a.frequency), 0);

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
  
  // Cálculo de tiempos por cargo individual
  const calculatePositionTotals = (position: Position, workdayMinutes: number, fixedBreaksMinutes: number) => {
    const activities = position.activities;
    const count = position.count;
    
    // Calcular tiempo total por tipo (duración × frecuencia × cantidad de personas)
    const productiveTime = activities
      .filter(a => a.type === "productive")
      .reduce((acc, a) => acc + (a.timeMinutes * a.frequency * count), 0);
    
    const supportTime = activities
      .filter(a => a.type === "support")
      .reduce((acc, a) => acc + (a.timeMinutes * a.frequency * count), 0);
    
    const deadTime = activities
      .filter(a => a.type === "dead_time")
      .reduce((acc, a) => acc + (a.timeMinutes * a.frequency * count), 0);
    
    const totalActivities = productiveTime + supportTime + deadTime;
    const availableTime = (workdayMinutes - fixedBreaksMinutes) * count; // Tiempo disponible multiplicado por cantidad de personas
    const unassignedTime = availableTime - totalActivities;
    
    return {
      productiveTime,
      supportTime,
      deadTime,
      totalActivities,
      availableTime,
      unassignedTime,
      productivePercentage: availableTime > 0 ? (productiveTime / availableTime) * 100 : 0,
      supportPercentage: availableTime > 0 ? (supportTime / availableTime) * 100 : 0,
      deadTimePercentage: availableTime > 0 ? (deadTime / availableTime) * 100 : 0,
      unassignedPercentage: availableTime > 0 ? (unassignedTime / availableTime) * 100 : 0,
    };
  };

  // Funciones de Cargos
  const addPosition = () => {
    if (!newPositionName.trim()) {
      alert("Por favor ingresa el nombre del cargo");
      return;
    }

    const position: Position = {
      id: Date.now().toString(),
      name: newPositionName,
      activities: [],
    };

    setInterviewData({
      ...interviewData,
      positions: [...interviewData.positions, position],
    });

    setNewPositionName("");
    setShowPositionDialog(false);
    setCurrentPosition(position); // Seleccionar el cargo recién creado
  };

  const removePosition = (positionId: string) => {
    if (confirm("¿Estás seguro de eliminar este cargo y todas sus actividades?")) {
      setInterviewData({
        ...interviewData,
        positions: interviewData.positions.filter((p) => p.id !== positionId),
      });
      
      // Si el cargo eliminado era el actual, limpiar selección
      if (currentPosition?.id === positionId) {
        setCurrentPosition(null);
      }
    }
  };
  
  const startEditPosition = (position: Position) => {
    setEditingPosition({ id: position.id, name: position.name });
    setEditPositionName(position.name);
  };
  
  const saveEditPosition = () => {
    if (!editingPosition || !editPositionName.trim()) {
      alert("Por favor ingresa un nombre válido para el cargo");
      return;
    }
    
    setInterviewData({
      ...interviewData,
      positions: interviewData.positions.map(p => 
        p.id === editingPosition.id 
          ? { ...p, name: editPositionName.trim() }
          : p
      ),
    });
    
    // Actualizar currentPosition si es el que se está editando
    if (currentPosition?.id === editingPosition.id) {
      setCurrentPosition({ ...currentPosition, name: editPositionName.trim() });
    }
    
    setEditingPosition(null);
    setEditPositionName("");
  };
  
  const cancelEditPosition = () => {
    setEditingPosition(null);
    setEditPositionName("");
  };

  // Funciones de Actividades (ahora trabajan con el cargo actual)
  const addActivity = () => {
    if (!currentPosition) {
      alert("Por favor selecciona un cargo primero");
      return;
    }
    
    if (!newActivity.name || newActivity.timeMinutes <= 0) return;

    const activity: Activity = {
      id: Date.now().toString(),
      name: newActivity.name,
      timeMinutes: newActivity.timeMinutes,
      frequency: newActivity.frequency,
      type: newActivity.type,
      cause: newActivity.type === "dead_time" ? newActivity.cause : undefined,
    };

    // Actualizar el cargo con la nueva actividad
    setInterviewData({
      ...interviewData,
      positions: interviewData.positions.map(p => 
        p.id === currentPosition.id 
          ? { ...p, activities: [...p.activities, activity] }
          : p
      ),
    });

    // Actualizar currentPosition
    setCurrentPosition({
      ...currentPosition,
      activities: [...currentPosition.activities, activity],
    });

    setNewActivity({ name: "", timeMinutes: 0, frequency: 1, type: "productive", cause: "" });
  };

  const removeActivity = (activityId: string) => {
    if (!currentPosition) return;

    setInterviewData({
      ...interviewData,
      positions: interviewData.positions.map(p => 
        p.id === currentPosition.id 
          ? { ...p, activities: p.activities.filter((a) => a.id !== activityId) }
          : p
      ),
    });

    // Actualizar currentPosition
    setCurrentPosition({
      ...currentPosition,
      activities: currentPosition.activities.filter((a) => a.id !== activityId),
    });
  };

  const editActivity = (activityId: string, positionId: string) => {
    // Encontrar el cargo y la actividad
    const position = interviewData.positions.find(p => p.id === positionId);
    if (!position) return;

    const activity = position.activities.find(a => a.id === activityId);
    if (!activity) return;

    // Cargar la actividad en el formulario
    setNewActivity({
      name: activity.name,
      timeMinutes: activity.timeMinutes,
      frequency: activity.frequency,
      type: activity.type,
      cause: activity.cause || "",
    });

    // Establecer el cargo actual
    setCurrentPosition(position);

    // Marcar que estamos editando
    setEditingActivity({ activityId, positionId });
  };

  const updateActivity = () => {
    if (!editingActivity || !currentPosition) return;
    if (!newActivity.name || newActivity.timeMinutes <= 0) return;

    // Actualizar la actividad
    setInterviewData({
      ...interviewData,
      positions: interviewData.positions.map(p => 
        p.id === editingActivity.positionId
          ? {
              ...p,
              activities: p.activities.map(a =>
                a.id === editingActivity.activityId
                  ? {
                      ...a,
                      name: newActivity.name,
                      timeMinutes: newActivity.timeMinutes,
                      frequency: newActivity.frequency,
                      type: newActivity.type,
                      cause: newActivity.type === "dead_time" ? newActivity.cause : undefined,
                    }
                  : a
              ),
            }
          : p
      ),
    });

    // Actualizar currentPosition
    setCurrentPosition({
      ...currentPosition,
      activities: currentPosition.activities.map(a =>
        a.id === editingActivity.activityId
          ? {
              ...a,
              name: newActivity.name,
              timeMinutes: newActivity.timeMinutes,
              frequency: newActivity.frequency,
              type: newActivity.type,
              cause: newActivity.type === "dead_time" ? newActivity.cause : undefined,
            }
          : a
      ),
    });

    // Limpiar el formulario y salir del modo edición
    setNewActivity({ name: "", timeMinutes: 0, frequency: 1, type: "productive", cause: "" });
    setEditingActivity(null);
  };

  const cancelEdit = () => {
    setNewActivity({ name: "", timeMinutes: 0, frequency: 1, type: "productive", cause: "" });
    setEditingActivity(null);
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
  
  // Mutation de tRPC para generar sugerencias con IA
  const generateAIMutation = trpc.ai.generateTurtleSuggestions.useMutation({
    onSuccess: (data: any) => {
      if (data.success && data.suggestions) {
        setAiSuggestions(data.suggestions);
        setShowAISuggestions(true);
      }
    },
    onError: (error: any) => {
      console.error('Error al generar sugerencias:', error);
      alert('No se pudieron generar sugerencias. Por favor, intenta de nuevo.');
    },
  });
  
  // Función para generar sugerencias con IA
  const handleGenerateAISuggestions = () => {
    if (!interviewData.areaName) {
      alert("¡Primero ingresa el nombre del área!");
      return;
    }
    
    generateAIMutation.mutate({
      areaName: interviewData.areaName,
      processDescription: interviewData.observations,
    });
  };
  
  // Función para aplicar sugerencias de IA
  const applyAISuggestions = () => {
    if (!aiSuggestions) return;
    
    setInterviewData({
      ...interviewData,
      turtleProcess: {
        inputs: aiSuggestions.entradas,
        outputs: aiSuggestions.salidas,
        resources: aiSuggestions.recursos,
        methods: aiSuggestions.metodos,
        indicators: aiSuggestions.indicadores,
        competencies: aiSuggestions.competencias,
      },
    });
    
    setShowAISuggestions(false);
    alert('¡Sugerencias aplicadas! Puedes editarlas según necesites.');
  };
  
  // Mutation para analizar área con IA
  const analyzeAreaMutation = trpc.ai.analyzeArea.useMutation({
    onSuccess: (data: any) => {
      if (data.success && data.analysis) {
        setAreaAnalysis(data.analysis);
        setShowAreaAnalysis(true);
      }
      setIsAnalyzingArea(false);
    },
    onError: (error: any) => {
      console.error('Error al analizar área:', error);
      alert('No se pudo generar el análisis. Por favor, intenta de nuevo.');
      setIsAnalyzingArea(false);
    },
  });
  
  // Función para analizar área con IA
  const handleAnalyzeArea = (area: InterviewData) => {
    setIsAnalyzingArea(true);
    const totals = calculateTotals(area);
    analyzeAreaMutation.mutate({
      areaName: area.areaName,
      managerName: area.managerName,
      productivePercentage: totals.productivePercentage,
      supportPercentage: totals.supportPercentage,
      deadTimePercentage: totals.deadTimePercentage,
      productiveTime: totals.productiveTime,
      supportTime: totals.supportTime,
      deadTime: totals.deadTime,
      workdayMinutes: area.workdayMinutes,
      positions: area.positions,
      observations: area.observations,
    });
  };
  
  // Mutation para comparar áreas con IA
  const compareAreasMutation = trpc.ai.compareAreas.useMutation({
    onSuccess: (data: any) => {
      if (data.success && data.analysis) {
        setComparativeAnalysis(data.analysis);
        setShowComparativeAnalysis(true);
      }
      setIsComparingAreas(false);
    },
    onError: (error: any) => {
      console.error('Error al comparar áreas:', error);
      alert('No se pudo generar el análisis comparativo. Por favor, intenta de nuevo.');
      setIsComparingAreas(false);
    },
  });
  
  // Función para comparar todas las áreas con IA
  const handleCompareAreas = () => {
    if (savedAreas.length < 2) {
      alert('Necesitas al menos 2 áreas para realizar un análisis comparativo.');
      return;
    }
    
    setIsComparingAreas(true);
    const areasData = savedAreas.map((area) => {
      const totals = calculateTotals(area);
      return {
        areaName: area.areaName,
        managerName: area.managerName,
        productivePercentage: totals.productivePercentage,
        supportPercentage: totals.supportPercentage,
        deadTimePercentage: totals.deadTimePercentage,
        totalActivities: getAllActivities(area).length,
      };
    });
    
    compareAreasMutation.mutate({ areas: areasData });
  };
  
  // Mutation para analizar flujo de procesos con IA
  const analyzeProcessesMutation = trpc.ai.analyzeProcessFlow.useMutation({
    onSuccess: (data: any) => {
      if (data.success && data.analysis) {
        setProcessAnalysis(data.analysis);
        setShowProcessAnalysis(true);
      }
      setIsAnalyzingProcesses(false);
    },
    onError: (error: any) => {
      console.error('Error al analizar procesos:', error);
      alert('No se pudo generar el análisis de procesos. Por favor, intenta de nuevo.');
      setIsAnalyzingProcesses(false);
    },
  });
  
  // Función para analizar flujo de procesos con IA
  const handleAnalyzeProcesses = () => {
    if (savedAreas.length < 2) {
      alert('Necesitas al menos 2 áreas con procesos Tortuga para analizar el flujo.');
      return;
    }
    
    setIsAnalyzingProcesses(true);
    const interactions = detectInteractions();
    
    const sipocData = savedAreas.map((area) => {
      const suppliers = savedAreas
        .filter(otherArea => 
          otherArea.id !== area.id && 
          otherArea.turtleProcess &&
          otherArea.turtleProcess.outputs.some(output =>
            area.turtleProcess?.inputs.includes(output)
          )
        )
        .map(a => a.areaName);
      
      const customers = savedAreas
        .filter(otherArea => 
          otherArea.id !== area.id && 
          otherArea.turtleProcess &&
          otherArea.turtleProcess.inputs.some(input =>
            area.turtleProcess?.outputs.includes(input)
          )
        )
        .map(a => a.areaName);
      
      return {
        areaName: area.areaName,
        suppliers,
        inputs: area.turtleProcess?.inputs || [],
        outputs: area.turtleProcess?.outputs || [],
        customers,
      };
    });
    
    analyzeProcessesMutation.mutate({
      totalAreas: savedAreas.length,
      interactions,
      sipocData,
    });
  };
  
  // Mutation para generar reporte ejecutivo con IA
  const generateReportMutation = trpc.ai.generateExecutiveReport.useMutation({
    onSuccess: (data: any) => {
      if (data.success && data.report) {
        setExecutiveReport(data.report);
        setShowExecutiveReport(true);
      }
      setIsGeneratingReport(false);
    },
    onError: (error: any) => {
      console.error('Error al generar reporte ejecutivo:', error);
      alert('No se pudo generar el reporte ejecutivo. Por favor, intenta de nuevo.');
      setIsGeneratingReport(false);
    },
  });
  
  // Función para generar reporte ejecutivo con IA
  const handleGenerateExecutiveReport = () => {
    if (savedAreas.length === 0) {
      alert('Necesitas al menos un área para generar el reporte ejecutivo.');
      return;
    }
    
    setIsGeneratingReport(true);
    const areasData = savedAreas.map((area) => {
      const totals = calculateTotals(area);
      return {
        areaName: area.areaName,
        productivePercentage: totals.productivePercentage,
        deadTimePercentage: totals.deadTimePercentage,
      };
    });
    
    const averageProductivity = areasData.reduce((sum, a) => sum + a.productivePercentage, 0) / areasData.length;
    const averageDeadTime = areasData.reduce((sum, a) => sum + a.deadTimePercentage, 0) / areasData.length;
    const interactions = detectInteractions();
    
    generateReportMutation.mutate({
      totalAreas: savedAreas.length,
      areasData,
      totalInteractions: interactions.length,
      averageProductivity,
      averageDeadTime,
    });
  };

  // Funciones de Área
  const saveArea = async () => {
    if (!interviewData.areaName) {
      alert("Por favor ingresa el nombre del área");
      return;
    }

    try {
      const newArea: InterviewData = {
        ...interviewData,
        id: editingId || undefined,
        savedAt: new Date().toISOString(),
      };

      await saveAreaToFirestore(newArea);
      alert("Área guardada exitosamente en la nube ☁️");
      
    setInterviewData({
      areaName: "",
      managerName: "",
      date: new Date().toISOString().split("T")[0],
      workdayMinutes: 480,
      fixedBreaksMinutes: 60,
      positions: [],
      observations: "",
      turtleProcess: {
        inputs: [], outputs: [], resources: [], methods: [], indicators: [], competencies: []
      },
    });
    setCurrentPosition(null);
      setEditingId(null);
      setView("list");
    } catch (error) {
      alert("Error al guardar el área: " + (error instanceof Error ? error.message : "Error desconocido"));
    }
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

  const deleteArea = async (id: string | undefined) => {
    if (!id) {
      alert("Error: No se puede eliminar un área sin ID");
      return;
    }
    
    if (confirm("¿Estás seguro de eliminar esta área?")) {
      try {
        await deleteAreaFromFirestore(id);
        alert("Área eliminada exitosamente");
      } catch (error) {
        console.error("Error deleting area:", error);
        alert("Error al eliminar el área: " + (error instanceof Error ? error.message : "Error desconocido"));
      }
    }
  };

  const newArea = () => {
    setInterviewData({
      areaName: "",
      managerName: "",
      date: new Date().toISOString().split("T")[0],
      workdayMinutes: 480,
      fixedBreaksMinutes: 60,
      positions: [],
      observations: "",
      turtleProcess: {
        inputs: [], outputs: [], resources: [], methods: [], indicators: [], competencies: []
      },
    });
    setCurrentPosition(null);
    setEditingId(null);
    setView("form");
  };

  // Funciones para copiar como imagen
  const copyElementAsImage = async (element: HTMLElement, filename: string) => {
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('¡Imagen copiada al portapapeles! Puedes pegarla en tu informe.');
        } catch (err) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
          link.click();
          URL.revokeObjectURL(url);
          alert('La imagen se ha descargado. Puedes insertarla en tu informe.');
        }
      });
    } catch (error) {
      console.error('Error al generar imagen:', error);
      alert('Error al generar la imagen');
    }
  };
  
  const copyTableAsImage = async () => {
    if (!comparisonTableRef.current) return;
    await copyElementAsImage(comparisonTableRef.current, 'tabla-comparativa');
  };
  
  const copyChartsAsImage = async () => {
    if (!comparisonChartsRef.current) return;
    await copyElementAsImage(comparisonChartsRef.current, 'graficos-comparativos');
  };
  
  // Función para crear nueva medición (SISTEMA ANTIGUO - ELIMINADO)
  // const createNewMeasurement = async () => {
  //   if (!selectedAreaForNewMeasurement || !newMeasurementName.trim()) {
  //     alert('Por favor ingresa un nombre para la medición');
  //     return;
  //   }
  //   
  //   try {
  //     const newMeasurement = {
  //       id: `measurement-${Date.now()}`,
  //       name: newMeasurementName.trim(),
  //       date: new Date().toISOString(),
  //       positions: JSON.parse(JSON.stringify(selectedAreaForNewMeasurement.positions)), // Deep copy
  //     };
  //     
  //     const updatedArea = {
  //       ...selectedAreaForNewMeasurement,
  //       measurements: [...(selectedAreaForNewMeasurement.measurements || []), newMeasurement],
  //     };
  //     
  //     await saveAreaToFirestore(updatedArea);
  //     
  //     setShowNewMeasurementDialog(false);
  //     setNewMeasurementName("");
  //     setSelectedAreaForNewMeasurement(null);
  //     
  //     alert(`¡Medición "${newMeasurement.name}" creada exitosamente!`);
  //   } catch (error) {
  //     console.error('Error al crear medición:', error);
  //     alert('Error al crear la medición. Por favor intenta de nuevo.');
  //   }
  // };

  // Función para crear medición global (snapshot de todas las áreas)
  const createGlobalMeasurement = async () => {
    if (!globalMeasurementName.trim()) {
      alert('Por favor ingresa un nombre para la medición global');
      return;
    }
    
    if (savedAreas.length === 0) {
      alert('No hay áreas registradas para crear una medición');
      return;
    }
    
    try {
      // Crear snapshot de todas las áreas actuales
      const areasSnapshot: InterviewData[] = JSON.parse(JSON.stringify(savedAreas));
      
      const newGlobalMeasurement: GlobalMeasurement = {
        name: globalMeasurementName.trim(),
        date: new Date().toISOString(),
        areas: areasSnapshot,
        createdAt: new Date().toISOString(),
      };
      
      await saveGlobalMeasurement(newGlobalMeasurement);
      
      setShowGlobalMeasurementDialog(false);
      setGlobalMeasurementName("");
      
      alert(`¡Medición Global "${newGlobalMeasurement.name}" creada exitosamente!\n\nÁreas capturadas: ${areasSnapshot.length}`);
    } catch (error) {
      console.error('Error al crear medición global:', error);
      alert('Error al crear la medición global. Por favor intenta de nuevo.');
    }
  };

  const exportArea = (area: InterviewData) => {
    const totals = calculateTotals(area);
    const pdf = new jsPDF();
    
    // Título
    pdf.setFontSize(18);
    pdf.text(`Análisis: ${area.areaName}`, 20, 20);
    
    // Información general
    pdf.setFontSize(12);
    pdf.text(`Responsable: ${area.managerName}`, 20, 35);
    pdf.text(`Fecha: ${area.date}`, 20, 42);
    
    // Resultados
    pdf.setFontSize(14);
    pdf.text('Resultados del Análisis', 20, 55);
    pdf.setFontSize(11);
    pdf.text(`Tiempo Productivo: ${totals.productivePercentage.toFixed(1)}%`, 25, 65);
    pdf.text(`Tiempo de Soporte: ${totals.supportPercentage.toFixed(1)}%`, 25, 72);
    pdf.text(`Tiempo Muerto: ${totals.deadTimePercentage.toFixed(1)}%`, 25, 79);
    
    // Actividades por tipo
    let yPos = 95;
    pdf.setFontSize(14);
    pdf.text('Actividades Registradas', 20, yPos);
    yPos += 10;
    
    area.positions.forEach((position) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.setFontSize(12);
      pdf.text(`Cargo: ${position.name}`, 25, yPos);
      yPos += 7;
      
      position.activities.forEach((activity) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFontSize(10);
        const typeLabel = activity.type === 'productive' ? 'Productiva' : 
                         activity.type === 'support' ? 'Soporte' : 'Tiempo Muerto';
        pdf.text(`- ${activity.name} (${typeLabel}): ${activity.timeMinutes} min`, 30, yPos);
        yPos += 6;
      });
      yPos += 3;
    });
    
    // Guardar PDF
    pdf.save(`analisis-${area.areaName}-${area.date}.pdf`);
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

  // Exportar historial completo en PDF
  const exportAllAreasPDF = () => {
    const pdf = new jsPDF();
    let yPos = 20;
    
    // PORTADA
    pdf.setFontSize(22);
    pdf.setFont(undefined, 'bold');
    pdf.text('Historial Completo', 105, yPos, { align: 'center' });
    yPos += 10;
    pdf.setFontSize(18);
    pdf.text('Análisis de Tiempos Muertos', 105, yPos, { align: 'center' });
    yPos += 15;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Fecha del reporte: ${new Date().toLocaleDateString('es-CO')}`, 105, yPos, { align: 'center' });
    yPos += 8;
    pdf.text(`Total de áreas analizadas: ${savedAreas.length}`, 105, yPos, { align: 'center' });
    
    // TABLA RESUMEN
    pdf.addPage();
    yPos = 20;
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Resumen Ejecutivo', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('Área', 20, yPos);
    pdf.text('Responsable', 70, yPos);
    pdf.text('Productivo', 120, yPos);
    pdf.text('Soporte', 145, yPos);
    pdf.text('Muerto', 170, yPos);
    yPos += 7;
    
    pdf.setFont(undefined, 'normal');
    savedAreas.forEach((area) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      const totals = calculateTotals(area);
      pdf.text(area.areaName.substring(0, 25), 20, yPos);
      pdf.text(area.managerName.substring(0, 25), 70, yPos);
      pdf.text(`${totals.productivePercentage.toFixed(1)}%`, 120, yPos);
      pdf.text(`${totals.supportPercentage.toFixed(1)}%`, 145, yPos);
      pdf.text(`${totals.deadTimePercentage.toFixed(1)}%`, 170, yPos);
      yPos += 6;
    });
    
    // DETALLE POR ÁREA
    savedAreas.forEach((area) => {
      pdf.addPage();
      yPos = 20;
      const totals = calculateTotals(area);
      
      // Título del área
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Área: ${area.areaName}`, 20, yPos);
      yPos += 10;
      
      // Información general
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Responsable: ${area.managerName}`, 20, yPos);
      yPos += 6;
      pdf.text(`Fecha de análisis: ${area.date}`, 20, yPos);
      yPos += 6;
      pdf.text(`Jornada laboral: ${area.workdayMinutes} min (${(area.workdayMinutes/60).toFixed(1)} hrs)`, 20, yPos);
      yPos += 6;
      pdf.text(`Pausas fijas: ${area.fixedBreaksMinutes} min`, 20, yPos);
      yPos += 10;
      
      // Resultados
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Resultados del Análisis', 20, yPos);
      yPos += 8;
      
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(34, 197, 94); // Verde
      pdf.text(`Tiempo Productivo: ${totals.productivePercentage.toFixed(1)}% (${totals.productiveTime} min)`, 25, yPos);
      yPos += 6;
      pdf.setTextColor(59, 130, 246); // Azul
      pdf.text(`Tiempo de Soporte: ${totals.supportPercentage.toFixed(1)}% (${totals.supportTime} min)`, 25, yPos);
      yPos += 6;
      pdf.setTextColor(239, 68, 68); // Rojo
      pdf.text(`Tiempo Muerto: ${totals.deadTimePercentage.toFixed(1)}% (${totals.deadTime} min)`, 25, yPos);
      yPos += 10;
      pdf.setTextColor(0, 0, 0); // Negro
      
      // Cargos y actividades
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Cargos y Actividades', 20, yPos);
      yPos += 8;
      
      area.positions.forEach((position) => {
        if (yPos > 260) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text(`Cargo: ${position.name} (${position.peopleCount} persona${position.peopleCount > 1 ? 's' : ''})`, 25, yPos);
        yPos += 7;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        position.activities.forEach((activity) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          const typeLabel = activity.type === 'productive' ? 'Productiva' : 
                           activity.type === 'support' ? 'Soporte' : 'Tiempo Muerto';
          pdf.text(`- ${activity.name} (${typeLabel})`, 30, yPos);
          yPos += 5;
          pdf.text(`  ${activity.timeMinutes} min × ${activity.frequency} veces = ${activity.timeMinutes * activity.frequency} min/día`, 32, yPos);
          yPos += 6;
        });
        yPos += 3;
      });
      
      // Observaciones
      if (area.observations) {
        if (yPos > 240) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Observaciones:', 20, yPos);
        yPos += 7;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const lines = pdf.splitTextToSize(area.observations, 170);
        lines.forEach((line: string) => {
          if (yPos > 280) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(line, 25, yPos);
          yPos += 5;
        });
      }
    });
    
    // MAPA DE PROCESOS
    const interactions = detectInteractions();
    if (interactions.length > 0) {
      pdf.addPage();
      yPos = 20;
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Mapa de Interacciones entre Áreas', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      interactions.forEach((interaction) => {
        if (yPos > 260) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFont(undefined, 'bold');
        pdf.text(`${interaction.source} → ${interaction.target}`, 25, yPos);
        yPos += 6;
        pdf.setFont(undefined, 'normal');
        pdf.text(`Elementos transferidos: ${interaction.items.join(', ')}`, 30, yPos);
        yPos += 8;
      });
    }
    
    // MATRIZ SIPOC
    pdf.addPage();
    yPos = 20;
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Matriz SIPOC Consolidada', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(9);
    savedAreas.forEach((area) => {
      if (!area.turtleProcess) return;
      
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Detectar proveedores y clientes
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
      
      pdf.setFont(undefined, 'bold');
      pdf.text(`Proceso: ${area.areaName}`, 20, yPos);
      yPos += 6;
      pdf.setFont(undefined, 'normal');
      pdf.text(`Proveedores: ${suppliers.length > 0 ? suppliers.join(', ') : 'N/A'}`, 25, yPos);
      yPos += 5;
      pdf.text(`Entradas: ${area.turtleProcess.inputs.join(', ') || 'N/A'}`, 25, yPos);
      yPos += 5;
      pdf.text(`Salidas: ${area.turtleProcess.outputs.join(', ') || 'N/A'}`, 25, yPos);
      yPos += 5;
      pdf.text(`Clientes: ${customers.length > 0 ? customers.join(', ') : 'N/A'}`, 25, yPos);
      yPos += 8;
    });
    
    // Guardar PDF
    pdf.save(`historial-completo-${new Date().toISOString().split('T')[0]}.pdf`);
    alert('✅ Historial completo exportado exitosamente');
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

  const barChartData = currentActivities.map((activity) => ({
    name: activity.name.length > 20 ? activity.name.substring(0, 20) + "..." : activity.name,
    minutos: activity.timeMinutes * activity.frequency,
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
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Clock className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                  Análisis de Tiempos Muertos
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs md:text-sm text-slate-600 hidden sm:block">
                    Metodología Tortuga
                  </p>
                  {syncStatus === 'syncing' && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      🔄 Sincronizando
                    </Badge>
                  )}
                  {syncStatus === 'synced' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      ☁️ Sincronizado
                    </Badge>
                  )}
                  {syncStatus === 'error' && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      ⚠️ Error
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {/* Botones de Acción */}
            <div className="flex flex-wrap items-center gap-3">
              {view === "list" && (
                <>
                  {/* Acción Primaria */}
                  <Button onClick={newArea} size="lg" className="shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Nueva Área</span>
                    <span className="sm:hidden">Área</span>
                  </Button>
                  
                  {savedAreas.length === 0 && (
                    <Button 
                      onClick={async () => {
                        // Cargar datos de ejemplo
                        const ejemplos: InterviewData[] = [
                          {
                            areaName: "Compras",
                            managerName: "María García",
                            date: new Date().toISOString().split('T')[0],
                            workdayMinutes: 540,
                            fixedBreaksMinutes: 60,
                            positions: [],
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
                            areaName: "Producción",
                            managerName: "Carlos Rodríguez",
                            date: new Date().toISOString().split('T')[0],
                            workdayMinutes: 540,
                            fixedBreaksMinutes: 60,
                            positions: [],
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
                            areaName: "Logística",
                            managerName: "Ana Martínez",
                            date: new Date().toISOString().split('T')[0],
                            workdayMinutes: 600,
                            fixedBreaksMinutes: 60,
                            positions: [],
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
                        
                        try {
                          for (const ejemplo of ejemplos) {
                            await saveAreaToFirestore(ejemplo);
                          }
                          alert("✅ Se cargaron 3 áreas de ejemplo en la nube");
                        } catch (error) {
                          alert("Error al cargar ejemplos: " + (error instanceof Error ? error.message : "Error desconocido"));
                        }
                      }}
                      variant="outline" 
                      size="lg"
                    >
                      🎯 Cargar Ejemplo
                    </Button>
                  )}
                  {savedAreas.length > 0 && (
                    <>
                      {/* Separador Visual */}
                      <div className="hidden md:block h-8 w-px bg-slate-300"></div>
                      
                      {/* Grupo: Herramientas */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          onClick={() => setShowGlobalMeasurementDialog(true)} 
                          variant="outline" 
                          size="lg"
                          className="shadow-sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          <span className="hidden md:inline">Crear Medición</span>
                          <span className="md:hidden">📸</span>
                        </Button>
                        <Button 
                          onClick={exportAllAreasPDF} 
                          variant="outline" 
                          size="lg"
                          className="shadow-sm"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          <span className="hidden md:inline">Exportar PDF</span>
                          <span className="md:hidden">📄</span>
                        </Button>
                      </div>
                      
                      {/* Separador Visual */}
                      <div className="hidden lg:block h-8 w-px bg-slate-300"></div>
                      
                      {/* Grupo: Análisis IA */}
                      <div className="flex flex-wrap gap-2">
                        {savedAreas.length >= 2 && (
                          <Button 
                            onClick={handleCompareAreas} 
                            variant="default" 
                            size="lg" 
                            className="shadow-md bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                            disabled={isComparingAreas}
                          >
                            {isComparingAreas ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span className="hidden md:inline">Analizando...</span>
                                <span className="md:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <span className="hidden md:inline">🤖 Comparar Áreas</span>
                                <span className="md:hidden">🤖</span>
                              </>
                            )}
                          </Button>
                        )}
                        <Button 
                          onClick={handleGenerateExecutiveReport} 
                          variant="default" 
                          size="lg" 
                          className="shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          disabled={isGeneratingReport}
                        >
                          {isGeneratingReport ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span className="hidden md:inline">Generando...</span>
                              <span className="md:hidden">...</span>
                            </>
                          ) : (
                            <>
                              <span className="hidden md:inline">🤖 Informe Ejecutivo</span>
                              <span className="md:hidden">📊</span>
                            </>
                          )}
                        </Button>
                      </div>
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
              {(view === "compare" || view === "process-map" || view === "sipoc" || view === "measurements" || view === "measurement-detail" || view === "measurement-compare") && (
                <Button onClick={() => setView("list")} variant="outline" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sistema de Pestañas */}
      {view === "list" && savedAreas.length > 0 && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setView("list")}
                className="px-4 py-3 text-sm font-medium border-b-2 border-blue-600 text-blue-600 whitespace-nowrap"
              >
                🏢 Áreas
              </button>
              <button
                onClick={() => setView("measurements")}
                className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 whitespace-nowrap"
              >
                📊 Mediciones ({globalMeasurements.length})
              </button>
              <button
                onClick={() => setView("process-map")}
                className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 whitespace-nowrap"
              >
                🗺️ Mapa de Procesos
              </button>
              <button
                onClick={() => setView("sipoc")}
                className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 whitespace-nowrap"
              >
                📋 Matriz SIPOC
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6 md:py-8">
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
                              <strong>{getAllActivities(area).length}</strong> actividades registradas
                            </div>                            {/* Botones de Acción */}
                            <div className="space-y-2 mt-4">
                              {/* Grupo: Acciones Principales */}
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  onClick={() => editArea(area)}
                                  variant="default"
                                  size="sm"
                                  className="w-full"
                                >
                                  <Edit className="mr-1.5 h-3.5 w-3.5" />
                                  <span>Ver/Editar</span>
                                </Button>
                                <Button
                                  onClick={() => exportArea(area)}
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  <Download className="mr-1.5 h-3.5 w-3.5" />
                                  <span>Exportar</span>
                                </Button>
                              </div>
                              
                              {/* Análisis IA */}
                              <Button
                                onClick={() => handleAnalyzeArea(area)}
                                variant="default"
                                size="sm"
                                className="w-full shadow-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                disabled={isAnalyzingArea}
                              >
                                {isAnalyzingArea ? (
                                  <>
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    Analizando...
                                  </>
                                ) : (
                                  <>
                                    🤖 Análisis IA
                                  </>
                                )}
                              </Button>
                              
                              {/* Botón Eliminar */}
                              <Button
                                onClick={() => deleteArea(area.id)}
                                variant="ghost"
                                size="sm"
                                disabled={!area.id}
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Eliminar área
                              </Button>
                            </div>                       </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vista: Comparativa de Mediciones (ELIMINADA - Ahora se usa el sistema de Mediciones Globales) */}
        {false && selectedAreaForComparison && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mediciones del Área: {selectedAreaForComparison.areaName}</CardTitle>
                  <CardDescription>
                    Compara diferentes períodos de medición para identificar mejoras y oportunidades
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setSelectedAreaForComparison(null);
                    setBaseMeasurementId(null);
                    setCurrentMeasurementId(null);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selectores de Mediciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Medición Base</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={baseMeasurementId || "current"}
                    onChange={(e) => setBaseMeasurementId(e.target.value === "current" ? null : e.target.value)}
                  >
                    <option value="current">Estado Actual</option>
                    {selectedAreaForComparison.measurements?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} - {new Date(m.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Medición a Comparar</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={currentMeasurementId || "current"}
                    onChange={(e) => setCurrentMeasurementId(e.target.value === "current" ? null : e.target.value)}
                  >
                    <option value="current">Estado Actual</option>
                    {selectedAreaForComparison.measurements?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} - {new Date(m.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contenido de la comparación */}
              {(() => {
                const isValidComparison = baseMeasurementId !== currentMeasurementId && 
                  (baseMeasurementId || currentMeasurementId);
                
                if (!isValidComparison) {
                  return (
                    <div className="text-center py-12 text-slate-500">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                      <p className="font-medium">Selecciona dos mediciones diferentes para comparar</p>
                      <p className="text-sm mt-2">Elige una medición base y otra para comparar en los selectores de arriba</p>
                    </div>
                  );
                }

                // Obtener las mediciones a comparar
                const baseMeas = baseMeasurementId === null 
                  ? selectedAreaForComparison 
                  : selectedAreaForComparison.measurements?.find(m => m.id === baseMeasurementId);
                  
                const currentMeas = currentMeasurementId === null
                  ? selectedAreaForComparison
                  : selectedAreaForComparison.measurements?.find(m => m.id === currentMeasurementId);
                
                if (!baseMeas || !currentMeas) {
                  return <div className="text-center py-12 text-red-500">Error: No se encontraron las mediciones seleccionadas</div>;
                }
                
                // Calcular comparaciones
                const comparisons: Array<{
                  positionName: string;
                  activityName: string;
                  baseTime: number;
                  currentTime: number;
                  delta: number;
                  percentChange: number;
                }> = [];
                
                baseMeas.positions.forEach((basePos) => {
                  const currentPos = currentMeas.positions.find(p => p.id === basePos.id);
                  if (!currentPos) return;
                  
                  basePos.activities.forEach((baseActivity) => {
                    const currentActivity = currentPos.activities.find(a => a.id === baseActivity.id);
                    if (!currentActivity) return;
                    
                    const baseTime = baseActivity.timeMinutes * baseActivity.frequency;
                    const currentTime = currentActivity.timeMinutes * currentActivity.frequency;
                    const delta = currentTime - baseTime;
                    const percentChange = baseTime > 0 ? ((delta / baseTime) * 100) : 0;
                    
                    comparisons.push({
                      positionName: basePos.name,
                      activityName: baseActivity.name,
                      baseTime,
                      currentTime,
                      delta,
                      percentChange,
                    });
                  });
                });
                
                return (
                  <>
                    <Separator />
                    {/* Tabla Comparativa */}
                    <div ref={comparisonTableRef} className="p-6 bg-white rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Comparativa por Actividad</h3>
                        <Button
                          onClick={copyTableAsImage}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Copiar como Imagen
                        </Button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-100">
                              <th className="border border-slate-300 px-4 py-3 text-left">Cargo</th>
                              <th className="border border-slate-300 px-4 py-3 text-left">Actividad</th>
                              <th className="border border-slate-300 px-4 py-3 text-right">Base (min)</th>
                              <th className="border border-slate-300 px-4 py-3 text-right">Actual (min)</th>
                              <th className="border border-slate-300 px-4 py-3 text-right">Δ</th>
                              <th className="border border-slate-300 px-4 py-3 text-right">% Cambio</th>
                              <th className="border border-slate-300 px-4 py-3 text-center">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparisons.map((comp, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="border border-slate-300 px-4 py-3">{comp.positionName}</td>
                                <td className="border border-slate-300 px-4 py-3">{comp.activityName}</td>
                                <td className="border border-slate-300 px-4 py-3 text-right">{comp.baseTime}</td>
                                <td className="border border-slate-300 px-4 py-3 text-right">{comp.currentTime}</td>
                                <td className={`border border-slate-300 px-4 py-3 text-right font-semibold ${
                                  comp.delta < 0 ? 'text-green-600' : comp.delta > 0 ? 'text-red-600' : 'text-slate-600'
                                }`}>
                                  {comp.delta > 0 ? '+' : ''}{comp.delta}
                                </td>
                                <td className={`border border-slate-300 px-4 py-3 text-right font-semibold ${
                                  comp.percentChange < 0 ? 'text-green-600' : comp.percentChange > 0 ? 'text-red-600' : 'text-slate-600'
                                }`}>
                                  {comp.percentChange > 0 ? '+' : ''}{comp.percentChange.toFixed(1)}%
                                </td>
                                <td className="border border-slate-300 px-4 py-3 text-center">
                                  {comp.delta < -5 ? '✅' : comp.delta > 5 ? '❌' : '⚠️'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <Separator />
                    {/* Gráficos de Barras Horizontales */}
                    <div ref={comparisonChartsRef} className="p-6 bg-white rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Evolución Visual por Actividad</h3>
                        <Button
                          onClick={copyChartsAsImage}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Copiar Gráficos como Imagen
                        </Button>
                      </div>
                      <div className="space-y-6">
                        {comparisons.map((comp, idx) => {
                          const maxTime = Math.max(comp.baseTime, comp.currentTime);
                          const baseWidth = maxTime > 0 ? (comp.baseTime / maxTime) * 100 : 0;
                          const currentWidth = maxTime > 0 ? (comp.currentTime / maxTime) * 100 : 0;
                          
                          return (
                            <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                              <div className="mb-3">
                                <h4 className="font-semibold text-sm">{comp.activityName}</h4>
                                <p className="text-xs text-slate-600">{comp.positionName}</p>
                              </div>
                              
                              {/* Barra Base */}
                              <div className="mb-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-slate-600">Base</span>
                                  <span className="text-xs font-semibold">{comp.baseTime} min</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-6">
                                  <div 
                                    className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                                    style={{ width: `${baseWidth}%`, minWidth: comp.baseTime > 0 ? '2rem' : '0' }}
                                  >
                                    {comp.baseTime > 0 && (
                                      <span className="text-xs text-white font-medium">{comp.baseTime}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Barra Actual */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-slate-600">Actual</span>
                                  <span className="text-xs font-semibold">{comp.currentTime} min</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-6">
                                  <div 
                                    className={`h-6 rounded-full flex items-center justify-end pr-2 ${
                                      comp.delta < 0 ? 'bg-green-500' : comp.delta > 0 ? 'bg-red-500' : 'bg-slate-500'
                                    }`}
                                    style={{ width: `${currentWidth}%`, minWidth: comp.currentTime > 0 ? '2rem' : '0' }}
                                  >
                                    {comp.currentTime > 0 && (
                                      <span className="text-xs text-white font-medium">{comp.currentTime}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Indicador de cambio */}
                              <div className="mt-2 text-center">
                                <span className={`text-xs font-semibold ${
                                  comp.delta < 0 ? 'text-green-600' : comp.delta > 0 ? 'text-red-600' : 'text-slate-600'
                                }`}>
                                  {comp.delta < 0 ? '✅ Mejoró ' : comp.delta > 0 ? '❌ Empeoró ' : '⚠️ Sin cambio '}
                                  ({comp.delta > 0 ? '+' : ''}{comp.delta} min)
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
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

              {/* Gestión de Cargos */}
              <Card>
                <CardHeader>
                  <CardTitle>Cargos del Área</CardTitle>
                  <CardDescription>
                    Gestiona los cargos y sus actividades
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lista de cargos */}
                  {interviewData.positions.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selecciona un cargo para agregar actividades:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {interviewData.positions.map((position) => (
                          <div
                            key={position.id}
                            className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                              currentPosition?.id === position.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                            }`}
                            onClick={() => setCurrentPosition(position)}
                          >
                            <div>
                              <p className="font-semibold">{position.name}</p>
                              <p className="text-sm text-slate-600">
                                {position.activities.length} actividad{position.activities.length !== 1 ? "es" : ""}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditPosition(position);
                                }}
                                title="Editar nombre del cargo"
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePosition(position.id);
                                }}
                                title="Eliminar cargo"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botón para agregar cargo */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nombre del cargo (ej: Contador Senior)"
                      value={newPositionName}
                      onChange={(e) => setNewPositionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addPosition();
                        }
                      }}
                    />
                    <Button onClick={addPosition} size="lg" className="shadow-sm whitespace-nowrap">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar
                    </Button>
                  </div>

                  {interviewData.positions.length === 0 && (
                    <div className="text-center py-6 text-slate-500">
                      <p>No hay cargos registrados.</p>
                      <p className="text-sm">Agrega un cargo para comenzar a registrar actividades.</p>
                    </div>
                  )}

                  {currentPosition && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        💼 Cargo seleccionado: <strong>{currentPosition.name}</strong>
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Las actividades que agregues se asignarán a este cargo
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Agregar Actividades */}
              <Card className={editingActivity ? "border-blue-500 border-2" : ""}>
                <CardHeader>
                  <CardTitle>
                    {editingActivity ? "Editar Actividad" : "Registrar Actividades"}
                  </CardTitle>
                  <CardDescription>
                    {editingActivity 
                      ? "Modifica los datos de la actividad seleccionada"
                      : "Registra las actividades del cargo seleccionado"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                      <Label htmlFor="activityFrequency">Veces al día</Label>
                      <Input
                        id="activityFrequency"
                        type="number"
                        min="1"
                        value={newActivity.frequency || ""}
                        onChange={(e) =>
                          setNewActivity({
                            ...newActivity,
                            frequency: parseInt(e.target.value) || 1,
                          })
                        }
                        placeholder="1"
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
                      {editingActivity ? (
                        <div className="flex gap-2">
                          <Button onClick={updateActivity} size="lg" className="flex-1 shadow-sm">
                            <Pencil className="mr-2 h-4 w-4" />
                            Actualizar
                          </Button>
                          <Button onClick={cancelEdit} variant="outline" size="lg" className="flex-1">
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={addActivity} size="lg" className="w-full shadow-sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar
                        </Button>
                      )}
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

              {/* Lista de Actividades por Cargo */}
              {interviewData.positions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actividades por Cargo ({currentActivities.length} total)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {interviewData.positions.map((position) => (
                        position.activities.length > 0 && (
                          <div key={position.id} className="border rounded-lg p-4 bg-slate-50">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg">💼 {position.name}</h3>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {position.count} {position.count === 1 ? "persona" : "personas"}
                                </Badge>
                              </div>
                              <Badge variant="outline">
                                {position.activities.length} actividad{position.activities.length !== 1 ? 'es' : ''}
                              </Badge>
                            </div>
                            
                            {/* Contador de Tiempos por Cargo */}
                            {(() => {
                              const positionTotals = calculatePositionTotals(position, interviewData.workdayMinutes, interviewData.fixedBreaksMinutes);
                              return (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 p-3 bg-white rounded-lg border">
                                  <div className="text-center">
                                    <p className="text-xs text-slate-600">Productivo</p>
                                    <p className="font-bold text-green-600">{positionTotals.productiveTime} min</p>
                                    <p className="text-xs text-slate-500">{positionTotals.productivePercentage.toFixed(1)}%</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-slate-600">Apoyo</p>
                                    <p className="font-bold text-blue-600">{positionTotals.supportTime} min</p>
                                    <p className="text-xs text-slate-500">{positionTotals.supportPercentage.toFixed(1)}%</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-slate-600">Muerto</p>
                                    <p className="font-bold text-red-600">{positionTotals.deadTime} min</p>
                                    <p className="text-xs text-slate-500">{positionTotals.deadTimePercentage.toFixed(1)}%</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-slate-600">Disponible</p>
                                    <p className="font-bold text-slate-600">{positionTotals.unassignedTime} min</p>
                                    <p className="text-xs text-slate-500">{positionTotals.unassignedPercentage.toFixed(1)}%</p>
                                  </div>
                                </div>
                              );
                            })()}
                            
                            <div className="space-y-2">
                              {position.activities.map((activity) => (
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
                                      <p className="text-sm text-slate-600">
                                        {activity.timeMinutes} min × {activity.frequency} {activity.frequency === 1 ? 'vez' : 'veces'}
                                      </p>
                                      <p className="font-semibold text-blue-600">
                                        = {activity.timeMinutes * activity.frequency} min/día
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => editActivity(activity.id, position.id)}
                                      className="ml-2"
                                      title="Editar actividad"
                                    >
                                      <Pencil className="h-4 w-4 text-blue-500" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setCurrentPosition(position);
                                        removeActivity(activity.id);
                                      }}
                                      title="Eliminar actividad"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                      
                      {/* Totalizador del Área */}
                      {interviewData.positions.some(p => p.activities.length > 0) && (
                        <div className="border-2 border-blue-500 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <h3 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Totalizador del Área: {interviewData.areaName}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                              <p className="text-sm text-slate-600 mb-1">Total Productivo</p>
                              <p className="text-2xl font-bold text-green-600">{totals.productiveTime} min</p>
                              <p className="text-sm text-slate-500 mt-1">{totals.productivePercentage.toFixed(1)}%</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                              <p className="text-sm text-slate-600 mb-1">Total Apoyo</p>
                              <p className="text-2xl font-bold text-blue-600">{totals.supportTime} min</p>
                              <p className="text-sm text-slate-500 mt-1">{totals.supportPercentage.toFixed(1)}%</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                              <p className="text-sm text-slate-600 mb-1">Total Muerto</p>
                              <p className="text-2xl font-bold text-red-600">{totals.deadTime} min</p>
                              <p className="text-sm text-slate-500 mt-1">{totals.deadTimePercentage.toFixed(1)}%</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                              <p className="text-sm text-slate-600 mb-1">Total Disponible</p>
                              <p className="text-2xl font-bold text-slate-600">{totals.unassignedTime} min</p>
                              <p className="text-sm text-slate-500 mt-1">
                                {totals.availableTime > 0 ? ((totals.unassignedTime / totals.availableTime) * 100).toFixed(1) : 0}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
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
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>🐢 Metodología de la Tortuga</CardTitle>
                      <CardDescription>
                        Define el proceso completo del área. Usa la lista global para garantizar conexiones exactas entre áreas.
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleGenerateAISuggestions}
                      disabled={generateAIMutation.isPending || !interviewData.areaName}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {generateAIMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          🤖 Asistente IA
                        </>
                      )}
                    </Button>
                  </div>
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

              {/* Sección de Explicación de Indicadores */}
              <Card>
                <CardHeader>
                  <CardTitle>Informe: Entendiendo los Indicadores</CardTitle>
                  <CardDescription>
                    Guía para interpretar los resultados del análisis de tiempos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Tiempo Productivo */}
                    <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-50 rounded-r-lg">
                      <h4 className="font-bold text-green-900 text-lg mb-2">
                        🟢 Tiempo Productivo ({totals.productivePercentage.toFixed(1)}%)
                      </h4>
                      <p className="text-slate-700 mb-3">
                        <strong>Definición:</strong> Es el tiempo dedicado directamente a actividades que generan valor 
                        para el producto o servicio final. Son las tareas principales del área que contribuyen 
                        directamente a los objetivos de la organización.
                      </p>
                      <p className="text-slate-700 mb-3">
                        <strong>Ejemplos:</strong> Producción de unidades, atención a clientes, desarrollo de productos, 
                        procesamiento de pedidos, análisis de datos críticos.
                      </p>
                      <div className="bg-white p-3 rounded border border-green-200 mt-3">
                        <p className="text-sm font-semibold text-green-900 mb-2">Interpretación:</p>
                        {totals.productivePercentage >= 70 && (
                          <p className="text-sm text-slate-700">
                            ✅ <strong>Excelente:</strong> El área mantiene un alto nivel de productividad. 
                            Continuar monitoreando para mantener este estándar.
                          </p>
                        )}
                        {totals.productivePercentage >= 50 && totals.productivePercentage < 70 && (
                          <p className="text-sm text-slate-700">
                            ⚠️ <strong>Aceptable:</strong> Hay espacio para mejorar. Identifique oportunidades 
                            para reducir tiempos de soporte o muertos.
                          </p>
                        )}
                        {totals.productivePercentage < 50 && (
                          <p className="text-sm text-slate-700">
                            🔴 <strong>Crítico:</strong> Menos de la mitad del tiempo es productivo. 
                            Se requiere acción inmediata para identificar y eliminar desperdicios.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tiempo de Soporte */}
                    <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r-lg">
                      <h4 className="font-bold text-blue-900 text-lg mb-2">
                        🔵 Tiempo de Soporte ({totals.supportPercentage.toFixed(1)}%)
                      </h4>
                      <p className="text-slate-700 mb-3">
                        <strong>Definición:</strong> Actividades necesarias para que el trabajo productivo pueda realizarse, 
                        pero que no generan valor directo al producto/servicio. Son tareas de apoyo indispensables 
                        para el funcionamiento del área.
                      </p>
                      <p className="text-slate-700 mb-3">
                        <strong>Ejemplos:</strong> Reuniones de coordinación, preparación de herramientas, limpieza y orden, 
                        capacitaciones, mantenimiento preventivo, revisión de correos operativos.
                      </p>
                      <div className="bg-white p-3 rounded border border-blue-200 mt-3">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Interpretación:</p>
                        {totals.supportPercentage <= 20 && (
                          <p className="text-sm text-slate-700">
                            ✅ <strong>Óptimo:</strong> El tiempo de soporte está bien controlado y no afecta 
                            significativamente la productividad.
                          </p>
                        )}
                        {totals.supportPercentage > 20 && totals.supportPercentage <= 35 && (
                          <p className="text-sm text-slate-700">
                            ⚠️ <strong>Moderado:</strong> Revisar si algunas actividades de soporte pueden optimizarse 
                            o automatizarse para reducir su impacto.
                          </p>
                        )}
                        {totals.supportPercentage > 35 && (
                          <p className="text-sm text-slate-700">
                            🔴 <strong>Alto:</strong> El tiempo de soporte está consumiendo demasiados recursos. 
                            Evaluar qué actividades pueden eliminarse, simplificarse o delegarse.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tiempo Muerto */}
                    <div className="border-l-4 border-red-500 pl-4 py-3 bg-red-50 rounded-r-lg">
                      <h4 className="font-bold text-red-900 text-lg mb-2">
                        🔴 Tiempo Muerto ({totals.deadTimePercentage.toFixed(1)}%)
                      </h4>
                      <p className="text-slate-700 mb-3">
                        <strong>Definición:</strong> Tiempo en el que no se realiza ninguna actividad productiva ni de soporte. 
                        Representa desperdicio puro que debe ser eliminado o minimizado al máximo. Es el principal 
                        objetivo de mejora en cualquier análisis de tiempos.
                      </p>
                      <p className="text-slate-700 mb-3">
                        <strong>Ejemplos:</strong> Esperas por materiales, fallas de equipos, falta de instrucciones, 
                        ausencias de personal clave, sistemas caídos, reprocesos por errores, interrupciones innecesarias.
                      </p>
                      <div className="bg-white p-3 rounded border border-red-200 mt-3">
                        <p className="text-sm font-semibold text-red-900 mb-2">Interpretación:</p>
                        {totals.deadTimePercentage === 0 && (
                          <p className="text-sm text-slate-700">
                            🎉 <strong>Perfecto:</strong> No se detectaron tiempos muertos. Mantener las buenas prácticas 
                            y procesos actuales.
                          </p>
                        )}
                        {totals.deadTimePercentage > 0 && totals.deadTimePercentage <= 10 && (
                          <p className="text-sm text-slate-700">
                            ✅ <strong>Bajo:</strong> Nivel aceptable de tiempos muertos. Continuar trabajando en su reducción 
                            mediante mejora continua.
                          </p>
                        )}
                        {totals.deadTimePercentage > 10 && totals.deadTimePercentage <= 25 && (
                          <p className="text-sm text-slate-700">
                            ⚠️ <strong>Moderado:</strong> Hay oportunidades significativas de mejora. Priorizar las causas 
                            raíz más frecuentes o de mayor impacto.
                          </p>
                        )}
                        {totals.deadTimePercentage > 25 && (
                          <p className="text-sm text-slate-700">
                            🔴 <strong>Crítico:</strong> Más de un cuarto del tiempo se pierde. Se requiere un plan 
                            de acción urgente para atacar las causas raíz identificadas.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Recomendaciones Generales */}
                    <div className="border-l-4 border-slate-500 pl-4 py-3 bg-slate-50 rounded-r-lg">
                      <h4 className="font-bold text-slate-900 text-lg mb-2">
                        💡 Recomendaciones Generales
                      </h4>
                      <ul className="space-y-2 text-slate-700">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>
                            <strong>Priorizar:</strong> Enfocarse primero en eliminar tiempos muertos, luego optimizar 
                            tiempos de soporte, y finalmente maximizar tiempos productivos.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>
                            <strong>Medir regularmente:</strong> Realizar este análisis de forma periódica (mensual o trimestral) 
                            para identificar tendencias y medir el impacto de las mejoras implementadas.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>
                            <strong>Involucrar al equipo:</strong> Compartir estos resultados con el personal del área y 
                            trabajar en conjunto para identificar soluciones prácticas.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>
                            <strong>Documentar acciones:</strong> Crear un plan de acción con responsables y fechas para 
                            cada oportunidad de mejora identificada.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {currentActivities.filter((a) => a.type === "dead_time").length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Causas Raíz de Tiempos Muertos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentActivities
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

        {/* Vista: Dashboard de Mediciones Globales */}
        {view === "measurements" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📊 Dashboard de Mediciones Globales</CardTitle>
                <CardDescription>
                  {globalMeasurements.length === 0 
                    ? "No hay mediciones globales creadas aún. Crea tu primera medición para comenzar a hacer seguimiento."
                    : `Tienes ${globalMeasurements.length} medición${globalMeasurements.length > 1 ? 'es' : ''} global${globalMeasurements.length > 1 ? 'es' : ''} guardada${globalMeasurements.length > 1 ? 's' : ''}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {globalMeasurements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📸</div>
                    <h3 className="text-xl font-semibold mb-2">No hay mediciones globales</h3>
                    <p className="text-slate-600 mb-6">
                      Crea tu primera medición global para capturar el estado actual de todas las áreas
                    </p>
                    <Button onClick={() => setShowGlobalMeasurementDialog(true)} size="lg">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Primera Medición Global
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Nombre</th>
                          <th className="text-left p-3">Fecha</th>
                          <th className="text-center p-3"># Áreas</th>
                          <th className="text-right p-3">Promedio Productivo</th>
                          <th className="text-right p-3">Promedio Soporte</th>
                          <th className="text-right p-3">Promedio Muerto</th>
                          <th className="text-center p-3">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {globalMeasurements.map((measurement) => {
                          // Calcular promedios de todas las áreas
                          const avgProductivo = measurement.areas.reduce((sum, area) => {
                            const totals = calculateTotals(area);
                            return sum + totals.productivePercentage;
                          }, 0) / measurement.areas.length;
                          
                          const avgSoporte = measurement.areas.reduce((sum, area) => {
                            const totals = calculateTotals(area);
                            return sum + totals.supportPercentage;
                          }, 0) / measurement.areas.length;
                          
                          const avgMuerto = measurement.areas.reduce((sum, area) => {
                            const totals = calculateTotals(area);
                            return sum + totals.deadTimePercentage;
                          }, 0) / measurement.areas.length;
                          
                          return (
                            <tr key={measurement.id} className="border-b hover:bg-slate-50">
                              <td className="p-3 font-medium">{measurement.name}</td>
                              <td className="p-3 text-slate-600">
                                {new Date(measurement.date).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="p-3 text-center">
                                <Badge variant="outline">{measurement.areas.length}</Badge>
                              </td>
                              <td className="p-3 text-right">
                                <span className="font-semibold text-green-600">
                                  {avgProductivo.toFixed(1)}%
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <span className="font-semibold text-blue-600">
                                  {avgSoporte.toFixed(1)}%
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <span className="font-semibold text-red-600">
                                  {avgMuerto.toFixed(1)}%
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-1.5 justify-center">
                                  <Button 
                                    onClick={() => {
                                      setSelectedMeasurement(measurement);
                                      setView("measurement-detail");
                                    }}
                                    variant="default" 
                                    size="sm"
                                  >
                                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                                    Ver
                                  </Button>
                                  <Button 
                                    onClick={async () => {
                                      if (confirm(`¿Estás seguro de eliminar la medición "${measurement.name}"?`)) {
                                        try {
                                          await deleteGlobalMeasurement(measurement.id!);
                                          alert('Medición eliminada exitosamente');
                                        } catch (error) {
                                          alert('Error al eliminar la medición');
                                        }
                                      }
                                    }}
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {globalMeasurements.length >= 2 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">🔍 Comparar Mediciones</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Selecciona dos mediciones para ver su evolución y diferencias
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-blue-900">Medición Base</Label>
                        <select 
                          className="w-full mt-1 p-2 border rounded"
                          value={measurementToCompare1?.id || ""}
                          onChange={(e) => {
                            const m = globalMeasurements.find(m => m.id === e.target.value);
                            setMeasurementToCompare1(m || null);
                          }}
                        >
                          <option value="">Seleccionar...</option>
                          {globalMeasurements.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-blue-900">Medición Actual</Label>
                        <select 
                          className="w-full mt-1 p-2 border rounded"
                          value={measurementToCompare2?.id || ""}
                          onChange={(e) => {
                            const m = globalMeasurements.find(m => m.id === e.target.value);
                            setMeasurementToCompare2(m || null);
                          }}
                        >
                          <option value="">Seleccionar...</option>
                          {globalMeasurements.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          onClick={() => {
                            if (measurementToCompare1 && measurementToCompare2) {
                              setView("measurement-compare");
                            } else {
                              alert('Por favor selecciona dos mediciones para comparar');
                            }
                          }}
                          disabled={!measurementToCompare1 || !measurementToCompare2}
                          size="lg"
                          className="w-full shadow-sm"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Comparar Mediciones
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Vista: Detalle de Medición Global */}
        {view === "measurement-detail" && selectedMeasurement && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📊 Detalle de Medición: {selectedMeasurement.name}</CardTitle>
                <CardDescription>
                  Creada el {new Date(selectedMeasurement.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} • {selectedMeasurement.areas.length} áreas capturadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Área</th>
                        <th className="text-left p-3">Responsable</th>
                        <th className="text-center p-3"># Cargos</th>
                        <th className="text-center p-3"># Actividades</th>
                        <th className="text-right p-3">Productivo</th>
                        <th className="text-right p-3">Soporte</th>
                        <th className="text-right p-3">Muerto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMeasurement.areas.map((area, index) => {
                        const totals = calculateTotals(area);
                        const allActivities = getAllActivities(area);
                        
                        return (
                          <tr key={index} className="border-b hover:bg-slate-50">
                            <td className="p-3 font-medium">{area.areaName}</td>
                            <td className="p-3 text-slate-600">{area.managerName}</td>
                            <td className="p-3 text-center">
                              <Badge variant="outline">{area.positions.length}</Badge>
                            </td>
                            <td className="p-3 text-center">
                              <Badge variant="outline">{allActivities.length}</Badge>
                            </td>
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
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Gráfico de barras */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-4">Distribución por Área</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={selectedMeasurement.areas.map(area => {
                      const totals = calculateTotals(area);
                      return {
                        area: area.areaName,
                        Productivo: totals.productivePercentage,
                        Soporte: totals.supportPercentage,
                        "Tiempo Muerto": totals.deadTimePercentage
                      };
                    })}>
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
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Vista: Comparación entre Dos Mediciones Globales */}
        {view === "measurement-compare" && measurementToCompare1 && measurementToCompare2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🔍 Comparación de Mediciones</CardTitle>
                <CardDescription>
                  {measurementToCompare1.name} vs {measurementToCompare2.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Área</th>
                        <th className="text-right p-3" colSpan={2}>
                          <div className="text-sm font-normal text-slate-600">{measurementToCompare1.name}</div>
                        </th>
                        <th className="text-right p-3" colSpan={2}>
                          <div className="text-sm font-normal text-slate-600">{measurementToCompare2.name}</div>
                        </th>
                        <th className="text-center p-3">Evolución</th>
                      </tr>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left p-3"></th>
                        <th className="text-right p-3 text-xs">Prod.</th>
                        <th className="text-right p-3 text-xs">Muerto</th>
                        <th className="text-right p-3 text-xs">Prod.</th>
                        <th className="text-right p-3 text-xs">Muerto</th>
                        <th className="text-center p-3 text-xs">Cambio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {measurementToCompare1.areas.map((area1, index) => {
                        // Buscar el área correspondiente en la segunda medición
                        const area2 = measurementToCompare2.areas.find(a => a.areaName === area1.areaName);
                        
                        if (!area2) return null; // Área no existe en la segunda medición
                        
                        const totals1 = calculateTotals(area1);
                        const totals2 = calculateTotals(area2);
                        
                        const diffProductivo = totals2.productivePercentage - totals1.productivePercentage;
                        const diffMuerto = totals2.deadTimePercentage - totals1.deadTimePercentage;
                        
                        // Determinar si mejoró o empeoró
                        const improved = diffProductivo > 0 || diffMuerto < 0;
                        const worsened = diffProductivo < 0 || diffMuerto > 0;
                        
                        return (
                          <tr key={index} className="border-b hover:bg-slate-50">
                            <td className="p-3 font-medium">{area1.areaName}</td>
                            <td className="p-3 text-right text-green-600">
                              {totals1.productivePercentage.toFixed(1)}%
                            </td>
                            <td className="p-3 text-right text-red-600">
                              {totals1.deadTimePercentage.toFixed(1)}%
                            </td>
                            <td className="p-3 text-right text-green-600 font-semibold">
                              {totals2.productivePercentage.toFixed(1)}%
                            </td>
                            <td className="p-3 text-right text-red-600 font-semibold">
                              {totals2.deadTimePercentage.toFixed(1)}%
                            </td>
                            <td className="p-3 text-center">
                              {improved && !worsened && (
                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                  ↑ Mejoró
                                </Badge>
                              )}
                              {worsened && !improved && (
                                <Badge className="bg-red-100 text-red-800 border-red-300">
                                  ↓ Empeoró
                                </Badge>
                              )}
                              {!improved && !worsened && (
                                <Badge variant="outline">
                                  → Igual
                                </Badge>
                              )}
                              {improved && worsened && (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  ∼ Mixto
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Gráficos de comparación */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="font-semibold mb-4">Tiempo Productivo - Comparación</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={measurementToCompare1.areas.map(area1 => {
                        const area2 = measurementToCompare2.areas.find(a => a.areaName === area1.areaName);
                        if (!area2) return null;
                        
                        const totals1 = calculateTotals(area1);
                        const totals2 = calculateTotals(area2);
                        
                        return {
                          area: area1.areaName,
                          [measurementToCompare1.name]: totals1.productivePercentage,
                          [measurementToCompare2.name]: totals2.productivePercentage
                        };
                      }).filter(Boolean)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="area" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={measurementToCompare1.name} fill="#94a3b8" />
                        <Bar dataKey={measurementToCompare2.name} fill={COLORS.productive} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Tiempo Muerto - Comparación</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={measurementToCompare1.areas.map(area1 => {
                        const area2 = measurementToCompare2.areas.find(a => a.areaName === area1.areaName);
                        if (!area2) return null;
                        
                        const totals1 = calculateTotals(area1);
                        const totals2 = calculateTotals(area2);
                        
                        return {
                          area: area1.areaName,
                          [measurementToCompare1.name]: totals1.deadTimePercentage,
                          [measurementToCompare2.name]: totals2.deadTimePercentage
                        };
                      }).filter(Boolean)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="area" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={measurementToCompare1.name} fill="#fca5a5" />
                        <Bar dataKey={measurementToCompare2.name} fill={COLORS.dead_time} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Mapa de Interacciones entre Áreas</CardTitle>
                    <CardDescription>
                      Visualización de flujos basados en coincidencias exactas (Entradas ↔ Salidas)
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={handleAnalyzeProcesses}
                    variant="default"
                    size="lg"
                    className="shadow-md bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                    disabled={isAnalyzingProcesses}
                  >
                    {isAnalyzingProcesses ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analizando flujo...
                      </>
                    ) : (
                      <>
                        🤖 Analizar Flujo IA
                      </>
                    )}
                  </Button>
                </div>
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
              {savedAreas
                .filter((area) => {
                  const hasTurtle = area.turtleProcess && 
                    Object.values(area.turtleProcess).some(arr => arr.length > 0);
                  return hasTurtle;
                })
                .map((area) => {
                
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
                          {TURTLE_FIELDS
                            .filter((field) => {
                              const fieldKey = field.key as keyof TurtleProcess;
                              const items = area.turtleProcess?.[fieldKey] || [];
                              return items.length > 0;
                            })
                            .map((field) => {
                            const fieldKey = field.key as keyof TurtleProcess;
                            const items = area.turtleProcess?.[fieldKey] || [];
                            
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
                      {savedAreas
                        .filter((area) => area.turtleProcess)
                        .map((area) => {
                        
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
                              {area.turtleProcess!.inputs.length > 0 ? (
                                <ul className="space-y-1">
                                  {area.turtleProcess!.inputs.map((input, idx) => (
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
                                {area.turtleProcess!.methods.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-blue-200">
                                    <p className="text-xs font-semibold text-slate-700 mb-1">Métodos:</p>
                                    <ul className="space-y-1">
                                      {area.turtleProcess!.methods.map((method, idx) => (
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
                              {area.turtleProcess!.outputs.length > 0 ? (
                                <ul className="space-y-1">
                                  {area.turtleProcess!.outputs.map((output, idx) => (
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
                      const sipocData = savedAreas
                        .filter(area => area.turtleProcess)
                        .map(area => {
                        
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
                          Inputs: area.turtleProcess!.inputs.join(", ") || "-",
                          Process: area.areaName,
                          Methods: area.turtleProcess!.methods.join(", ") || "-",
                          Outputs: area.turtleProcess!.outputs.join(", ") || "-",
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

      {/* Diálogo de migración de datos */}
      {showMigrateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Migrar Datos a la Nube
              </CardTitle>
              <CardDescription>
                Se detectaron datos guardados localmente. ¿Deseas migrarlos a Firebase para sincronizarlos entre dispositivos?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  👉 Después de migrar, tus datos estarán disponibles en todos tus dispositivos.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    try {
                      const count = await migrateData();
                      alert(`✅ Se migraron ${count} áreas exitosamente a la nube`);
                      setShowMigrateDialog(false);
                    } catch (error) {
                      alert("Error al migrar datos: " + (error instanceof Error ? error.message : "Error desconocido"));
                    }
                  }}
                  className="flex-1"
                >
                  ☁️ Migrar a la Nube
                </Button>
                <Button
                  onClick={() => {
                    localStorage.setItem('firestoreMigrated', 'true');
                    setShowMigrateDialog(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Omitir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Diálogo de Sugerencias de IA */}
      {showAISuggestions && aiSuggestions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    🤖 Sugerencias del Asistente IA
                  </CardTitle>
                  <CardDescription>
                    Revisa las sugerencias generadas para el área "{interviewData.areaName}". Puedes aplicarlas todas o cerrar y agregar manualmente.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAISuggestions(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Entradas */}
                <div key="entradas" className="border rounded-lg p-4">
                  <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    📥 Entradas ({aiSuggestions.entradas.length})
                  </h4>
                  <ul className="space-y-1">
                    {aiSuggestions.entradas.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Salidas */}
                <div key="salidas" className="border rounded-lg p-4">
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    📤 Salidas ({aiSuggestions.salidas.length})
                  </h4>
                  <ul className="space-y-1">
                    {aiSuggestions.salidas.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Recursos */}
                <div key="recursos" className="border rounded-lg p-4">
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    🔧 Recursos ({aiSuggestions.recursos.length})
                  </h4>
                  <ul className="space-y-1">
                    {aiSuggestions.recursos.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-orange-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Métodos */}
                <div key="metodos" className="border rounded-lg p-4">
                  <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                    📋 Métodos ({aiSuggestions.metodos.length})
                  </h4>
                  <ul className="space-y-1">
                    {aiSuggestions.metodos.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Indicadores */}
                <div key="indicadores" className="border rounded-lg p-4">
                  <h4 className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
                    📊 Indicadores ({aiSuggestions.indicadores.length})
                  </h4>
                  <ul className="space-y-1">
                    {aiSuggestions.indicadores.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-pink-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Competencias */}
                <div key="competencias" className="border rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                    👥 Competencias ({aiSuggestions.competencias.length})
                  </h4>
                  <ul className="space-y-1">
                    {aiSuggestions.competencias.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-indigo-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={applyAISuggestions}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  ✔️ Aplicar Todas las Sugerencias
                </Button>
                <Button
                  onClick={() => setShowAISuggestions(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Diálogo de Medición Global */}
      {showGlobalMeasurementDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>📸 Crear Medición Global</CardTitle>
              <CardDescription>
                Toma una fotografía de TODAS las áreas actuales ({savedAreas.length} áreas) para comparar en el futuro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="global-measurement-name">Nombre de la Medición Global</Label>
                <Input
                  id="global-measurement-name"
                  value={globalMeasurementName}
                  onChange={(e) => setGlobalMeasurementName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      createGlobalMeasurement();
                    } else if (e.key === "Escape") {
                      setShowGlobalMeasurementDialog(false);
                      setGlobalMeasurementName("");
                    }
                  }}
                  placeholder="Ej: Estado Inicial, Medición Enero 2025, Después de Mejoras"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-2">
                  Se guardará una copia completa de todas las áreas con sus cargos, actividades y tiempos actuales
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900 font-medium">
                  Áreas que se capturarán:
                </p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1">
                  {savedAreas.slice(0, 5).map(area => (
                    <li key={area.id}>• {area.areaName}</li>
                  ))}
                  {savedAreas.length > 5 && (
                    <li className="text-blue-600 italic">... y {savedAreas.length - 5} áreas más</li>
                  )}
                </ul>
              </div>
              <div className="flex gap-2">
                <Button onClick={createGlobalMeasurement} className="flex-1">
                  <Check className="mr-2 h-4 w-4" />
                  Crear Medición Global
                </Button>
                <Button 
                  onClick={() => {
                    setShowGlobalMeasurementDialog(false);
                    setGlobalMeasurementName("");
                  }} 
                  variant="outline" 
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Diálogo de Nueva Medición (ELIMINADO - Ahora se usa el sistema de Mediciones Globales) */}
      {false && showNewMeasurementDialog && selectedAreaForNewMeasurement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Nueva Medición</CardTitle>
              <CardDescription>
                Crea un snapshot del estado actual del área "{selectedAreaForNewMeasurement.areaName}" para comparar en el futuro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="measurement-name">Nombre de la Medición</Label>
                <Input
                  id="measurement-name"
                  value={newMeasurementName}
                  onChange={(e) => setNewMeasurementName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      createNewMeasurement();
                    } else if (e.key === "Escape") {
                      setShowNewMeasurementDialog(false);
                      setNewMeasurementName("");
                    }
                  }}
                  placeholder="Ej: Medición Marzo 2025, Después de capacitación"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-2">
                  Se guardará una copia de todos los cargos y actividades actuales con sus tiempos
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={createNewMeasurement} className="flex-1">
                  <Check className="mr-2 h-4 w-4" />
                  Crear Medición
                </Button>
                <Button 
                  onClick={() => {
                    setShowNewMeasurementDialog(false);
                    setNewMeasurementName("");
                  }} 
                  variant="outline" 
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Diálogo de Edición de Nombre de Cargo */}
      {editingPosition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Editar Nombre del Cargo</CardTitle>
              <CardDescription>
                Modifica el nombre del cargo sin perder las actividades registradas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-position-name">Nombre del Cargo</Label>
                <Input
                  id="edit-position-name"
                  value={editPositionName}
                  onChange={(e) => setEditPositionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveEditPosition();
                    } else if (e.key === "Escape") {
                      cancelEditPosition();
                    }
                  }}
                  placeholder="Ej: Contador Senior"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEditPosition} className="flex-1">
                  <Check className="mr-2 h-4 w-4" />
                  Guardar
                </Button>
                <Button onClick={cancelEditPosition} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Diálogo de Análisis de Procesos IA */}
      {showProcessAnalysis && processAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
              <CardTitle className="text-2xl">🤖 Análisis de Flujo de Procesos</CardTitle>
              <CardDescription className="text-teal-100">
                Análisis inteligente del mapa de procesos y matriz SIPOC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 mt-6">
              {/* Cuellos de Botella */}
              <div>
                <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
                  ⛔ CUELLOS DE BOTELLA
                </h3>
                <ul className="space-y-2">
                  {processAnalysis.cuellosDeBottella.map((cuello: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-red-600 font-bold">•</span>
                      <span className="text-slate-700">{cuello}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              {/* Oportunidades de Optimización */}
              <div>
                <h3 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                  🚀 OPORTUNIDADES DE OPTIMIZACIÓN
                </h3>
                <ul className="space-y-2">
                  {processAnalysis.oportunidadesOptimizacion.map((oportunidad: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-green-600 font-bold">{index + 1}.</span>
                      <span className="text-slate-700">{oportunidad}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              {/* Riesgos Identificados */}
              <div>
                <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                  ⚠️ RIESGOS IDENTIFICADOS
                </h3>
                <ul className="space-y-2">
                  {processAnalysis.riesgosIdentificados.map((riesgo: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-orange-600 font-bold">▶</span>
                      <span className="text-slate-700">{riesgo}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              {/* Análisis Detallado */}
              <div>
                <h3 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
                  📊 ANÁLISIS DETALLADO
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {processAnalysis.analisisDetallado}
                </p>
              </div>
              
              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => {
                    const text = `ANÁLISIS DE FLUJO DE PROCESOS - IA\n\n` +
                      `CUELLOS DE BOTELLA:\n${processAnalysis.cuellosDeBottella.map((c: string, i: number) => `${i+1}. ${c}`).join('\n')}\n\n` +
                      `OPORTUNIDADES DE OPTIMIZACIÓN:\n${processAnalysis.oportunidadesOptimizacion.map((o: string, i: number) => `${i+1}. ${o}`).join('\n')}\n\n` +
                      `RIESGOS IDENTIFICADOS:\n${processAnalysis.riesgosIdentificados.map((r: string, i: number) => `${i+1}. ${r}`).join('\n')}\n\n` +
                      `ANÁLISIS DETALLADO:\n${processAnalysis.analisisDetallado}`;
                    navigator.clipboard.writeText(text);
                    alert('✅ Análisis de procesos copiado al portapapeles');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  📋 Copiar al Portapapeles
                </Button>
                <Button
                  onClick={() => setShowProcessAnalysis(false)}
                  variant="default"
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Diálogo de Reporte Ejecutivo IA */}
      {showExecutiveReport && executiveReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <CardTitle className="text-2xl">📊 Informe Ejecutivo Inteligente</CardTitle>
              <CardDescription className="text-indigo-100">
                Reporte estratégico completo generado por IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 mt-6">
              {/* Resumen Ejecutivo */}
              <div>
                <h3 className="text-lg font-bold text-indigo-600 mb-3 flex items-center gap-2">
                  🎯 RESUMEN EJECUTIVO
                </h3>
                <p className="text-slate-700 leading-relaxed bg-indigo-50 p-4 rounded-lg">
                  {executiveReport.resumenEjecutivo}
                </p>
              </div>
              
              <Separator />
              
              {/* Hallazgos Principales */}
              <div>
                <h3 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                  🔍 HALLAZGOS PRINCIPALES
                </h3>
                <ul className="space-y-2">
                  {executiveReport.hallazgosPrincipales.map((hallazgo: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-blue-600 font-bold">{index + 1}.</span>
                      <span className="text-slate-700">{hallazgo}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              {/* Recomendaciones Estratégicas */}
              <div>
                <h3 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
                  💡 RECOMENDACIONES ESTRATÉGICAS
                </h3>
                <ul className="space-y-2">
                  {executiveReport.recomendacionesEstrategicas.map((recomendacion: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-purple-600 font-bold">✓</span>
                      <span className="text-slate-700">{recomendacion}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              {/* Plan de Acción */}
              <div>
                <h3 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                  ✅ PLAN DE ACCIÓN
                </h3>
                <ul className="space-y-2">
                  {executiveReport.planDeAccion.map((accion: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-green-600 font-bold">{index + 1}.</span>
                      <span className="text-slate-700">{accion}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              {/* ROI Estimado */}
              <div>
                <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                  💰 ROI ESTIMADO
                </h3>
                <p className="text-slate-700 leading-relaxed bg-orange-50 p-4 rounded-lg">
                  {executiveReport.roi}
                </p>
              </div>
              
              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => {
                    const text = `INFORME EJECUTIVO - IA\n\n` +
                      `RESUMEN EJECUTIVO:\n${executiveReport.resumenEjecutivo}\n\n` +
                      `HALLAZGOS PRINCIPALES:\n${executiveReport.hallazgosPrincipales.map((h: string, i: number) => `${i+1}. ${h}`).join('\n')}\n\n` +
                      `RECOMENDACIONES ESTRATÉGICAS:\n${executiveReport.recomendacionesEstrategicas.map((r: string, i: number) => `${i+1}. ${r}`).join('\n')}\n\n` +
                      `PLAN DE ACCIÓN:\n${executiveReport.planDeAccion.map((a: string, i: number) => `${i+1}. ${a}`).join('\n')}\n\n` +
                      `ROI ESTIMADO:\n${executiveReport.roi}`;
                    navigator.clipboard.writeText(text);
                    alert('✅ Informe ejecutivo copiado al portapapeles');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  📋 Copiar al Portapapeles
                </Button>
                <Button
                  onClick={() => setShowExecutiveReport(false)}
                  variant="default"
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Diálogo de Análisis Comparativo IA */}
      {showComparativeAnalysis && comparativeAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-pink-600 text-white">
              <CardTitle className="text-2xl">🤖 Análisis Comparativo Inteligente</CardTitle>
              <CardDescription className="text-orange-100">
                Benchmarking interno y mejores prácticas entre {savedAreas.length} áreas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 mt-6">
              {/* Mejores Prácticas */}
              <div>
                <h3 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                  🏆 MEJORES PRÁCTICAS IDENTIFICADAS
                </h3>
                <ul className="space-y-2">
                  {comparativeAnalysis.mejoresPracticas.map((practica: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-slate-700">{practica}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              {/* Áreas de Oportunidad */}
              <div>
                <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                  ⚠️ ÁREAS DE OPORTUNIDAD
                </h3>
                <ul className="space-y-2">
                  {comparativeAnalysis.areasDeOportunidad.map((oportunidad: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-orange-600 font-bold">{index + 1}.</span>
                      <span className="text-slate-700">{oportunidad}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              {/* Oportunidades de Mejora Cruzada */}
              <div>
                <h3 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                  🔄 OPORTUNIDADES DE MEJORA CRUZADA
                </h3>
                <ul className="space-y-2">
                  {comparativeAnalysis.oportunidadesMejoraCruzada.map((mejora: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-blue-600 font-bold">•</span>
                      <span className="text-slate-700">{mejora}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              {/* Benchmarking Interno */}
              <div>
                <h3 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
                  📊 BENCHMARKING INTERNO
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {comparativeAnalysis.benchmarkingInterno}
                </p>
              </div>
              
              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => {
                    const text = `ANÁLISIS COMPARATIVO - IA\n\n` +
                      `MEJORES PRÁCTICAS:\n${comparativeAnalysis.mejoresPracticas.map((p: string, i: number) => `${i+1}. ${p}`).join('\n')}\n\n` +
                      `ÁREAS DE OPORTUNIDAD:\n${comparativeAnalysis.areasDeOportunidad.map((o: string, i: number) => `${i+1}. ${o}`).join('\n')}\n\n` +
                      `OPORTUNIDADES DE MEJORA CRUZADA:\n${comparativeAnalysis.oportunidadesMejoraCruzada.map((m: string, i: number) => `${i+1}. ${m}`).join('\n')}\n\n` +
                      `BENCHMARKING INTERNO:\n${comparativeAnalysis.benchmarkingInterno}`;
                    navigator.clipboard.writeText(text);
                    alert('✅ Análisis comparativo copiado al portapapeles');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  📋 Copiar al Portapapeles
                </Button>
                <Button
                  onClick={() => setShowComparativeAnalysis(false)}
                  variant="default"
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Diálogo de Análisis IA */}
      {showAreaAnalysis && areaAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardTitle className="text-2xl">🤖 Análisis Inteligente con IA</CardTitle>
              <CardDescription className="text-purple-100">
                Recomendaciones y hallazgos generados por inteligencia artificial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 mt-6">
              {/* Hallazgos Críticos */}
              <div>
                <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
                  🔴 HALLAZGOS CRÍTICOS
                </h3>
                <ul className="space-y-2">
                  {areaAnalysis.hallazgosCriticos.map((hallazgo: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-red-600 font-bold">•</span>
                      <span className="text-slate-700">{hallazgo}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              {/* Recomendaciones Prioritarias */}
              <div>
                <h3 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                  ✅ RECOMENDACIONES PRIORITARIAS
                </h3>
                <ul className="space-y-2">
                  {areaAnalysis.recomendacionesPrioritarias.map((recomendacion: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-blue-600 font-bold">{index + 1}.</span>
                      <span className="text-slate-700">{recomendacion}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              {/* Quick Wins */}
              <div>
                <h3 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                  💡 QUICK WINS (Impacto Inmediato)
                </h3>
                <ul className="space-y-2">
                  {areaAnalysis.quickWins.map((quickWin: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-slate-700">{quickWin}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              {/* Análisis Detallado */}
              <div>
                <h3 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
                  📊 ANÁLISIS DETALLADO
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {areaAnalysis.analisisDetallado}
                </p>
              </div>
              
              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => {
                    const text = `ANÁLISIS INTELIGENTE - IA\n\n` +
                      `HALLAZGOS CRÍTICOS:\n${areaAnalysis.hallazgosCriticos.map((h: string, i: number) => `${i+1}. ${h}`).join('\n')}\n\n` +
                      `RECOMENDACIONES PRIORITARIAS:\n${areaAnalysis.recomendacionesPrioritarias.map((r: string, i: number) => `${i+1}. ${r}`).join('\n')}\n\n` +
                      `QUICK WINS:\n${areaAnalysis.quickWins.map((q: string, i: number) => `${i+1}. ${q}`).join('\n')}\n\n` +
                      `ANÁLISIS DETALLADO:\n${areaAnalysis.analisisDetallado}`;
                    navigator.clipboard.writeText(text);
                    alert('✅ Análisis copiado al portapapeles');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  📋 Copiar al Portapapeles
                </Button>
                <Button
                  onClick={() => setShowAreaAnalysis(false)}
                  variant="default"
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
