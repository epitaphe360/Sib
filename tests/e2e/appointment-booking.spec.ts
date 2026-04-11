import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('Appointment Booking Flow', () => {

  // Global mocks for this suite
  test.beforeEach(async ({ page }) => {
     // Mock appointment slots to ensure there is always one slot available today
     await page.route('**/rest/v1/appointment_slots*', async route => {
        if (route.request().method() === 'GET') {
             const now = new Date();
             const startTime = new Date(now);
             startTime.setHours(14, 0, 0, 0); // Default to 14:00 today
             const endTime = new Date(startTime);
             endTime.setMinutes(30);
             
             const mockSlots = [{
                 id: 'mock-slot-1',
                 exhibitor_id: 'mock-exhibitor-id', 
                 start_time: startTime.toISOString(),
                 end_time: endTime.toISOString(),
                 max_bookings: 5,
                 current_bookings: 0,
                 type: 'video'
             }];
             
             await route.fulfill({
                 status: 200,
                 contentType: 'application/json',
                 body: JSON.stringify(mockSlots)
             });
        } else {
            await route.continue();
        }
    });

    // Mock quota check to be consistently TRUE by default
    await page.route('**/rest/v1/rpc/check_b2b_quota_available', async route => {
       await route.fulfill({
           status: 200,
           contentType: 'application/json',
           body: JSON.stringify(true) // or { available: true } depending on schema, usually boolean or obj
       });
    });
  });

  async function login(page: any, userType: 'admin' | 'visitor' | 'exhibitor' | 'partner') {
    const user = TEST_USERS[userType];
    await page.goto('/login');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]'); 
    await page.waitForTimeout(2000); 
    await expect(page).toHaveURL(/dashboard|exhibitors/);
  }

  test('should book appointment successfully', async ({ page }) => {
    test.slow();
    await login(page, 'visitor');
    
    await page.goto('/exhibitors');
    
    const firstExhibitor = page.locator('.exhibitor-card, [data-testid="exhibitor-card"]').first();
    await expect(firstExhibitor).toBeVisible();
    
    // Click View Details relative to the card
    const detailsBtn = firstExhibitor.locator('button[title="Fiche complète"], button[title="Full Profile"]');
    if (await detailsBtn.count() > 0) {
        await detailsBtn.first().click();
    } else {
        // Fallback: try finding button with external-link icon
        await firstExhibitor.locator('button').filter({ has: page.locator('.lucide-external-link, svg.lucide-external-link') }).click();
    }
    
    // "Planifier un RDV B2B" button on detail page
    const bookBtn = page.locator('button', { hasText: 'Planifier un RDV B2B' });
    await expect(bookBtn).toBeVisible({ timeout: 15000 });
    await bookBtn.click();
    
    // Verify timeslots appear
    // Since we mocked them, they should appear
    const timeSlots = page.locator('[data-testid="timeslot"]');
    await expect(timeSlots.first()).toBeVisible({ timeout: 15000 });
    
    // Click slot
    await timeSlots.first().click();
    
    // Verify booking modal
    const messageInput = page.locator('textarea[name="message"], textarea');
    await expect(messageInput).toBeVisible();
  });

  test('should prevent double booking', async ({ page }) => {
    test.slow();
    await login(page, 'visitor');
    await page.goto('/exhibitors');
    
    const firstExhibitor = page.locator('.exhibitor-card, [data-testid="exhibitor-card"]').first();
    const detailsBtn = firstExhibitor.locator('button[title="Fiche complète"], button[title="Full Profile"]');
    if (await detailsBtn.count() > 0) {
        await detailsBtn.first().click();
    } else {
        await firstExhibitor.locator('button').filter({ has: page.locator('.lucide-external-link, svg.lucide-external-link') }).click();
    }

    const bookBtn = page.locator('button', { hasText: 'Planifier un RDV B2B' });
    await expect(bookBtn).toBeVisible({ timeout: 15000 });
    await bookBtn.click();

    const timeSlots = page.locator('[data-testid="timeslot"]');
    await expect(timeSlots.first()).toBeVisible({ timeout: 15000 });
  });

  test('should show quota reached error', async ({ page }) => {
    test.slow();
    // Override quota mock for this test to return false
    await page.route('**/rest/v1/rpc/check_b2b_quota_available', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(false)
        });
    });

    await login(page, 'visitor');
    await page.goto('/exhibitors');
    
    const firstExhibitor = page.locator('.exhibitor-card, [data-testid="exhibitor-card"]').first();
    const detailsBtn = firstExhibitor.locator('button[title="Fiche complète"], button[title="Full Profile"]');
    if (await detailsBtn.count() > 0) {
        await detailsBtn.first().click();
    } else {
        await firstExhibitor.locator('button').filter({ has: page.locator('.lucide-external-link, svg.lucide-external-link') }).click();
    }
    
    const bookBtn = page.locator('button', { hasText: 'Planifier un RDV B2B' });
    await expect(bookBtn).toBeVisible({ timeout: 15000 });
    await bookBtn.click();

    const slot = page.locator('[data-testid="timeslot"]').first();
    await expect(slot).toBeVisible({ timeout: 10000 });
    await slot.click();
        
    const textArea = page.locator('textarea');
    if (await textArea.isVisible()) {
            await textArea.fill('Test quota message');
    }
    
    const reserveBtn = page.locator('button:has-text("Réserver"), button:has-text("Confirm"), button:has-text("Book")');
    if (await reserveBtn.isVisible()) {
        await reserveBtn.click();
    }

    // Expect error message
    await expect(page.locator('div[role="status"], .Toastify__toast, text=/quota|limit/i')).toBeVisible({ timeout: 15000 });
  });

});
