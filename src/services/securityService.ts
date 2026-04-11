/**
 * 🔐 Security Service - Server-side Validation via RPC Functions
 * 
 * This service calls Supabase RPC functions to validate operations
 * on the server-side, preventing client-side bypass attacks.
 * 
 * Functions:
 * - validateAppointmentQuota: Check user's remaining quota
 * - canCreateTimeSlot: Verify user role permission
 * - validateAppointmentUpdate: Check status transition validity
 * - checkPaymentStatus: Get exhibitor payment info
 * - createAppointmentAtomic: Create appointment with atomic quota check
 */

import { supabase } from '@/lib/supabase';

export interface ValidationResult {
  isValid: boolean;
  message: string;
  [key: string]: any;
}

export interface AppointmentValidationResult extends ValidationResult {
  currentCount?: number;
  allowedQuota?: number;
}

export interface TimeSlotPermissionResult extends ValidationResult {
  userType?: string;
}

export interface AppointmentCreationResult extends ValidationResult {
  appointmentId?: string;
  errorMessage?: string;
}

export const SecurityService = {
  /**
   * Validate if user has remaining appointment quota
   * @param userId The user ID to check
   * @param visitorLevel The visitor level ('free', 'premium', 'vip')
   * @returns Validation result with current count and allowed quota
   */
  async validateAppointmentQuota(
    userId: string,
    visitorLevel: string = 'free'
  ): Promise<AppointmentValidationResult> {
    if (!supabase) {
      return {
        isValid: false,
        message: 'Database not available',
      };
    }

    try {
      const { data, error } = await supabase.rpc(
        'validate_appointment_quota',
        {
          p_user_id: userId,
          p_visitor_level: visitorLevel,
        }
      );

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          isValid: false,
          message: 'Validation failed',
        };
      }

      const result = data[0];
      return {
        isValid: result.is_valid,
        message: result.message,
        currentCount: result.current_count,
        allowedQuota: result.allowed_quota,
      };
    } catch (error) {
      console.error('❌ Quota validation error:', error);
      return {
        isValid: false,
        message: 'Server validation error',
      };
    }
  },

  /**
   * Check if user can create time slots
   * Only exhibitors and partners are allowed
   * @param userId The user ID to check
   * @returns Permission result with user type and reason
   */
  async canCreateTimeSlot(userId: string): Promise<TimeSlotPermissionResult> {
    if (!supabase) {
      return {
        isValid: false,
        message: 'Database not available',
      };
    }

    try {
      const { data, error } = await supabase.rpc(
        'can_create_time_slot',
        {
          p_user_id: userId,
        }
      );

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          isValid: false,
          message: 'Permission check failed',
        };
      }

      const result = data[0];
      return {
        isValid: result.is_allowed,
        message: result.reason,
        userType: result.user_type,
      };
    } catch (error) {
      console.error('❌ Permission check error:', error);
      return {
        isValid: false,
        message: 'Server permission check failed',
      };
    }
  },

  /**
   * Validate appointment status update
   * Ensures only authorized users can change status
   * and validates the status transition
   * @param appointmentId The appointment to update
   * @param newStatus The new status ('confirmed', 'rejected', 'cancelled')
   * @param actorId The user making the change
   * @returns Validation result with appointment record
   */
  async validateAppointmentUpdate(
    appointmentId: string,
    newStatus: string,
    actorId: string
  ): Promise<ValidationResult> {
    if (!supabase) {
      return {
        isValid: false,
        message: 'Database not available',
      };
    }

    try {
      const { data, error } = await supabase.rpc(
        'validate_appointment_update',
        {
          p_appointment_id: appointmentId,
          p_new_status: newStatus,
          p_actor_id: actorId,
        }
      );

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          isValid: false,
          message: 'Update validation failed',
        };
      }

      const result = data[0];
      return {
        isValid: result.is_valid,
        message: result.reason,
      };
    } catch (error) {
      console.error('❌ Update validation error:', error);
      return {
        isValid: false,
        message: 'Server update validation failed',
      };
    }
  },

  /**
   * Check exhibitor payment status
   * @param exhibitorId The exhibitor user ID
   * @returns Payment status info
   */
  async checkPaymentStatus(
    exhibitorId: string
  ): Promise<ValidationResult & { paymentStatus?: string; isPaid?: boolean }> {
    if (!supabase) {
      return {
        isValid: false,
        message: 'Database not available',
      };
    }

    try {
      const { data, error } = await supabase.rpc(
        'check_payment_status',
        {
          p_exhibitor_id: exhibitorId,
        }
      );

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          isValid: false,
          message: 'Payment check failed',
        };
      }

      const result = data[0];
      return {
        isValid: result.is_paid,
        message: result.payment_status,
        paymentStatus: result.payment_status,
        isPaid: result.is_paid,
      };
    } catch (error) {
      console.error('❌ Payment check error:', error);
      return {
        isValid: false,
        message: 'Server payment check failed',
      };
    }
  },

  /**
   * Create appointment with atomic server-side quota validation
   * This ensures no race conditions or client-side bypass
   * @param visitorId The visitor booking the appointment
   * @param exhibitorId The exhibitor providing the appointment
   * @param timeSlotId The time slot selected
   * @param visitorLevel The visitor level for quota check
   * @param message Optional appointment message
   * @returns Creation result with appointment ID if successful
   */
  async createAppointmentAtomic(
    visitorId: string,
    exhibitorId: string,
    timeSlotId: string,
    visitorLevel: string,
    message: string = ''
  ): Promise<AppointmentCreationResult> {
    if (!supabase) {
      return {
        isValid: false,
        message: 'Database not available',
      };
    }

    try {
      const { data, error } = await supabase.rpc(
        'create_appointment_atomic',
        {
          p_visitor_id: visitorId,
          p_exhibitor_id: exhibitorId,
          p_time_slot_id: timeSlotId,
          p_visitor_level: visitorLevel,
          p_message: message,
        }
      );

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          isValid: false,
          message: 'Appointment creation failed',
        };
      }

      const result = data[0];
      return {
        isValid: result.success,
        message: result.success ? 'Appointment created successfully' : result.error_message,
        appointmentId: result.appointment_id,
      };
    } catch (error) {
      console.error('❌ Appointment creation error:', error);
      return {
        isValid: false,
        message: 'Server appointment creation failed',
      };
    }
  },
};

export default SecurityService;
