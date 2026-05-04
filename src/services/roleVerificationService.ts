/**
 * Role Verification Service
 *
 * SECURITY: This service provides backend verification of user roles
 * to prevent privilege escalation attacks via localStorage manipulation.
 *
 * CRITICAL: Always verify roles on the server-side for sensitive operations.
 */

import { supabase } from '../lib/supabase';
import type { User } from '../types';

export interface RoleVerificationResult {
  isValid: boolean;
  actualRole: User['type'] | null;
  actualStatus: User['status'] | null;
  error?: string;
}

export class RoleVerificationService {
  /**
   * Verify user's role against Supabase database
   * This provides server-side validation to prevent localStorage tampering
   *
   * @param userId - User ID to verify
   * @param expectedRole - Role claimed by the client
   * @param allowPendingPayment - Allow pending_payment status (for payment pages)
   * @returns Verification result with actual role from database
   */
  static async verifyUserRole(
    userId: string,
    expectedRole?: User['type'],
    allowPendingPayment: boolean = false
  ): Promise<RoleVerificationResult> {
    try {
      // SECURITY: Query Supabase directly to get user's actual role
      // This bypasses any client-side state that could be manipulated
      const { data, error } = await supabase
        .from('users')
        .select('type, status')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[RoleVerification] Database query failed:', error);
        return {
          isValid: false,
          actualRole: null,
          actualStatus: null,
          error: 'Failed to verify user role'
        };
      }

      if (!data) {
        return {
          isValid: false,
          actualRole: null,
          actualStatus: null,
          error: 'User not found'
        };
      }

      // If no expected role provided, just return the actual role
      if (!expectedRole) {
        return {
          isValid: true,
          actualRole: data.type,
          actualStatus: data.status
        };
      }

      // SECURITY: Verify claimed role matches database
      const rolesMatch = data.type === expectedRole;

      if (!rolesMatch) {
        console.warn(
          `[RoleVerification] SECURITY ALERT: Role mismatch detected!`,
          `User ${userId} claims role "${expectedRole}" but database shows "${data.type}"`
        );
      }

      // Allow active users OR pending_payment users if explicitly allowed
      const validStatus = data.status === 'active' ||
                         (data.status === 'pending_payment' && allowPendingPayment);

      return {
        isValid: rolesMatch && validStatus,
        actualRole: data.type,
        actualStatus: data.status,
        error: rolesMatch ? undefined : 'Role mismatch detected'
      };
    } catch (error) {
      console.error('[RoleVerification] Unexpected error:', error);
      return {
        isValid: false,
        actualRole: null,
        actualStatus: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify current session and role
   * Checks both JWT token validity and role authorization
   *
   * @param requiredRole - Required role for the operation
   * @returns Verification result
   */
  static async verifyCurrentSession(
    requiredRole?: User['type']
  ): Promise<RoleVerificationResult> {
    try {
      // SECURITY: Get current session from Supabase (validates JWT)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        return {
          isValid: false,
          actualRole: null,
          actualStatus: null,
          error: 'No valid session'
        };
      }

      // Verify role against database
      return await this.verifyUserRole(session.user.id, requiredRole);
    } catch (error) {
      console.error('[RoleVerification] Session verification failed:', error);
      return {
        isValid: false,
        actualRole: null,
        actualStatus: null,
        error: error instanceof Error ? error.message : 'Session verification failed'
      };
    }
  }

  /**
   * Verify multiple roles (any of them is valid)
   *
   * @param userId - User ID to verify
   * @param allowedRoles - Array of allowed roles
   * @returns True if user has any of the allowed roles
   */
  static async verifyUserHasAnyRole(
    userId: string,
    allowedRoles: User['type'][]
  ): Promise<RoleVerificationResult> {
    const result = await this.verifyUserRole(userId);

    if (!result.isValid || !result.actualRole) {
      return result;
    }

    const hasAllowedRole = allowedRoles.includes(result.actualRole);

    return {
      ...result,
      isValid: hasAllowedRole && result.actualStatus === 'active',
      error: hasAllowedRole ? undefined : 'User does not have required role'
    };
  }

  /**
   * Check if user is admin
   * Convenience method for admin-only operations
   *
   * @param userId - User ID to check
   * @returns True if user is admin with active status
   */
  static async isAdmin(userId: string): Promise<boolean> {
    const result = await this.verifyUserRole(userId, 'admin');
    return result.isValid;
  }

  /**
   * Audit log for failed role verification attempts
   * SECURITY: Log suspicious activity for monitoring
   *
   * @param userId - User ID that failed verification
   * @param attemptedRole - Role they attempted to access
   * @param actualRole - Their actual role
   */
  private static async logFailedVerification(
    userId: string,
    attemptedRole: string,
    actualRole: string | null
  ): Promise<void> {
    try {
      // Log to admin_logs table for security monitoring
      await supabase.from('admin_logs').insert({
        admin_user: userId,
        action_type: 'security',
        description: `Failed role verification: attempted ${attemptedRole}, actual ${actualRole}`,
        severity: 'warning',
        metadata: {
          attempted_role: attemptedRole,
          actual_role: actualRole,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[RoleVerification] Failed to log security event:', error);
    }
  }
}

export default RoleVerificationService;
