import { test, expect } from '@playwright/test';

test.describe('Feature: Invite a Friend (Invitaciones)', () => {
    test.use({ viewport: { width: 1280, height: 720 } });
    test.slow();

    test.beforeEach(async ({ context }, testInfo) => {
        // Даем разрешения на буфер обмена только для Chromium, так как Webkit их не поддерживает в Playwright
        if (testInfo.project.name.includes('chromium')) {
            await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        }

        // Prevent race condition on Webkit/Chromium by using init scripts for storage
        await context.addInitScript(() => {
            window.localStorage.setItem('cookieConsent', 'accepted');
            window.localStorage.removeItem('sushi_token');

            // Mock grecaptcha for Playwright
            (window as any).grecaptcha = {
                execute: () => Promise.resolve('playwright-invite-mock-token'),
                ready: (callback: () => void) => callback(),
            };
        });

        // Block real reCAPTCHA and return mock
        await context.route('**/recaptcha/api.js*', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/javascript',
                body: 'window.grecaptcha = { execute: () => Promise.resolve("playwright-invite-mock-token"), ready: (cb) => cb() };',
            });
        });

        // Configuración básica de mocks de API
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
                            image: '',
                        },
                    ],
                    total: 1,
                }),
            })
        );

        // Mock del carrito por defecto
        await context.route('**/api/cart', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    items: [
                        {
                            id: 1,
                            name: 'Gyozas con carne',
                            price: 6.9,
                            quantity: 3,
                            category: 'entrantes',
                            image: '',
                        },
                    ],
                    total: 20.7,
                }),
            })
        );
    });

    test('SUCCESS: Create invitation and pay as friend', async ({ page, context }) => {
        // Устанавливаем токен ДО навигации через init script
        // Также форсируем отсутствие navigator.share для срабатывания fallback-а с тостом
        await page.addInitScript(() => {
            window.localStorage.setItem('sushi_token', 'sender-token');
            // @ts-expect-error: deleting share property to force fallback
            delete window.navigator.share;
            // Mock clipboard to avoid permission errors
            Object.defineProperty(window.navigator, 'clipboard', {
                value: {
                    writeText: async () => Promise.resolve(),
                },
            });
        });

        // Консистентные моки пользователя
        const senderUser = {
            id: 111,
            name: 'Sender User',
            phone: '600111222',
            addresses: [{ street: 'Calle Emisor', house: '1', apartment: 'A', isDefault: true }],
        };

        await context.route('**/api/auth/me', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ user: senderUser }),
            })
        );
        await context.route('**/api/user/active', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ user: senderUser }),
            })
        );

        // Mock корзины
        await context.route('**/api/cart', route =>
            route.fulfill({
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
                        },
                    ],
                    total: 20.7,
                }),
            })
        );

        await page.goto('/cart');

        // КРИТИЧНО: Ждем, пока корзина загрузится и покажет товар
        await expect(page.getByText('Gyozas con carne').first()).toBeVisible({ timeout: 15000 });

        // Убедимся, что заголовок "Resumen" виден (признак того, что колонка отрендерилась)
        await expect(page.getByText(/Resumen/i).first()).toBeVisible({ timeout: 10000 });

        const inviteBtn = page.getByTestId('invite-button');

        // RELLENAR DATOS DE ENVÍO (necesario para validación en handleInvite)
        await page.getByTestId('address-input').fill('Calle Falsa 123');
        await page.getByTestId('house-input').fill('1');
        await page.getByTestId('apartment-input').fill('2A');
        await page.getByTestId('phone-input').fill('600111222');

        // Select payment method
        const paymentBtn = page.getByRole('button', { name: /Tarjeta/i });
        await paymentBtn.scrollIntoViewIfNeeded();
        await paymentBtn.click({ force: true });

        // Прокрутим к кнопке на всякий случай
        await inviteBtn.scrollIntoViewIfNeeded();
        await expect(inviteBtn).toBeVisible({ timeout: 15000 });
        await expect(inviteBtn).toBeEnabled({ timeout: 5000 });

        const fakeOrderId = 999;
        await context.route('**/api/orders/invite', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    order: { id: fakeOrderId },
                    shareUrl: `http://localhost:5173/pay-for-friend/${fakeOrderId}`,
                }),
            })
        );

        // Кликаем и ждем ответа от API
        const responsePromise = page.waitForResponse(
            resp => resp.url().includes('/api/orders/invite') && resp.status() === 200
        );
        await inviteBtn.click({ force: true });
        const response = await responsePromise;
        const respJson = await response.json();
        expect(respJson.success).toBe(true);

        // Ждем тост об успехе. Если не появился - проверяем, нет ли тоста об ошибке
        try {
            await expect(page.getByText(/Enlace de invitación copiado/i).first()).toBeVisible({
                timeout: 8000,
            });
        } catch (e) {
            const errorToast = page.locator('div').filter({ hasText: /Error/i });
            if ((await errorToast.count()) > 0) {
                const errorMsg = await errorToast.innerText();
                throw new Error(`Test failed because of application error: ${errorMsg}`);
            }
            throw e;
        }

        // RECIPIENT FLOW
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
                        items: [{ name: 'Gyozas con carne', quantity: 3, price: 6.9 }],
                    },
                }),
            })
        );

        const recipientPage = await context.newPage();
        await recipientPage.goto(`/pay-for-friend/${fakeOrderId}`);
        // В Webkit иногда нужно больше времени на рендеринг страницы оплаты
        await expect(recipientPage.getByText(/Momento de invitar/i).first()).toBeVisible({
            timeout: 20000,
        });

        await context.route(`**/api/orders/*/confirm-payment`, route =>
            route.fulfill({ status: 200, body: '{"success":true}' })
        );

        await recipientPage.getByRole('button', { name: /Confirmar y Pagar/i }).click();
        await expect(recipientPage.locator('h2', { hasText: /¡Eres Genial!/i })).toBeVisible({
            timeout: 15000,
        });
    });

    test('PROTECTION: Guests cannot invite friends (prompt to login)', async ({ page }) => {
        // Устанавливаем корзину ДО навигации
        await page.addInitScript(() => {
            window.localStorage.setItem(
                'guest_cart',
                JSON.stringify([
                    { id: '1', name: 'Gyozas', price: 20, quantity: 1, category: 'entrantes' },
                ])
            );
        });

        await page.goto('/cart');

        // Ждем товар
        await expect(page.getByText('Gyozas').first()).toBeVisible({ timeout: 15000 });

        const inviteBtn = page.getByTestId('invite-button');
        await inviteBtn.scrollIntoViewIfNeeded();
        await expect(inviteBtn).toBeVisible({ timeout: 15000 });
        await inviteBtn.click();

        // Проверяем открытие модалки
        await expect(page.getByText(/¡Hola de nuevo!/i).first()).toBeVisible({ timeout: 15000 });
    });
});
