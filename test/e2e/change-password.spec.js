import { test, expect } from '@playwright/test'

const VALID_PASSWORD = 'Password1'
const NEW_VALID_PASSWORD = 'Password2'

function getUniqueEmail() {
	const TIMESTAMP = Date.now()
	return `test.e2e.${TIMESTAMP}@example.com`
}

test('Happy path - navegar a /change-password, rellenar y ver mensaje de éxito', async({page}) => {

  const email = getUniqueEmail()

  await fetch('http:localhost:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email, password: VALID_PASSWORD })
  })

  await page.goto('/change-password')
        await expect(page).toHaveTitle(/contraseña/);

  await page.fill('#email', email)
  await page.fill('#currentPassword', VALID_PASSWORD)
  await page.fill('#newPassword', NEW_VALID_PASSWORD)

  await page.click('button[type="submit"]')

  await expect(page.locator('#result')).toContainText(/Contraseña cambiada correctamente/)
})