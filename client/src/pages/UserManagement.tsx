import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, UserPlus, Trash2, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagement() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Solo el usuario administrador puede acceder
  const isAdmin = user?.email === 'hsesupergas@gmail.com';

  useEffect(() => {
    if (!isAdmin) {
      toast.error('No tienes permisos para acceder a esta página');
      setLocation('/');
    }
  }, [isAdmin, setLocation]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserEmail || !newUserPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (newUserPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      // Obtener token del usuario actual
      const token = await user?.getIdToken();
      
      // Llamar al endpoint de backend para crear usuario
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear usuario');
      }

      toast.success(`Usuario ${newUserEmail} creado exitosamente`);
      setNewUserEmail('');
      setNewUserPassword('');
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="container max-w-2xl mx-auto py-8">
        <Button
          variant="outline"
          onClick={() => setLocation('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <CardTitle>Administración de Usuarios</CardTitle>
            </div>
            <CardDescription>
              Autoriza nuevos usuarios para acceder a la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico del Nuevo Usuario</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña Temporal</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                />
                <p className="text-sm text-muted-foreground">
                  El usuario podrá cambiar su contraseña después de iniciar sesión
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando usuario...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Usuario
                  </>
                )}
              </Button>
            </form>

            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-2">Instrucciones:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Ingresa el correo electrónico del nuevo usuario</li>
                <li>Crea una contraseña temporal (mínimo 6 caracteres)</li>
                <li>Comparte las credenciales con el usuario de forma segura</li>
                <li>El usuario podrá iniciar sesión con estas credenciales</li>
              </ol>
            </div>

            <div className="pt-4 border-t bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                ⚠️ Nota de Seguridad
              </p>
              <p className="text-sm text-blue-700">
                Solo el administrador (hsesupergas@gmail.com) puede crear nuevos usuarios. 
                Asegúrate de compartir las credenciales de forma segura y recomienda a los 
                usuarios cambiar su contraseña después del primer inicio de sesión.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
