import { create } from 'zustand';
import { AdminMetrics, AdminMetricsService } from '../services/adminMetrics';

interface AdminDashboardState {
  metrics: AdminMetrics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMetrics: () => Promise<void>;
  refreshMetric: (metric: keyof AdminMetrics) => Promise<void>;
  clearError: () => void;
}

export const useAdminDashboardStore = create<AdminDashboardState>((set, get) => ({
  metrics: null,
  isLoading: false,
  error: null,

  fetchMetrics: async () => {
    set({ isLoading: true, error: null });
    try {
      const metrics = await AdminMetricsService.getMetrics();
      set({ metrics, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      set({ error: errorMessage, isLoading: false });
    }
  },

  refreshMetric: async (metric) => {
    const { metrics } = get();
    if (!metrics) return;

    try {
      let newValue: number;

      switch (metric) {
        case 'pendingValidations':
          newValue = await AdminMetricsService.getPendingValidations();
          break;
        case 'activeContracts':
          newValue = await AdminMetricsService.getActiveContracts();
          break;
        case 'contentModerations':
          newValue = await AdminMetricsService.getContentModerations();
          break;
        default:
          return; // Ne pas rafraîchir les autres métriques pour l'instant
      }

      set({
        metrics: {
          ...metrics,
          [metric]: newValue
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du rafraîchissement';
      set({ error: errorMessage });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));
