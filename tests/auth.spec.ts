import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Clear auth state
        await page.evaluate(() => localStorage.removeItem('sushi_token'));
        await page.reload();
    });

    test('SUCCESS: should register and see the welcome message', async ({ page }) => {
        const randomId = Math.floor(Math.random() * 100000);
        const email = `reg${randomId}@test.com`;

        await page.getByRole('button', { name: /ACCEDER/i }).click();
        await page.getByRole('button', { name: /Regístrate/i }).click();

        await page.getByPlaceholder(/Tu nombre completo/i).fill('Test Register');
        await page.getByPlaceholder(/\+34 600 000 000/i).fill('600000111');
        await page.getByPlaceholder(/tu@email.com/i).fill(email);
        await page.getByPlaceholder(/Mínimo 6 caracteres/i).fill('password123');

        await page.getByRole('button', { name: /Crear cuenta/i }).click();

        // Success alert box
        const successBox = page.locator('div.bg-green-50').first();
        await expect(successBox).toBeVisible({ timeout: 10000 });
        await expect(successBox).toContainText(/(Проверьте пожалуйста почту|confirmación)/i);
    });

    test('SUCCESS: should login and access profile', async ({ page }) => {
        const randomId = Math.floor(Math.random() * 100000);
        const email = `login${randomId}@test.com`;
        const name = 'Tester';
        const pass = 'testpass123';

        // 1. Create a user (Register)
        await page.getByRole('button', { name: /ACCEDER/i }).click();
        await page.getByRole('button', { name: /Regístrate/i }).click();
        await page.getByPlaceholder(/Tu nombre completo/i).fill(name);
        await page.getByPlaceholder(/\+34 600 000 000/i).fill('600222333');
        await page.getByPlaceholder(/tu@email.com/i).fill(email);
        await page.getByPlaceholder(/Mínimo 6 caracteres/i).fill(pass);
        await page.getByRole('button', { name: /Crear cuenta/i }).click();

        // 2. Clear state and login
        await page.waitForTimeout(4000);
        await page.evaluate(() => localStorage.removeItem('sushi_token'));
        await page.reload();

        await page.getByRole('button', { name: /ACCEDER/i }).click();
        await page.getByPlaceholder(/tu@email.com/i).fill(email);
        await page.getByPlaceholder(/Tu contraseña/i).fill(pass);
        await page.getByRole('button', { name: /Iniciar sesión/i }).click();

        // 3. User name should be in the header button
        const userBtn = page.locator('header button').filter({ hasText: name }).first();
        await expect(userBtn).toBeVisible({ timeout: 10000 });

        // 4. Check profile menu
        await userBtn.click();
        await expect(page.getByRole('link', { name: /Mi Perfil/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Cerrar sesión/i })).toBeVisible();
    });

    test('FAILURE: should show error on invalid credentials', async ({ page }) => {
        await page.getByRole('button', { name: /ACCEDER/i }).click();

        await page.getByPlaceholder(/tu@email.com/i).fill('wrong@email.com');
        await page.getByPlaceholder(/Tu contraseña/i).fill('wrongpassword');
        await page.getByRole('button', { name: /Iniciar sesión/i }).click();

        // Error alert box (prefixed with ⚠️)
        const errorAlert = page.locator('div.bg-red-50').filter({ hasText: /⚠️/ }).first();
        await expect(errorAlert).toBeVisible();
        await expect(errorAlert).toContainText(/incorrectos|inválidas/i);
    });
});
