/**
 * Tipos para sistema multi-tenant
 */

export type CompanyStatus = 'pending' | 'active' | 'inactive';
export type UserRole = 'super_admin' | 'company_admin';

export interface Company {
  id?: string;
  name: string;
  email: string;
  contactName: string;
  phone?: string;
  status: CompanyStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string; // Email del super admin que aprobó
  updatedAt?: string;
}

export interface AppUser {
  id?: string;
  uid: string; // Firebase Auth UID
  email: string;
  name: string;
  companyId: string; // ID de la empresa a la que pertenece
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  companyStatus?: CompanyStatus;
}
