// Montar entorno de testing e2e
// Webserver
// Utilizando chrommium

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: 'test/e2e',  // donde van a vivir nuestros tests
    timeout: 30_000, // timeout de 30s en ms
    retries: 0,
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ],

    // APP Config
    use: {
        baseURL: 'http://localhost:3000', // Los tests llaman a /register
        trace: 'on-first-retry' // npx playwright show-trace
    },
    // Esto nos permite decirle que arranque la app con el test
    webServer: {
        command: 'HOST=0.0.0.0 node src/server.js',
        // PW espera una url a la que navegar al iniciar antes de arrancar los test
        url: 'http://localhost:3000/register',


        // Es posible que arranquemos los test
        // Pero en otra terminal tengamos 'npm start' corriedo
        reuseExistingServer: !process.env.CI,
    }
})