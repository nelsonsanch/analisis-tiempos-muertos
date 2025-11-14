import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  deleteField 
} from 'firebase/firestore';
import { db } from './firebase';

export interface InterviewData {
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

export interface Position {
  id: string;
  name: string; // Nombre del cargo (ej: "Contador Senior", "Auxiliar Contable")
  count: number; // Cantidad de personas en este cargo
  activities: Activity[]; // Actividades asignadas a este cargo
}

export interface Activity {
  id: string;
  name: string;
  timeMinutes: number;
  frequency: number;
  type: "productive" | "support" | "dead_time";
  cause?: string;
}

export interface TurtleProcess {
  inputs: string[];
  outputs: string[];
  resources: string[];
  methods: string[];
  indicators: string[];
  competencies: string[];
}

const COLLECTION_NAME = 'timeAnalysisAreas';

/**
 * Limpiar valores undefined de un objeto (Firestore no los permite)
 */
const cleanUndefined = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(cleanUndefined);
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      const value = obj[key];
      cleaned[key] = value === undefined ? null : cleanUndefined(value);
    }
    return cleaned;
  }
  return obj;
};

/**
 * Guardar o actualizar un área
 */
export const saveArea = async (area: InterviewData): Promise<string> => {
  try {
    // Excluir el campo 'id' de los datos a guardar (Firestore maneja los IDs automáticamente)
    const { id, ...areaWithoutId } = area;
    
    const areaData = cleanUndefined({
      ...areaWithoutId,
      savedAt: new Date().toISOString(),
      updatedAt: Timestamp.now()
    });

    if (id) {
      // Actualizar área existente
      const areaRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(areaRef, areaData);
      return id;
    } else {
      // Crear nueva área
      const docRef = await addDoc(collection(db, COLLECTION_NAME), areaData);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving area:', error);
    throw new Error('Error al guardar el área en la nube');
  }
};

/**
 * Obtener todas las áreas (una sola vez)
 */
export const getAreas = async (): Promise<InterviewData[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('savedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const areas: InterviewData[] = [];
    querySnapshot.forEach((doc) => {
      areas.push({
        id: doc.id,
        ...doc.data()
      } as InterviewData);
    });
    
    return areas;
  } catch (error) {
    console.error('Error getting areas:', error);
    throw new Error('Error al cargar las áreas desde la nube');
  }
};

/**
 * Suscribirse a cambios en tiempo real
 */
export const subscribeToAreas = (
  callback: (areas: InterviewData[]) => void,
  onError?: (error: Error) => void
) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('savedAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const areas: InterviewData[] = [];
        querySnapshot.forEach((doc) => {
          areas.push({
            id: doc.id,
            ...doc.data()
          } as InterviewData);
        });
        callback(areas);
      },
      (error) => {
        console.error('Error in real-time subscription:', error);
        if (onError) {
          onError(new Error('Error en la sincronización en tiempo real'));
        }
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to areas:', error);
    throw new Error('Error al conectar con la base de datos');
  }
};

/**
 * Eliminar un área
 */
export const deleteArea = async (areaId: string): Promise<void> => {
  try {
    const areaRef = doc(db, COLLECTION_NAME, areaId);
    await deleteDoc(areaRef);
  } catch (error) {
    console.error('Error deleting area:', error);
    throw new Error('Error al eliminar el área');
  }
};

/**
 * Migrar datos de localStorage a Firestore
 */
export const migrateFromLocalStorage = async (): Promise<number> => {
  try {
    const stored = localStorage.getItem('timeAnalysisInterviews');
    if (!stored) return 0;
    
    const areas: InterviewData[] = JSON.parse(stored);
    let migratedCount = 0;
    
    for (const area of areas) {
      // No incluir el ID local al migrar
      const { id, ...areaWithoutId } = area;
      await saveArea(areaWithoutId as InterviewData);
      migratedCount++;
    }
    
    return migratedCount;
  } catch (error) {
    console.error('Error migrating from localStorage:', error);
    throw new Error('Error al migrar datos locales a la nube');
  }
};

/**
 * Limpiar documentos existentes que tienen el campo 'id' guardado (migración única)
 */
export const cleanExistingDocuments = async (): Promise<number> => {
  try {
    console.log('[Firestore] Iniciando limpieza de documentos...');
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    let cleanedCount = 0;
    
    for (const docSnapshot of querySnapshot.docs) {
      const docId = docSnapshot.id;
      const data = docSnapshot.data();
      
      // Si el documento tiene el campo 'id' en sus datos, eliminarlo
      if ('id' in data) {
        console.log('[Firestore] Limpiando documento:', docId, 'Nombre:', data.areaName);
        await updateDoc(doc(db, COLLECTION_NAME, docId), {
          id: deleteField()
        });
        cleanedCount++;
      }
    }
    
    console.log(`[Firestore] ✅ Limpieza completada: ${cleanedCount} documentos actualizados`);
    return cleanedCount;
  } catch (error) {
    console.error('[Firestore] Error al limpiar documentos:', error);
    throw new Error('Error al limpiar documentos existentes');
  }
};
