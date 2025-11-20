import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, userProfile, company, loading } = useAuth();
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

  // Super admin siempre puede acceder
  if (userProfile?.role === 'super_admin') {
    return <>{children}</>;
  }

  // Verificar estado de la empresa
  if (company) {
    if (company.status === 'pending') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Cuenta Pendiente de Aprobación</CardTitle>
              <CardDescription className="text-base mt-2">
                Su solicitud de registro está siendo revisada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Su cuenta está <strong>pendiente de aprobación</strong> por el administrador.
                  Recibirá un correo electrónico cuando su cuenta sea activada.
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Empresa:</strong> {company.name}</p>
                <p><strong>Email:</strong> {userProfile?.email}</p>
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  window.location.href = '/login';
                }}
              >
                Cerrar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (company.status === 'inactive') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Cuenta Desactivada</CardTitle>
              <CardDescription className="text-base mt-2">
                Su cuenta ha sido desactivada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Su cuenta ha sido <strong>desactivada</strong> por el administrador.
                  Por favor contacte al soporte para más información.
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Empresa:</strong> {company.name}</p>
                <p><strong>Email:</strong> {userProfile?.email}</p>
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  window.location.href = '/login';
                }}
              >
                Cerrar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}
