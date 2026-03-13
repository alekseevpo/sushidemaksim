import { test, expect } from '@playwright/test';

test.describe('Feature: Invite a Friend (Invitaciones)', () => {
    test.use({ viewport: { width: 1280, height: 720 } });
    test.slow();

    test.beforeEach(async ({ page, context }) => {
        // Set cookie consent before any script runs.
        // We only clear sushi_token once at the start, using sessionStorage to track it.
        await context.addInitScript(() => {
            if (!window.sessionStorage.getItem('init_cleared')) {
                window.localStorage.removeItem('sushi_token');
                window.sessionStorage.setItem('init_cleared', 'true');
            }
            window.localStorage.setItem('cookieConsent', 'accepted');
        });

        // Basic settings and public user mocks
        await context.route('**/api/settings', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ site_name: 'Sushi de Maksim', min_order: 20 }),
            })
        );
        await context.route('**/api/user/active', route =>
            route.fulfill({ status: 200, contentType: 'application/json', body: '{"user":null}' })
        );
        await context.route('**/api/user/favorites', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"favorites":[]}',
            })
        );

        await context.route('**/api/menu*', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    items: [
                        {
                            id: 1,
                            name: 'Gyozas con carne',
                            price: 6.9,
                            category: 'entrantes',
                            description: '5 piezas',
                            image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf',
                        },
                    ],
                    total: 1,
                }),
            })
        );

        // Default cart with items
        await context.route('**/api/cart', route => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    items: [
                        {
                            menu_item_id: 1,
                            name: 'Gyozas con carne',
                            price: 6.9,
                            quantity: 3,
                            category: 'entrantes',
                            image: '',
                            description: '',
                        },
                    ],
                    total: 20.7,
                }),
            });
        });

        await page.goto('/');
    });

    test('SUCCESS: Create invitation and pay as friend', async ({ page, context }) => {
        // Mock auth for Sender
        await context.route('**/api/auth/me', async route => {
            const h = route.request().headers();
            const auth = h['authorization'] || h['Authorization'];
            if (auth?.includes('sender-token')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        user: {
                            id: 101,
                            name: 'Sender',
                            full_name: 'Sender',
                            email: 'sender@test.com',
                            role: 'user',
                            addresses: [],
                        },
                    }),
                });
            } else {
                await route.fulfill({ status: 401, body: '{"error":"Unauthorized"}' });
            }
        });

        await context.route('**/api/auth/login', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    token: 'sender-token',
                    user: {
                        id: 101,
                        name: 'Sender',
                        full_name: 'Sender',
                        email: 'sender@test.com',
                    },
                }),
            })
        );

        // 1. Login
        const loginBtn = page
            .getByRole('button', { name: /ACCEDER/i })
            .filter({ visible: true })
            .first();
        await loginBtn.click({ delay: 100 });
        await page.getByPlaceholder(/tu@email.com/i).fill('sender@test.com');
        await page.getByPlaceholder(/Tu contraseña/i).fill('password123');
        await page.getByRole('button', { name: /Iniciar sesión/i }).click({ delay: 100 });

        // Wait for login to complete and UI to update
        await expect(page.locator('header')).toContainText('Sender', { timeout: 20000 });

        // 2. Add item manually to ensure local state and server state are in sync
        // actually, we already have it mocked, so just go to cart
        await page.goto('/cart');

        // Wait for items to appear first
        await expect(page.getByText('Gyozas con carne').first()).toBeVisible({ timeout: 20000 });

        // Ensure cart is loaded with the mocked items
        await expect(page.getByText(/Resumen/i).first()).toBeVisible({ timeout: 15000 });

        const inviteBtn = page.getByRole('button', { name: /¡Que me inviten!/i });
        await expect(inviteBtn).toBeVisible({ timeout: 15000 });

        const fakeOrderId = 'INV-123';
        await context.route('**/api/orders/invite', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, order_id: fakeOrderId }),
            })
        );

        await page.getByPlaceholder(/Nombre de tu calle/i).fill('Calle Invitación');
        await page.getByPlaceholder(/Ej: 15/i).fill('7');
        await page.getByPlaceholder(/Ej: 3ºB/i).fill('B');
        await page.locator('input[type="tel"]').fill('611222333');
        await inviteBtn.click();

        // 3. Recipient part
        await context.route(`**/api/orders/public/${fakeOrderId}`, route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    order: {
                        id: fakeOrderId,
                        total: 20.7,
                        status: 'pending',
                        delivery_address: 'Calle Invitación, 7, B',
                        notes: '[De parte de: Sender]',
                        items: [{ name: 'Gyozas con carne', quantity: 3, price: 6.9, image: '' }],
                    },
                }),
            })
        );

        const recipientPage = await context.newPage();
        await recipientPage.goto(`/pay-for-friend/${fakeOrderId}`);
        // Use a more relaxed text check for the title
        await expect(recipientPage.getByText(/Momento de invitar/i).first()).toBeVisible({
            timeout: 30000,
        });

        await context.route(`**/api/orders/*/confirm-payment`, route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"success":true}',
            })
        );

        await recipientPage.getByRole('button', { name: /Confirmar y Pagar/i }).click();
        await expect(recipientPage.locator('h2', { hasText: /¡Eres Genial!/i })).toBeVisible({
            timeout: 20000,
        });
    });

    test('PROTECTION: Guests cannot invite friends (prompt to login)', async ({ page }) => {
        // Mock guest cart in localStorage
        await page.evaluate(() => {
            window.localStorage.setItem(
                'guest_cart',
                JSON.stringify([
                    {
                        id: '1',
                        name: 'Gyozas',
                        price: 10,
                        quantity: 1,
                        category: 'entrantes',
                        image: '',
                        description: '',
                    },
                ])
            );
        });

        await page.goto('/cart');
        try {
            const inviteBtn = page.getByText(/¡Que me inviten!/i).first();
            await expect(inviteBtn).toBeVisible({ timeout: 15000 });
            await inviteBtn.click();
        } catch (e) {
            console.log('GUEST CART CONTENT:', await page.evaluate(() => document.body.innerText));
            throw e;
        }

        await expect(page.getByRole('heading', { name: /Hola/i })).toBeVisible({ timeout: 10000 });
    });
});
