/**
 * Tests composant — VisitorPaymentPage.tsx
 *
 * La page est désormais un flux de REDIRECTION (plus de sélection de méthode à l'écran) :
 *  - Affiche un écran « redirection en cours ».
 *  - Utilisateur déjà premium/vip → redirige vers le dashboard visiteur.
 *  - Sinon, réutilise une demande de paiement en attente ou en crée une,
 *    puis redirige vers la page de virement bancaire.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { ROUTES } from '../../src/lib/routes';

// ── Mock useNavigate ──────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Mock authStore (fonction appelable + getState, comme un store Zustand) ──────
const authState = vi.hoisted<{ user: Record<string, unknown> | null }>(() => ({
  user: {
    id: 'visitor-1',
    email: 'visitor@test.com',
    name: 'Jean Dupont',
    type: 'visitor',
    status: 'active',
    visitor_level: 'free',
  },
}));
vi.mock('../../src/store/authStore', () => {
  const useAuthStore = Object.assign(
    () => ({ user: authState.user }),
    { getState: () => ({ user: authState.user }) },
  );
  return { default: useAuthStore, useAuthStore };
});

// ── Mock useTranslation (passe-plat sur la clé) ─────────────────────────────────
vi.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key, language: 'fr' }),
}));

// ── Mock paymentService ─────────────────────────────────────────────────────────
const mockCreatePaymentRecord = vi.hoisted(() => vi.fn());
vi.mock('../../src/services/paymentService', () => ({
  PAYPAL_CLIENT_ID: 'test-client-id',
  capturePayPalOrder: vi.fn(),
  createCMIPaymentRequest: vi.fn(),
  createPaymentRecord: mockCreatePaymentRecord,
  getVipPassAmount: vi.fn().mockResolvedValue(700),
}));

// ── Mock pricing dynamique + conversion ─────────────────────────────────────────
vi.mock('../../src/services/visitorLevelService', () => ({
  fetchVipPassPricing: vi.fn().mockResolvedValue({ level: 'premium', price: 700, currency: 'EUR' }),
}));
vi.mock('../../src/utils/currencyUtils', () => ({
  convertEURtoMAD: vi.fn().mockResolvedValue(7000),
}));

// ── Mock config virement ────────────────────────────────────────────────────────
vi.mock('../../src/config/visitorBankTransferConfig', () => ({
  generateVisitorPaymentReference: vi.fn().mockReturnValue('VIP-U1-001'),
  formatVisitorAmount: vi.fn((amount: number) => `${amount} €`),
}));

// ── Mock EmailService ───────────────────────────────────────────────────────────
vi.mock('../../src/services/emailService', () => ({
  EmailService: { sendPaymentReceipt: vi.fn().mockResolvedValue(undefined) },
}));

// ── Mock supabase (chaîne payment_requests → maybeSingle) ───────────────────────
const mockMaybeSingle = vi.hoisted(() => vi.fn());
vi.mock('../../src/lib/supabase', () => {
  const chain: Record<string, unknown> = {};
  const chainable = () => chain;
  Object.assign(chain, {
    select: vi.fn(chainable),
    eq: vi.fn(chainable),
    update: vi.fn(chainable),
    insert: vi.fn(chainable),
    single: vi.fn(),
    maybeSingle: mockMaybeSingle,
  });
  return { supabase: { from: vi.fn(() => chain) } };
});

// ── Mock framer-motion ─────────────────────────────────────────────────────────
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
      React.createElement('div', props, children),
    button: ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) =>
      React.createElement('button', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// ── Mock toast ──────────────────────────────────────────────────────────────────
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import VisitorPaymentPage from '../../src/pages/VisitorPaymentPage';

// ─────────────────────────────────────────────────────────────────────────────

function renderPage() {
  return render(
    <MemoryRouter>
      <VisitorPaymentPage />
    </MemoryRouter>,
  );
}

describe('VisitorPaymentPage (flux de redirection)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = {
      id: 'visitor-1',
      email: 'visitor@test.com',
      name: 'Jean Dupont',
      type: 'visitor',
      status: 'active',
      visitor_level: 'free',
    };
    mockMaybeSingle.mockResolvedValue({ data: null });
    mockCreatePaymentRecord.mockResolvedValue({ id: 'req-new-1' });
  });

  it('affiche un écran de préparation/redirection', () => {
    renderPage();
    // État initial : loading → « préparation » (puis redirection).
    expect(screen.getByText('payment.preparing')).toBeTruthy();
  });

  it('redirige un visiteur déjà premium vers le dashboard', async () => {
    authState.user = { ...authState.user, visitor_level: 'premium' };
    renderPage();
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.VISITOR_DASHBOARD, { replace: true }),
    );
    expect(mockCreatePaymentRecord).not.toHaveBeenCalled();
  });

  it('redirige un visiteur déjà vip vers le dashboard', async () => {
    authState.user = { ...authState.user, visitor_level: 'vip' };
    renderPage();
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.VISITOR_DASHBOARD, { replace: true }),
    );
  });

  it('réutilise une demande de paiement en attente existante', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 'existing-42' } });
    renderPage();
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/visitor/bank-transfer?request_id=existing-42'),
    );
    expect(mockCreatePaymentRecord).not.toHaveBeenCalled();
  });

  it('crée une nouvelle demande de paiement si aucune en attente', async () => {
    renderPage();
    await waitFor(() => expect(mockCreatePaymentRecord).toHaveBeenCalled());
    const args = mockCreatePaymentRecord.mock.calls[0][0];
    expect(args).toMatchObject({
      userId: 'visitor-1',
      amount: 700,
      currency: 'EUR',
      paymentMethod: 'bank_transfer',
    });
  });

  it('redirige vers la nouvelle demande après création', async () => {
    renderPage();
    await waitFor(
      () => expect(mockNavigate).toHaveBeenCalledWith('/visitor/bank-transfer?request_id=req-new-1'),
      { timeout: 2000 },
    );
  });
});
