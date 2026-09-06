import type { LabRole } from './types';

export type LabPermission =
  | 'dashboard.view'
  | 'requests.read'
  | 'requests.write'
  | 'requests.qualify'
  | 'suppliers.read'
  | 'suppliers.write'
  | 'consultations.write'
  | 'quotes.write'
  | 'quotes.validate'
  | 'samples.write'
  | 'results.review.technical'
  | 'results.review.final'
  | 'reports.write'
  | 'invoices.read'
  | 'invoices.write'
  | 'settings.write'
  | 'audit.read'
  | 'users.write'
  | 'portal.client'
  | 'regulatory.write'
  | 'calls.write';

const ROLE_PERMS: Record<LabRole, LabPermission[]> = {
  SUPER_ADMIN: [
    'dashboard.view', 'requests.read', 'requests.write', 'requests.qualify',
    'suppliers.read', 'suppliers.write', 'consultations.write', 'quotes.write',
    'quotes.validate', 'samples.write', 'results.review.technical', 'results.review.final',
    'reports.write', 'invoices.read', 'invoices.write', 'settings.write', 'audit.read', 'users.write',
    'regulatory.write', 'calls.write',
  ],
  DIRECTION: [
    'dashboard.view', 'requests.read', 'requests.write', 'requests.qualify',
    'suppliers.read', 'suppliers.write', 'consultations.write', 'quotes.write',
    'quotes.validate', 'samples.write', 'results.review.final', 'reports.write',
    'invoices.read', 'invoices.write', 'settings.write', 'audit.read', 'users.write',
    'regulatory.write', 'calls.write',
  ],
  RESPONSABLE_VALIDATION: [
    'dashboard.view', 'requests.read', 'requests.write', 'requests.qualify',
    'suppliers.read', 'consultations.write', 'quotes.write', 'quotes.validate',
    'samples.write', 'results.review.final', 'reports.write', 'invoices.read',
    'regulatory.write', 'calls.write',
  ],
  RESPONSABLE_TECHNIQUE: [
    'dashboard.view', 'requests.read', 'requests.qualify', 'suppliers.read',
    'samples.write', 'results.review.technical', 'reports.write',
  ],
  ASSISTANTE: [
    'dashboard.view', 'requests.read', 'requests.write', 'suppliers.read',
    'consultations.write', 'quotes.write', 'samples.write', 'calls.write',
  ],
  TECHNICIEN: ['dashboard.view', 'requests.read', 'samples.write'],
  FINANCE: ['dashboard.view', 'requests.read', 'invoices.read', 'invoices.write'],
  UTILISATEUR_STANDARD: ['dashboard.view', 'requests.read'],
  CLIENT: ['portal.client', 'requests.read', 'invoices.read'],
};

export function can(role: LabRole | null | undefined, permission: LabPermission): boolean {
  if (!role) return false;
  return ROLE_PERMS[role]?.includes(permission) ?? false;
}

export function isAdminRole(role: LabRole | null | undefined): boolean {
  return !!role && role !== 'CLIENT';
}
