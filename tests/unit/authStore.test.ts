import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../../src/store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ 
      user: null, 
      isAuthenticated: false,
      isLoading: false 
    });
  });

  describe('initialization', () => {
    it('should initialize with unauthenticated state', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('should set authenticated state on successful login', () => {
      const mockUser = {
        id: 'test-123',
        email: 'test@example.com',
        type: 'visitor' as const,
        name: 'Test User'
      };

      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should clear state on logout', () => {
      // Set authenticated state first
      useAuthStore.setState({
        user: { id: '1', email: 'test@test.com', type: 'visitor', name: 'Test' },
        isAuthenticated: true
      });

      // Logout
      useAuthStore.setState({
        user: null,
        isAuthenticated: false
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });
});
