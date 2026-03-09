import { test, expect } from '@playwright/test';

test.describe('Critical E2E: Guest Checkout', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('cookieConsent', 'accepted');
        });
    });

    test('SUCCESS: should place an order when above 20€ threshold', async ({ page }) => {
        await page.goto('/menu');

        // Find specifically the "Gyozas con carne" section and its button
        const card = page
            .locator('div#item-17, div#item-16, div.bg-white')
            .filter({ hasText: 'Gyozas con carne' })
            .first();
        const addButton = card.getByRole('button', { name: /Añadir/i }).first();

        // Add 4 items
        for (let i = 0; i < 4; i++) {
            await addButton.click();
            await page.waitForTimeout(300);
        }

        await page.goto('/cart');
        await expect(page.locator('text=/Resumen/i')).toBeVisible();

        const randomPhone = '6' + Math.floor(Math.random() * 90000000 + 10000000);
        await page.getByPlaceholder(/Nombre de tu calle/i).fill('Calle E2E Verified');
        await page.getByPlaceholder(/Ej: 15/i).fill('1');
        await page.getByPlaceholder(/Ej: 3ºB/i).fill('A');
        await page.locator('input[type="tel"]').fill(randomPhone);

        const submitBtn = page.getByRole('button', { name: /Realizar pedido/i }).first();
        await submitBtn.click();

        // 20s timeout and look for specific heading
        await expect(page.locator('h1', { hasText: /¡Pedido exitoso!/i })).toBeVisible({
            timeout: 20000,
        });
    });

    test('FAILURE: should show error when below 20€ threshold', async ({ page }) => {
        await page.goto('/menu');
        const card = page.locator('div.bg-white', { hasText: 'Gyozas con carne' }).first();
        await card
            .getByRole('button', { name: /Añadir/i })
            .first()
            .click();

        await page.goto('/cart');
        await page.getByPlaceholder(/Nombre de tu calle/i).fill('Calle Error Test');
        await page.getByPlaceholder(/Ej: 15/i).fill('1');
        await page.getByPlaceholder(/Ej: 3ºB/i).fill('A');
        await page.locator('input[type="tel"]').fill('600999888');

        const submitBtn = page.getByRole('button', { name: /Realizar pedido/i }).first();
        await submitBtn.click();

        // Error toast
        const errorToast = page.getByText(/El pedido mínimo es de 20,00/i).first();
        await expect(errorToast).toBeVisible();
    });
});
