import { test, expect } from '@playwright/test';

const TIMESTAMP = Date.now();
const UNIQUE_EMAIL = `test.e2e.${TIMESTAMP}@example.com`;
const VALID_PASSWORD = 'TestPass1';

// Esto es valido como PoC. En entorno real usariamos randomUUID;

test.describe('Registro de usuario - Happy Path e2e con Chromium', () => {

    test('rellenar el formulario y ver mensaje de éxito', async ({ page }) => {
        // Navigate: Navegamos a la pagina definida
        await page.goto('/register');

        // Assert: la pagina se carga OK y contiene título
        await expect(page).toHaveTitle(/Registro/);

        // Interact: rellenar el formulario de registro
        await page.fill('#email', UNIQUE_EMAIL);
        await page.fill('#password', VALID_PASSWORD);

        // Act: enviar form
        await page.click('button[type="submit"]');

        // Assert: esperar mensaje de éxito
        await expect(page.locator('#result')).toContainText('Cuenta creada');

    });
});