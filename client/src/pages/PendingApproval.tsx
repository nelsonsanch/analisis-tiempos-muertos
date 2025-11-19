import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Mail } from 'lucide-react';

export default function PendingApproval() {
  const { signOut, company } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Pendiente de Aprobación</CardTitle>
          <CardDescription>
            Tu empresa está siendo revisada por nuestro equipo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2">
              {company?.name}
            </h3>
            <p className="text-sm text-amber-700">
              Hemos recibido tu solicitud de registro. Nuestro equipo la revisará pronto y te notificaremos por email cuando tu cuenta esté activa.
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Recibirás un correo electrónico en <strong>{company?.email}</strong> cuando tu empresa sea aprobada.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              ¿Necesitas ayuda? Contacta a soporte:
            </p>
            <p className="text-sm font-medium">
              📧 soporte@tegnologic.com
            </p>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => signOut()}
          >
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
