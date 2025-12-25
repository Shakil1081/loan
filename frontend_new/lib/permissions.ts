import { User } from './types';

/**
 * Check if user has a specific permission
 * Works like Laravel's @can directive
 */
export function can(user: User | null, permission: string): boolean {
  if (!user) return false;
  
  // Super Admin has all permissions
  if (user.roles?.some(role => role.name === 'Super Admin')) {
    return true;
  }
  
  // Check in all_permissions array sent from backend
  return user.all_permissions?.includes(permission) || false;
}

/**
 * Check if user has any of the specified permissions
 */
export function canAny(user: User | null, permissions: string[]): boolean {
  if (!user) return false;
  return permissions.some(permission => can(user, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function canAll(user: User | null, permissions: string[]): boolean {
  if (!user) return false;
  return permissions.every(permission => can(user, permission));
}
