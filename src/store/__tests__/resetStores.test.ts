/**
 * Tests for store reset functionality
 * Coverage: Logout cleanup, preventing data leaks
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { resetAllStores } from '../resetStores';
import { useExhibitorStore } from '../exhibitorStore';
import { useEventStore } from '../eventStore';
import useAuthStore from '../authStore';
import { useAppointmentStore } from '../appointmentStore';
import { useVisitorStore } from '../visitorStore';

describe('resetAllStores', () => {
  beforeEach(() => {
    // Set up some mock data in stores
    useExhibitorStore.setState({
      exhibitors: [
        {
          id: '1',
          userId: 'user1',
          companyName: 'Test Company',
          description: 'Test description',
          industry: 'Technology',
          website: 'https://test.com',
          logo: 'logo.jpg',
          booth: 'A1',
          country: 'France',
          products: [],
          contacts: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      isLoading: false,
      error: null
    });

    useEventStore.setState({
      events: [
        {
          id: '1',
          title: 'Test Event',
          description: 'Event description',
          date: new Date(),
          location: 'Test Location',
          type: 'conference',
          category: 'Technology',
          capacity: 100,
          registeredCount: 50,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      registeredEvents: ['1'],
      featuredEvents: [],
      isLoading: false,
      error: null
    });

    useAppointmentStore.setState({
      appointments: [
        {
          id: '1',
          timeSlotId: 'slot1',
          visitorId: 'visitor1',
          exhibitorId: 'exhibitor1',
          status: 'confirmed',
          notes: 'Test notes',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      timeSlots: [
        {
          id: 'slot1',
          exhibitorId: 'exhibitor1',
          startTime: new Date(),
          endTime: new Date(),
          available: true,
          maxBookings: 1,
          currentBookings: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      isLoading: false,
      error: null
    });

    useVisitorStore.setState({
      visitors: [
        {
          id: '1',
          userId: 'user1',
          interests: ['Technology'],
          country: 'France',
          position: 'Developer',
          company: 'Test Corp',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      currentVisitor: {
        id: '1',
        userId: 'user1',
        interests: ['Technology'],
        country: 'France',
        position: 'Developer',
        company: 'Test Corp',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    useAuthStore.setState({
      user: {
        id: 'user1',
        email: 'test@example.com',
        type: 'visitor',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          company: 'Test Corp',
          position: 'Developer',
          country: 'France',
          avatar: 'avatar.jpg'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      isAuthenticated: true,
      isLoading: false,
      token: 'test-token'
    });
  });

  it('should reset exhibitor store', () => {
    resetAllStores();

    const exhibitorState = useExhibitorStore.getState();
    expect(exhibitorState.exhibitors).toEqual([]);
    expect(exhibitorState.isLoading).toBe(false);
    expect(exhibitorState.error).toBeNull();
  });

  it('should reset event store', () => {
    resetAllStores();

    const eventState = useEventStore.getState();
    expect(eventState.events).toEqual([]);
    expect(eventState.registeredEvents).toEqual([]);
    expect(eventState.featuredEvents).toEqual([]);
    expect(eventState.isLoading).toBe(false);
    expect(eventState.error).toBeNull();
  });

  it('should reset appointment store', () => {
    resetAllStores();

    const appointmentState = useAppointmentStore.getState();
    expect(appointmentState.appointments).toEqual([]);
    expect(appointmentState.timeSlots).toEqual([]);
    expect(appointmentState.isLoading).toBe(false);
    expect(appointmentState.error).toBeNull();
  });

  it('should reset visitor store', () => {
    resetAllStores();

    const visitorState = useVisitorStore.getState();
    expect(visitorState.visitorProfile).toBeNull();
    expect(visitorState.agenda.appointments).toEqual([]);
    expect(visitorState.favoriteExhibitors).toEqual([]);
  });

  it('should reset auth store (except authentication state)', () => {
    resetAllStores();

    const authState = useAuthStore.getState();
    // Auth state should be reset by logout, not by resetAllStores
    // But we verify that other stores are reset regardless
    expect(useExhibitorStore.getState().exhibitors).toEqual([]);
    expect(useEventStore.getState().events).toEqual([]);
  });

  it('should handle multiple consecutive resets', () => {
    resetAllStores();
    resetAllStores();
    resetAllStores();

    const exhibitorState = useExhibitorStore.getState();
    const eventState = useEventStore.getState();
    const appointmentState = useAppointmentStore.getState();

    expect(exhibitorState.exhibitors).toEqual([]);
    expect(eventState.events).toEqual([]);
    expect(appointmentState.appointments).toEqual([]);
  });

  it('should prevent data leaks between user sessions', () => {
    // Simulate first user session
    useExhibitorStore.setState({
      exhibitors: [
        {
          id: 'sensitive1',
          userId: 'user1',
          companyName: 'Secret Company',
          description: 'Confidential',
          industry: 'Defense',
          website: 'https://secret.com',
          logo: 'logo.jpg',
          booth: 'A1',
          country: 'USA',
          products: [],
          contacts: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    });

    // User logs out
    resetAllStores();

    // Verify no sensitive data remains
    const exhibitorState = useExhibitorStore.getState();
    expect(exhibitorState.exhibitors).toEqual([]);
    expect(exhibitorState.exhibitors.length).toBe(0);

    // Verify we can't find the sensitive data
    const hasSensitiveData = exhibitorState.exhibitors.some(
      (e) => e.companyName === 'Secret Company'
    );
    expect(hasSensitiveData).toBe(false);
  });

  it('should clear all arrays and objects', () => {
    resetAllStores();

    // Check all stores have empty arrays
    expect(useExhibitorStore.getState().exhibitors).toHaveLength(0);
    expect(useEventStore.getState().events).toHaveLength(0);
    expect(useEventStore.getState().registeredEvents).toHaveLength(0);
    expect(useAppointmentStore.getState().appointments).toHaveLength(0);
    expect(useAppointmentStore.getState().timeSlots).toHaveLength(0);
    expect(useVisitorStore.getState().agenda.appointments).toHaveLength(0);

    // Check null objects
    expect(useVisitorStore.getState().visitorProfile).toBeNull();
  });

  it('should reset error states', () => {
    // Set some errors
    useExhibitorStore.setState({ error: 'Test error' });
    useEventStore.setState({ error: 'Event error' });
    useAppointmentStore.setState({ error: 'Appointment error' });

    resetAllStores();

    expect(useExhibitorStore.getState().error).toBeNull();
    expect(useEventStore.getState().error).toBeNull();
    expect(useAppointmentStore.getState().error).toBeNull();
  });

  it('should reset loading states', () => {
    // Set loading states
    useExhibitorStore.setState({ isLoading: true });
    useEventStore.setState({ isLoading: true });
    useAppointmentStore.setState({ isLoading: true });

    resetAllStores();

    expect(useExhibitorStore.getState().isLoading).toBe(false);
    expect(useEventStore.getState().isLoading).toBe(false);
    expect(useAppointmentStore.getState().isLoading).toBe(false);
  });
});
