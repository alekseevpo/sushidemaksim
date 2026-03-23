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

            // Mock date to a Saturday night (Open)
            const mockDate = new Date('2026-03-21T21:00:00').getTime();
            Date.now = () => mockDate;
            const RealDate = Date;
            // @ts-expect-error - overriding global Date
            globalThis.Date = class extends RealDate {
                constructor(...args: any[]) {
                    if (args.length === 0) {
                        super(mockDate);
                    } else {
                        // @ts-expect-error - spreading args
                        super(...args);
                    }
                }
            } as any;
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
            // Mock navigator.share as undefined to force clipboard fallback
            Object.defineProperty(window.navigator, 'share', {
                value: undefined,
                configurable: true,
                writable: true,
            });
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
                            menuItemId: 1,
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
        // Usamos RECOGIDA para simplificar el test E2E
        await page.getByRole('button', { name: /Recogida/i }).click();
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
            resp => resp.url().includes('/api/orders/invite') && resp.status() === 200,
            { timeout: 10000 }
        );
        await inviteBtn.click({ force: true });

        // В Webkit иногда клик не срабатывает из-за анимаций, попробуем еще раз если запрос не ушел
        try {
            const response = await responsePromise;
            const respJson = await response.json();
            expect(respJson.success).toBe(true);
        } catch (e) {
            console.log('Retrying click for Webkit...');
            await inviteBtn.click({ force: true });
            const response = await responsePromise;
            const respJson = await response.json();
            expect(respJson.success).toBe(true);
        }

        // Ждем тост об успехе. Используем regex для большей гибкости.
        // Теперь мы показываем тост "Enlace de invitación generado" сразу после успеха API.
        await expect(page.getByText(/Enlace de invitación generado/i).first()).toBeVisible({
            timeout: 15000,
        });

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
                        deliveryAddress: 'Calle Invitación, 7, B',
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
