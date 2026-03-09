import { test, expect } from '@playwright/test';

test.describe('Feature: Invite a Friend (Invitaciones)', () => {
    test('SUCCESS: Create invitation and pay as friend', async ({ page, context }) => {
        const randomId = Date.now();
        const email = `test${randomId}@test.com`;
        const name = `Tester ${randomId}`;
        const pass = 'password123';

        // 1. Register Sender
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('cookieConsent', 'accepted');
        });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Wait for ACCEDER button explicitly
        const loginBtnHeader = page.getByRole('button', { name: /ACCEDER/i }).first();
        await expect(loginBtnHeader).toBeVisible({ timeout: 15000 });
        await loginBtnHeader.click();

        // Switch to Register
        const registerBtn = page.getByRole('button', { name: /Regístrate/i }).first();
        await expect(registerBtn).toBeVisible();
        await registerBtn.click();

        await page.getByPlaceholder(/Tu nombre completo|Nombre completo/i).fill(name);
        await page.getByPlaceholder(/\+34 600 000 000/i).fill('600111222');
        await page.getByPlaceholder(/tu@email.com/i).fill(email);
        await page.getByPlaceholder(/Mínimo 6 caracteres/i).fill(pass);

        await page.getByRole('button', { name: /Crear cuenta/i }).click();

        // Success message should appear
        await expect(
            page.getByText(/Casi listo|enviado un enlace|revisa tu email/i).first()
        ).toBeVisible({ timeout: 25000 });

        // Force verify in DB to continue E2E flow
        const { execSync } = await import('child_process');
        execSync(`npx tsx tests/verify-user.ts ${email}`);

        // Go to menu directly to bypass modal closing lag
        await page.goto('/menu');
        await page.waitForLoadState('networkidle');

        // Check if logged in (user initials or name in header)
        // If not logged in, perform login
        const isUserButtonVisible = await page
            .locator('header button')
            .filter({ hasText: name })
            .isVisible();
        if (!isUserButtonVisible) {
            await page
                .getByRole('button', { name: /ACCEDER/i })
                .first()
                .click();
            await page.getByPlaceholder(/tu@email.com/i).fill(email);
            await page.getByPlaceholder(/Tu contraseña/i).fill(pass);
            await page.getByRole('button', { name: /Iniciar sesión/i }).click();
            await expect(page).toHaveURL(/.*menu/, { timeout: 15000 });
        }

        // 2. Add things to cart
        const card = page.locator('div.bg-white').filter({ hasText: 'Gyozas con carne' }).first();
        const addButton = card.getByRole('button', { name: /Añadir/i }).first();

        await addButton.click();
        await page.waitForTimeout(500); // Wait for cart update animation
        await addButton.click();

        // 3. Go to cart and create invitation
        await page.goto('/cart');
        await expect(page).toHaveURL(/.*cart/);

        // Fill delivery details
        await page.getByPlaceholder(/Nombre de tu calle/i).fill('Calle Invitación E2E');
        await page.getByPlaceholder(/Ej: 15/i).fill('7');
        await page.getByPlaceholder(/Ej: 3ºB/i).fill('B');
        await page.locator('input[type="tel"]').fill('611222333');

        // Mock navigator.share
        await page.addInitScript(() => {
            (navigator as any).share = (data: any) => {
                (window as any).__last_share = data;
                return Promise.resolve();
            };
        });

        // Click "¡Que me inviten!"
        const inviteBtn = page.getByRole('button', { name: /¡Que me inviten!/i });
        await expect(inviteBtn).toBeVisible();
        await inviteBtn.click();

        // Wait for networking
        await page.waitForTimeout(5000);

        // 4. Simulate Recipient
        await page.goto('/profile');

        // Click on "Mis Pedidos" tab
        const ordersTabBtn = page.getByRole('button', { name: /Mis Pedidos/i });
        await expect(ordersTabBtn).toBeVisible({ timeout: 15000 });
        await ordersTabBtn.click();

        // 3. Find our order card (it's the first one in the list)
        const orderCard = page.locator('div.bg-white').filter({ hasText: '#' }).first();
        await expect(orderCard).toBeVisible({ timeout: 15000 });

        // Extract ID from the "#000XX" text
        const orderIdText = await orderCard
            .locator('span')
            .filter({ hasText: '#' })
            .first()
            .textContent();
        const orderId = orderIdText?.replace('#', '').trim();
        console.log(`Found order ID: ${orderId}`);

        if (orderId) {
            const recipientPage = await context.newPage();
            await recipientPage.goto(`/pay-for-friend/${orderId}`);

            await expect(
                recipientPage.locator('h1', { hasText: '¡Momento de invitar!' })
            ).toBeVisible({ timeout: 20000 });
            await expect(recipientPage.locator('text=Gyozas con carne')).toBeVisible();

            // 5. Pay as friend
            const payBtn = recipientPage.getByRole('button', { name: /Confirmar y Pagar/i });
            await payBtn.click();

            await expect(recipientPage.locator('h2', { hasText: '¡Eres Genial!' })).toBeVisible({
                timeout: 25000,
            });
        } else {
            throw new Error('Could not find created order ID in profile');
        }
    });

    test('PROTECTION: Guests cannot invite friends (prompt to login)', async ({ page }) => {
        await page.goto('/menu');
        const card = page.locator('div.bg-white').filter({ hasText: 'Gyozas con carne' }).first();
        await card
            .getByRole('button', { name: /Añadir/i })
            .first()
            .click();

        await page.goto('/cart');

        const inviteBtn = page.getByRole('button', { name: /¡Que me inviten!/i });
        await expect(inviteBtn).not.toBeVisible();

        await expect(page.locator('text=Regístrate o inicia sesión')).toBeVisible();
    });
});
