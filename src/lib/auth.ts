import type { PublicMetadata, UserRole } from '@/types';

export const resolveRoles = (metadata?: PublicMetadata | null): UserRole[] => {
  if (!metadata) {
    return [];
  }

  const explicitRoles = Array.isArray(metadata.roles)
    ? (metadata.roles.filter(Boolean) as UserRole[])
    : [];

  if (metadata.role && !explicitRoles.includes(metadata.role)) {
    explicitRoles.unshift(metadata.role);
  }

  return [...new Set(explicitRoles)];
};

export const getPrimaryRole = (roles: UserRole[]): UserRole | null => {
  if (!roles.length) {
    return null;
  }

  if (roles.includes('admin')) {
    return 'admin';
  }

  if (roles.includes('employee')) {
    return 'employee';
  }

  return roles[0];
};

export const hasRequiredRole = (roles: UserRole[], allowed: UserRole[]): boolean => {
  if (!roles.length) {
    return false;
  }

  return roles.some((role) => allowed.includes(role));
};

export const roleToPortalPath: Record<UserRole, string> = {
  admin: '/admin',
  employee: '/employee',
  client: '/client'
};

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  employee: 'Employee',
  client: 'Client'
};
