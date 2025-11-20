import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Company, UserProfile, CompanyStatus } from '@/types/multitenant';

const COMPANIES_COLLECTION = 'companies';
const USERS_COLLECTION = 'users';

/**
 * Crear una nueva empresa
 */
export async function createCompany(data: {
  name: string;
  adminEmail: string;
  adminName?: string;
  createdBy: string;
}): Promise<string> {
  const companyRef = doc(collection(db, COMPANIES_COLLECTION));
  const companyId = companyRef.id;

  const company: Omit<Company, 'id'> = {
    name: data.name,
    status: 'active',
    createdAt: new Date().toISOString(),
    createdBy: data.createdBy,
    adminEmail: data.adminEmail,
    adminName: data.adminName,
  };

  await setDoc(companyRef, company);
  return companyId;
}

/**
 * Obtener todas las empresas (solo para super_admin)
 */
export async function getAllCompanies(): Promise<Company[]> {
  const companiesRef = collection(db, COMPANIES_COLLECTION);
  const snapshot = await getDocs(companiesRef);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Company));
}

/**
 * Obtener una empresa por ID
 */
export async function getCompanyById(companyId: string): Promise<Company | null> {
  const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
  const snapshot = await getDoc(companyRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return {
    id: snapshot.id,
    ...snapshot.data()
  } as Company;
}

/**
 * Actualizar estado de una empresa
 */
export async function updateCompanyStatus(
  companyId: string,
  status: CompanyStatus
): Promise<void> {
  const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
  await updateDoc(companyRef, { status });
}

/**
 * Crear o actualizar perfil de usuario
 */
export async function upsertUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(userRef);
  
  // Limpiar valores undefined
  const cleanData: any = {
    uid,
    email: data.email || '',
    role: data.role || 'user',
    updatedAt: new Date().toISOString(),
  };
  
  // Solo agregar campos opcionales si tienen valor
  if (data.name) cleanData.name = data.name;
  if (data.companyId) cleanData.companyId = data.companyId;
  
  if (snapshot.exists()) {
    // Actualizar usuario existente
    await updateDoc(userRef, cleanData);
  } else {
    // Crear nuevo usuario
    cleanData.createdAt = new Date().toISOString();
    await setDoc(userRef, cleanData);
  }
}

/**
 * Obtener perfil de usuario
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(userRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.data() as UserProfile;
}

/**
 * Obtener usuarios de una empresa
 */
export async function getCompanyUsers(companyId: string): Promise<UserProfile[]> {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where('companyId', '==', companyId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => doc.data() as UserProfile);
}

/**
 * Crear empresa y usuario durante el registro
 * La empresa se crea con estado "pending" hasta que el super admin la apruebe
 */
export async function createCompanyWithUser(
  uid: string,
  data: {
    email: string;
    companyName: string;
    nit: string;
    phone: string;
    economicActivity: string;
    address: string;
  }
): Promise<string> {
  // 1. Crear la empresa con estado "pending"
  const companyRef = doc(collection(db, COMPANIES_COLLECTION));
  const companyId = companyRef.id;

  const company: Omit<Company, 'id'> = {
    name: data.companyName,
    status: 'pending',
    createdAt: new Date().toISOString(),
    createdBy: uid,
    adminEmail: data.email,
    nit: data.nit,
    phone: data.phone,
    economicActivity: data.economicActivity,
    address: data.address,
  };

  await setDoc(companyRef, company);

  // 2. Crear el perfil de usuario asociado a la empresa
  await upsertUserProfile(uid, {
    uid,
    email: data.email,
    role: 'user',
    companyId,
  });

  // 3. TODO: Enviar notificación por email al super admin
  // Esto se implementará en la siguiente fase

  return companyId;
}
