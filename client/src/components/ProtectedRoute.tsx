import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/../../shared/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, currentUser, company, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      // No autenticado → Login
      if (!user || !currentUser) {
        setLocation('/login');
        return;
      }

      // Super admin siempre tiene acceso
      if (currentUser.role === 'super_admin') {
        // Si está en raíz, redirigir a panel de super admin
        if (location === '/') {
          setLocation('/super-admin');
        }
        return;
      }

      // Verificar rol requerido
      if (requiredRole && currentUser.role !== requiredRole) {
        setLocation('/');
        return;
      }

      // Verificar estado de la empresa
      if (company?.status === 'pending') {
        setLocation('/pending-approval');
        return;
      }

      if (company?.status === 'inactive') {
        setLocation('/login');
        return;
      }

      // Empresa activa pero está en pending-approval → redirigir a home
      if (company?.status === 'active' && location === '/pending-approval') {
        setLocation('/');
      }
    }
  }, [user, currentUser, company, loading, setLocation, location, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user || !currentUser) {
    return null;
  }

  // Verificar rol si es requerido
  if (requiredRole && currentUser.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
