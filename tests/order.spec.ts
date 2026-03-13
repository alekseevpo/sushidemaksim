import { test, expect } from '@playwright/test';

test.describe('Critical E2E: Guest Checkout', () => {
    test.beforeEach(async ({ page, context }) => {
        await context.addInitScript(() => {
            localStorage.setItem('cookieConsent', 'accepted');
            localStorage.removeItem('sushi_token');
        });

        await page.route('**/api/**', async route => {
            const url = route.request().url();
            if (url.includes('/api/settings')) {
                return route.fulfill({
                    status: 200,
                    body: JSON.stringify({
                        site_name: 'Sushi de Maksim',
                        min_order: 20,
                        free_delivery_threshold: 25,
                        delivery_fee: 3.5,
                    }),
                });
            }
            if (url.includes('/api/menu')) {
                return route.fulfill({
                    status: 200,
                    body: JSON.stringify({
                        items: [
                            { id: 1, name: 'Gyozas con carne', price: 6.9, category: 'entrantes' },
                        ],
                        total: 1,
                    }),
                });
            }
            return route.fulfill({ status: 200, body: '{}' });
        });
    });

    test('SUCCESS: should place an order when above 20€ threshold', async ({ page }) => {
        await page.route('**/api/orders', route =>
            route.fulfill({ status: 200, body: '{"success":true, "order":{"id":"123"}}' })
        );

        await page.goto('/menu');
        const addButton = page.getByTestId('add-to-cart-button').first();
        await expect(addButton).toBeVisible();

        for (let i = 0; i < 4; i++) {
            await addButton.click();
            // Wait for the "Added" state (green button / check icon)
            await expect(addButton).toHaveClass(/bg-green-500/, { timeout: 10000 });
            // Small delay to let animations/state settle
            await page.waitForTimeout(300);
        }

        await page.goto('/cart');
        await expect(page.locator('h2', { hasText: /Resumen/i })).toBeVisible();

        await page.getByPlaceholder(/Nombre de tu calle/i).fill('Calle E2E');
        await page.getByPlaceholder(/Ej: 15/i).fill('1');
        await page.getByPlaceholder(/Ej: 3ºB/i).fill('A');
        await page.locator('input[type="tel"]').fill('600111222');

        await page
            .getByRole('button', { name: /Realizar pedido/i })
            .first()
            .click();
        await expect(page.locator('h1', { hasText: /¡Pedido exitoso!/i })).toBeVisible({
            timeout: 15000,
        });
    });

    test('FAILURE: should show error when below 20€ threshold', async ({ page }) => {
        await page.goto('/menu');
        await page.getByTestId('add-to-cart-button').first().click();

        await page.goto('/cart');
        await page.getByPlaceholder(/Nombre de tu calle/i).fill('Calle Error');
        await page.getByPlaceholder(/Ej: 15/i).fill('1');
        await page.getByPlaceholder(/Ej: 3ºB/i).fill('A');
        await page.locator('input[type="tel"]').fill('600999888');

        await page.getByRole('button', { name: /Realizar pedido/i }).click({ delay: 100 });
        await expect(page.getByText(/pedido mínimo.*20/i)).toBeVisible({ timeout: 20000 });
    });
});
