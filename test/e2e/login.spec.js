// TODO:
// Generamos un test e2e para testear
// 3 intentos fallidos por contraseña erronea
// Un cuarto intento bloqueado con contraseña correcta

import { test, expect } from '@playwright/test';
const [REAL_EMAIL, REAL_PASSWORD] = ['admin@example.com', 'Admin1234'];

test.describe('Login de usuario - Gestión de bloqueo', () => {

    test('tras tres intentos fallidos de login, el usuario debe quedar bloqueado', async ({ page }) => {

        await page.goto('/login');

        // Try 1
        await page.fill('#email', REAL_EMAIL);
        await page.fill('#password', 'WrongPw1234');
        await page.click('button[type="submit"]');
        await expect(page.locator('#result.error')).toBeVisible();

        // Try 2
        await page.fill('#email', REAL_EMAIL);
        await page.fill('#password', 'WrongPw1234');
        await page.click('button[type="submit"]');
        await expect(page.locator('#result.error')).toBeVisible();

        // Try 3
        await page.fill('#email', REAL_EMAIL);
        await page.fill('#password', 'WrongPw1234');
        await page.click('button[type="submit"]');
        await expect(page.locator('#result.error')).toBeVisible();

        // Lock Control
        await page.fill('#email', REAL_EMAIL);
        await page.fill('#password', REAL_PASSWORD);
        await page.click('button[type="submit"]');
        await expect(page.locator('#result.error')).toBeVisible();
        await expect(page.locator('#result.error')).toContainText(/Cuenta bloqueada/i);

    });
});





// Pregunta