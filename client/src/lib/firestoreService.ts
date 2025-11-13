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
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface InterviewData {
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
 * Guardar o actualizar un área
 */
export const saveArea = async (area: InterviewData): Promise<string> => {
  try {
    const areaData = {
      ...area,
      savedAt: new Date().toISOString(),
      updatedAt: Timestamp.now()
    };

    if (area.id) {
      // Actualizar área existente
      const areaRef = doc(db, COLLECTION_NAME, area.id);
      await updateDoc(areaRef, areaData);
      return area.id;
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
