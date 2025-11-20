import { useState, useEffect } from 'react';
import { 
  InterviewData, 
  saveArea as saveAreaToFirestore, 
  deleteArea as deleteAreaFromFirestore,
  subscribeToAreas,
  migrateFromLocalStorage,
  cleanExistingDocuments 
} from '@/lib/firestoreService';
import { useAuth } from '@/contexts/AuthContext';

export type SyncStatus = 'idle' | 'loading' | 'syncing' | 'synced' | 'error';

export const useFirestore = () => {
  const { userProfile } = useAuth();
  const [areas, setAreas] = useState<InterviewData[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isMigrated, setIsMigrated] = useState<boolean>(false);

  // Verificar si ya se migró
  useEffect(() => {
    const migrated = localStorage.getItem('firestoreMigrated');
    setIsMigrated(migrated === 'true');
  }, []);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    // Si no hay perfil de usuario, no cargar nada
    if (!userProfile) {
      setAreas([]);
      setSyncStatus('idle');
      return;
    }
    
    setSyncStatus('loading');
    
    // Determinar el companyId a usar para filtrar
    let companyIdFilter: string | null | undefined;
    
    if (userProfile.role === 'super_admin') {
      // Super admin NO debe ver datos de empresas
      companyIdFilter = null;
    } else {
      // Usuarios regulares ven solo datos de su empresa
      companyIdFilter = userProfile.companyId;
    }
    
    const unsubscribe = subscribeToAreas(
      (updatedAreas) => {
        setAreas(updatedAreas);
        setSyncStatus('synced');
        setError(null);
      },
      (err) => {
        setError(err.message);
        setSyncStatus('error');
      },
      companyIdFilter
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userProfile]);

  /**
   * Guardar área en Firestore
   */
  const saveArea = async (area: InterviewData): Promise<string> => {
    try {
      setSyncStatus('syncing');
      setError(null);
      
      // Agregar companyId automáticamente si el usuario tiene uno
      const areaWithCompany = {
        ...area,
        companyId: userProfile?.companyId || area.companyId
      };
      
      const areaId = await saveAreaToFirestore(areaWithCompany);
      
      setSyncStatus('synced');
      return areaId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setSyncStatus('error');
      throw err;
    }
  };

  /**
   * Eliminar área de Firestore
   */
  const deleteArea = async (areaId: string): Promise<void> => {
    try {
      setSyncStatus('syncing');
      setError(null);
      
      await deleteAreaFromFirestore(areaId);
      
      setSyncStatus('synced');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setSyncStatus('error');
      throw err;
    }
  };

  /**
   * Migrar datos de localStorage a Firestore
   */
  const migrateData = async (): Promise<number> => {
    try {
      setSyncStatus('syncing');
      setError(null);
      
      const count = await migrateFromLocalStorage();
      
      // Marcar como migrado
      localStorage.setItem('firestoreMigrated', 'true');
      setIsMigrated(true);
      
      setSyncStatus('synced');
      return count;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setSyncStatus('error');
      throw err;
    }
  };

  /**
   * Limpiar documentos existentes (migración única)
   */
  const cleanDocuments = async (): Promise<number> => {
    try {
      setSyncStatus('syncing');
      setError(null);
      
      const count = await cleanExistingDocuments();
      
      setSyncStatus('synced');
      return count;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setSyncStatus('error');
      throw err;
    }
  };

  return {
    areas,
    saveArea,
    deleteArea,
    migrateData,
    cleanDocuments,
    syncStatus,
    error,
    isMigrated,
    isLoading: syncStatus === 'loading',
    isSyncing: syncStatus === 'syncing',
    isSynced: syncStatus === 'synced',
    hasError: syncStatus === 'error',
  };
};
