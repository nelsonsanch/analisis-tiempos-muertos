import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  subscribeToCompanies, 
  approveCompany, 
  rejectCompany, 
  toggleCompanyStatus 
} from '@/lib/companyService';
import type { Company } from '@/../../shared/types';
import { toast } from 'sonner';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  User,
  Phone,
  Power,
  PowerOff
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { currentUser, signOut } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCompanies((companiesData) => {
      setCompanies(companiesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (companyId: string) => {
    try {
      await approveCompany(companyId, currentUser?.email || '');
      toast.success('Empresa aprobada exitosamente');
    } catch (error) {
      console.error('Error approving company:', error);
      toast.error('Error al aprobar la empresa');
    }
  };

  const handleReject = async (companyId: string) => {
    try {
      await rejectCompany(companyId);
      toast.success('Empresa rechazada');
    } catch (error) {
      console.error('Error rejecting company:', error);
      toast.error('Error al rechazar la empresa');
    }
  };

  const handleToggleStatus = async (companyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await toggleCompanyStatus(companyId, newStatus);
      toast.success(`Empresa ${newStatus === 'active' ? 'activada' : 'desactivada'}`);
    } catch (error) {
      console.error('Error toggling company status:', error);
      toast.error('Error al cambiar el estado de la empresa');
    }
  };

  const pendingCompanies = companies.filter(c => c.status === 'pending');
  const activeCompanies = companies.filter(c => c.status === 'active');
  const inactiveCompanies = companies.filter(c => c.status === 'inactive');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Panel de Super Admin</h1>
            <p className="text-muted-foreground">Gestión de empresas en MapTX</p>
          </div>
          <Button variant="outline" onClick={() => signOut()}>
            Cerrar Sesión
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Empresas Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activeCompanies.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes de Aprobación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{pendingCompanies.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Empresas Inactivas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{inactiveCompanies.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Empresas Pendientes */}
        {pendingCompanies.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Empresas Pendientes de Aprobación
              </CardTitle>
              <CardDescription>
                Revisa y aprueba las solicitudes de registro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingCompanies.map((company) => (
                <div key={company.id} className="border rounded-lg p-4 bg-amber-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {company.name}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        Pendiente
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(company.id!)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(company.id!)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{company.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{company.contactName}</span>
                    </div>
                    {company.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                    <div className="text-muted-foreground">
                      Registrada: {new Date(company.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empresas Activas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Empresas Activas
            </CardTitle>
            <CardDescription>
              Empresas con acceso completo al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCompanies.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay empresas activas
              </p>
            ) : (
              activeCompanies.map((company) => (
                <div key={company.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {company.name}
                      </h3>
                      <Badge variant="default" className="mt-1 bg-green-600">
                        Activa
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(company.id!, company.status)}
                    >
                      <PowerOff className="w-4 h-4 mr-1" />
                      Desactivar
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{company.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{company.contactName}</span>
                    </div>
                    {company.approvedAt && (
                      <div className="text-muted-foreground">
                        Aprobada: {new Date(company.approvedAt).toLocaleDateString()}
                      </div>
                    )}
                    {company.approvedBy && (
                      <div className="text-muted-foreground">
                        Por: {company.approvedBy}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Empresas Inactivas */}
        {inactiveCompanies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-gray-600" />
                Empresas Inactivas
              </CardTitle>
              <CardDescription>
                Empresas desactivadas o rechazadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inactiveCompanies.map((company) => (
                <div key={company.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {company.name}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        Inactiva
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(company.id!, company.status)}
                    >
                      <Power className="w-4 h-4 mr-1" />
                      Activar
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{company.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{company.contactName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
