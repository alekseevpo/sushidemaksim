import { test, expect } from '@playwright/test';

test.describe('Contact Form (Refactored)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/contacts');
    });

    test('SUCCESS: should send a message with valid data', async ({ page }) => {
        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('textarea[name="message"]', 'Hello, this is a test message for the audit.');

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
        // Leave name empty and provide invalid email
        await page.fill('input[name="email"]', 'invalid-email');
        await page.fill('textarea[name="message"]', 'Short');

        await page.click('button[type="submit"]');

        // The frontend might have its own validation, but we want to see the backend/Zod responses if possible.
        // However, standard HTML5 validation might kick in first.
        // Let's check for messages that our Zod schema would produce.

        // If HTML5 validation is present, we might need to bypass it or check for it.
        // For this test, let's assume we want to see the Zod error for "invalid email"
        await expect(page.getByText('Email inválido')).toBeVisible();
    });
});
