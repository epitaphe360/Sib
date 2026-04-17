import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

const SALON_DATE = '2026-11-25';
const EXHIBITOR_ID = 'cb05b866-0ee1-48c1-997e-d6473ed15a44';
const DEFAULT_SLOT = {
    id: 'mock-slot-1',
    exhibitor_id: EXHIBITOR_ID,
    slot_date: SALON_DATE,
    start_time: '14:00',
    end_time: '14:30',
    duration: 30,
    max_bookings: 5,
    current_bookings: 0,
    type: 'in-person',
    available: true,
    location: 'Hall A'
};

test.describe('Appointment Booking Flow', () => {
    async function mockBookingApi(
        page: any,
        options?: {
            appointments?: Array<Record<string, unknown>>;
            slots?: Array<Record<string, unknown>>;
            bookingResponse?: Record<string, unknown>;
        }
    ) {
        const appointments = options?.appointments ?? [];
        const slots = options?.slots ?? [DEFAULT_SLOT];
        const bookingResponse = options?.bookingResponse ?? {
            success: true,
            appointment_id: 'mock-appointment-1'
        };

        await page.route('**/rest/v1/time_slots*', async route => {
            if (route.request().method() !== 'GET') {
                await route.continue();
                return;
            }

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(slots)
            });
        });

        await page.route('**/rest/v1/appointments*', async route => {
            if (route.request().method() !== 'GET') {
                await route.continue();
                return;
            }

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(appointments)
            });
        });

        await page.route('**/rest/v1/rpc/book_appointment_atomic', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(bookingResponse)
            });
        });
    }

    async function login(page: any, userType: 'admin' | 'visitor' | 'visitorVip' | 'exhibitor' | 'partner') {
    const user = TEST_USERS[userType];
    await page.goto('/login');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]'); 
    await page.waitForTimeout(2000); 
    await expect(page).toHaveURL(/dashboard|exhibitors/);
  }

    async function openBookingModal(page: any) {
        await page.goto('/exhibitors', { waitUntil: 'commit' });

        const firstExhibitor = page.locator('.exhibitor-card, [data-testid="exhibitor-card"]').first();
        await expect(firstExhibitor).toBeVisible();

        const directBookBtn = firstExhibitor.locator('button[title="Prendre rendez-vous"], button[aria-label="Prendre rendez-vous"]').first();
        if (await directBookBtn.count() > 0) {
            await directBookBtn.click();
        } else {
            const detailsBtn = firstExhibitor.locator('button[title="Fiche complète"], button[title="Full Profile"]');
            if (await detailsBtn.count() > 0) {
                await detailsBtn.first().click();
            } else {
                await firstExhibitor.locator('button').filter({ has: page.locator('.lucide-external-link, svg.lucide-external-link') }).first().click();
            }

            const bookBtn = page.getByRole('button', { name: /Planifier un RDV B2B|Prendre Rendez-vous|Prendre rendez-vous/i }).first();
            await expect(bookBtn).toBeVisible({ timeout: 15000 });
            await bookBtn.click();
        }

        const timeSlot = page.locator('[data-testid="timeslot"]').first();
        await expect(timeSlot).toBeVisible({ timeout: 15000 });
        await timeSlot.click();

        const messageInput = page.locator('textarea');
        await expect(messageInput).toBeVisible();
        return messageInput;
    }

  test('should book appointment successfully', async ({ page }) => {
    test.slow();
        await mockBookingApi(page);
        await login(page, 'visitorVip');

        const messageInput = await openBookingModal(page);
        await messageInput.fill('Je souhaite echanger sur vos solutions constructives.');
        await page.getByRole('button', { name: /Envoyer la demande/i }).click();

        await expect(page.getByText(/Demande envoyee|Demande envoyée/i)).toBeVisible({ timeout: 15000 });
  });

  test('should prevent double booking', async ({ page }) => {
    test.slow();
        await mockBookingApi(page);
        await login(page, 'visitorVip');

        const firstMessage = await openBookingModal(page);
        await firstMessage.fill('Premier envoi de test');
        await page.getByRole('button', { name: /Envoyer la demande/i }).click();
        await expect(page.getByText(/Demande envoyee|Demande envoyée/i)).toBeVisible({ timeout: 15000 });

        const timeSlot = page.locator('[data-testid="timeslot"]').first();
        await expect(timeSlot).toBeVisible({ timeout: 15000 });
        await timeSlot.click();

        const secondMessage = page.locator('textarea');
        await expect(secondMessage).toBeVisible({ timeout: 15000 });
        await secondMessage.fill('Tentative de doublon');
        await page.getByRole('button', { name: /Envoyer la demande/i }).click();

        await expect(page.getByText(/deja reserve|déjà réservé/i)).toBeVisible({ timeout: 15000 });
  });

    test('should block free visitor from booking appointments', async ({ page }) => {
    test.slow();
    await login(page, 'visitor');
        await mockBookingApi(page);

        const messageInput = await openBookingModal(page);
        await messageInput.fill('Demande de rendez-vous avec un pass gratuit');
        await page.getByRole('button', { name: /Envoyer la demande/i }).click();

        await expect(page.getByText(/Visiteurs FREE|ticket pour acceder|ticket pour accéder/i)).toBeVisible({ timeout: 15000 });
  });

});
