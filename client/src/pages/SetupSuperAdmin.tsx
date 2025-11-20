import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export default function SetupSuperAdmin() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSetup = async () => {
    const user = auth.currentUser;
    
    if (!user) {
      toast.error('Debes estar autenticado');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: 'Nelson Sanchez',
        role: 'super_admin',
        createdAt: new Date().toISOString(),
      }, { merge: false }); // merge: false para sobrescribir completamente
      
      toast.success('¡Usuario configurado como super_admin!');
      setDone(true);
      
      // Recargar después de 2 segundos
      setTimeout(() => {
        window.location.href = '/super-admin';
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al configurar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configurar Super Admin</CardTitle>
          <CardDescription>
            Haz clic en el botón para configurar tu usuario como super administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">¡Configuración exitosa!</p>
              <p className="text-muted-foreground">Redirigiendo al panel de super admin...</p>
            </div>
          ) : (
            <Button 
              onClick={handleSetup} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Configurando...
                </>
              ) : (
                'Configurar como Super Admin'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
