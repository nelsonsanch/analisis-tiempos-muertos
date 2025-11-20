import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [user, loading]);

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-muted-foreground">Redirigiendo a login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
