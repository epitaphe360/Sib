/**
 * Service d'audit logs
 * Suivi de toutes les actions importantes pour la conformité et la sécurité
 */

import { supabase } from '../lib/supabase';

export interface AuditLog {
  id: string;
  user_id?: string;
  actor_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  session_id?: string;
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AuditLogFilters {
  user_id?: string;
  actor_id?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  severity?: string[];
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

class AuditService {
  /**
   * Logger une action d'audit
   */
  async log(params: {
    userId?: string;
    actorId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    sessionId?: string;
    severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
    metadata?: Record<string, any>;
  }): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_audit', {
        p_user_id: params.userId || null,
        p_actor_id: params.actorId || null,
        p_action: params.action,
        p_entity_type: params.entityType,
        p_entity_id: params.entityId || null,
        p_old_values: params.oldValues || null,
        p_new_values: params.newValues || null,
        p_ip_address: params.ipAddress || null,
        p_user_agent: params.userAgent || null,
        p_severity: params.severity || 'info',
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur log audit:', error);
      return null;
    }
  }

  /**
   * Récupérer les logs d'audit avec filtres
   */
  async getLogs(filters?: AuditLogFilters): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('id, user_id, actor_id, action, entity_type, entity_id, old_values, new_values, changes, ip_address, user_agent, request_id, session_id, severity, metadata, created_at');

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters?.actor_id) {
        query = query.eq('actor_id', filters.actor_id);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }

      if (filters?.entity_id) {
        query = query.eq('entity_id', filters.entity_id);
      }

      if (filters?.severity && filters.severity.length > 0) {
        query = query.in('severity', filters.severity);
      }

      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      query = query.order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 50) - 1
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getLogs:', error);
      return [];
    }
  }

  /**
   * Récupérer un log spécifique
   */
  async getLogById(logId: string): Promise<AuditLog | null> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, user_id, actor_id, action, entity_type, entity_id, old_values, new_values, changes, ip_address, user_agent, request_id, session_id, severity, metadata, created_at')
        .eq('id', logId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur getLogById:', error);
      return null;
    }
  }

  /**
   * Récupérer les logs pour une entité spécifique
   */
  async getEntityHistory(
    entityType: string,
    entityId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    return this.getLogs({
      entity_type: entityType,
      entity_id: entityId,
      limit,
    });
  }

  /**
   * Récupérer les logs pour un utilisateur
   */
  async getUserActivity(
    userId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    return this.getLogs({
      user_id: userId,
      limit,
    });
  }

  /**
   * Récupérer les logs critiques récents
   */
  async getCriticalLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.getLogs({
      severity: ['critical', 'error'],
      limit,
    });
  }

  /**
   * Logs pré-définis pour actions communes
   */

  async logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      action: 'user.login',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      severity: 'info',
    });
  }

  async logLogout(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      action: 'user.logout',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      severity: 'info',
    });
  }

  async logPasswordChange(
    userId: string,
    actorId?: string,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      userId,
      actorId: actorId || userId,
      action: 'user.password_change',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      severity: 'warning',
    });
  }

  async logProfileUpdate(
    userId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    actorId?: string
  ): Promise<void> {
    await this.log({
      userId,
      actorId: actorId || userId,
      action: 'user.profile_update',
      entityType: 'user',
      entityId: userId,
      oldValues,
      newValues,
      severity: 'info',
    });
  }

  async logPayment(
    userId: string,
    transactionId: string,
    amount: number,
    currency: string,
    method: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'payment.completed',
      entityType: 'payment_transaction',
      entityId: transactionId,
      metadata: { amount, currency, method },
      severity: 'info',
    });
  }

  async logRefund(
    userId: string,
    transactionId: string,
    amount: number,
    reason: string,
    actorId: string
  ): Promise<void> {
    await this.log({
      userId,
      actorId,
      action: 'payment.refunded',
      entityType: 'payment_transaction',
      entityId: transactionId,
      metadata: { amount, reason },
      severity: 'warning',
    });
  }

  async logDataExport(
    userId: string,
    dataType: string,
    actorId?: string
  ): Promise<void> {
    await this.log({
      userId,
      actorId: actorId || userId,
      action: 'data.export',
      entityType: 'user',
      entityId: userId,
      metadata: { dataType },
      severity: 'info',
    });
  }

  async logDataDeletion(
    userId: string,
    entityType: string,
    entityId: string,
    actorId: string
  ): Promise<void> {
    await this.log({
      userId,
      actorId,
      action: 'data.delete',
      entityType,
      entityId,
      severity: 'warning',
    });
  }

  async logSecurityEvent(
    userId: string,
    event: string,
    severity: 'warning' | 'error' | 'critical',
    metadata?: Record<string, any>,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: `security.${event}`,
      entityType: 'security',
      metadata,
      ipAddress,
      severity,
    });
  }

  async logFailedLogin(
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: 'security.failed_login',
      entityType: 'security',
      metadata: { email },
      ipAddress,
      userAgent,
      severity: 'warning',
    });
  }

  async logSuspiciousActivity(
    userId: string,
    activity: string,
    metadata?: Record<string, any>,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'security.suspicious_activity',
      entityType: 'security',
      metadata: { activity, ...metadata },
      ipAddress,
      severity: 'critical',
    });
  }

  async logAdminAction(
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): Promise<void> {
    await this.log({
      actorId,
      action: `admin.${action}`,
      entityType,
      entityId,
      oldValues,
      newValues,
      severity: 'info',
    });
  }

  /**
   * Statistiques d'audit
   */
  async getStatistics(filters?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{
    total: number;
    by_action: Record<string, number>;
    by_severity: Record<string, number>;
    by_entity_type: Record<string, number>;
  }> {
    try {
      const logs = await this.getLogs({
        start_date: filters?.start_date,
        end_date: filters?.end_date,
        limit: 10000, // Limite raisonnable pour les stats
      });

      const stats = {
        total: logs.length,
        by_action: {} as Record<string, number>,
        by_severity: {} as Record<string, number>,
        by_entity_type: {} as Record<string, number>,
      };

      logs.forEach((log) => {
        // Count by action
        stats.by_action[log.action] = (stats.by_action[log.action] || 0) + 1;

        // Count by severity
        stats.by_severity[log.severity] = (stats.by_severity[log.severity] || 0) + 1;

        // Count by entity type
        stats.by_entity_type[log.entity_type] =
          (stats.by_entity_type[log.entity_type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('❌ Erreur getStatistics:', error);
      return {
        total: 0,
        by_action: {},
        by_severity: {},
        by_entity_type: {},
      };
    }
  }
}

export const auditService = new AuditService();
export default auditService;
