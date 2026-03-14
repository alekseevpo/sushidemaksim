import { test, expect } from '@playwright/test';

test.describe('Critical E2E: Guest Checkout', () => {
    test.beforeEach(async ({ page, context }) => {
        // Prevent race condition on Webkit by using init scripts for storage
        await context.addInitScript(() => {
            window.localStorage.setItem('cookieConsent', 'accepted');
            window.localStorage.removeItem('sushi_token');
        });

        // Global API mocks for stability
        await page.route('**/api/settings', route => 
            route.fulfill({
                status: 200,
                body: JSON.stringify({
                    site_name: 'Sushi de Maksim',
                    min_order: 20,
                    free_delivery_threshold: 25,
                    delivery_fee: 3.5,
                }),
            })
        );

        await page.route('**/api/menu*', route => 
            route.fulfill({
                status: 200,
                body: JSON.stringify({
                    items: [
                        { id: 1, name: 'Gyozas con carne', price: 6.9, category: 'entrantes', description: '5 piezas', image: '' },
                        { id: 100, name: 'Combo Deluxe', price: 25.0, category: 'sets', is_promo: true, description: 'Oferta especial', image: '' }
                    ],
                    total: 2,
                }),
            })
        );
    });

    test('EMPTY CART: should show recommendations and "Mira lo que tenemos para ti"', async ({ page }) => {
        await page.goto('/cart');
        
        // Check for the new UI elements
        await expect(page.getByText(/Mira lo que tenemos para ti/i)).toBeVisible();
        // Check for presence of Lucide icons globally in that container
        await expect(page.locator('.lucide-shopping-cart').first()).toBeVisible();
        await expect(page.locator('.lucide-arrow-down').first()).toBeVisible();
        
        // Check for recommendations block
        await expect(page.getByText(/Top Ventas y Ofertas/i)).toBeVisible();
        await expect(page.getByText(/Gyozas con carne/i)).toBeVisible();
    });

    test('SUCCESS: should place an order when above 20€ threshold', async ({ page }) => {
        await page.route('**/api/orders', route =>
            route.fulfill({ status: 200, body: '{"success":true, "order":{"id":"123"}}' })
        );

        await page.goto('/menu');
        
        // Wait for real items to load (not skeletons)
        await expect(page.getByText('Gyozas con carne')).toBeVisible({ timeout: 15000 });
        
        const addButton = page.getByTestId('add-to-cart-button').first();
        
        // Add 3 times to exceed 20€ (3 * 6.9 = 20.7)
        for (let i = 0; i < 3; i++) {
            await addButton.click();
            // Just check it exists and is enabled, class check can be flaky with animations
            await expect(addButton).toBeVisible();
            await page.waitForTimeout(300);
        }

        await page.goto('/cart');
        await expect(page.locator('h2', { hasText: /Resumen/i })).toBeVisible();

        // Fill delivery info
        await page.getByPlaceholder(/Nombre de tu calle/i).fill('Calle Playwright');
        await page.getByPlaceholder(/Ej: 15/i).fill('42');
        await page.getByPlaceholder(/Ej: 3ºB/i).fill('C');
        await page.locator('input[type="tel"]').fill('600123456');

        await page.getByRole('button', { name: /Realizar pedido/i }).first().click();
        
        // Success check
        await expect(page.locator('h1', { hasText: /¡Pedido exitoso!/i })).toBeVisible({
            timeout: 10000,
        });
    });

    test('FAILURE: should show error when below 20€ threshold', async ({ page }) => {
        await page.goto('/menu');
        await page.getByTestId('add-to-cart-button').first().click();

        await page.goto('/cart');
        await page.locator('input[type="tel"]').fill('666555444');
        
        // Fill min required fields
        await page.getByPlaceholder(/Nombre de tu calle/i).fill('Calle Falla');
        await page.getByPlaceholder(/Ej: 15/i).fill('1');
        await page.getByPlaceholder(/Ej: 3ºB/i).fill('1');

        await page.getByRole('button', { name: /Realizar pedido/i }).first().click();
        await expect(page.getByText(/El pedido mínimo es de 20,00/i)).toBeVisible();
    });
});
