import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, upsertUserProfile, getCompanyById, createCompanyWithUser } from '@/lib/companyService';
import type { UserProfile, Company } from '@/types/multitenant';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  company: Company | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set persistence to LOCAL (survives browser restarts)
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Cargar perfil del usuario
          let profile = await getUserProfile(firebaseUser.uid);
          
          // Si no existe perfil O no tiene companyId, crear empresa automáticamente
          if (!profile || (!profile.companyId && profile.role !== 'super_admin')) {
            console.log('[AuthContext] Usuario sin perfil detectado, creando empresa automática...');
            
            // Crear empresa automática para el usuario
            const companyName = firebaseUser.displayName 
              ? `Empresa de ${firebaseUser.displayName}`
              : `Empresa de ${firebaseUser.email?.split('@')[0] || 'Usuario'}`;
            
            try {
              await createCompanyWithUser(firebaseUser.uid, {
                email: firebaseUser.email || '',
                companyName,
                nit: 'Por definir',
                phone: 'Por definir',
                economicActivity: 'Por definir',
                address: 'Por definir',
              });
              
              console.log('[AuthContext] Empresa creada exitosamente');
              profile = await getUserProfile(firebaseUser.uid);
            } catch (error) {
              console.error('[AuthContext] Error creando empresa automática:', error);
              // Fallback: crear perfil básico sin empresa (para super_admin)
              const userData: any = {
                email: firebaseUser.email || '',
                role: 'user',
              };
              
              if (firebaseUser.displayName) {
                userData.name = firebaseUser.displayName;
              }
              
              await upsertUserProfile(firebaseUser.uid, userData);
              profile = await getUserProfile(firebaseUser.uid);
            }
          }
          
          setUserProfile(profile);
          
          // Cargar empresa si el usuario tiene companyId
          if (profile?.companyId) {
            const companyData = await getCompanyById(profile.companyId);
            setCompany(companyData);
          } else {
            setCompany(null);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUserProfile(null);
          setCompany(null);
        }
      } else {
        setUserProfile(null);
        setCompany(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error(error.message || 'Error al cerrar sesión');
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, company, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
