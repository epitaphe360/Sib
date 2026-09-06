import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { loginRateLimiter } from '@/utils/rateLimiter';
import type { LabMembership, LabOrganization, LabRole } from '../types';
import { labSchema } from '../services/labClient';

const otpLimiter = loginRateLimiter;

interface LabSessionState {
  userId: string | null;
  email: string | null;
  memberships: LabMembership[];
  activeOrg: LabOrganization | null;
  role: LabRole | null;
  clientId: string | null;
  isLoading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  setActiveOrg: (organizationId: string) => void;
  loginAdmin: (email: string, password: string) => Promise<void>;
  requestClientOtp: (email: string) => Promise<void>;
  verifyClientOtp: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

async function loadMemberships(userId: string, email: string | null): Promise<LabMembership[]> {
  const { data, error } = await labSchema()
    .from('organization_members')
    .select('id,organization_id,user_id,role,client_id,organization:organizations(id,name,slug,is_active)')
    .eq('user_id', userId)
    .is('deleted_at', null);
  if (error) throw error;

  if (!data?.length && email && userId) {
    await labSchema().from('profiles').upsert({ id: userId, email, full_name: email });
  }

  return (data ?? []).map((row) => {
    const orgRaw = row.organization as LabOrganization | LabOrganization[] | null;
    const organization = Array.isArray(orgRaw) ? orgRaw[0] : orgRaw ?? undefined;
    return {
      id: row.id as string,
      organization_id: row.organization_id as string,
      user_id: row.user_id as string,
      role: row.role as LabRole,
      client_id: (row.client_id as string | null) ?? null,
      organization,
    };
  });
}

export const useLabSessionStore = create<LabSessionState>((set, get) => ({
  userId: null,
  email: null,
  memberships: [],
  activeOrg: null,
  role: null,
  clientId: null,
  isLoading: false,
  error: null,

  hydrate: async () => {
    if (!supabase) {
      set({ isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        set({ userId: null, email: null, memberships: [], activeOrg: null, role: null, clientId: null, isLoading: false });
        return;
      }
      const memberships = await loadMemberships(session.user.id, session.user.email ?? null);
      const first = memberships[0];
      set({
        userId: session.user.id,
        email: session.user.email ?? null,
        memberships,
        activeOrg: first?.organization ?? null,
        role: first?.role ?? null,
        clientId: first?.client_id ?? null,
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Session lab indisponible' });
    }
  },

  setActiveOrg: (organizationId) => {
    const membership = get().memberships.find((m) => m.organization_id === organizationId);
    if (!membership) return;
    set({
      activeOrg: membership.organization ?? null,
      role: membership.role,
      clientId: membership.client_id,
    });
  },

  loginAdmin: async (email, password) => {
    if (!supabase) throw new Error('Supabase non configuré');
    const gate = await loginRateLimiter.isAllowed(email);
    if (!gate.allowed) throw new Error('Trop de tentatives. Réessayez plus tard.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      loginRateLimiter.recordFailure(email);
      throw error;
    }
    loginRateLimiter.recordSuccess(email);
    await get().hydrate();
    const role = get().role;
    if (role === 'CLIENT') throw new Error('Compte client : utilisez la connexion OTP.');
    if (!role) throw new Error('Aucun accès laboratoire pour ce compte.');
  },

  requestClientOtp: async (email) => {
    if (!supabase) throw new Error('Supabase non configuré');
    const gate = await otpLimiter.isAllowed(`otp:${email}`);
    if (!gate.allowed) throw new Error('Trop de codes demandés. Réessayez plus tard.');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      otpLimiter.recordFailure(`otp:${email}`);
      throw error;
    }
  },

  verifyClientOtp: async (email, token) => {
    if (!supabase) throw new Error('Supabase non configuré');
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) throw error;
    await get().hydrate();
  },

  logout: async () => {
    await supabase?.auth.signOut();
    set({ userId: null, email: null, memberships: [], activeOrg: null, role: null, clientId: null, error: null });
  },
}));
