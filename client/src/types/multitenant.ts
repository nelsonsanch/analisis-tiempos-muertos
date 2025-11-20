/**
 * Tipos para sistema multi-tenant
 */

export type UserRole = 'super_admin' | 'company_admin' | 'user';

export type CompanyStatus = 'active' | 'inactive' | 'pending';

export interface Company {
  id: string;
  name: string;
  status: CompanyStatus;
  createdAt: string;
  createdBy: string;
  adminEmail?: string;
  adminName?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  role: UserRole;
  companyId?: string; // undefined para super_admin
  createdAt: string;
}
