import { test, expect } from '@playwright/test';

const VALID_PASSWORD = 'TestPass1';

function getUniqueEmail() {
    const TIMESTAMP = Date.now();
    return `test.e2e.${TIMESTAMP}@example.com`;
}

// Esto es valido como PoC. En entorno real usariamos randomUUID;

test.describe('Registro de usuario - Happy Path e2e con Chromium', () => {

    test('rellenar el formulario y ver mensaje de éxito', async ({ page }) => {
        // Navigate: Navegamos a la pagina definida
        await page.goto('/register');

        // Assert: la pagina se carga OK y contiene título
        await expect(page).toHaveTitle(/Registro/);

        // Interact: rellenar el formulario de registro
        await page.fill('#email', getUniqueEmail());
        await page.fill('#password', VALID_PASSWORD);

        // Act: enviar form
        await page.click('button[type="submit"]');

        // Assert: esperar mensaje de éxito
        await expect(page.locator('#result')).toContainText('Cuenta creada');

    });
});

test.describe('Registro de usuario - Error Cases', () => {

    test('error de validación: password inválida muestra el mensaje de error en #result', async ({ page }) => {
        await page.goto('/register');

        await page.fill('#email', getUniqueEmail());
        await page.fill('#password', 'abcd1');

        await page.click('button[type="submit"]');

        await expect(page.locator('#result.error')).toBeVisible();
        await expect(page.locator('#result.error')).not.toBeEmpty();
    });
})