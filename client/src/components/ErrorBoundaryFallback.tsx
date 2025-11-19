import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export default function ErrorBoundaryFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
  const isFirebaseError = error.message.includes('Firebase') || error.message.includes('auth/');
  const isNetworkError = error.message.includes('network') || error.message.includes('fetch');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Se ha producido un error</CardTitle>
              <CardDescription>
                {isFirebaseError && "Error de conexión con Firebase"}
                {isNetworkError && "Error de conexión a internet"}
                {!isFirebaseError && !isNetworkError && "Error inesperado en la aplicación"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mensaje específico según el tipo de error */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            {isFirebaseError && (
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Problema de configuración de Firebase</p>
                <p className="text-sm text-slate-600">
                  La aplicación no puede conectarse a Firebase. Esto puede deberse a:
                </p>
                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1 ml-2">
                  <li>Variables de entorno no configuradas correctamente</li>
                  <li>Dominio no autorizado en Firebase Console</li>
                  <li>Credenciales de Firebase inválidas</li>
                </ul>
              </div>
            )}
            
            {isNetworkError && (
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Problema de conexión</p>
                <p className="text-sm text-slate-600">
                  No se pudo establecer conexión con los servicios. Verifica tu conexión a internet.
                </p>
              </div>
            )}
            
            {!isFirebaseError && !isNetworkError && (
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Error técnico</p>
                <p className="text-sm text-slate-600">
                  {error.message || "Ha ocurrido un error inesperado"}
                </p>
              </div>
            )}
          </div>

          {/* Detalles técnicos (colapsable) */}
          <details className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <summary className="cursor-pointer font-semibold text-slate-900 text-sm">
              Ver detalles técnicos
            </summary>
            <pre className="mt-3 text-xs text-slate-600 overflow-x-auto p-3 bg-white rounded border border-slate-200">
              {error.stack || error.message}
            </pre>
          </details>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="flex-1"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recargar página
            </Button>
            
            {resetErrorBoundary && (
              <Button 
                onClick={resetErrorBoundary} 
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            )}
          </div>

          {/* Información de ayuda */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              ¿Necesitas ayuda?
            </p>
            <p className="text-sm text-blue-700">
              Si el problema persiste, contacta al administrador del sistema o abre un issue en el repositorio de GitHub.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
