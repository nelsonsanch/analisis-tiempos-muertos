import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Company, AppUser } from '@/../../shared/types';

const COMPANIES_COLLECTION = 'companies';
const USERS_COLLECTION = 'users';

/**
 * Registrar una nueva empresa (auto-registro)
 */
export const registerCompany = async (companyData: Omit<Company, 'id' | 'status' | 'createdAt'>): Promise<string> => {
  try {
    const company: Omit<Company, 'id'> = {
      ...companyData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), company);
    return docRef.id;
  } catch (error) {
    console.error('Error registering company:', error);
    throw error;
  }
};

/**
 * Aprobar una empresa
 */
export const approveCompany = async (companyId: string, approvedBy: string): Promise<void> => {
  try {
    const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
    await updateDoc(companyRef, {
      status: 'active',
      approvedAt: new Date().toISOString(),
      approvedBy,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error approving company:', error);
    throw error;
  }
};

/**
 * Rechazar una empresa
 */
export const rejectCompany = async (companyId: string): Promise<void> => {
  try {
    const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
    await updateDoc(companyRef, {
      status: 'inactive',
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error rejecting company:', error);
    throw error;
  }
};

/**
 * Activar/Desactivar una empresa
 */
export const toggleCompanyStatus = async (companyId: string, status: 'active' | 'inactive'): Promise<void> => {
  try {
    const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
    await updateDoc(companyRef, {
      status,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error toggling company status:', error);
    throw error;
  }
};

/**
 * Obtener todas las empresas
 */
export const getAllCompanies = async (): Promise<Company[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, COMPANIES_COLLECTION), orderBy('createdAt', 'desc'))
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Company));
  } catch (error) {
    console.error('Error getting companies:', error);
    throw error;
  }
};

/**
 * Suscribirse a cambios en empresas
 */
export const subscribeToCompanies = (callback: (companies: Company[]) => void) => {
  const q = query(collection(db, COMPANIES_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const companies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Company));
    
    callback(companies);
  });
};

/**
 * Obtener empresas pendientes
 */
export const getPendingCompanies = async (): Promise<Company[]> => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, COMPANIES_COLLECTION),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      )
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Company));
  } catch (error) {
    console.error('Error getting pending companies:', error);
    throw error;
  }
};

/**
 * Crear usuario en Firestore (después de crear en Firebase Auth)
 */
export const createUser = async (userData: Omit<AppUser, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const user: Omit<AppUser, 'id'> = {
      ...userData,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, USERS_COLLECTION), user);
    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Obtener usuario por UID de Firebase Auth
 */
export const getUserByUid = async (uid: string): Promise<AppUser | null> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, USERS_COLLECTION), where('uid', '==', uid))
    );
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as AppUser;
  } catch (error) {
    console.error('Error getting user by UID:', error);
    throw error;
  }
};

/**
 * Obtener empresa por ID
 */
export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, COMPANIES_COLLECTION), where('__name__', '==', companyId))
    );
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Company;
  } catch (error) {
    console.error('Error getting company by ID:', error);
    throw error;
  }
};
