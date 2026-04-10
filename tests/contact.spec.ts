import { test, expect } from '@playwright/test';

test.describe('Contact Form (Refactored)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/contacts');
    });

    test('SUCCESS: should send a message with valid data', async ({ page }) => {
        await page.getByPlaceholder('Nombre completo').fill('Test User');
        await page.getByPlaceholder('tu@email.com').fill('test@example.com');
        await page.getByPlaceholder('¿En qué podemos ayudarte?').fill('Hello, this is a test message for the audit.');

        // Intercept API call to verify it's working
        await page.route('**/api/contact', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ message: '¡Mensaje enviado con éxito!' }),
            });
        });

        await page.click('button[type="submit"]');

        // Check for success toast or message
        // Our Toast system uses the ToastProvider
        await expect(page.getByText('¡Mensaje enviado con éxito!')).toBeVisible();
    });

    test('ERROR: should show validation errors from Zod', async ({ page }) => {
        // Fill all fields but provide invalid email to trigger Zod validation
        await page.getByPlaceholder('Nombre completo').fill('Test User');
        await page.getByPlaceholder('tu@email.com').fill('invalid-email');
        await page.getByPlaceholder('¿En qué podemos ayudarte?').fill('Short message');

        await page.click('button[type="submit"]');

        // We expect the Zod error message from the backend (or frontend validation if synced)
        await expect(page.getByText('Email inválido')).toBeVisible();
    });
});
