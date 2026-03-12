import { test, expect } from '@playwright/test';

test.describe('Feature: Invite a Friend (Invitaciones)', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test.beforeEach(async ({ page }) => {
        // Strict basic mocks
        await page.route('**/api/settings', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ site_name: 'Sushi de Maksim', min_order: 20 }) }));
        await page.route('**/api/user/active', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
        await page.route('**/api/menu*', route => route.fulfill({ 
            status: 200, 
            contentType: 'application/json',
            body: JSON.stringify({ 
                items: [{ 
                    id: 1, 
                    name: 'Gyozas con carne', 
                    price: 6.90, 
                    category: 'entrantes', 
                    description: '5 piezas', 
                    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf' 
                }], 
                total: 1 
            }) 
        }));

        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('cookieConsent', 'accepted');
            localStorage.removeItem('sushi_token');
        });
    });

    test('SUCCESS: Create invitation and pay as friend', async ({ page, context }) => {
        // Mock auth specifically
        await page.route('**/api/auth/me', async (route) => {
            const h = route.request().headers();
            const auth = h['authorization'] || h['Authorization'];
            if (auth?.includes('sender-token')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ user: { id: 1, name: 'Sender', email: 'sender@test.com', role: 'user', addresses: [] } })
                });
            } else {
                await route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"Unauthorized"}' });
            }
        });

        await page.route('**/api/auth/login', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ token: 'sender-token', user: { id: 1, name: 'Sender' } })
        }));

        await page.getByRole('button', { name: /ACCEDER/i }).first().click();
        await page.getByPlaceholder(/tu@email.com/i).fill('sender@test.com');
        await page.getByPlaceholder(/Tu contraseña/i).fill('password123');
        await page.getByRole('button', { name: /Iniciar sesión/i }).click();

        await expect(page.locator('header')).toContainText('Sender', { timeout: 15000 });

        await page.goto('/menu');
        await page.waitForLoadState('networkidle');
        
        const addButton = page.getByRole('button', { name: /Añadir/i }).first();
        await expect(addButton).toBeVisible({ timeout: 20000 });
        
        await addButton.click();
        await page.waitForTimeout(500);
        await addButton.click();
        await page.waitForTimeout(500);
        await addButton.click(); 

        await page.goto('/cart');
        await expect(page.locator('h2', { hasText: /Resumen/i })).toBeVisible({ timeout: 15000 });

        const inviteBtn = page.getByRole('button', { name: /¡Que me inviten!/i });
        await expect(inviteBtn).toBeVisible({ timeout: 15000 });

        const fakeOrderId = 'INV-123';
        await page.route('**/api/orders/invite', route => route.fulfill({ 
            status: 200, 
            contentType: 'application/json',
            body: JSON.stringify({ order: { id: fakeOrderId }, success: true }) 
        }));

        await page.getByPlaceholder(/Nombre de tu calle/i).fill('Calle Invitación');
        await page.getByPlaceholder(/Ej: 15/i).fill('7');
        await page.getByPlaceholder(/Ej: 3ºB/i).fill('B');
        await page.locator('input[type="tel"]').fill('611222333');

        await inviteBtn.click();

        // Recipient part
        await page.route(`**/api/orders/public/${fakeOrderId}`, route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                order: {
                    id: fakeOrderId,
                    total_price: 20.70,
                    items: [{ name: 'Gyozas con carne', quantity: 3, price: 6.90 }],
                    user: { full_name: 'Sender' }
                }
            })
        }));

        const recipientPage = await context.newPage();
        await recipientPage.goto(`/pay-for-friend/${fakeOrderId}`);
        await expect(recipientPage.locator('h1', { hasText: /¡Momento de invitar!/i })).toBeVisible({ timeout: 15000 });

        await page.route(`**/api/orders/confirm-payment`, route => route.fulfill({ 
            status: 200, 
            contentType: 'application/json',
            body: '{"success":true}' 
        }));
        await recipientPage.getByRole('button', { name: /Confirmar y Pagar/i }).click();
        await expect(recipientPage.locator('h2', { hasText: /¡Eres Genial!/i })).toBeVisible({ timeout: 15000 });
    });

    test('PROTECTION: Guests cannot invite friends (prompt to login)', async ({ page }) => {
        await page.route('**/api/auth/me', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"No"}' }));
        await page.goto('/menu');
        const addButton = page.getByRole('button', { name: /Añadir/i }).first();
        await expect(addButton).toBeVisible({ timeout: 25000 });
        await addButton.click();
        await page.goto('/cart');
        await expect(page.locator('text=Regístrate o inicia sesión')).toBeVisible({ timeout: 10000 });
    });
});
