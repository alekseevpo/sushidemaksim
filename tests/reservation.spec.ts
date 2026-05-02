import { test, expect } from '@playwright/test';

test.describe('Reservation Page Flow', () => {
    test('SUCCESS: should be able to fill the reservation form and submit', async ({ page }) => {
        // Set fixed time to a Sunday afternoon to ensure store is open and slots available
        await page.clock.setFixedTime(new Date('2026-05-10T15:00:00'));
        await page.goto('/reservar');

        // 1. Check SEO and Content
        await expect(page).toHaveTitle(/Reservar Mesa/);
        await expect(page.getByText('C. de Barrilero, 20, 28007 Madrid España')).toBeVisible();

        // 2. Fill Name
        await page.getByPlaceholder('Tu nombre и apellidos').fill('Playwright Test User');

        // 3. Select Date (using custom picker)
        await page.getByText('Hoy/Mañana').click();
        await page.getByRole('button', { name: 'Hoy', exact: true }).click();

        // 4. Select Time (should be visible after date selection)
        await page.getByText('Selecciona', { exact: true }).click();
        // Click the first available time slot
        const firstSlot = page
            .locator('button[type="button"]')
            .filter({ hasText: /^\d{2}:\d{2}$/ })
            .first();
        await expect(firstSlot).toBeVisible();
        await firstSlot.click();

        // 5. Fill Phone
        await page.getByPlaceholder('600 000 000').fill('612345678');

        // 6. Fill Email (if not logged in)
        await page.getByPlaceholder('tucorreo@ejemplo.com').fill('test@playwright.com');

        // 7. Intercept API call
        await page.route('**/api/reservations', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ message: 'Reservation saved' }),
            });
        });

        // 8. Submit
        const submitBtn = page.getByRole('button', { name: 'RESERVAR AHORA' });
        await expect(submitBtn).toBeEnabled();

        // Mock window.open/window.location for WhatsApp redirect
        await page.evaluate(() => {
            window.open = () => null as any;
        });

        await submitBtn.click();

        // 9. Verify Success State
        await expect(page.getByText('¡Mesa Reservada!')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Hemos recibido tu solicitud')).toBeVisible();
    });

    test('NAVIGATION: should be accessible from footer', async ({ page }) => {
        await page.goto('/');
        const footerLink = page.locator('footer').getByRole('link', { name: 'Reservar' });
        await expect(footerLink).toBeVisible();
        await footerLink.click();
        await expect(page).toHaveURL(/\/reservar/);
    });

    test('NAVIGATION: should be accessible from header desktop nav', async ({ page, viewport }) => {
        if (!viewport || viewport.width > 1024) {
            // Explicit check for desktop
            await page.goto('/');
            const headerLink = page.locator('header').getByRole('link', { name: 'Reserva' });
            await expect(headerLink).toBeVisible();
            await headerLink.click();
            await expect(page).toHaveURL(/\/reservar/);
        }
    });
});
