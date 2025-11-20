import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createCompanyWithUser } from '@/lib/companyService';
import { APP_TITLE } from '@/const';

export default function Register() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [nit, setNit] = useState('');
  const [phone, setPhone] = useState('');
  const [economicActivity, setEconomicActivity] = useState('');
  const [address, setAddress] = useState('');

  // Validación de contraseña
  const [passwordValidation, setPasswordValidation] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasSpecialChar: false,
    minLength: false,
  });

  const validatePassword = (pwd: string) => {
    setPasswordValidation({
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      minLength: pwd.length >= 8,
    });
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validatePassword(value);
  };

  const isPasswordValid = () => {
    return (
      passwordValidation.hasUpperCase &&
      passwordValidation.hasLowerCase &&
      passwordValidation.hasSpecialChar &&
      passwordValidation.minLength
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!email || !password || !confirmPassword || !companyName || !nit || !phone || !economicActivity || !address) {
      setError('Por favor complete todos los campos');
      return;
    }

    if (!isPasswordValid()) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      // 1. Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Crear empresa y perfil de usuario en Firestore
      await createCompanyWithUser(user.uid, {
        email,
        companyName,
        nit,
        phone,
        economicActivity,
        address,
      });

      setSuccess(true);
      
      // Cerrar sesión automáticamente (Firebase autentica al crear usuario)
      await auth.signOut();
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err: any) {
      console.error('Error during registration:', err);
      
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado');
      } else if (err.code === 'auth/invalid-email') {
        setError('Correo electrónico inválido');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil');
      } else {
        setError(err.message || 'Error al registrar la empresa. Por favor intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡Registro Exitoso!</CardTitle>
            <CardDescription className="text-base mt-2">
              Su solicitud de registro ha sido enviada correctamente
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
            <p className="text-sm text-muted-foreground text-center">
              Redirigiendo al inicio de sesión...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{APP_TITLE}</CardTitle>
          <CardDescription>Registro de Nueva Empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Información de Acceso */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-lg">Información de Acceso</h3>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  disabled={loading}
                />
                <div className="text-xs space-y-1 mt-2">
                  <div className={passwordValidation.minLength ? 'text-green-600' : 'text-muted-foreground'}>
                    {passwordValidation.minLength ? '✓' : '○'} Mínimo 8 caracteres
                  </div>
                  <div className={passwordValidation.hasUpperCase ? 'text-green-600' : 'text-muted-foreground'}>
                    {passwordValidation.hasUpperCase ? '✓' : '○'} Al menos una mayúscula
                  </div>
                  <div className={passwordValidation.hasLowerCase ? 'text-green-600' : 'text-muted-foreground'}>
                    {passwordValidation.hasLowerCase ? '✓' : '○'} Al menos una minúscula
                  </div>
                  <div className={passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-muted-foreground'}>
                    {passwordValidation.hasSpecialChar ? '✓' : '○'} Al menos un carácter especial (!@#$%^&*...)
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Información de la Empresa */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información de la Empresa</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Empresa S.A.S."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nit">NIT *</Label>
                  <Input
                    id="nit"
                    type="text"
                    placeholder="123456789-0"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono de Contacto *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="economicActivity">Actividad Económica *</Label>
                  <Input
                    id="economicActivity"
                    type="text"
                    placeholder="Comercio, Servicios, Manufactura..."
                    value={economicActivity}
                    onChange={(e) => setEconomicActivity(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Calle 123 #45-67, Ciudad"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button type="submit" className="w-full" disabled={loading || !isPasswordValid()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Empresa'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setLocation('/login')}
                disabled={loading}
              >
                Volver al Inicio de Sesión
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
