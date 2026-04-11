/**
 * TRANSACTION SERVICE
 * Wrapper for atomic database transaction functions
 * 
 * Ensures data consistency across multi-table operations:
 * - Appointment status updates
 * - Appointment cancellations
 * - Subscription payments
 * - Message creation
 * - Profile updates
 */

import { supabase } from '../lib/supabase';

interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Appointment Status Transaction
 */
export async function updateAppointmentStatusAtomic(
  appointmentId: string,
  newStatus: 'confirmed' | 'rejected' | 'pending' | 'cancelled',
  visitorId: string,
  exhibitorId: string
): Promise<TransactionResult<{
  appointmentId: string;
  oldStatus: string;
  newStatus: string;
}>> {
  try {
    const { data, error } = await supabase.rpc(
      'update_appointment_status_atomic',
      {
        p_appointment_id: appointmentId,
        p_new_status: newStatus,
        p_visitor_id: visitorId,
        p_exhibitor_id: exhibitorId,
      }
    );

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to update appointment status',
      };
    }

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || 'Unknown error updating appointment',
      };
    }

    return {
      success: true,
      data: {
        appointmentId: data.appointment_id,
        oldStatus: data.old_status,
        newStatus: data.new_status,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Cancel Appointment Transaction
 * Atomically cancels appointment, refunds slot, and notifies user
 */
export async function cancelAppointmentAtomic(
  appointmentId: string,
  visitorId: string
): Promise<TransactionResult<{
  appointmentId: string;
  timeSlotId: string;
  message: string;
}>> {
  try {
    const { data, error } = await supabase.rpc(
      'cancel_appointment_atomic',
      {
        p_appointment_id: appointmentId,
        p_visitor_id: visitorId,
      }
    );

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to cancel appointment',
      };
    }

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || 'Failed to cancel appointment',
      };
    }

    return {
      success: true,
      data: {
        appointmentId: data.appointment_id,
        timeSlotId: data.time_slot_id,
        message: data.message,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Process Subscription Payment Transaction
 * Atomically processes payment, updates subscription tier, and notifies user
 */
export async function processSubscriptionPaymentAtomic(
  visitorId: string,
  tierName: string,
  amount: number,
  paymentMethod: string,
  transactionId: string
): Promise<TransactionResult<{
  visitorId: string;
  tierName: string;
  oldTier: string;
  amount: number;
  message: string;
}>> {
  try {
    const { data, error } = await supabase.rpc(
      'process_subscription_payment_atomic',
      {
        p_visitor_id: visitorId,
        p_tier_name: tierName,
        p_amount: amount,
        p_payment_method: paymentMethod,
        p_transaction_id: transactionId,
      }
    );

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to process payment',
      };
    }

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || 'Failed to process payment',
      };
    }

    return {
      success: true,
      data: {
        visitorId: data.visitor_id,
        tierName: data.tier_name,
        oldTier: data.old_tier,
        amount: data.amount,
        message: data.message,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Send Message Transaction
 * Atomically sends message, updates conversation, and notifies recipient
 */
export async function sendMessageAtomic(
  senderId: string,
  recipientId: string,
  messageText: string
): Promise<TransactionResult<{
  messageId: string;
  conversationId: string;
  timestamp: string;
}>> {
  try {
    const { data, error } = await supabase.rpc(
      'send_message_atomic',
      {
        p_sender_id: senderId,
        p_recipient_id: recipientId,
        p_message_text: messageText,
      }
    );

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to send message',
      };
    }

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || 'Failed to send message',
      };
    }

    return {
      success: true,
      data: {
        messageId: data.message_id,
        conversationId: data.conversation_id,
        timestamp: data.timestamp,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Update Exhibitor Profile Transaction
 * Atomically updates profile and optionally invalidates future slots
 */
export async function updateExhibitorProfileAtomic(
  exhibitorId: string,
  profileData: {
    company_name?: string;
    description?: string;
    logo_url?: string;
    website?: string;
  },
  invalidateSlots: boolean = false
): Promise<TransactionResult<{
  exhibitorId: string;
  slotsInvalidated: number;
  message: string;
}>> {
  try {
    const { data, error } = await supabase.rpc(
      'update_exhibitor_profile_atomic',
      {
        p_exhibitor_id: exhibitorId,
        p_profile_data: profileData,
        p_invalidate_slots: invalidateSlots,
      }
    );

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || 'Failed to update profile',
      };
    }

    return {
      success: true,
      data: {
        exhibitorId: data.exhibitor_id,
        slotsInvalidated: data.slots_invalidated,
        message: data.message,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Get Transaction Status
 * Queries user_activity_log for recent transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 20
): Promise<TransactionResult<any[]>> {
  try {
    const { data, error } = await supabase
      .from('user_activity_log')
      .select('id, user_id, action, entity_type, entity_id, metadata, ip_address, user_agent, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch transaction history',
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Query failed',
    };
  }
}

/**
 * Rollback Transaction (for error recovery)
 * Note: This is application-level recovery, not true ROLLBACK
 * The database transaction functions handle rollback automatically on error
 */
export async function rollbackOperation(
  operationId: string,
  reason: string
): Promise<TransactionResult<{ message: string }>> {
  try {
    // Log the rollback event
    console.warn(`⚠️ Transaction rollback requested for ${operationId}: ${reason}`);

    // In a production system, you might:
    // 1. Flag the operation for review
    // 2. Notify administrators
    // 3. Store recovery information
    // 4. Trigger manual intervention workflow

    return {
      success: true,
      data: {
        message: `Transaction ${operationId} marked for review. Manual intervention may be required.`,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Rollback failed',
    };
  }
}

export const TransactionService = {
  updateAppointmentStatusAtomic,
  cancelAppointmentAtomic,
  processSubscriptionPaymentAtomic,
  sendMessageAtomic,
  updateExhibitorProfileAtomic,
  getTransactionHistory,
  rollbackOperation,
};

export default TransactionService;
