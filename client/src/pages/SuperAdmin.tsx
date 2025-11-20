import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, Plus, Loader2, CheckCircle2, XCircle, Clock, LogOut, User, ChevronDown, Home } from 'lucide-react';
import { toast } from 'sonner';
import { getAllCompanies, createCompany, updateCompanyStatus } from '@/lib/companyService';
import type { Company, CompanyStatus } from '@/types/multitenant';

export default function SuperAdmin() {
  const { userProfile, signOut } = useAuth();
  
  // Protección de ruta: solo super_admin puede acceder
  useEffect(() => {
    if (userProfile && userProfile.role !== 'super_admin') {
      window.location.href = '/';
    }
  }, [userProfile]);
  
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [companyName, setCompanyName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getAllCompanies();
      setCompanies(data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim() || !adminEmail.trim()) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    if (!userProfile?.uid) {
      toast.error('No se pudo identificar el usuario');
      return;
    }

    setCreating(true);
    try {
      await createCompany({
        name: companyName.trim(),
        adminEmail: adminEmail.trim(),
        adminName: adminName.trim() || undefined,
        createdBy: userProfile.uid,
      });
      
      toast.success('Empresa creada exitosamente');
      setShowCreateDialog(false);
      setCompanyName('');
      setAdminEmail('');
      setAdminName('');
      loadCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Error al crear empresa');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (companyId: string, currentStatus: CompanyStatus) => {
    let newStatus: CompanyStatus;
    
    if (currentStatus === 'pending') {
      newStatus = 'active';
    } else if (currentStatus === 'active') {
      newStatus = 'inactive';
    } else {
      newStatus = 'active';
    }
    
    try {
      await updateCompanyStatus(companyId, newStatus);
      
      if (newStatus === 'active' && currentStatus === 'pending') {
        toast.success('Empresa activada. El cliente puede iniciar sesión.');
        // TODO: Enviar email de notificación al cliente
      } else {
        toast.success(`Empresa ${newStatus === 'active' ? 'activada' : 'desactivada'}`);
      }
      
      loadCompanies();
    } catch (error) {
      console.error('Error updating company status:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const getStatusBadge = (status: CompanyStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Activa</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Inactiva</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
    }
  };

  if (userProfile?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>No tienes permisos para acceder a esta sección</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              Panel de Super Administrador
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestiona todas las empresas y sus configuraciones
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowCreateDialog(true)} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Empresa
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline max-w-[150px] truncate">
                    {userProfile?.email}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Super Administrador</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {userProfile?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/'}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Ir a Página Principal</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : companies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay empresas registradas</h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando tu primera empresa cliente
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Empresa
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{company.name}</CardTitle>
                    {getStatusBadge(company.status)}
                  </div>
                  <CardDescription>
                    {company.adminEmail && (
                      <div className="mt-2">
                        <strong>Admin:</strong> {company.adminName || company.adminEmail}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    {company.nit && (
                      <div>
                        <strong>NIT:</strong> {company.nit}
                      </div>
                    )}
                    {company.phone && (
                      <div>
                        <strong>Teléfono:</strong> {company.phone}
                      </div>
                    )}
                    {company.economicActivity && (
                      <div>
                        <strong>Actividad:</strong> {company.economicActivity}
                      </div>
                    )}
                    {company.address && (
                      <div>
                        <strong>Dirección:</strong> {company.address}
                      </div>
                    )}
                    <div>
                      <strong>Creada:</strong> {new Date(company.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  <Button
                    variant={company.status === 'pending' ? 'default' : company.status === 'active' ? 'outline' : 'default'}
                    className={company.status === 'pending' ? 'w-full bg-green-600 hover:bg-green-700' : 'w-full'}
                    onClick={() => handleToggleStatus(company.id, company.status)}
                  >
                    {company.status === 'pending' && '✅ Activar Empresa'}
                    {company.status === 'active' && '❌ Desactivar'}
                    {company.status === 'inactive' && '✅ Reactivar'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para crear empresa */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Empresa</DialogTitle>
              <DialogDescription>
                Registra una nueva empresa cliente en el sistema
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCompany}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                  <Input
                    id="companyName"
                    placeholder="Ej: Acme Corporation"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={creating}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email del Administrador *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@empresa.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled={creating}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminName">Nombre del Administrador</Label>
                  <Input
                    id="adminName"
                    placeholder="Juan Pérez"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    disabled={creating}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Empresa'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
