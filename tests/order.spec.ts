import { test, expect } from '@playwright/test';

test.describe('Order Process', () => {
    test('should add a menu item to the cart and see it in the checkout', async ({ page }) => {
        // 1. Go to menu
        await page.goto('/menu');

        // Wait for items to load
        await page.waitForSelector('h3');

        // 2. Add first item to cart
        // Locating the "Añadir" button
        const addButtons = page.getByRole('button', { name: /Añadir/i }).first();
        await addButtons.click();

        // 3. Navigate to cart
        await page.goto('/cart');

        // 4. Verify cart has items
        const cartItemHeader = page.locator('h1', { hasText: /Tu cesta/i });
        await expect(cartItemHeader).toBeVisible();

        // Verify the checkout button is present (it might be "Realizar pedido" or "Log In para pedir" depending on state)
        // We use a regex to be more flexible
        const checkoutButton = page.getByRole('button', { name: /(Realizar pedido|Pedir|Log In para pedir)/i }).first();
        await expect(checkoutButton).toBeVisible();
    });
});
