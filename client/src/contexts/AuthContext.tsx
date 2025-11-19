import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserByUid, createUser, getCompanyById } from '@/lib/companyService';
import type { AuthUser, AppUser, Company } from '@/../../shared/types';

interface AuthContextType {
  user: FirebaseUser | null; // Mantener compatibilidad con código existente
  currentUser: AuthUser | null;
  company: Company | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createAccount: (email: string, password: string, name: string, companyId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set persistence to LOCAL (survives browser restarts)
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Obtener datos del usuario desde Firestore
          const appUser = await getUserByUid(firebaseUser.uid);
          
          if (appUser) {
            // Obtener datos de la empresa
            const companyData = await getCompanyById(appUser.companyId);
            
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: appUser.name,
              role: appUser.role,
              companyId: appUser.companyId,
              companyStatus: companyData?.status
            });
            
            setCompany(companyData);
          } else {
            // Usuario no tiene datos en Firestore (caso raro)
            setCurrentUser(null);
            setCompany(null);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setCurrentUser(null);
          setCompany(null);
        }
      } else {
        setCurrentUser(null);
        setCompany(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const appUser = await getUserByUid(userCredential.user.uid);
      
      if (!appUser) {
        throw new Error('Usuario no encontrado en el sistema');
      }

      // Verificar estado de la empresa (solo si no es super admin)
      if (appUser.role !== 'super_admin') {
        const companyData = await getCompanyById(appUser.companyId);
        
        if (!companyData) {
          throw new Error('Empresa no encontrada');
        }

        if (companyData.status === 'pending') {
          await firebaseSignOut(auth);
          throw new Error('Tu empresa está pendiente de aprobación');
        }

        if (companyData.status === 'inactive') {
          await firebaseSignOut(auth);
          throw new Error('Tu empresa ha sido desactivada. Contacta al administrador.');
        }
      }

      // Login exitoso - el estado se actualiza automáticamente por onAuthStateChanged
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setCurrentUser(null);
      setCompany(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error(error.message || 'Error al cerrar sesión');
    }
  };

  const createAccount = async (email: string, password: string, name: string, companyId: string) => {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Crear usuario en Firestore
      await createUser({
        uid: userCredential.user.uid,
        email,
        name,
        companyId,
        role: 'company_admin'
      });

      // El estado se actualiza automáticamente por onAuthStateChanged
    } catch (error: any) {
      console.error('Error creating account:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user, // Mantener compatibilidad
    currentUser,
    company,
    loading,
    signIn,
    signOut,
    createAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
