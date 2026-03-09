import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Clear auth and bypass cookie banner
        await page.evaluate(() => {
            localStorage.removeItem('sushi_token');
            localStorage.setItem('cookieConsent', 'accepted');
        });
        await page.reload();
    });

    test('SUCCESS: should register and see the welcome message', async ({ page }) => {
        const randomId = Date.now();
        const email = `test${randomId}@test.com`;
        const name = `Tester ${randomId}`;
        const pass = 'password123';

        await page
            .getByRole('button', { name: /ACCEDER/i })
            .first()
            .click();
        await page.getByRole('button', { name: /Regístrate/i }).click();

        await page.getByPlaceholder(/Tu nombre completo|Nombre completo/i).fill(name);
        await page.getByPlaceholder(/\+34 600 000 000/i).fill('600111222');
        await page.getByPlaceholder(/tu@email.com/i).fill(email);
        await page.getByPlaceholder(/Mínimo 6 caracteres/i).fill(pass);

        await page.getByRole('button', { name: /Crear cuenta/i }).click();

        // 1. Check for error first
        const errorAlert = page.locator('div.bg-red-50').first();
        if (await errorAlert.isVisible()) {
            const errorMsg = await errorAlert.textContent();
            throw new Error(`Registration failed with error: ${errorMsg}`);
        }

        // 2. Wait for success message
        await expect(
            page.getByText(/Casi listo|enviado un enlace|revisa tu email/i).first()
        ).toBeVisible({ timeout: 25000 });
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
        await expect(
            page.getByText(/Casi listo|enviado un enlace|revisa tu email/i).first()
        ).toBeVisible({ timeout: 20000 });

        // 2. Manual verify for login test
        const { execSync } = await import('child_process');
        execSync(`npx tsx tests/verify-user.ts ${email}`);
        await page.reload();

        await page.getByRole('button', { name: /ACCEDER/i }).click();
        await page.getByPlaceholder(/tu@email.com/i).fill(email);
        await page.getByPlaceholder(/Tu contraseña/i).fill(pass);
        await page.getByRole('button', { name: /Iniciar sesión/i }).click();

        // 3. User name (first word) should be in a header button
        const firstName = name.split(' ')[0];
        const userBtn = page
            .locator('header button')
            .filter({ hasText: new RegExp(firstName, 'i') })
            .first();
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
