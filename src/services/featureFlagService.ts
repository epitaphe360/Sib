/**
 * Service de gestion des feature flags
 * Permet d'activer/désactiver des fonctionnalités de manière dynamique
 */

import { supabase } from '../lib/supabase';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  rollout_percentage: number;
  enabled_for_users?: string[];
  enabled_for_roles?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

class FeatureFlagService {
  private cache: Map<string, { flag: FeatureFlag; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  /**
   * Vérifier si une fonctionnalité est activée pour un utilisateur
   */
  async isEnabled(flagKey: string, userId?: string): Promise<boolean> {
    try {
      // Vérifier le cache d'abord
      const cached = this.cache.get(flagKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return this.checkFlag(cached.flag, userId);
      }

      // Récupérer le flag depuis la DB
      const flag = await this.getFlag(flagKey);
      if (!flag) {
        return false;
      }

      // Mettre en cache
      this.cache.set(flagKey, { flag, timestamp: Date.now() });

      return this.checkFlag(flag, userId);
    } catch (error) {
      console.error('❌ Erreur isEnabled:', error);
      return false;
    }
  }

  /**
   * Vérifier un flag avec la logique de rollout
   */
  private async checkFlag(flag: FeatureFlag, userId?: string): Promise<boolean> {
    // Si désactivé globalement
    if (!flag.is_enabled) {
      return false;
    }

    // Si activé à 100%
    if (flag.rollout_percentage === 100 && flag.is_enabled) {
      return true;
    }

    // Si pas d'utilisateur, on ne peut pas vérifier les règles spécifiques
    if (!userId) {
      return flag.rollout_percentage === 100;
    }

    // Vérifier si l'utilisateur est dans la liste enabled_for_users
    if (flag.enabled_for_users && flag.enabled_for_users.includes(userId)) {
      return true;
    }

    // Vérifier si l'utilisateur a un rôle dans enabled_for_roles
    if (flag.enabled_for_roles && flag.enabled_for_roles.length > 0) {
      const { data: user } = await supabase
        .from('users')
        .select('type, role')
        .eq('id', userId)
        .single();

      if (user && (
        flag.enabled_for_roles.includes(user.type) ||
        (user.role && flag.enabled_for_roles.includes(user.role))
      )) {
        return true;
      }
    }

    // Vérifier le rollout percentage (déterministe basé sur userId)
    if (flag.rollout_percentage > 0) {
      const { data, error } = await supabase.rpc('is_feature_enabled', {
        p_flag_key: flag.key,
        p_user_id: userId,
      });

      if (error) throw error;
      return data;
    }

    return false;
  }

  /**
   * Récupérer un flag par sa clé
   */
  async getFlag(flagKey: string): Promise<FeatureFlag | null> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('id, key, name, description, is_enabled, rollout_percentage, enabled_for_users, enabled_for_roles, metadata, created_at, updated_at')
        .eq('key', flagKey)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur getFlag:', error);
      return null;
    }
  }

  /**
   * Récupérer tous les flags
   */
  async getAllFlags(): Promise<FeatureFlag[]> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('id, key, name, description, is_enabled, rollout_percentage, enabled_for_users, enabled_for_roles, metadata, created_at, updated_at')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getAllFlags:', error);
      return [];
    }
  }

  /**
   * Créer un nouveau flag
   */
  async createFlag(flag: {
    key: string;
    name: string;
    description?: string;
    is_enabled?: boolean;
    rollout_percentage?: number;
    enabled_for_users?: string[];
    enabled_for_roles?: string[];
    metadata?: Record<string, any>;
  }): Promise<FeatureFlag | null> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .insert([{
          ...flag,
          is_enabled: flag.is_enabled ?? false,
          rollout_percentage: flag.rollout_percentage ?? 0,
          enabled_for_users: flag.enabled_for_users || [],
          enabled_for_roles: flag.enabled_for_roles || [],
          metadata: flag.metadata || {},
        }])
        .select('id, key, name, description, is_enabled, rollout_percentage, enabled_for_users, enabled_for_roles, metadata, created_at, updated_at')
        .single();

      if (error) throw error;

      // Invalider le cache
      this.cache.delete(flag.key);

      return data;
    } catch (error) {
      console.error('❌ Erreur createFlag:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un flag
   */
  async updateFlag(
    flagKey: string,
    updates: Partial<FeatureFlag>
  ): Promise<FeatureFlag | null> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .update(updates)
        .eq('key', flagKey)
        .select('id, key, name, description, is_enabled, rollout_percentage, enabled_for_users, enabled_for_roles, metadata, created_at, updated_at')
        .single();

      if (error) throw error;

      // Invalider le cache
      this.cache.delete(flagKey);

      return data;
    } catch (error) {
      console.error('❌ Erreur updateFlag:', error);
      return null;
    }
  }

  /**
   * Supprimer un flag
   */
  async deleteFlag(flagKey: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .delete()
        .eq('key', flagKey);

      if (error) throw error;

      // Invalider le cache
      this.cache.delete(flagKey);

      return true;
    } catch (error) {
      console.error('❌ Erreur deleteFlag:', error);
      return false;
    }
  }

  /**
   * Activer un flag
   */
  async enableFlag(flagKey: string): Promise<boolean> {
    const result = await this.updateFlag(flagKey, { is_enabled: true });
    return !!result;
  }

  /**
   * Désactiver un flag
   */
  async disableFlag(flagKey: string): Promise<boolean> {
    const result = await this.updateFlag(flagKey, { is_enabled: false });
    return !!result;
  }

  /**
   * Définir le pourcentage de rollout
   */
  async setRolloutPercentage(
    flagKey: string,
    percentage: number
  ): Promise<boolean> {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Rollout percentage must be between 0 and 100');
    }

    const result = await this.updateFlag(flagKey, {
      rollout_percentage: percentage,
    });
    return !!result;
  }

  /**
   * Ajouter un utilisateur à la liste d'activation
   */
  async addUserToFlag(flagKey: string, userId: string): Promise<boolean> {
    try {
      const flag = await this.getFlag(flagKey);
      if (!flag) {
        throw new Error('Flag not found');
      }

      const enabledUsers = flag.enabled_for_users || [];
      if (enabledUsers.includes(userId)) {
        return true; // Déjà présent
      }

      enabledUsers.push(userId);

      const result = await this.updateFlag(flagKey, {
        enabled_for_users: enabledUsers,
      });
      return !!result;
    } catch (error) {
      console.error('❌ Erreur addUserToFlag:', error);
      return false;
    }
  }

  /**
   * Retirer un utilisateur de la liste d'activation
   */
  async removeUserFromFlag(flagKey: string, userId: string): Promise<boolean> {
    try {
      const flag = await this.getFlag(flagKey);
      if (!flag) {
        throw new Error('Flag not found');
      }

      const enabledUsers = (flag.enabled_for_users || []).filter(
        (id) => id !== userId
      );

      const result = await this.updateFlag(flagKey, {
        enabled_for_users: enabledUsers,
      });
      return !!result;
    } catch (error) {
      console.error('❌ Erreur removeUserFromFlag:', error);
      return false;
    }
  }

  /**
   * Ajouter un rôle à la liste d'activation
   */
  async addRoleToFlag(flagKey: string, role: string): Promise<boolean> {
    try {
      const flag = await this.getFlag(flagKey);
      if (!flag) {
        throw new Error('Flag not found');
      }

      const enabledRoles = flag.enabled_for_roles || [];
      if (enabledRoles.includes(role)) {
        return true; // Déjà présent
      }

      enabledRoles.push(role);

      const result = await this.updateFlag(flagKey, {
        enabled_for_roles: enabledRoles,
      });
      return !!result;
    } catch (error) {
      console.error('❌ Erreur addRoleToFlag:', error);
      return false;
    }
  }

  /**
   * Retirer un rôle de la liste d'activation
   */
  async removeRoleFromFlag(flagKey: string, role: string): Promise<boolean> {
    try {
      const flag = await this.getFlag(flagKey);
      if (!flag) {
        throw new Error('Flag not found');
      }

      const enabledRoles = (flag.enabled_for_roles || []).filter(
        (r) => r !== role
      );

      const result = await this.updateFlag(flagKey, {
        enabled_for_roles: enabledRoles,
      });
      return !!result;
    } catch (error) {
      console.error('❌ Erreur removeRoleFromFlag:', error);
      return false;
    }
  }

  /**
   * Récupérer tous les flags actifs pour un utilisateur
   */
  async getEnabledFlagsForUser(userId: string): Promise<FeatureFlag[]> {
    const allFlags = await this.getAllFlags();
    const enabledFlags: FeatureFlag[] = [];

    for (const flag of allFlags) {
      const isEnabled = await this.isEnabled(flag.key, userId);
      if (isEnabled) {
        enabledFlags.push(flag);
      }
    }

    return enabledFlags;
  }

  /**
   * Invalider le cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const featureFlagService = new FeatureFlagService();
export default featureFlagService;
