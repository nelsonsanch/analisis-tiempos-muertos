import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { registerCompany } from '@/lib/companyService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Building2, Mail, User, Phone } from 'lucide-react';

export default function CompanyRegistration() {
  const [, setLocation] = useLocation();
  const { createAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'company' | 'user'>('company');
  const [companyId, setCompanyId] = useState<string>('');
  
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    contactName: '',
    phone: ''
  });

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyData.name || !companyData.email || !companyData.contactName) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      const id = await registerCompany(companyData);
      setCompanyId(id);
      setStep('user');
      toast.success('Empresa registrada. Ahora crea tu cuenta de usuario.');
    } catch (error: any) {
      console.error('Error registering company:', error);
      toast.error('Error al registrar la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData.name || !userData.email || !userData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (userData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await createAccount(userData.email, userData.password, userData.name, companyId);
      toast.success('Cuenta creada exitosamente');
      setLocation('/pending-approval');
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Registro en MapTX</CardTitle>
          <CardDescription>
            {step === 'company' 
              ? 'Paso 1: Registra tu empresa'
              : 'Paso 2: Crea tu cuenta de usuario'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'company' ? (
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  <Building2 className="inline w-4 h-4 mr-2" />
                  Nombre de la Empresa *
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Ej: Acme Corp"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email Corporativo *
                </Label>
                <Input
                  id="companyEmail"
                  type="email"
                  placeholder="contacto@empresa.com"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactName">
                  <User className="inline w-4 h-4 mr-2" />
                  Nombre del Contacto *
                </Label>
                <Input
                  id="contactName"
                  type="text"
                  placeholder="Juan Pérez"
                  value={companyData.contactName}
                  onChange={(e) => setCompanyData({ ...companyData, contactName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Teléfono (opcional)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registrando...' : 'Continuar'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setLocation('/login')}
                  className="text-primary hover:underline"
                >
                  Inicia sesión
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">
                  <User className="inline w-4 h-4 mr-2" />
                  Tu Nombre *
                </Label>
                <Input
                  id="userName"
                  type="text"
                  placeholder="Juan Pérez"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Tu Email *
                </Label>
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={userData.confirmPassword}
                  onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setStep('company')}
                  className="text-primary hover:underline"
                >
                  ← Volver
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
